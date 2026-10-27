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
};
const KEY_V2 = 'mamaput.save.v2';
const KEY = 'mamaput.save.v3';
export const START_STOCK: Record<StockKey, number> = { pepper: 40, grains: 40, protein: 40, produce: 40, drinks: 40 };
export const DEFAULT_SAVE2: Save2 = {
  v: 3, coins: 0, unlocked: 0, stars: [], best: [], dest: 'lagos', prog: { lagos: { unlocked: 0, stars: [], best: [] } },
  stock: { ...START_STOCK }, kitchen: {}, decor: {}, sound: true, music: true,
};

/** v2 (one restaurant) -> v3 (destinations + market stock). The old v2 key is left untouched as a backup. */
export function migrate(old: any): Save2 {
  if (!old || typeof old !== 'object') return { ...DEFAULT_SAVE2 };
  if (old.v === 3 && old.prog) {
    const s: Save2 = { ...DEFAULT_SAVE2, ...old, stock: { ...START_STOCK, ...(old.stock ?? {}) } };
    const p = s.prog[s.dest] ?? { unlocked: 0, stars: [], best: [] };
    return { ...s, unlocked: p.unlocked, stars: p.stars, best: p.best };
  }
  const lagos: DestProg = { unlocked: old.unlocked ?? 0, stars: old.stars ?? [], best: old.best ?? [] };
  return {
    ...DEFAULT_SAVE2, coins: old.coins ?? 0, kitchen: old.kitchen ?? {}, decor: old.decor ?? {},
    sound: old.sound ?? true, music: old.music ?? true, dest: 'lagos', prog: { lagos }, ...lagos, stock: { ...START_STOCK },
  };
}

export async function loadSave2(): Promise<Save2> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
    const v2 = await AsyncStorage.getItem(KEY_V2);
    return v2 ? migrate(JSON.parse(v2)) : { ...DEFAULT_SAVE2 };
  } catch { return { ...DEFAULT_SAVE2 }; }
}
/** keep prog[dest] in sync with the active-destination fields */
export function synced(s: Save2): Save2 {
  return { ...s, v: 3, prog: { ...s.prog, [s.dest]: { unlocked: s.unlocked, stars: s.stars, best: s.best } } };
}
export async function writeSave2(s: Save2) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(synced(s))); } catch {}
}
export const totalStars = (s: Save2) => Object.values(synced(s).prog).reduce((a, p) => a + p.stars.reduce((b, x) => b + (x ?? 0), 0), 0);
