import { ChipGroup } from '../ChipGroup';
import { useAppStore } from '../../../store/useAppStore';

const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
const DAYS = ['2', '3', '4', '5', '6'];

export function Experience() {
  const draft = useAppStore((s) => s.onbDraft);
  const setOnbField = useAppStore((s) => s.setOnbField);

  return (
    <>
      <h2>Training experience</h2>
      <p className="lead">And how many days a week can you realistically train?</p>
      <div style={{ marginBottom: 22 }}>
        <ChipGroup options={EXPERIENCE} value={draft.experience} onSelect={(v) => setOnbField('experience', v)} />
      </div>
      <div className="field">
        <label>Days per week</label>
      </div>
      <ChipGroup options={DAYS} value={draft.availability} onSelect={(v) => setOnbField('availability', v)} />
    </>
  );
}
