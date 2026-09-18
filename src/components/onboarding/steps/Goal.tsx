import { ChipGroup } from '../ChipGroup';
import { useAppStore } from '../../../store/useAppStore';

export const GOALS = ['Build strength', 'Lose fat', 'General fitness', 'Endurance', 'Muscle gain', 'Aerobic fitness'];

export function Goal() {
  const draft = useAppStore((s) => s.onbDraft);
  const toggleOnbMulti = useAppStore((s) => s.toggleOnbMulti);

  return (
    <>
      <h2>What’s the main goal?</h2>
      <p className="lead">Pick everything that applies - this shapes the program we assign you.</p>
      <ChipGroup options={GOALS} value={draft.goal} onSelect={(v) => toggleOnbMulti('goal', v)} />
    </>
  );
}
