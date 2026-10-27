import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  pop: require('../assets/sfx/pop.wav'),
  plop: require('../assets/sfx/plop.wav'),
  bad: require('../assets/sfx/bad.wav'),
  ding: require('../assets/sfx/ding.wav'),
  cash: require('../assets/sfx/cash.wav'),
  sizzle: require('../assets/sfx/sizzle.wav'),
  horn: require('../assets/sfx/horn.wav'),
};
export type Sfx = keyof typeof SOURCES;

let enabled = true;
const players: Partial<Record<Sfx, AudioPlayer>> = {};

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function play(name: Sfx) {
  if (!enabled) return;
  try {
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      players[name] = p;
    }
    p.seekTo(0);
    p.play();
  } catch {}
}

const native = Platform.OS !== 'web';

export const haptic = {
  pick() {
    if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  drop() {
    if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  good() {
    if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  bad() {
    if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
