import { ChipGroup } from '../ChipGroup';
import { useAppStore } from '../../../store/useAppStore';

const GOALS = ['Build strength', 'Lose fat', 'General fitness', 'Endurance', 'Muscle gain'];

export function Goal() {
  const draft = useAppStore((s) => s.onbDraft);
  const setOnbField = useAppStore((s) => s.setOnbField);

  return (
    <>
      <h2>What’s the main goal?</h2>
      <p className="lead">This shapes the program we assign you.</p>
      <ChipGroup options={GOALS} value={draft.goal} onSelect={(v) => setOnbField('goal', v)} />
    </>
  );
}
