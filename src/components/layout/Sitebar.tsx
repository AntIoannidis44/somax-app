interface SitebarProps {
  onAboutClick: () => void;
}

export function Sitebar({ onAboutClick }: SitebarProps) {
  return (
    <div className="sitebar">
      <div className="brand">
        <span className="brand-mark">
          SO<b>MAX</b>
        </span>
        <span className="beta-pill">Beta</span>
      </div>
      <button className="about-link" onClick={onAboutClick}>
        About this build
      </button>
    </div>
  );
}
