import { ICON_PATHS, type IconName } from '../data/icons';

interface IconProps {
  name: IconName;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}
