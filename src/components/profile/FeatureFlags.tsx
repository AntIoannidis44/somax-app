const FLAGS = [
  { name: 'Challenges', on: true },
  { name: 'Leagues', on: true },
  { name: 'Character Mode', on: true },
  { name: 'AI Coach', on: false },
  { name: 'Nutrition tracking', on: false },
  { name: 'Store', on: false },
];

export function FeatureFlags() {
  return (
    <div className="card">
      {FLAGS.map((f) => (
        <div className="flag-row" key={f.name}>
          <span className="flag-name">{f.name}</span>
          <span className={`flag-badge ${f.on ? 'on' : 'off'}`}>{f.on ? 'Live' : 'Coming soon'}</span>
        </div>
      ))}
    </div>
  );
}
