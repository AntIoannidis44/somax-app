export function first(name: string | undefined | null): string {
  return (name || 'Athlete').split(' ')[0];
}

export function initials(name: string): string {
  return name
    .split(/[\s_.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}
