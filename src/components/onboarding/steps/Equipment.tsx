import { ChipGroup } from '../ChipGroup';
import { useAppStore } from '../../../store/useAppStore';

const EQUIPMENT = ['Full gym', 'Dumbbells', 'Barbell', 'Bands', 'Bodyweight only', 'Cardio machine'];

export function Equipment() {
  const draft = useAppStore((s) => s.onbDraft);
  const toggleOnbMulti = useAppStore((s) => s.toggleOnbMulti);

  return (
    <>
      <h2>What have you got access to?</h2>
      <p className="lead">Pick everything that applies.</p>
      <ChipGroup options={EQUIPMENT} value={draft.equipment} onSelect={(v) => toggleOnbMulti('equipment', v)} />
    </>
  );
}
