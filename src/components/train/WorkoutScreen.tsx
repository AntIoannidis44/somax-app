import { useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { Icon } from '../Icon';
import { getWorkout } from '../../lib/customWorkouts';
import { buildBlocks, expandSets, setKey, type BlockItem, type WorkoutBlock } from '../../lib/workoutSets';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { workoutTypeById } from '../../data/workoutTypes';
import { ShareSessionButton } from './ShareSessionButton';
import { createShareLink } from '../../lib/shareLinks';
import { recordActivityForGoals } from '../../lib/fitnessGoals';

function repsLabel(reps: string): string {
  return /^\d+$/.test(reps.trim()) ? `${reps.trim()} reps` : reps;
}

export function WorkoutScreen() {
  const wid = useAppStore((s) => s.viewingWorkout)!;
  const simDay = useAppStore((s) => s.simDay);
  const ws = useAppStore((s) => s.workoutState[simDay]?.[wid]);
  const toggleSet = useAppStore((s) => s.toggleSet);
  const toggleSkip = useAppStore((s) => s.toggleSkip);
  const finishWorkout = useAppStore((s) => s.finishWorkout);
  const awardFitnessGoalXP = useAppStore((s) => s.awardFitnessGoalXP);
  const openWorkoutEditor = useAppStore((s) => s.openWorkoutEditor);
  const openComposer = useAppStore((s) => s.openComposer);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();
  const [tracking, setTracking] = useState(false);

  const w = getWorkout(wid);
  if (!ws || !w) return null;

  const exercises = w.exercises;
  const blocks = buildBlocks(exercises);
  const totalSets = exercises.reduce((n, ex, i) => n + (ws.skipped?.[i] ? 0 : expandSets(ex).length), 0);
  const doneSets = exercises.reduce(
    (n, ex, i) => n + (ws.skipped?.[i] ? 0 : expandSets(ex).filter((_, k) => ws.setDone?.[setKey(i, k)]).length),
    0,
  );
  const allDone = exercises.every((_, i) => ws.exDone[i]);

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
          const done = !!ws!.setDone?.[setKey(row.exIndex, row.setIndex)];
          const label = (
            <>
              <span className="set-label">Set {row.setIndex + 1}</span>
              <span className="set-detail">
                {repsLabel(row.reps)}
                {row.weight ? ` · ${row.weight}` : ''}
              </span>
            </>
          );
          if (!tracking) {
            return (
              <div className="set-line" key={row.setIndex}>
                {label}
              </div>
            );
          }
          return (
            <button
              key={row.setIndex}
              className={`set-row${done ? ' done' : ''}${skipped ? ' skipped' : ''}`}
              disabled={skipped || ws!.completed}
              onClick={() => toggleSet(row.exIndex, row.setIndex)}
            >
              <span className={`set-tick${done ? ' done' : ''}`}>{done && <Icon name="check" style={{ width: 14, height: 14 }} />}</span>
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  async function handleShareLink() {
    if (!userId) return;
    const url = await createShareLink(userId, { name: w!.name, duration: w!.duration, exercises: w!.exercises, category: w!.category });
    if (!url) {
      showToast('Could not create the link');
      return;
    }
    try {
      await Clipboard.write({ string: url });
      showToast('Link copied');
    } catch {
      showToast(url);
    }
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
        <span>
          {tracking ? 'Tracking' : 'Program'}
          {tracking && (
            <span style={{ color: 'var(--text-faint)', fontWeight: 700, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
              {doneSets} / {totalSets} sets
            </span>
          )}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, gap: 5 }} onClick={handleShareLink}>
            <Icon name="link" style={{ width: 13, height: 13 }} /> Share link
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
            'Tick every set or skip to finish'
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
    </>
  );
}
