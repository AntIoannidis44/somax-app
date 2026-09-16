import { useAppStore } from '../../../store/useAppStore';

export function Identity() {
  const draft = useAppStore((s) => s.onbDraft);
  const setOnbField = useAppStore((s) => s.setOnbField);

  return (
    <>
      <h2>What should we call you?</h2>
      <p className="lead">Used across your profile and the league leaderboard.</p>
      <div className="field">
        <label>Full name</label>
        <input
          type="text"
          placeholder="Alex Rivera"
          value={draft.name}
          onChange={(e) => setOnbField('name', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Age</label>
        <input
          type="number"
          min={13}
          max={90}
          placeholder="27"
          value={draft.age}
          onChange={(e) => setOnbField('age', e.target.value)}
        />
      </div>
    </>
  );
}
