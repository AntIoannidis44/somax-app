// Each group gets a stable colour from its name - shared by the Messages
// inbox row and the chat header, so a group's identity (no photo set) looks
// the same everywhere it shows up.
export const GROUP_GRADIENTS = [
  'linear-gradient(140deg, #0f8f5c, #0b5a3a)',
  'linear-gradient(140deg, #d4425c, #7a1d2c)',
  'linear-gradient(140deg, #1554e6, #0b2f8e)',
  'linear-gradient(140deg, #8936e8, #4b1a8c)',
  'linear-gradient(140deg, #c1830f, #7a4a08)',
  'linear-gradient(140deg, #0f95a5, #0a5560)',
];

export function hashName(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function groupGradient(name: string): string {
  return GROUP_GRADIENTS[hashName(name) % GROUP_GRADIENTS.length];
}
