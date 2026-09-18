import { useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { getWorkout, myWorkouts, saveWorkout, deleteWorkout, shareLinkFor } from '../../lib/customWorkouts';
import type { ExerciseDef } from '../../types';

export function WorkoutEditorScreen() {
  const sourceKey = useAppStore((s) => s.viewingWorkoutEditor)!;
  const closeWorkoutEditor = useAppStore((s) => s.closeWorkoutEditor);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();

  const owned = sourceKey !== 'new' ? myWorkouts().find((w) => w.id === sourceKey) : undefined;
  const preset = sourceKey !== 'new' && !owned ? getWorkout(sourceKey) : undefined;

  const [draftId] = useState<string | undefined>(owned?.id);
  const [name, setName] = useState(owned?.name ?? preset?.name ?? '');
  const [duration, setDuration] = useState(owned?.duration ?? preset?.duration ?? '30 min');
  const [exercises, setExercises] = useState<ExerciseDef[]>(
    (owned?.exercises ?? preset?.exercises ?? []).map((e) => ({ ...e })),
  );
  const [saving, setSaving] = useState(false);

  function updateExercise(i: number, patch: Partial<ExerciseDef>) {
    setExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addExercise() {
    setExercises((prev) => [...prev, { name: '', sets: 3, reps: '10' }]);
  }

  async function handleSave() {
    if (!userId) return;
    const clean = exercises
      .filter((e) => e.name.trim())
      .map((e) => ({ name: e.name.trim(), sets: e.sets || 1, reps: e.reps.trim() || '10', weight: e.weight?.trim() || undefined }));
    if (!name.trim() || clean.length === 0) {
      showToast('Add a name and at least one exercise');
      return;
    }
    setSaving(true);
    const id = await saveWorkout(userId, { id: draftId, name: name.trim(), duration: duration.trim() || '30 min', exercises: clean });
    setSaving(false);
    if (id) {
      showToast(draftId ? 'Program updated' : 'Program created');
      closeWorkoutEditor();
    } else {
      showToast('Something went wrong saving this program');
    }
  }

  async function handleDelete() {
    if (!userId || !draftId) return;
    setSaving(true);
    await deleteWorkout(userId, draftId);
    setSaving(false);
    showToast('Program deleted');
    closeWorkoutEditor();
  }

  function handleShare() {
    if (!draftId) return;
    const link = shareLinkFor(draftId);
    navigator.clipboard?.writeText(link).then(
      () => showToast('Share link copied'),
      () => showToast(link),
    );
  }

  return (
    <>
      <div className="banner">
        <Icon name="info" />
        <span>{draftId ? 'Editing your own program.' : 'Editing a preset creates your own copy — the original stays unchanged.'}</span>
      </div>

      <div className="field">
        <label>Program name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Day" />
      </div>
      <div className="field">
        <label>Duration</label>
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45 min" />
      </div>

      <div className="section-label">
        Exercises
        <button className="link-btn" onClick={addExercise}>
          <Icon name="plus" style={{ width: 13, height: 13 }} /> Add
        </button>
      </div>
      <div className="card">
        {exercises.length === 0 && <div className="empty-hint">No exercises yet — add one above.</div>}
        {exercises.map((ex, i) => (
          <div className="ex-edit-row" key={i}>
            <input
              className="ex-edit-name"
              value={ex.name}
              onChange={(e) => updateExercise(i, { name: e.target.value })}
              placeholder="Exercise name"
            />
            <input
              className="ex-edit-num"
              value={ex.sets}
              onChange={(e) => updateExercise(i, { sets: Math.max(1, Number(e.target.value) || 1) })}
              inputMode="numeric"
              placeholder="Sets"
            />
            <input
              className="ex-edit-num"
              value={ex.reps}
              onChange={(e) => updateExercise(i, { reps: e.target.value })}
              placeholder="Reps"
            />
            <input
              className="ex-edit-num"
              value={ex.weight ?? ''}
              onChange={(e) => updateExercise(i, { weight: e.target.value })}
              placeholder="Weight"
            />
            <button className="ex-edit-remove" onClick={() => removeExercise(i)}>
              <Icon name="trash" />
            </button>
          </div>
        ))}
      </div>

      <div style={{ height: 8 }} />
      <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
        {draftId ? 'Save changes' : 'Create program'}
      </button>
      {draftId && (
        <>
          <div style={{ height: 10 }} />
          <button className="btn btn-ghost" disabled={saving} onClick={handleShare}>
            <Icon name="link" style={{ width: 15, height: 15 }} /> Copy share link
          </button>
          <div style={{ height: 10 }} />
          <button className="btn btn-danger-ghost" disabled={saving} onClick={handleDelete}>
            <Icon name="trash" style={{ width: 15, height: 15 }} /> Delete program
          </button>
        </>
      )}
    </>
  );
}
