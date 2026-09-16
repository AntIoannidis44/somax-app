import { useAppStore } from '../../../store/useAppStore';

export function Body() {
  const draft = useAppStore((s) => s.onbDraft);
  const setOnbField = useAppStore((s) => s.setOnbField);

  return (
    <>
      <h2>A couple of body stats</h2>
      <p className="lead">Used to personalise load and XP targets — never shown publicly.</p>
      <div className="row2">
        <div className="field">
          <label>Height (cm)</label>
          <input
            type="number"
            placeholder="178"
            value={draft.height}
            onChange={(e) => setOnbField('height', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Weight (kg)</label>
          <input
            type="number"
            placeholder="76"
            value={draft.weight}
            onChange={(e) => setOnbField('weight', e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
