export const ICON_PATHS: Record<string, string> = {
  home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>',
  train: '<path d="M3 8.5v7M6 6v12M18 6v12M21 8.5v7M6 12h12"/>',
  play: '<path d="M6 21c1.5-4 1.5-14 0-18M18 21c-1.5-4-1.5-14 0-18M6 3h12M6 21h12"/>',
  community:
    '<circle cx="9" cy="8" r="3"/><path d="M2.5 19c.7-3 2.7-5 6.5-5s5.8 2 6.5 5"/><circle cx="17.5" cy="9" r="2.3"/><path d="M15.8 12.3c2.6.2 4 1.8 4.6 4"/>',
  profile: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-4.2 4-6.3 7.5-6.3s6.3 2.1 7.5 6.3"/>',
  check: '<polyline points="4 12 9 17 20 6"/>',
  chevron: '<polyline points="9 6 15 12 9 18"/>',
  dumbbell: '<path d="M4 8v8M20 8v8M4 12H2M22 12h-2M7 6v12M17 6v12"/>',
  flame:
    '<path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 1-1.5 1-1.5 1.5 1.5 2 3.5 2 5A5 5 0 0 1 7 13.5C7 9 12 8 12 3Z"/>',
  heart: '<path d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.6-9.5 9-9.5 9Z"/>',
  trophy:
    '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5a3 3 0 0 0 3 5M16 5h3a3 3 0 0 1-3 5"/><path d="M10 15v2h4v-2M9 21h6M12 17v4"/>',
  zap: '<polygon points="12 2 4 14 11 14 10 22 20 9 13 9 12 2"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  coffee:
    '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M7 3.5c-.6.6-.6 1.4 0 2M11 3.5c-.6.6-.6 1.4 0 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8v.01"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  rotate:
    '<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/>',
  steps:
    '<path d="M8 20a3 3 0 0 1-3-3v-3a3 3 0 0 1 6 0v3a3 3 0 0 1-3 3Z"/><path d="M16 12a3 3 0 0 1-3-3V6a3 3 0 0 1 6 0v3a3 3 0 0 1-3 3Z"/><path d="M5 20h6M13 12h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
};

export type IconName = keyof typeof ICON_PATHS;
