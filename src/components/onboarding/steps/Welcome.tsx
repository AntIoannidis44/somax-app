import { Icon } from '../../Icon';

export function Welcome() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 26 }}>
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 22,
          background: 'linear-gradient(155deg, var(--accent), var(--accent-2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
          boxShadow: '0 16px 30px -12px color-mix(in srgb, var(--accent) 55%, transparent)',
        }}
      >
        <Icon name="zap" style={{ width: 34, height: 34, stroke: '#fff' }} />
      </div>
      <h2 style={{ fontSize: 26 }}>Your life is the game.</h2>
      <p className="lead" style={{ maxWidth: 280 }}>
        Somax turns real training into XP, levels and league rank. Two minutes of setup, then straight into today’s
        session.
      </p>
    </div>
  );
}
