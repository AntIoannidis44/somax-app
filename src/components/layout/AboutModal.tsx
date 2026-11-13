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
        <h4>What this build is</h4>
        <p>
          A real account on a real backend: onboarding, daily goals, a training program, the XP &amp; level engine,
          challenges, a league leaderboard, community, messaging and macro tracking. Your account, progress and XP
          are saved to the cloud and sync across your devices — nothing here is local-only.
        </p>
      </div>
      <div className="about-block">
        <h4>Known limitation</h4>
        <ul>
          <li>XP amounts are still calculated on your device, not independently verified by the server.</li>
          <li>There's no audit-trail event per award yet, so a disputed leaderboard figure can't be traced.</li>
          <li>Daily XP caps exist, but duplicate-activity detection beyond that is still basic.</li>
        </ul>
      </div>
      <div className="about-block">
        <h4>Beta hypothesis</h4>
        <p>
          Does turning fitness consistency into visible game progression make people more likely to actually keep
          their training consistent? This build exists to test that, nothing more.
        </p>
      </div>
      <div className="about-block" style={{ marginBottom: 0 }}>
        <h4>Nutrition data</h4>
        <p>
          Barcode and packaged-product data provided by{' '}
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">
            Open Food Facts
          </a>
          , a free, open database built by a community of contributors, used under the Open Database License.
          Generic whole-food data (fruit, vegetables, meat, grains and other staples) from the U.S. Department of
          Agriculture's{' '}
          <a href="https://fdc.nal.usda.gov" target="_blank" rel="noopener noreferrer">
            FoodData Central
          </a>
          , public domain.
        </p>
      </div>
    </Modal>
  );
}
