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
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
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
  expand: '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  link: '<path d="M9 15l6-6"/><path d="M13 5.5 15 3.5a3.5 3.5 0 0 1 5 5L18 10.5"/><path d="M11 18.5 9 20.5a3.5 3.5 0 0 1-5-5L6 13.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  watch:
    '<rect x="7" y="7" width="10" height="10" rx="3"/><path d="M9 7V4h6v3M9 20v-3h6v3"/><path d="M12 10v2.5l1.5 1"/>',
  camera:
    '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/>',
  comment:
    '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4.5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
  // Workout types (feed tagging, league, icons list).
  run: '<circle cx="14.5" cy="4.5" r="1.7"/><path d="M11.5 8.5 9 11l2.5 2-1 5"/><path d="M8.5 11.5 5 13.5"/><path d="M11.5 8.5l3 2 3-1"/><path d="M14.5 10.5l1.5 4.5-3 3.5"/>',
  walk: '<circle cx="13" cy="4.5" r="1.7"/><path d="M12.5 7.5v5l-3 3.5"/><path d="M12.5 11.5l3.5 2"/><path d="M9 16.5 7 20.5"/><path d="M16 13.5l1 7"/>',
  ride: '<circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17 9.5 9h4l3 8"/><path d="M9.5 9h3.2"/><path d="M12.7 9 15 13h3"/>',
  swim: '<circle cx="8.5" cy="6.5" r="1.7"/><path d="M6 10.5l2-2 3 1 2.5-2"/><path d="M11 9.5l3 2.5"/><path d="M2.5 16c1.6 1.6 3.2 1.6 4.8 0s3.2-1.6 4.8 0 3.2 1.6 4.8 0 3.2-1.6 4.8 0"/><path d="M2.5 20c1.6 1.6 3.2 1.6 4.8 0s3.2-1.6 4.8 0 3.2 1.6 4.8 0 3.2-1.6 4.8 0"/>',
  fitness: '<path d="M2.5 13h3.5l2-6 4 11 2-7 1.5 2H21.5"/>',
  other: '<circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/>',
  music: '<circle cx="6.5" cy="18" r="2.3"/><circle cx="17" cy="16" r="2.3"/><path d="M8.8 18V5.5L19.3 3v13"/><path d="M8.8 9.5 19.3 7"/>',
  scale: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M8.3 10.5a5 5 0 0 1 7.4 0"/><path d="m12 10.5 1.6-2.2"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  go: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  attire: '<path d="M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3Z"/>',
  droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  hairstyle: '<path d="M5 13c0-5 3-9 7-9s7 4 7 9"/><path d="M5 13c0 4 1 7 3 8M19 13c0 4-1 7-3 8"/><path d="M8 8c2 2 6 2 8 0"/>',
};

export type IconName = keyof typeof ICON_PATHS;
