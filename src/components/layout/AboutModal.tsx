import { Modal } from './Modal';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="About this build">
      <div className="about-block">
        <h4>The idea</h4>
        <p>
          Somax turns real-world training consistency into visible game progression. Train, complete goals, earn XP,
          level up, compete in leagues — the same loop as an RPG, except the grind is your actual fitness.
        </p>
      </div>
      <div className="about-block">
        <h4>What this prototype is</h4>
        <p>
          A fully click-through beta of the core product: onboarding, daily goals, a training program, the XP &amp;
          level engine, challenges, a league leaderboard and profile stats. It's a static, front-end-only build —
          there's no server, so XP is calculated in your browser and saved to this device only.
        </p>
      </div>
      <div className="about-block">
        <h4>In production</h4>
        <ul>
          <li>XP is server-authoritative — the client never decides an award, the backend validates it.</li>
          <li>Every award writes an audit-trail event so leaderboard disputes can be investigated.</li>
          <li>Daily XP caps and duplicate-activity detection keep league rankings fair.</li>
        </ul>
      </div>
      <div className="about-block">
        <h4>Planned stack</h4>
        <div className="about-stack">
          <span className="stack-pill">Expo / React Native</span>
          <span className="stack-pill">TypeScript</span>
          <span className="stack-pill">Supabase / Postgres</span>
          <span className="stack-pill">Row-level auth</span>
        </div>
      </div>
      <div className="about-block" style={{ marginBottom: 0 }}>
        <h4>Beta hypothesis</h4>
        <p>
          Does turning fitness consistency into visible game progression make people more likely to actually keep
          their training consistent? This build exists to test that, nothing more.
        </p>
      </div>
    </Modal>
  );
}
