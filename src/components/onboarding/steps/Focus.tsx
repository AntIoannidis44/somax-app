import { ChipGroup } from '../ChipGroup';
import { useAppStore } from '../../../store/useAppStore';

export const FOCUS_OPTIONS: { id: 'gym' | 'running' | 'hybrid'; name: string }[] = [
  { id: 'gym', name: 'Gym & weights' },
  { id: 'running', name: 'Running & walking' },
  { id: 'hybrid', name: 'Hybrid' },
];

export function Focus() {
  const draft = useAppStore((s) => s.onbDraft);
  const setOnbField = useAppStore((s) => s.setOnbField);

  return (
    <>
      <h2>What are you focused on?</h2>
      <p className="lead">Gym and weights, running and walking, or a mix of both.</p>
      <ChipGroup
        options={FOCUS_OPTIONS.map((f) => f.name)}
        value={FOCUS_OPTIONS.find((f) => f.id === draft.focus)?.name || ''}
        onSelect={(name) => setOnbField('focus', FOCUS_OPTIONS.find((f) => f.name === name)!.id)}
      />
    </>
  );
}
