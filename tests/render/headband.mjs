// Renders every hairstyle WITH the headband from 5 angles, close on the head, using the app's
// own composeCharacter + idle pose, into one contact sheet, and FAILS if a band is hidden where it should show.
//   node tests/render/headband.mjs [tag] [styles,comma,separated] [regular|teen|superhero]   (npm run test:render runs all builds)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'tests', 'render', 'out'); mkdirSync(OUT, { recursive: true });
const TAG = process.argv[2] || 'now';
const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const BUILD = process.argv[4] || 'regular';
const PORT = 5196;
const browserPath = () => { const b = path.join(homedir(), 'Library', 'Caches', 'ms-playwright'); const d = readdirSync(b).filter((x) => x.startsWith('chromium_headless_shell-')).sort().reverse()[0]; return path.join(b, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'); };
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('vite')), 30000); server.stdout.on('data', (b) => { if (String(b).includes('Local:')) { clearTimeout(t); res(); } }); });
const browser = await chromium.launch({ executablePath: browserPath(), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', String(e).slice(0, 300)));
  await page.goto(`http://localhost:${PORT}/?e2e=1`);
  await page.waitForFunction(() => !!window.__store, null, { timeout: 60000 });
  const styles = await page.evaluate(async () => (await import('/src/data/catalog.ts')).HAIR_STYLES.map((h) => ({ id: h.id, base: h.base, name: h.name })));
  const pick = ONLY.length ? styles.filter((s) => ONLY.includes(s.id)) : styles;
  console.log('styles', pick.map((s) => s.id).join(','));
  const sheet = await page.evaluate(async ({ styles, build }) => {
    const THREE = await import('/node_modules/.vite/deps/three.js').catch(() => import('three'));
    const M = await import('/src/lib/characterModels.ts');
    const B = await import('/src/lib/characterBuilder.ts');
    const C = await import('/src/lib/character.ts');
    const R = new THREE.WebGLRenderer({ alpha: false, antialias: true, preserveDrawingBuffer: true });
    R.setSize(300, 300); R.setClearColor(0x4a6c8f, 1); // blue backdrop so the off-white band can be counted R.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(); B.addLights(scene, false);
    const cam = new THREE.PerspectiveCamera(24, 1, 0.05, 50);
    const clips = await M.loadAnimationClips();
    const out = [];
    const ANGLES = [['front', 0, 0], ['3/4', -0.8, 0], ['side', -1.57, 0], ['back', 3.14, 0], ['above-back', 2.4, 0.5]];
    for (const s of styles) {
      // no-band first: it is the reference for the visibility count
      for (const band of [false, true]) {
        const cfg = { ...C.defaultCharacter(s.base), build, hair: s.id, hairColor: 2, acc: band ? ['headband'] : [] };
        const { group } = await M.composeCharacter(cfg);
        const idle = M.fitClipsToCharacter(clips, group).find((c) => c.name === M.CLIPS.idle);
        if (idle) { const mx = new THREE.AnimationMixer(group); mx.clipAction(idle).play(); mx.update(0.3); }
        group.updateMatrixWorld(true);
        let headBone = group.getObjectByName('head');
        if (!headBone) group.traverse((o) => { if (!headBone && o.isBone && /head/i.test(o.name) && !/end|top|nub/i.test(o.name)) headBone = o; });
        if (!headBone) throw new Error('no head bone for ' + build);
        const head = headBone.getWorldPosition(new THREE.Vector3());
        scene.add(group);
        const row = [];
        for (const [, yaw, up] of ANGLES) {
          const d = 0.95, cy = head.y + 0.06;
          cam.position.set(Math.sin(yaw) * d * Math.cos(up), cy + Math.sin(up) * d, Math.cos(yaw) * d * Math.cos(up));
          cam.position.x += head.x; cam.position.z += head.z;
          cam.lookAt(head.x, cy, head.z);
          R.render(scene, cam);
          row.push(R.domElement.toDataURL('image/png'));
          // visible band = pixels that differ from the same angle WITHOUT the headband and are lighter than
          // hair/skin (the band is the only thing that changes between the two renders)
          const gl = R.getContext(), W = R.domElement.width, H2 = R.domElement.height, px = new Uint8Array(W * H2 * 4);
          gl.readPixels(0, 0, W, H2, gl.RGBA, gl.UNSIGNED_BYTE, px);
          const ai = row.length - 1, refKey = s.id + ':' + ai;
          let n = 0;
          if (!band) (globalThis.__REF ??= {})[refKey] = px;
          else { const ref = globalThis.__REF[refKey]; for (let i = 0; i < px.length; i += 4) { const lum = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2]; const d = Math.abs(px[i] - ref[i]) + Math.abs(px[i + 1] - ref[i + 1]) + Math.abs(px[i + 2] - ref[i + 2]); if (d > 60 && lum > 115) n++; } }
          (row.counts ??= []).push(n);
        }
        scene.remove(group);
        out.push({ id: s.id, base: s.base, name: s.name, band, row, counts: row.counts });
      }
    }
    return out;
  }, { styles: pick, build: BUILD });
  // write an HTML contact sheet and screenshot it
  const html = `<html><body style="margin:0;font:13px sans-serif;background:#fff">${sheet.map((r) => `<div style="display:flex;align-items:center;gap:4px;padding:3px 6px;${r.band ? '' : 'opacity:.85'}"><div style="width:150px">${r.name} (${r.base})<br><b>${r.band ? 'WITH headband' : 'no headband'}</b></div>${r.row.map((u) => `<img src="${u}" width="150">`).join('')}</div>`).join('')}</body></html>`;
  writeFileSync(path.join(OUT, `headband-${TAG}.html`), html);
  const p2 = await browser.newPage({ viewport: { width: 940, height: 600 } });
  await p2.setContent(html); await p2.waitForTimeout(500);
  await p2.screenshot({ path: path.join(OUT, `headband-${TAG}.png`), fullPage: true });
  console.log('rows', sheet.length, '->', path.join(OUT, `headband-${TAG}.png`));
  // ---- checks: every style that isn't meant to cover the band must show it from the side and back,
  // and nothing shows band pixels when no headband is worn (sanity check on the counter itself)
  const UNDER_HAIR = new Set(['long', 'longDreads']); // band shows at the forehead only, hair falls over it
  const fails = [];
  for (const r of sheet) {
    const [front, , side, back] = r.counts;
    if (!r.band) continue;
    if (front < (UNDER_HAIR.has(r.id) ? 800 : 1500)) fails.push(`${r.name}: band barely visible from the front (${front})`);
    if (!UNDER_HAIR.has(r.id) && side < 1500) fails.push(`${r.name}: band hidden from the side (${side})`);
    // a ponytail's tail hangs over the middle of the band at the back (as on a real head), so less shows
    if (!UNDER_HAIR.has(r.id) && back < (/^ponytail/.test(r.id) ? 600 : 900)) fails.push(`${r.name}: band hidden from behind (${back})`);
  }
  console.log(sheet.filter((r) => r.band).map((r) => `${r.id}:${r.counts.join('/')}`).join('  '));
  console.log(fails.length ? 'FAIL\n  ' + fails.join('\n  ') : `PASS  headband visible on all ${sheet.length / 2} hairstyles`);
  if (fails.length) process.exitCode = 1;
} finally { await browser.close(); server.kill(); }
