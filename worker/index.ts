interface Env {
  ASSETS: { fetch: typeof fetch };
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface SetDef {
  reps: string;
  weight?: string;
}

interface ExerciseDef {
  name: string;
  sets?: number;
  reps?: string;
  weight?: string;
  distance?: string;
  setList?: SetDef[];
}

interface SharedProgramRow {
  name: string;
  duration: string;
  category: string;
  exercises: ExerciseDef[];
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// Mirrors src/lib/workoutSets.ts's expandSets - duplicated here since this
// worker is a standalone deploy target, not bundled through the app's Vite
// build, so it can't import from src/lib directly.
function expandSets(ex: ExerciseDef): SetDef[] {
  if (ex.setList && ex.setList.length > 0) return ex.setList;
  const count = Math.max(1, ex.sets || 1);
  const reps = ex.reps ?? '';
  const repParts = reps.split(',').map((r) => r.trim()).filter(Boolean);
  const weightParts = (ex.weight ?? '').split(',').map((w) => w.trim()).filter(Boolean);
  return Array.from({ length: count }, (_, i) => ({
    reps: repParts[i] ?? repParts[repParts.length - 1] ?? reps,
    weight: weightParts[i] ?? weightParts[weightParts.length - 1] ?? undefined,
  }));
}

function exerciseMeta(ex: ExerciseDef): string {
  const sets = expandSets(ex);
  if (ex.distance && !ex.setList) {
    return `${sets.length} × ${ex.reps || ex.distance}${ex.reps ? ` · ${ex.distance}` : ''}`;
  }
  const repsList = sets.map((s) => s.reps);
  const repsStr = repsList.every((r) => r === repsList[0]) ? repsList[0] : repsList.join(', ');
  const weight = sets[0]?.weight;
  const base = `${sets.length} × ${repsStr}`;
  return weight ? `${base} · ${weight}` : base;
}

// Matches the ids in src/data/workoutTypes.ts - each has a matching inline
// icon below and a pre-rendered badge in public/share-icons/, both built
// from the same path data as src/data/icons.ts so the preview matches the
// in-app icon exactly.
const TYPE_ICONS: Record<string, string> = {
  fitness: '<path d="M2.5 13h3.5l2-6 4 11 2-7 1.5 2H21.5"/>',
  gym: '<path d="M4 8v8M20 8v8M4 12H2M22 12h-2M7 6v12M17 6v12"/>',
  run: '<circle cx="14.5" cy="4.5" r="1.7"/><path d="M11.5 8.5 9 11l2.5 2-1 5"/><path d="M8.5 11.5 5 13.5"/><path d="M11.5 8.5l3 2 3-1"/><path d="M14.5 10.5l1.5 4.5-3 3.5"/>',
  walk: '<circle cx="13" cy="4.5" r="1.7"/><path d="M12.5 7.5v5l-3 3.5"/><path d="M12.5 11.5l3.5 2"/><path d="M9 16.5 7 20.5"/><path d="M16 13.5l1 7"/>',
  ride: '<circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17 9.5 9h4l3 8"/><path d="M9.5 9h3.2"/><path d="M12.7 9 15 13h3"/>',
  swim: '<circle cx="8.5" cy="6.5" r="1.7"/><path d="M6 10.5l2-2 3 1 2.5-2"/><path d="M11 9.5l3 2.5"/><path d="M2.5 16c1.6 1.6 3.2 1.6 4.8 0s3.2-1.6 4.8 0 3.2 1.6 4.8 0 3.2-1.6 4.8 0"/><path d="M2.5 20c1.6 1.6 3.2 1.6 4.8 0s3.2-1.6 4.8 0 3.2 1.6 4.8 0 3.2-1.6 4.8 0"/>',
  other: '<circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/>',
};

function renderProgramPage(code: string, program: SharedProgramRow): string {
  const title = `${program.name} · Somaxx`;
  const desc = `${program.duration} · ${program.exercises.length} exercises · shared from Somaxx`;
  const iconType = TYPE_ICONS[program.category] ? program.category : 'other';
  const imageUrl = `https://somaxx.app/share-icons/${iconType}.png`;

  const exerciseList = program.exercises
    .map(
      (ex, i) => `<div class="ex-row">
        <div class="ex-num">${i + 1}</div>
        <div class="ex-info">
          <div class="ex-name">${escapeHtml(ex.name)}</div>
          <div class="ex-meta">${escapeHtml(exerciseMeta(ex))}</div>
        </div>
      </div>`,
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta name="twitter:card" content="summary">
<meta name="twitter:image" content="${imageUrl}">
<style>
  :root{ color-scheme: light; }
  *{ box-sizing: border-box; }
  body{
    margin:0; background:#eef0f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#15172a;
    display:flex; justify-content:center; padding:28px 16px 90px; min-height:100vh;
  }
  .phone{ max-width:400px; width:100%; }
  .brand{ display:flex; align-items:center; gap:7px; margin-bottom:16px; color:#5a5f78; font-weight:800; font-size:12.5px; letter-spacing:.06em; text-transform:uppercase; }
  .brand svg{ width:15px; height:15px; }
  .card{ background:#fff; border-radius:26px; overflow:hidden; box-shadow:0 24px 60px -24px rgba(20,30,70,.3); }
  .hero{ background:linear-gradient(152deg,#3454e8,#6c3ef0); padding:26px 22px 22px; color:#fff; position:relative; }
  .hero-icon{ width:52px; height:52px; border-radius:16px; background:rgba(255,255,255,.16); display:flex; align-items:center; justify-content:center; margin-bottom:14px; backdrop-filter: blur(6px); }
  .hero-icon svg{ width:26px; height:26px; }
  .hero h1{ font-size:21px; margin:0 0 5px; letter-spacing:-.01em; }
  .hero .meta{ font-size:13px; opacity:.85; font-weight:600; }
  .tag{ position:absolute; top:22px; right:22px; font-size:10.5px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; background:rgba(255,255,255,.18); padding:5px 10px; border-radius:999px; }
  .list{ padding:6px 8px; }
  .ex-row{ display:flex; align-items:center; gap:13px; padding:13px 14px; }
  .ex-row + .ex-row{ border-top:1px solid #f0f1f6; }
  .ex-num{ width:26px; height:26px; flex-shrink:0; border-radius:9px; background:#eef0ff; color:#4a5fe8; font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; }
  .ex-name{ font-size:14.5px; font-weight:700; }
  .ex-meta{ font-size:12px; color:#8a8fa3; margin-top:2px; font-weight:600; }
  .cta-wrap{ padding:16px 18px 20px; }
  .open-btn{ display:block; width:100%; box-sizing:border-box; padding:14px; border:none; border-radius:14px; background:linear-gradient(152deg,#3454e8,#6c3ef0); color:#fff; font-size:14.5px; font-weight:700; text-align:center; text-decoration:none; box-shadow:0 10px 24px -10px rgba(60,70,230,.6); }
  .foot{ text-align:center; font-size:11.5px; color:#9aa0b4; font-weight:600; margin-top:14px; }
</style>
</head>
<body>
  <div class="phone">
    <div class="brand">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 4 14 11 14 10 22 20 9 13 9 12 2"/></svg>
      Somaxx
    </div>
    <div class="card">
      <div class="hero">
        <span class="tag">${escapeHtml(program.category)}</span>
        <div class="hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${TYPE_ICONS[iconType]}</svg>
        </div>
        <h1>${escapeHtml(program.name)}</h1>
        <div class="meta">${escapeHtml(program.duration)} · ${program.exercises.length} exercises</div>
      </div>
      <div class="list">${exerciseList}</div>
      <div class="cta-wrap">
        <a class="open-btn" href="somaxx://program/${encodeURIComponent(code)}">Download Somaxx</a>
      </div>
    </div>
    <div class="foot">Shared from the Somaxx app</div>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/p\/([a-zA-Z0-9]+)\/?$/);

    if (match) {
      const code = match[1];
      const res = await fetch(
        `${env.SUPABASE_URL}/rest/v1/shared_programs?code=eq.${code}&select=name,duration,category,exercises`,
        { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } },
      );
      const rows = (await res.json()) as SharedProgramRow[];
      const program = rows[0];
      if (!program) return new Response('Program link not found', { status: 404 });
      return new Response(renderProgramPage(code, program), { headers: { 'content-type': 'text/html; charset=UTF-8' } });
    }

    return env.ASSETS.fetch(request);
  },
};
