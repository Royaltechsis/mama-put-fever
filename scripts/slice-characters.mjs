// Cuts the character sprite sheets in assets/anim/src (made with docs/character-sprite-prompts.md) into frame strips
// the game can play, and regenerates src/v2/animSheets.ts so the game picks them up.
//
//   node scripts/slice-characters.mjs
//
// Each sheet is a 4 x 2 grid of poses on a flat background. The background is keyed out from the edges, the grid is
// found from the empty gaps between figures, and every frame is scaled the same and placed feet-down in a fixed cell.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Jimp = require('jimp-compact');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const SRC = path.join(ROOT, 'assets/anim/src');
const OUT = path.join(ROOT, 'assets/anim');
const MANIFEST = path.join(ROOT, 'src/v2/animSheets.ts');

// keep in sync with SHEET in src/v2/world3d/SpritePerson.tsx
const FRAMES = 8;
const FW = 192; // frame width px
const FH = 256; // frame height px
const FOOT = 252; // y of the feet in every frame
const BODY = 224; // height of a standing (walking) figure

const STAFF = ['cook', 'waiter', 'cleaner'];
const portraitOf = (id) => (/^c\d$/.test(id) ? `assets/v2/${id}.webp` : /^c[ip]\d$/.test(id) ? `assets/v4/${id}.webp` : null);

function keyOut(img) {
  const { width: w, height: h, data } = img.bitmap;
  // background colour: the median of the border pixels
  const border = [];
  for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) border.push(y * w, y * w + w - 1);
  const med = (ch) => { const v = border.map((p) => data[p * 4 + ch]).sort((a, b) => a - b); return v[v.length >> 1]; };
  const bg = [med(0), med(1), med(2)];
  const dist = (p) => Math.hypot(data[p * 4] - bg[0], data[p * 4 + 1] - bg[1], data[p * 4 + 2] - bg[2]);
  const isBg = new Uint8Array(w * h);
  // A bright pure green is far from anything people wear, so it can be keyed loosely. A duller green (what image tools
  // sometimes give instead) is close to green clothes, so it is keyed tightly and only exact background is cleared from gaps.
  const pure = bg[1] > 200 && bg[0] < 90 && bg[2] < 90;
  const tol = pure ? 110 : 55;
  // flood fill from the edges through anything close to the background colour
  const q = new Int32Array(w * h); let qh = 0; let qt = 0;
  for (const p of border) if (!isBg[p] && dist(p) < tol) { isBg[p] = 1; q[qt++] = p; }
  while (qh < qt) {
    const p = q[qh++]; const x = p % w; const y = (p / w) | 0;
    for (const n of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
      if (n >= 0 && !isBg[n] && dist(n) < tol) { isBg[n] = 1; q[qt++] = n; }
    }
  }
  // enclosed gaps (between an arm and the body) are not reached from the edge: drop pixels that are almost exactly the background
  const gap = pure ? 70 : 26;
  for (let p = 0; p < w * h; p++) if (!isBg[p] && dist(p) < gap) isBg[p] = 1;
  // grid lines drawn between the poses: a row or column that is solid nearly edge to edge is a line, not a person
  for (let y = 0; y < h; y++) { let c = 0; for (let x = 0; x < w; x++) c += isBg[y * w + x] ? 0 : 1; if (c > w * 0.97) for (let x = 0; x < w; x++) isBg[y * w + x] = 1; }
  for (let x = 0; x < w; x++) { let c = 0; for (let y = 0; y < h; y++) c += isBg[y * w + x] ? 0 : 1; if (c > h * 0.97) for (let y = 0; y < h; y++) isBg[y * w + x] = 1; }
  for (let p = 0; p < w * h; p++) {
    if (isBg[p]) { data[p * 4] = 40; data[p * 4 + 1] = 30; data[p * 4 + 2] = 25; data[p * 4 + 3] = 0; continue; }
    // pull the background tint off the outline
    const x = p % w; const y = (p / w) | 0;
    let edge = false;
    for (let dy = -2; dy <= 2 && !edge; dy++) for (let dx = -2; dx <= 2 && !edge; dx++) {
      const xx = x + dx; const yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && isBg[yy * w + xx]) edge = true;
    }
    if (edge) {
      const i = p * 4;
      if (bg[1] > bg[0] && bg[1] > bg[2]) data[i + 1] = Math.min(data[i + 1], Math.max(data[i], data[i + 2]));
      else if (dist(p) < 140) data[i + 3] = 150;
    }
  }
  return isBg;
}

