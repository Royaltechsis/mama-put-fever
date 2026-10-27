import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DecorUp, KitchenUp } from './data2';

export type Save2 = {
  coins: number;
  unlocked: number;
  stars: number[];
  best: number[];
  kitchen: Partial<Record<KitchenUp, number>>;
  decor: Partial<Record<DecorUp, boolean>>;
  sound: boolean;
  music: boolean;
};
const KEY = 'mamaput.save.v2';
export const DEFAULT_SAVE2: Save2 = { coins: 0, unlocked: 0, stars: [], best: [], kitchen: {}, decor: {}, sound: true, music: true };
export async function loadSave2(): Promise<Save2> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SAVE2, ...JSON.parse(raw) } : DEFAULT_SAVE2;
  } catch { return DEFAULT_SAVE2; }
}
export async function writeSave2(s: Save2) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
