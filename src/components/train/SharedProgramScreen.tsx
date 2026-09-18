import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { exerciseMeta } from '../../data/workouts';
import { fetchWorkoutById, importWorkout, type CustomWorkout } from '../../lib/customWorkouts';

export function SharedProgramScreen() {
  const id = useAppStore((s) => s.viewingSharedProgram)!;
  const closeSharedProgram = useAppStore((s) => s.closeSharedProgram);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();

  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');
  const [program, setProgram] = useState<CustomWorkout | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchWorkoutById(id).then((w) => {
      if (cancelled) return;
      setProgram(w);
      setStatus(w ? 'found' : 'missing');
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleImport() {
    if (!userId || !program) return;
    setImporting(true);
    const newId = await importWorkout(userId, program);
    setImporting(false);
    if (newId) {
      showToast('Added to your programs');
      closeSharedProgram();
    } else {
      showToast('Something went wrong importing this program');
    }
  }

  if (status === 'loading') {
    return (
      <div className="empty-hint" style={{ padding: '40px 2px', textAlign: 'center' }}>
        Loading shared program…
      </div>
    );
  }

  if (status === 'missing' || !program) {
    return (
      <>
        <div className="banner">
          <Icon name="info" />
          <span>This shared program link is no longer valid.</span>
        </div>
        <button className="btn btn-ghost" onClick={closeSharedProgram}>
          Back
        </button>
      </>
    );
  }

  return (
    <>
      <div className="banner">
        <Icon name="info" />
        <span>Someone shared this training program with you. Add it to make it your own, editable copy.</span>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="wc-title" style={{ fontSize: 17, marginBottom: 4 }}>
          {program.name}
        </div>
        <div className="wc-sub">
          {program.duration} · {program.exercises.length} exercises
        </div>
      </div>
      <div className="section-label">Exercises</div>
      <div className="card">
        {program.exercises.map((ex, i) => (
          <div className="ex-card" key={i}>
            <div className="ex-num">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="ex-name">{ex.name}</div>
              <div className="ex-meta">{exerciseMeta(ex)}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 8 }} />
      <button className="btn btn-primary" disabled={importing} onClick={handleImport}>
        <Icon name="plus" style={{ width: 15, height: 15 }} /> Add to my programs
      </button>
      <div style={{ height: 10 }} />
      <button className="btn btn-ghost" onClick={closeSharedProgram}>
        Not now
      </button>
    </>
  );
}
