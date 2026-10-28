import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DecorUp, KitchenUp } from './data2';

export type StockKey = 'pepper' | 'grains' | 'protein' | 'produce' | 'drinks';
export type DestProg = { unlocked: number; stars: number[]; best: number[] };

export type Save2 = {
  v?: number;
  coins: number;
  // progress of the ACTIVE destination (mirrored into prog[dest] on every write)
  unlocked: number;
  stars: number[];
  best: number[];
  dest: string;
  prog: Record<string, DestProg>;
  stock: Record<StockKey, number>;
  kitchen: Partial<Record<KitchenUp, number>>;
  decor: Partial<Record<DecorUp, boolean>>;
  sound: boolean;
  music: boolean;
  // v4: restaurant sim
  seats: number; // 3..5 seats at the counter
  chair: number; // 0 plastic, 1 wooden, 2 cushioned
  deco: Partial<Record<Deco4, boolean>>;
  staff: Record<string, boolean>; // keyed by worker id, e.g. 'waiter2'
  prepSeen: boolean;
  acctNote?: boolean;
  day: number;
  // v5: reputation, chef progression, staff training
  rating: number; // 1..5, average of recent customer reviews
  reviews: number; // reviews received so far
  xp: number; // chef experience
  staffLv: Record<string, StaffLv>;
};
export type StaffLv = { lv: number; xp: number };
export type Deco4 = 'gen' | 'tv' | 'canopy';
export type StaffId = 'cleaner' | 'waiter' | 'cook'; // roles
export type WorkerId = string;
const KEY_V2 = 'mamaput.save.v2';
const KEY_V3 = 'mamaput.save.v3';
const KEY = 'mamaput.save.v4';
export const START_STOCK: Record<StockKey, number> = { pepper: 40, grains: 40, protein: 40, produce: 40, drinks: 40 };
export const DEFAULT_SAVE2: Save2 = {
  v: 4, coins: 0, unlocked: 0, stars: [], best: [], dest: 'lagos', prog: { lagos: { unlocked: 0, stars: [], best: [] } },
  stock: { ...START_STOCK }, kitchen: {}, decor: {}, sound: true, music: true,
  seats: 3, chair: 0, deco: {}, staff: {}, prepSeen: false, day: 1,
  rating: 3.5, reviews: 0, xp: 0, staffLv: {},
};
const V4_DEFAULTS = { seats: 3, chair: 0, deco: {}, staff: {}, prepSeen: false, day: 1 };

/** old saves hired one worker per role under the role name; those become the first worker of that role */
function fixWorkers(s: Save2): Save2 {
  const rename = (m: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.keys(m ?? {}).forEach((k) => { out[k === 'cook' || k === 'waiter' || k === 'cleaner' ? k + '1' : k] = m[k]; });
    return out;
  };
  return { ...s, staff: rename(s.staff), staffLv: rename(s.staffLv) };
}
export const migrate = (old: any): Save2 => fixWorkers(migrateBase(old));

/** v2 (one restaurant) -> v3 (destinations + market stock). The old v2 key is left untouched as a backup. */
function migrateBase(old: any): Save2 {
  if (!old || typeof old !== 'object') return { ...DEFAULT_SAVE2 };
  if (old.v === 4 && old.prog) {
    const s: Save2 = { ...DEFAULT_SAVE2, ...old, stock: { ...START_STOCK, ...(old.stock ?? {}) }, deco: old.deco ?? {}, staff: old.staff ?? {}, staffLv: old.staffLv ?? {} };
    const p = s.prog[s.dest] ?? { unlocked: 0, stars: [], best: [] };
    return { ...s, unlocked: p.unlocked, stars: p.stars, best: p.best };
  }
  if (old.v === 3 && old.prog) {
    // v3 -> v4: returning players keep the 4 counter spots they always had
    const s: Save2 = { ...DEFAULT_SAVE2, ...old, ...V4_DEFAULTS, seats: 4, v: 4, stock: { ...START_STOCK, ...(old.stock ?? {}) } };
    const p = s.prog[s.dest] ?? { unlocked: 0, stars: [], best: [] };
    return { ...s, unlocked: p.unlocked, stars: p.stars, best: p.best };
  }
  const lagos: DestProg = { unlocked: old.unlocked ?? 0, stars: old.stars ?? [], best: old.best ?? [] };
  return {
    ...DEFAULT_SAVE2, coins: old.coins ?? 0, kitchen: old.kitchen ?? {}, decor: old.decor ?? {},
    sound: old.sound ?? true, music: old.music ?? true, dest: 'lagos', prog: { lagos }, ...lagos, stock: { ...START_STOCK },
    ...V4_DEFAULTS, seats: 4,
  };
}

