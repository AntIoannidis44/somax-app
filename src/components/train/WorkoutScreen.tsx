import { Icon } from '../Icon';
import { exerciseMeta } from '../../data/workouts';
import { getWorkout } from '../../lib/customWorkouts';
import { useAppStore } from '../../store/useAppStore';

export function WorkoutScreen() {
  const wid = useAppStore((s) => s.viewingWorkout)!;
  const simDay = useAppStore((s) => s.simDay);
  const ws = useAppStore((s) => s.workoutState[simDay]?.[wid]);
  const toggleExercise = useAppStore((s) => s.toggleExercise);
  const finishWorkout = useAppStore((s) => s.finishWorkout);
  const openWorkoutEditor = useAppStore((s) => s.openWorkoutEditor);

  const w = getWorkout(wid);
  if (!ws || !w) return null;

  const doneCount = w.exercises.filter((_, i) => ws.exDone[i]).length;
  const allDone = doneCount === w.exercises.length;

  return (
    <>
      <div className="banner">
        <Icon name="info" />
        <span>
          Mark each exercise as you finish your sets. Completing the whole session awards session XP once — repeats
          on the same day don’t double up.
        </span>
      </div>
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>
          Exercises
          <span style={{ color: 'var(--text-faint)', fontWeight: 700, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
            {doneCount} / {w.exercises.length}
          </span>
        </span>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openWorkoutEditor(wid)}>
          <Icon name="edit" style={{ width: 14, height: 14 }} /> Edit
        </button>
      </div>
      {w.exercises.map((ex, i) => {
        const d = !!ws.exDone[i];
        return (
          <div className={`ex-card${d ? ' done' : ''}`} key={i}>
            <div className="ex-num">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="ex-name">{ex.name}</div>
              <div className="ex-meta">{exerciseMeta(ex)}</div>
            </div>
            <button className={`ex-toggle${d ? ' done' : ''}`} onClick={() => toggleExercise(i)}>
              <Icon name="check" />
            </button>
          </div>
        );
      })}
      <div style={{ height: 8 }} />
      <button
        className={`btn ${ws.completed ? 'btn-ghost' : 'btn-primary'}`}
        disabled={!allDone || ws.completed}
        style={{ marginTop: 6 }}
        onClick={() => finishWorkout(wid)}
      >
        {ws.completed ? (
          <>
            <Icon name="check" style={{ width: 16, height: 16 }} /> Workout completed
          </>
        ) : allDone ? (
          'Finish workout · +40 XP'
        ) : (
          'Complete all exercises to finish'
        )}
      </button>
    </>
  );
}
