import { useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { getWorkout, myWorkouts, saveWorkout, deleteWorkout } from '../../lib/customWorkouts';
import { WORKOUT_TYPES } from '../../data/workoutTypes';
import { expandSets } from '../../lib/workoutSets';
import type { ExerciseDef, SetDef } from '../../types';

const GROUP_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function nextGroup(exercises: ExerciseDef[]): string {
  const used = new Set(exercises.map((e) => e.group).filter(Boolean));
  return GROUP_LETTERS.split('').find((l) => !used.has(l)) ?? 'Z';
}

// The editor always works on per-set rows (setList). Older programs are
// expanded into rows on load, so one editing path covers everything.
function toDraft(ex: ExerciseDef): ExerciseDef {
  return { ...ex, setList: expandSets(ex).map((s) => ({ ...s })) };
}

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
  const [exercises, setExercises] = useState<ExerciseDef[]>((owned?.exercises ?? preset?.exercises ?? []).map(toDraft));
  const [category, setCategory] = useState(owned?.category ?? preset?.category ?? 'gym');
  const [saving, setSaving] = useState(false);

  function updateExercise(i: number, patch: Partial<ExerciseDef>) {
    setExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function updateSet(i: number, k: number, patch: Partial<SetDef>) {
    setExercises((prev) =>
      prev.map((e, idx) => {
        if (idx !== i) return e;
        const setList = (e.setList ?? []).map((s, j) => (j === k ? { ...s, ...patch } : s));
        return { ...e, setList };
      }),
    );
  }
  function addSet(i: number) {
    setExercises((prev) =>
      prev.map((e, idx) => {
        if (idx !== i) return e;
        const list = e.setList ?? [];
        const last = list[list.length - 1] ?? { reps: '10' };
        return { ...e, setList: [...list, { ...last }] };
      }),
    );
  }
  function removeSet(i: number, k: number) {
    setExercises((prev) =>
      prev.map((e, idx) => (idx === i && (e.setList?.length ?? 0) > 1 ? { ...e, setList: (e.setList ?? []).filter((_, j) => j !== k) } : e)),
    );
  }
  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addExercise() {
    setExercises((prev) => [...prev, toDraft({ name: '', sets: 3, reps: '10' })]);
  }

  // Superset with the exercise above: joins its group (or starts a new one
  // with it). Exercises in the same group are done back to back.
  function toggleSupersetWithAbove(i: number) {
    setExercises((prev) => {
      const current = prev[i];
      if (current.group) return prev.map((e, idx) => (idx === i ? { ...e, group: undefined } : e));
      const above = prev[i - 1];
      const group = above?.group ?? nextGroup(prev);
      return prev.map((e, idx) => {
        if (idx === i) return { ...e, group };
        if (idx === i - 1 && !above.group) return { ...e, group };
        return e;
      });
    });
  }

  async function handleSave() {
    if (!userId) return;
    const clean = exercises
      .filter((e) => e.name.trim())
      .map((e) => {
        const setList = (e.setList ?? []).map((s) => ({
          reps: s.reps.trim(),
          weight: s.weight?.trim() || undefined,
        }));
        return {
          name: e.name.trim(),
          sets: setList.length || 1,
          reps: setList[0]?.reps ?? '',
          weight: setList[0]?.weight,
          distance: e.distance?.trim() || undefined,
          setList,
          group: e.group || undefined,
        };
      });
    if (!name.trim() || clean.length === 0) {
      showToast('Add a name and at least one exercise');
      return;
    }
    setSaving(true);
    const id = await saveWorkout(userId, { id: draftId, name: name.trim(), duration: duration.trim() || '30 min', exercises: clean, category });
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

      <div className="field">
        <label>Category</label>
        <div className="type-tabs" style={{ marginTop: 6 }}>
          {WORKOUT_TYPES.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`type-chip${category === w.id ? ' active' : ''}`}
              onClick={() => setCategory(w.id)}
            >
              <Icon name={w.icon} style={{ width: 14, height: 14 }} />
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-label">
        Exercises
        <button className="link-btn" onClick={addExercise}>
          <Icon name="plus" style={{ width: 13, height: 13 }} /> Add
        </button>
      </div>
      {exercises.length === 0 && <div className="card"><div className="empty-hint">No exercises yet — add one above.</div></div>}
      {exercises.map((ex, i) => {
        const sets = ex.setList ?? [];
        const prevGroup = i > 0 ? exercises[i - 1].group : undefined;
        const canLinkAbove = i > 0;
        return (
          <div className={`card ex-edit-block${ex.group ? ' in-superset' : ''}`} key={i} style={{ marginBottom: 12 }}>
            {ex.group && <div className="superset-label">Superset {ex.group}{prevGroup === ex.group ? '' : ' · starts here'}</div>}
            <div className="ex-edit-card-top">
              <input
                className="ex-edit-name"
                value={ex.name}
                onChange={(e) => updateExercise(i, { name: e.target.value })}
                placeholder="Exercise name"
              />
              <button className="ex-edit-remove" onClick={() => removeExercise(i)}>
                <Icon name="trash" />
              </button>
            </div>

            <div className="set-edit-head">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight</span>
              <span />
            </div>
            {sets.map((s, k) => (
              <div className="set-edit-row" key={k}>
                <span className="set-edit-no">{k + 1}</span>
                <input value={s.reps} onChange={(e) => updateSet(i, k, { reps: e.target.value })} placeholder="12" />
                <input value={s.weight ?? ''} onChange={(e) => updateSet(i, k, { weight: e.target.value })} placeholder="optional" />
                <button className="ex-edit-remove" disabled={sets.length <= 1} onClick={() => removeSet(i, k)} aria-label="Remove set">
                  <Icon name="trash" style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}
            <div className="ex-edit-actions">
              <button className="link-btn" onClick={() => addSet(i)}>
                <Icon name="plus" style={{ width: 13, height: 13 }} /> Add set
              </button>
              {canLinkAbove && (
                <button className={`skip-btn${ex.group ? ' on' : ''}`} onClick={() => toggleSupersetWithAbove(i)}>
                  {ex.group ? 'Unlink superset' : 'Superset with above'}
                </button>
              )}
            </div>

            <div className="ex-edit-card-row" style={{ marginTop: 8 }}>
              <div className="ex-edit-field">
                <label>Distance (optional)</label>
                <input value={ex.distance ?? ''} onChange={(e) => updateExercise(i, { distance: e.target.value })} placeholder="e.g. 5km" />
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ height: 8 }} />
      <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
        {draftId ? 'Save changes' : 'Create program'}
      </button>
      {draftId && (
        <>
          <div style={{ height: 10 }} />
          <button className="btn btn-danger-ghost" disabled={saving} onClick={handleDelete}>
            <Icon name="trash" style={{ width: 15, height: 15 }} /> Delete program
          </button>
        </>
      )}
    </>
  );
}
