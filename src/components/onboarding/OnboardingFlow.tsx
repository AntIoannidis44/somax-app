import { useAppStore } from '../../store/useAppStore';
import type { OnboardingDraft } from '../../types';
import { Welcome } from './steps/Welcome';
import { Identity } from './steps/Identity';
import { Body } from './steps/Body';
import { Goal } from './steps/Goal';
import { Experience } from './steps/Experience';
import { Equipment } from './steps/Equipment';
import { CharacterStep } from './steps/CharacterStep';
import { Summary } from './steps/Summary';

const ONB_STEPS = ['welcome', 'identity', 'body', 'goal', 'experience', 'equipment', 'character', 'summary'] as const;

function stepValid(step: string, d: OnboardingDraft): boolean {
  if (step === 'identity') return d.name.trim().length > 1 && !!d.age;
  if (step === 'body') return !!d.height && !!d.weight;
  if (step === 'goal') return d.goal.length > 0;
  if (step === 'experience') return !!d.experience && !!d.availability;
  if (step === 'equipment') return d.equipment.length > 0;
  if (step === 'character') return !!d.character;
  return true;
}

export function OnboardingFlow() {
  const onbStep = useAppStore((s) => s.onbStep);
  const draft = useAppStore((s) => s.onbDraft);
  const onbNext = useAppStore((s) => s.onbNext);
  const onbBack = useAppStore((s) => s.onbBack);
  const finishOnboarding = useAppStore((s) => s.finishOnboarding);

  const step = ONB_STEPS[onbStep];
  const canNext = stepValid(step, draft);

  return (
    <div className="onb">
      {onbStep > 0 && (
        <div className="onb-progress">
          {ONB_STEPS.slice(1).map((s, i) => {
            const idx = i + 1;
            const cls = idx < onbStep ? 'done' : idx === onbStep ? 'current' : '';
            return (
              <div key={s} className={`onb-dot ${cls}`}>
                <i />
              </div>
            );
          })}
        </div>
      )}
      <div className="onb-body">
        {step === 'welcome' && <Welcome />}
        {step === 'identity' && <Identity />}
        {step === 'body' && <Body />}
        {step === 'goal' && <Goal />}
        {step === 'experience' && <Experience />}
        {step === 'equipment' && <Equipment />}
        {step === 'character' && <CharacterStep />}
        {step === 'summary' && <Summary />}
      </div>
      <div className="onb-foot">
        {step === 'welcome' ? (
          <button className="btn btn-primary" onClick={onbNext}>
            Get started
          </button>
        ) : step === 'summary' ? (
          <>
            <button className="btn btn-ghost btn-sm" onClick={onbBack}>
              Back
            </button>
            <button className="btn btn-primary" onClick={finishOnboarding}>
              Create my profile
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={onbBack}>
              Back
            </button>
            <button className="btn btn-primary" onClick={onbNext} disabled={!canNext}>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
