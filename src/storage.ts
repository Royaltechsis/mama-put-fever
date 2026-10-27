import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UpgradeId } from './data';

export type Save = {
  coins: number;
  unlocked: number; // highest playable level index
  stars: number[]; // best stars per level
  upgrades: Partial<Record<UpgradeId, boolean>>;
  sound: boolean;
};

const KEY = 'mamaput.save.v1';
export const DEFAULT_SAVE: Save = { coins: 0, unlocked: 0, stars: [], upgrades: {}, sound: true };

export async function loadSave(): Promise<Save> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SAVE;
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SAVE;
  }
}

export async function writeSave(s: Save) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}
