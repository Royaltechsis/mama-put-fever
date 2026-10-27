import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// Mamaput sound kit: generated Nigerian buka sounds (talking drum, agogo, shekere,
// highlife guitar, okada horn, market voices). See assets/audio/README.md.
const SOURCES = {
  pop: require('../assets/audio/pop.mp3'), // talking-drum tap: pick up / serve one item
  plop: require('../assets/audio/plop.mp3'), // ingredient into the pot
  bad: require('../assets/audio/bad.mp3'), // wooden thud: wrong move
  ding: require('../assets/audio/ding.mp3'), // agogo bell: pot ready
  cash: require('../assets/audio/cash.mp3'), // naira cha-ching + talking drum hit
  sizzle: require('../assets/audio/sizzle.mp3'), // oil sizzling on the grill / fryer
  horn: require('../assets/audio/horn.mp3'), // okada horn (Owambe delivery)
  combo: require('../assets/audio/combo.mp3'), // talking-drum roll: combo
  lick: require('../assets/audio/lick.mp3'), // highlife guitar lick: order complete
  win: require('../assets/audio/win.mp3'), // shekere + drum flourish: level complete
  fail: require('../assets/audio/fail.mp3'), // sad sax sting: level failed
  customer_b: require('../assets/audio/customer_b.mp3'), // "Customer! Come and chop!"
  burnt_a: require('../assets/audio/burnt_a.mp3'), // "Ehn-ehn! E don burn o!"
  burnt_b: require('../assets/audio/burnt_b.mp3'), // "Ah! E don burn!"
};
type Src = keyof typeof SOURCES;
// Voice cues pick a random take; they are rate-limited so the buka doesn't turn into a choir.
const VOICES = {
  customer: ['customer_b'],
  burnt: ['burnt_a', 'burnt_b'],
  angry: [], // "Abeg!" voice lines land in a follow-up; until then a customer walking out gets the thud
} as const satisfies Record<string, readonly Src[]>;
export type Sfx = Exclude<Src, `${string}_a` | `${string}_b`> | keyof typeof VOICES;

const VOL: Partial<Record<Src, number>> = { sizzle: 0.55, plop: 0.8, pop: 0.8, bad: 0.8, ding: 0.9 };
const VOICE_GAP_MS: Record<keyof typeof VOICES, number> = { customer: 7000, burnt: 2500, angry: 2500 };

let enabled = true;
const players: Partial<Record<Src, AudioPlayer>> = {};
const lastVoice: Record<string, number> = {};

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function raw(name: Src) {
  try {
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      p.volume = VOL[name] ?? 1;
      players[name] = p;
    }
    p.seekTo(0);
    p.play();
  } catch {}
}

export function play(name: Sfx) {
  if (!enabled) return;
  if (name in VOICES) {
    const k = name as keyof typeof VOICES;
    const now = Date.now();
    if (now - (lastVoice[k] ?? 0) < VOICE_GAP_MS[k]) {
      if (k === 'customer') raw('pop');
      else if (k === 'burnt') raw('bad');
      return;
    }
    const takes: readonly Src[] = VOICES[k];
    if (!takes.length) { raw('bad'); return; }
    lastVoice[k] = now;
    raw(takes[Math.floor(Math.random() * takes.length)]);
    return;
  }
  raw(name as Src);
}

// ---------- music: one original Afrobeats/highlife loop + a low buka ambience bed ----------
const MUSIC = {
  theme: require('../assets/audio/theme.mp3'),
  ambience: require('../assets/audio/ambience.mp3'),
};
export type Mood = 'menu' | 'game' | 'off';
const MIX: Record<Exclude<Mood, 'off'>, { theme: number; ambience: number }> = {
  menu: { theme: 0.7, ambience: 0 },
  game: { theme: 0.22, ambience: 0.35 },
};
let musicOn = true;
let mood: Mood = 'off';
const mPlayers: Partial<Record<keyof typeof MUSIC, AudioPlayer>> = {};

function mp(k: keyof typeof MUSIC) {
  let p = mPlayers[k];
  if (!p) {
    p = createAudioPlayer(MUSIC[k]);
    p.loop = true;
    mPlayers[k] = p;
  }
  return p;
}

function applyMusic() {
  try {
    const mix = musicOn && mood !== 'off' ? MIX[mood] : { theme: 0, ambience: 0 };
    (Object.keys(MUSIC) as (keyof typeof MUSIC)[]).forEach((k) => {
      const v = mix[k];
      if (v > 0) {
        const p = mp(k);
        p.volume = v;
        if (!p.playing) p.play();
      } else if (mPlayers[k]?.playing) {
        mPlayers[k]!.pause();
      }
    });
  } catch {}
}

export function setMusicEnabled(v: boolean) {
  musicOn = v;
  applyMusic();
}
let greeted = false;
export function setMood(m: Mood) {
  mood = m;
  applyMusic();
  // native has no autoplay block: shout the name once on the title screen
  if (Platform.OS !== 'web' && m === 'menu' && !greeted && musicOn) { greeted = true; raw('win'); }
}

if (Platform.OS !== 'web') setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

// Browsers block audio until the first tap; start the music on that tap.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const kick = () => {
    applyMusic();
    if (musicOn && mood === 'menu' && !greeted) { greeted = true; raw('win'); }
    document.removeEventListener('pointerdown', kick, true);
    document.removeEventListener('keydown', kick, true);
  };
  document.addEventListener('pointerdown', kick, true);
  document.addEventListener('keydown', kick, true);
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