/** the index with the fewest opaque pixels inside [lo, hi): the gap between two figures */
function gapIn(counts, lo, hi) {
  let best = lo;
  for (let i = lo; i < hi; i++) if (counts[i] < counts[best]) best = i;
  return best;
}

/** the figures in a row band, found from the empty columns between them, left to right */
function figuresInRow(isBg, w, y0, y1) {
  const colCount = new Array(w).fill(0);
  for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) if (!isBg[y * w + x]) colCount[x]++;
  const runs = [];
  for (let x = 0; x < w; x++) {
    if (colCount[x] <= 2) continue;
    const last = runs[runs.length - 1];
    // a short gap (a hand or a towel standing off the body) still belongs to the same figure
    if (last && x - last.x1 < w * 0.012) last.x1 = x + 1; else runs.push({ x0: x, x1: x + 1 });
  }
  const boxes = runs.filter((r) => r.x1 - r.x0 > w * 0.02).map((r) => ({ x0: r.x0, x1: r.x1, y0, y1 }));
  // a bag or stick standing on its own between poses is much shorter than a person: drop it
  const tall = boxes.map((b) => { const f = figure(isBg, w, b); return f ? f.maxY - f.minY : 0; });
  const most = Math.max(0, ...tall);
  return boxes.filter((_, i) => tall[i] > most * 0.55);
}

/**
 * The 8 frame cells. The prompt asks for 4 per row, but image models often draw more walking poses on top and a
 * different number on the bottom, so the figures are found rather than assumed: the top row is the walk cycle
 * (sampled to 4 frames). For staff the bottom row fills the last 4 slots in order. For customers with more than 4
 * bottom poses: the first is standing, the second sitting, the last chewing, and the eating pose is the middle one
 * between sitting and chewing.
 */
function cells(isBg, w, h, staff) {
  const rowCount = new Array(h).fill(0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!isBg[y * w + x]) rowCount[y]++;
  const mid = gapIn(rowCount, Math.round(h * 0.35), Math.round(h * 0.65));
  const top = figuresInRow(isBg, w, 0, mid);
  const bottom = figuresInRow(isBg, w, mid, h);
  const walk = top.length ? [0, 1, 2, 3].map((i) => top[Math.floor((i * top.length) / 4)]) : [null, null, null, null];
  let rest = [0, 1, 2, 3].map((i) => bottom[i] ?? null);
  if (!staff && bottom.length > 4) {
    const last = bottom.length - 1;
    rest = [bottom[0], bottom[1], bottom[1 + Math.ceil((last - 2) / 2)], bottom[last]];
  }
  return { boxes: [...walk, ...rest], found: `${top.length} top, ${bottom.length} bottom` };
}

/** bounding box and horizontal centre of mass of the figure in a cell, ignoring stray specks */
function figure(isBg, w, cell) {
  let n = 0; let sx = 0; let minX = Infinity; let maxX = -1; let minY = Infinity; let maxY = -1;
  const rows = []; const cols = new Map();
  for (let y = cell.y0; y < cell.y1; y++) {
    let r = 0;
    for (let x = cell.x0; x < cell.x1; x++) if (!isBg[y * w + x]) { r++; cols.set(x, (cols.get(x) ?? 0) + 1); n++; sx += x; }
    rows.push(r);
  }
  if (n < (cell.x1 - cell.x0) * (cell.y1 - cell.y0) * 0.01) return null;
  rows.forEach((r, i) => { if (r > 2) { minY = Math.min(minY, cell.y0 + i); maxY = Math.max(maxY, cell.y0 + i); } });
  cols.forEach((c, x) => { if (c > 2) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); } });
  return { minX, maxX, minY, maxY, cx: sx / n };
}