export async function loadSave2(): Promise<Save2> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
    // the old v3 key is left untouched as a backup
    const v3 = await AsyncStorage.getItem(KEY_V3);
    if (v3) return migrate(JSON.parse(v3));
    const v2 = await AsyncStorage.getItem(KEY_V2);
    return v2 ? migrate(JSON.parse(v2)) : { ...DEFAULT_SAVE2 };
  } catch { return { ...DEFAULT_SAVE2 }; }
}
/** keep prog[dest] in sync with the active-destination fields */
export function synced(s: Save2): Save2 {
  return { ...s, v: 4, prog: { ...s.prog, [s.dest]: { unlocked: s.unlocked, stars: s.stars, best: s.best } } };
}
export async function writeSave2(s: Save2) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(synced(s))); } catch {}
}
export const totalStars = (s: Save2) => Object.values(synced(s).prog).reduce((a, p) => a + p.stars.reduce((b, x) => b + (x ?? 0), 0), 0);

// ---- v4 restaurant economy ----
export const SEAT_PRICES: Record<number, number> = { 4: 1500, 5: 3500, 6: 6500 };
export const MAX_SEATS = 6;
export const CHAIRS = [
  { name: 'Plastic chairs', desc: 'Red and white, the classic', price: 0, tip: 1 },
  { name: 'Wooden benches', desc: 'Tips +10%', price: 2000, tip: 1.1 },
  { name: 'Cushioned chairs', desc: 'Tips +25%, customers wait longer', price: 5000, tip: 1.25 },
];
export const DECO4: Record<Deco4, { name: string; desc: string; price: number; icon: string }> = {
  canopy: { name: 'Canopy', desc: 'Shade outside. Patience +5%', price: 1800, icon: '⛱' },
  gen: { name: 'Generator', desc: 'No NEPA wahala: drinks pour faster', price: 2500, icon: '⚡' },
  tv: { name: 'TV (football on)', desc: 'Customers wait 15% longer', price: 3500, icon: '📺' },
};
export type Worker = { role: StaffId; name: string; wage: number; stars: number };
/** every worker you can hire; later ones unlock as your total stars grow */
export const WORKERS: Record<WorkerId, Worker> = {
  cleaner1: { role: 'cleaner', name: 'Mama Nkechi', wage: 1200, stars: 2 },
  waiter1: { role: 'waiter', name: 'Tunde', wage: 2500, stars: 5 },
  cook1: { role: 'cook', name: 'Iya Bisi', wage: 4000, stars: 9 },
  cleaner2: { role: 'cleaner', name: 'Bola', wage: 1400, stars: 14 },
  waiter2: { role: 'waiter', name: 'Segun', wage: 2800, stars: 16 },
  cook2: { role: 'cook', name: 'Auntie Ngozi', wage: 4400, stars: 22 },
  waiter3: { role: 'waiter', name: 'Kunle', wage: 3000, stars: 30 },
};
export const WORKER_IDS = Object.keys(WORKERS);
export const ROLE_INFO: Record<StaffId, { label: string; job: string; color: string }> = {
  cleaner: { label: 'Cleaner', job: 'Walks the tables and clears dirty plates', color: '#3FA7D6' },
  waiter: { label: 'Waiter', job: 'Carries ready plates and drinks to the tables', color: '#E8453C' },
  cook: { label: 'Cook', job: 'Runs the pots and grill. Low skill means sloppy timing', color: '#F2A93B' },
};
export const MAX_STAFF_LV = 5;
export const hiredWorkers = (s: Save2) => WORKER_IDS.filter((w) => s.staff?.[w]);
export const staffLvOf = (s: Save2, w: WorkerId) => s.staffLv?.[w]?.lv ?? 1;
/** wage goes up 30% of the base per training level */
export const wageOf = (s: Save2, w: WorkerId) => Math.round((WORKERS[w].wage * (1 + 0.3 * (staffLvOf(s, w) - 1))) / 100) * 100;
export const wagesOf = (s: Save2) => hiredWorkers(s).reduce((a, w) => a + wageOf(s, w), 0);
/** tasks a worker must complete before they are ready for the next training level */
export const staffXpNeed = (lv: number) => 12 * lv;
export const trainCost = (lv: number) => 2500 * lv;
export const staffSpeed = (lv: number) => 1 + 0.18 * (lv - 1); // walking speed multiplier
export const staffSkill = (lv: number) => Math.min(0.95, 0.45 + 0.12 * (lv - 1)); // 0..1 chance-ish quality

// ---- chef progression ----
export const chefLevel = (xp: number) => Math.min(10, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 60)));
export const chefXpFor = (lv: number) => (lv - 1) * (lv - 1) * 60;
export const chefTitle = (lv: number) => (lv <= 2 ? 'Rookie cook' : lv <= 4 ? 'Line cook' : lv <= 6 ? 'Buka boss' : lv <= 8 ? 'Master chef' : 'Mama Put legend');
/** timing windows get this much wider per chef level */
export const chefWinMul = (xp: number) => 1 + 0.06 * (chefLevel(xp) - 1);
export const ratingLabel = (r: number) => (r >= 4.5 ? 'Famous' : r >= 3.8 ? 'Well loved' : r >= 3 ? 'Decent' : r >= 2.2 ? 'Struggling' : 'Avoided');
export function bukaLevel(s: Save2) {
  const deco = Object.values(s.deco ?? {}).filter(Boolean).length + Object.values(s.decor ?? {}).filter(Boolean).length;
  const staff = hiredWorkers(s).length;
  return 1 + Math.max(0, (s.seats ?? 3) - 3) + (s.chair ?? 0) + deco + staff;
}
