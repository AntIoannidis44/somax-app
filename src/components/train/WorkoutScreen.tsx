import { useState } from 'react';
import { Icon } from '../Icon';
import { getWorkout } from '../../lib/customWorkouts';
import { buildBlocks, expandSets, setKey, type BlockItem, type WorkoutBlock } from '../../lib/workoutSets';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { workoutTypeById } from '../../data/workoutTypes';
import { ShareSessionButton } from './ShareSessionButton';
import { ShareProgramSheet } from './ShareProgramSheet';
import { recordActivityForGoals } from '../../lib/fitnessGoals';

function repsLabel(reps: string): string {
  return /^\d+$/.test(reps.trim()) ? `${reps.trim()} reps` : reps;
}

// Tap-to-edit weight for one set, this session only. Free text (users log
// "20kg", "bodyweight", ranges - see WorkoutEditorScreen), so this is a
// plain field, not a numeric +/- stepper - some weights have no number to
// step at all.
function WeightChip({
  value,
  disabled,
  onCommit,
}: {
  value: string;
  disabled: boolean;
  onCommit: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) {
    return (
      <input
        className="set-weight-input"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => {
          setEditing(false);
          if (draft.trim() !== value) onCommit(draft.trim());
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
    );
  }
  return (
    <button
      type="button"
      className="set-weight-chip"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
    >
      {value}
      {!disabled && <Icon name="edit" style={{ width: 9, height: 9 }} />}
    </button>
  );
}

interface SetRowProps {
  exIndex: number;
  setIndex: number;
  reps: string;
  weight?: string;
  done: boolean;
  crossed: boolean;
  exSkipped: boolean;
  locked: boolean;
  effectiveWeight: string;
  onToggleDone: () => void;
  onToggleCross: () => void;
  onWeightChange: (v: string) => void;
}

// One trackable set: the tick, cross and weight chip are each their own tap
// target (not "tap anywhere in the row") - with a weight chip also living
// in this row, making the whole row double as a 4th, overlapping "mark
// done" target meant a tap near the chip could land on either control
// unpredictably, sometimes doing nothing, sometimes the wrong thing.
function SetRow({ setIndex, reps, weight, done, crossed, exSkipped, locked, effectiveWeight, onToggleDone, onToggleCross, onWeightChange }: SetRowProps) {
  const inert = exSkipped || locked;
  return (
    <div className={`set-row${done ? ' done' : ''}${crossed ? ' crossed' : ''}${exSkipped ? ' skipped' : ''}`}>
      <button
        type="button"
        className="set-tick-btn"
        disabled={inert}
        onClick={onToggleDone}
        aria-label={done ? 'Mark set not done' : 'Mark set done'}
      >
        <span className={`set-tick${done ? ' done' : ''}`}>{done && <Icon name="check" style={{ width: 14, height: 14 }} />}</span>
      </button>
      <span className="set-label">Set {setIndex + 1}</span>
      <span className="set-detail">
        {repsLabel(reps)}
        {weight && <WeightChip value={effectiveWeight} disabled={inert} onCommit={onWeightChange} />}
      </span>
      <button
        type="button"
        className={`set-cross-btn${crossed ? ' on' : ''}`}
        disabled={inert}
        onClick={onToggleCross}
        title={crossed ? 'Undo' : "Didn't complete this set"}
        aria-label={crossed ? 'Undo: mark set not completed' : "Mark set not completed"}
      >
        <Icon name="x" style={{ width: 10, height: 10 }} />
      </button>
    </div>
  );
}

export function WorkoutScreen() {
  const wid = useAppStore((s) => s.viewingWorkout)!;
  const simDay = useAppStore((s) => s.simDay);
  const ws = useAppStore((s) => s.workoutState[simDay]?.[wid]);
  const toggleSet = useAppStore((s) => s.toggleSet);
  const toggleSetSkip = useAppStore((s) => s.toggleSetSkip);
  const setSetWeight = useAppStore((s) => s.setSetWeight);
  const toggleSkip = useAppStore((s) => s.toggleSkip);
  const finishWorkout = useAppStore((s) => s.finishWorkout);
  const awardFitnessGoalXP = useAppStore((s) => s.awardFitnessGoalXP);
  const openWorkoutEditor = useAppStore((s) => s.openWorkoutEditor);
  const openComposer = useAppStore((s) => s.openComposer);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();
  const [tracking, setTracking] = useState(false);
  const [sharing, setSharing] = useState(false);

  const w = getWorkout(wid);
  if (!ws || !w) return null;

  const exercises = w.exercises;
  const blocks = buildBlocks(exercises);
  const totalSets = exercises.reduce((n, ex, i) => n + (ws.skipped?.[i] ? 0 : expandSets(ex).length), 0);
  const doneSets = exercises.reduce(
    (n, ex, i) => n + (ws.skipped?.[i] ? 0 : expandSets(ex).filter((_, k) => ws.setDone?.[setKey(i, k)]).length),
    0,
  );
  const crossedSets = exercises.reduce(
    (n, ex, i) => n + (ws.skipped?.[i] ? 0 : expandSets(ex).filter((_, k) => ws.setSkipped?.[setKey(i, k)]).length),
    0,
  );
  const allDone = exercises.every((_, i) => ws.exDone[i]);
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;

  // Gym sessions have no real GPS distance/duration to verify against a
  // performance goal, only a real completion - so only frequency goals
  // (sport matching this workout's category, or 'any') can credit from
  // here; distance_time/distance_total goals simply won't match since
  // distanceMeters/durationSeconds are null (see recordActivityForGoals).
  function handleFinish() {
    finishWorkout(wid);
    if (!userId) return;
    recordActivityForGoals(userId, {
      sourceId: `${wid}-day${simDay}`,
      category: w!.category,
      distanceMeters: null,
      durationSeconds: null,
      occurredAt: new Date().toISOString(),
    }).then((credits) => {
      for (const credit of credits) {
        if (credit.justCompleted) {
          awardFitnessGoalXP(`${w!.name} goal reached`, 20, { completed: true });
          showToast('Goal reached! +80 bonus XP');
        } else {
          awardFitnessGoalXP(`${w!.name} goal progress`, 20, {});
        }
      }
    });
  }

  // One exercise: its label and name, then a row per set. In tracking mode
  // each set row ticks off and turns green; a skipped exercise greys out.
  function renderItem(item: BlockItem) {
    const ex = exercises[item.exIndex];
    const skipped = !!ws!.skipped?.[item.exIndex];
    return (
      <div className={`ex-group${skipped ? ' skipped' : ''}`} key={item.exIndex}>
        <div className="ex-group-head">
          <span className="ex-label">{item.label}</span>
          <span className="ex-group-name">{ex.name}</span>
          {tracking && (
            <button className={`skip-btn${skipped ? ' on' : ''}`} disabled={ws!.completed} onClick={() => toggleSkip(item.exIndex)}>
              {skipped ? 'Undo' : 'Skip'}
            </button>
          )}
        </div>
        {item.sets.map((row) => {
          const key = setKey(row.exIndex, row.setIndex);
          const done = !!ws!.setDone?.[key];
          if (!tracking) {
            return (
              <div className="set-line" key={row.setIndex}>
                <span className="set-label">Set {row.setIndex + 1}</span>
                <span className="set-detail">
                  {repsLabel(row.reps)}
                  {row.weight ? ` · ${row.weight}` : ''}
                </span>
              </div>
            );
          }
          return (
            <SetRow
              key={row.setIndex}
              exIndex={row.exIndex}
              setIndex={row.setIndex}
              reps={row.reps}
              weight={row.weight}
              done={done}
              crossed={!!ws!.setSkipped?.[key]}
              exSkipped={skipped}
              locked={ws!.completed}
              effectiveWeight={ws!.setWeight?.[key] ?? row.weight ?? ''}
              onToggleDone={() => toggleSet(row.exIndex, row.setIndex)}
              onToggleCross={() => toggleSetSkip(row.exIndex, row.setIndex)}
              onWeightChange={(v) => setSetWeight(row.exIndex, row.setIndex, v)}
            />
          );
        })}
      </div>
    );
  }

  function renderBlock(block: WorkoutBlock) {
    const title = block.superset ? `${block.number} · Superset · do back to back` : null;
    return (
      <div className={`workout-block${block.superset ? ' superset' : ''}`} key={block.number}>
        {title ? (
          <div className="workout-block-title">{title}</div>
        ) : null}
        {block.items.map(renderItem)}
      </div>
    );
  }

  return (
    <>
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{tracking ? 'Tracking' : 'Program'}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, gap: 5 }} onClick={() => setSharing(true)}>
            <Icon name="send" style={{ width: 13, height: 13 }} /> Share
          </button>
          {!tracking && !ws.completed && (
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, gap: 5 }} onClick={() => openWorkoutEditor(wid)}>
              <Icon name="edit" style={{ width: 13, height: 13 }} /> Edit
            </button>
          )}
        </div>
      </div>

      {!ws.completed && (
        <button
          className={`btn ${tracking ? 'btn-ghost' : 'btn-primary'}`}
          style={{ marginBottom: 14 }}
          onClick={() => setTracking((t) => !t)}
        >
          {tracking ? 'Back to program' : 'Track workout'}
        </button>
      )}

      {tracking && (
        <div className="track-sticky">
          <div className="track-sticky-head">
            <span className="track-sticky-title">{w.name}</span>
            <span className="track-sticky-count">
              {doneSets}/{totalSets} sets{crossedSets > 0 ? ` · ${crossedSets} crossed` : ''}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {blocks.map(renderBlock)}

      <div style={{ height: 8 }} />
      {(tracking || ws.completed) && (
        <button
          className={`btn ${ws.completed ? 'btn-ghost' : 'btn-primary'}`}
          disabled={!allDone || ws.completed}
          style={{ marginTop: 10 }}
          onClick={handleFinish}
        >
          {ws.completed ? (
            <>
              <Icon name="check" style={{ width: 16, height: 16 }} /> Workout completed
            </>
          ) : allDone ? (
            'Finish workout · +40 XP'
          ) : (
            'Tick or cross every set to finish'
          )}
        </button>
      )}
      {ws.completed && (
        <>
          <div style={{ height: 10 }} />
          <ShareSessionButton
            resolveActivity={async () => ({ name: w.name, duration: w.duration, category: w.category, exercises: w.exercises })}
          />
          <div style={{ height: 10 }} />
          <button
            className="btn btn-ghost"
            onClick={() =>
              openComposer({
                workout: { name: w.name, duration: w.duration, category: w.category, exercises: w.exercises },
                defaultCaption: `Just finished ${w.name} (${w.duration}) — +40 XP`,
                defaultType: w.category,
                locked: true,
              })
            }
          >
            <Icon name={workoutTypeById(w.category)?.icon ?? 'zap'} style={{ width: 15, height: 15 }} />
            Post to {workoutTypeById(w.category)?.label ?? 'the'} feed
          </button>
        </>
      )}
      {sharing && w && (
        <ShareProgramSheet
          program={{ name: w.name, duration: w.duration, exercises: w.exercises, category: w.category }}
          onClose={() => setSharing(false)}
        />
      )}
    </>
  );
}