async function slice(file) {
  const id = path.basename(file, path.extname(file));
  const img = await Jimp.read(path.join(SRC, file));
  if (img.bitmap.width > 2400) img.resize(2400, Jimp.AUTO);
  const { width: w, height: h } = img.bitmap;
  const isBg = keyOut(img);
  const { boxes, found } = cells(isBg, w, h, STAFF.includes(id));
  const figs = boxes.map((c) => (c ? figure(isBg, w, c) : null));
  const walkH = figs.slice(0, 4).filter(Boolean).map((f) => f.maxY - f.minY).sort((a, b) => a - b);
  if (walkH.length < 2) throw new Error(`${file}: could not find the walking frames on the top row`);
  const s = BODY / walkH[walkH.length >> 1];
  const strip = new Jimp(FW * FRAMES, FH, 0x00000000);
  const warn = [];
  figs.forEach((f, i) => {
    if (!f) { if (!(STAFF.includes(id) && i === 7)) warn.push(`frame ${i + 1} is empty`); return; }
    const piece = img.clone().crop(f.minX, f.minY, f.maxX - f.minX + 1, f.maxY - f.minY + 1);
    piece.resize(Math.max(1, Math.round(piece.bitmap.width * s)), Math.max(1, Math.round(piece.bitmap.height * s)));
    const left = Math.round(FW / 2 - (f.cx - f.minX) * s);
    const top = FOOT - piece.bitmap.height;
    if (left < 0 || left + piece.bitmap.width > FW || top < 0) warn.push(`frame ${i + 1} is wider or taller than its cell and was clipped`);
    // draw into this frame's own slot only
    const slot = new Jimp(FW, FH, 0x00000000).composite(piece, left, top);
    strip.composite(slot, i * FW, 0);
  });
  fs.writeFileSync(path.join(OUT, `${id}.png`), await strip.getBufferAsync(Jimp.MIME_PNG));
  console.log(`✓ ${id} [${found}]${warn.length ? `  (check: ${warn.join('; ')})` : ''}`);
  return id;
}

function writeManifest() {
  const done = fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4));
  const cust = done.filter((id) => portraitOf(id) && fs.existsSync(path.join(ROOT, portraitOf(id))));
  const staff = done.filter((id) => STAFF.includes(id));
  const lines = [
    '// Generated by scripts/slice-characters.mjs. Do not edit by hand.',
    '// Animated frame strips for characters that have one; everyone else falls back to their portrait.',
    'import type { StaffId } from \'./save2\';',
    '',
    '/** customer portrait module -> frame strip */',
    'export const CUST_SHEETS = new Map<unknown, number>([',
    ...cust.map((id) => `  [require('../../${portraitOf(id)}'), require('../../assets/anim/${id}.png')],`),
    ']);',
    'export const STAFF_SHEETS: Partial<Record<StaffId, number>> = {',
    ...staff.map((id) => `  ${id}: require('../../assets/anim/${id}.png'),`),
    '};',
    '',
  ];
  fs.writeFileSync(MANIFEST, lines.join('\n'));
  console.log(`wrote ${path.relative(ROOT, MANIFEST)} (${cust.length} customers, ${staff.length} staff)`);
}

fs.mkdirSync(SRC, { recursive: true });
const sheets = fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (sheets.length === 0) console.log('No sheets in assets/anim/src yet. See docs/character-sprite-prompts.md.');
let failed = 0;
for (const f of sheets) {
  try { await slice(f); } catch (e) { failed++; console.error(`✗ ${f}: ${e.message}`); }
}
writeManifest();
process.exit(failed ? 1 : 0);
