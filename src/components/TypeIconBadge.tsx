import { Icon } from './Icon';
import { workoutTypeById } from '../data/workoutTypes';
import type { IconName } from '../data/icons';

// The colored icon badge for "what kind of session is this" - one shared
// component so Train's week list, program rows, feed cards and DM cards
// all render the exact same badge instead of each having their own
// slightly-different gray-circle markup.
export function TypeIconBadge({ category, size = 34, fallbackIcon = 'zap' }: { category: string | null | undefined; size?: number; fallbackIcon?: IconName }) {
  const wt = workoutTypeById(category ?? undefined);
  const colorVar = wt?.colorVar ?? '--text-faint';
  return (
    <div
      className="type-icon-badge"
      style={{ width: size, height: size, background: `var(${colorVar})`, ['--badge-color' as string]: `var(${colorVar})` }}
    >
      <Icon name={wt?.icon ?? fallbackIcon} style={{ width: size * 0.47, height: size * 0.47 }} />
    </div>
  );
}
