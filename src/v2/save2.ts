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
  staff: Partial<Record<StaffId, boolean>>;
  prepSeen: boolean;
  acctNote?: boolean;
  day: number;
};
export type Deco4 = 'gen' | 'tv' | 'canopy';
export type StaffId = 'cleaner' | 'waiter' | 'cook';
const KEY_V2 = 'mamaput.save.v2';
const KEY_V3 = 'mamaput.save.v3';
const KEY = 'mamaput.save.v4';
export const START_STOCK: Record<StockKey, number> = { pepper: 40, grains: 40, protein: 40, produce: 40, drinks: 40 };
export const DEFAULT_SAVE2: Save2 = {
  v: 4, coins: 0, unlocked: 0, stars: [], best: [], dest: 'lagos', prog: { lagos: { unlocked: 0, stars: [], best: [] } },
  stock: { ...START_STOCK }, kitchen: {}, decor: {}, sound: true, music: true,
  seats: 3, chair: 0, deco: {}, staff: {}, prepSeen: false, day: 1,
};
const V4_DEFAULTS = { seats: 3, chair: 0, deco: {}, staff: {}, prepSeen: false, day: 1 };

/** v2 (one restaurant) -> v3 (destinations + market stock). The old v2 key is left untouched as a backup. */
export function migrate(old: any): Save2 {
  if (!old || typeof old !== 'object') return { ...DEFAULT_SAVE2 };
  if (old.v === 4 && old.prog) {
    const s: Save2 = { ...DEFAULT_SAVE2, ...old, stock: { ...START_STOCK, ...(old.stock ?? {}) }, deco: old.deco ?? {}, staff: old.staff ?? {} };
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
export const SEAT_PRICES: Record<number, number> = { 4: 1500, 5: 3500 };
export const MAX_SEATS = 5;
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
export const STAFF: Record<StaffId, { name: string; job: string; wage: number; stars: number; who: number; color: string }> = {
  cleaner: { name: 'Mama Nkechi', job: 'Cleaner: clears dirty plates', wage: 150, stars: 2, who: 3, color: '#3FA7D6' },
  waiter: { name: 'Tunde', job: 'Waiter: carries ready plates and drinks to customers', wage: 300, stars: 5, who: 1, color: '#E8453C' },
  cook: { name: 'Iya Bisi', job: 'Cook: keeps the pot and grill going', wage: 450, stars: 9, who: 0, color: '#F2A93B' },
};
export const wagesOf = (s: Save2) => (Object.keys(STAFF) as StaffId[]).reduce((a, k) => a + (s.staff?.[k] ? STAFF[k].wage : 0), 0);
export function bukaLevel(s: Save2) {
  const deco = Object.values(s.deco ?? {}).filter(Boolean).length + Object.values(s.decor ?? {}).filter(Boolean).length;
  const staff = Object.values(s.staff ?? {}).filter(Boolean).length;
  return 1 + Math.max(0, (s.seats ?? 3) - 3) + (s.chair ?? 0) + deco + staff;
}
