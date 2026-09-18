import { useAppStore } from '../../../store/useAppStore';
import { first } from '../../../lib/format';

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--line-soft)',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>{k}</span>
      <span style={{ fontWeight: 700 }}>{v}</span>
    </div>
  );
}

export function Summary() {
  const draft = useAppStore((s) => s.onbDraft);

  return (
    <>
      <h2>You’re set, {first(draft.name)}.</h2>
      <p className="lead">Here’s the profile we’ll build your first program from.</p>
      <div className="card" style={{ marginBottom: 10 }}>
        <SummaryRow k="Athlete" v={draft.character ? (draft.character.base === 'male' ? 'Male base' : 'Female base') : '—'} />
        <SummaryRow k="Goal" v={draft.goal.length ? draft.goal.join(', ') : '—'} />
        <SummaryRow k="Experience" v={draft.experience || '—'} />
        <SummaryRow k="Availability" v={`${draft.availability || '—'} days / week`} />
        <SummaryRow k="Equipment" v={draft.equipment.length ? draft.equipment.join(', ') : '—'} />
      </div>
      <p className="lead" style={{ marginTop: 14 }}>
        You can change all of this later in Profile.
      </p>
    </>
  );
}
