import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { getExerciseHowTo, getExerciseSourceLink, hasExerciseHowTo, type ExerciseHowTo } from '../../lib/exerciseHowTo';

// Full-screen how-to overlay, same takeover pattern as the rest of the app
// (FoodSearchOverlay etc. - see feedback_fullscreen_overlay_convention).
// Styling approved via artifact https://claude.ai/artifact/5RXKaDbYBB98DrJpS5WcPv
// before any image was generated; see exercise-howto/research for the
// sports-science verification behind every muscle claim shown here.
function HowToOverlay({ name, data, onClose }: { name: string; data: ExerciseHowTo; onClose: () => void }) {
  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close how-to">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
      </div>
      <div className="macro-search-results">
        <div className="howto-diagram">
          <img src={data.imageUrl} alt={`How to do ${name}`} />
          <div className="howto-legend">
            <span><i style={{ background: '#e6453f' }} /> Primary - {data.primaryMuscle}</span>
            {data.secondaryMuscle && <span><i style={{ background: '#f2a74b' }} /> Secondary - {data.secondaryMuscle}</span>}
          </div>
        </div>
        {(data.bestPracticeJudgment || data.confidence === 'low' || data.confidence === 'low-moderate') && (
          <div className="howto-caveat">
            {data.bestPracticeJudgment
              ? "This movement doesn't have a credible sports-science source for muscle targeting - the muscle shown is our best general judgment, not a verified citation."
              : 'Credible sources vary on exactly how this movement is classified - treat this as a general guide rather than a precise measurement.'}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// OFF until the image audit is finished and the owner approves (2026-11-18).
// See howto-pipeline/STATE.md. Flip to true only on the owner's go.
export const HOWTO_ENABLED = false;

export function ExerciseHowToButton({ name }: { name: string }) {
  if (!HOWTO_ENABLED) return null;
  return <HowToButtonInner name={name} />;
}

function HowToButtonInner({ name }: { name: string }) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ExerciseHowTo | null>(null);
  const [source, setSource] = useState<{ link: string; linkLabel: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    hasExerciseHowTo(name).then((v) => {
      if (cancelled) return;
      setAvailable(v);
      if (!v) getExerciseSourceLink(name).then((s) => !cancelled && setSource(s));
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  // No picture of our own, but the original program has a demonstration - open that.
  if (!available && source) {
    return (
      <a className="ex-howto" href={source.link} target="_blank" rel="noreferrer" aria-label={`How to do ${name} - ${source.linkLabel}`}>
        <Icon name="link" style={{ width: 15, height: 15 }} />
      </a>
    );
  }

  if (!available) {
    return (
      <span className="ex-howto pending" aria-label="How-to coming soon">
        <Icon name="info" style={{ width: 15, height: 15 }} />
      </span>
    );
  }

  return (
    <>
      <button
        className="ex-howto"
        aria-label={`How to do ${name}`}
        onClick={() => {
          setOpen(true);
          if (!data) getExerciseHowTo(name).then(setData);
        }}
      >
        <Icon name="info" style={{ width: 15, height: 15 }} />
      </button>
      {open && data && <HowToOverlay name={name} data={data} onClose={() => setOpen(false)} />}
    </>
  );
}
