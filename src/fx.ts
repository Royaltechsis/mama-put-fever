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
  // customer arrival: a quiet counter bell every time, sometimes a short greeting / hum
  bell_a: require('../assets/audio/bell_a.mp3'), // brass counter bell
  bell_b: require('../assets/audio/bell_b.mp3'), // softer bell
  bell_c: require('../assets/audio/bell_c.mp3'), // small bright ding
  f_afternoon: require('../assets/audio/f_afternoon.mp3'), // "Good afternoon o!" (woman)
  f_aunty: require('../assets/audio/f_aunty.mp3'), // "Aunty, good afternoon!" (woman)
  f_ehen: require('../assets/audio/f_ehen.mp3'), // "Ehen?" (woman)
  f_mmm: require('../assets/audio/f_mmm.mp3'), // appreciative "Mmm!" (woman)
  f_hum: require('../assets/audio/f_hum.mp3'), // happy wordless hum (woman, SFX)
  m_aunty: require('../assets/audio/m_aunty.mp3'), // "Aunty!" (man)
  m_howfar: require('../assets/audio/m_howfar.mp3'), // "How far?" (man)
  m_ekasan: require('../assets/audio/m_ekasan.mp3'), // "Ẹ kú àsán o!" (man)
  m_ahh: require('../assets/audio/m_ahh.mp3'), // satisfied "Ahh" (man)
  m_mmhm: require('../assets/audio/m_mmhm.mp3'), // "Mm-hmm" (man)
  m_grunt: require('../assets/audio/m_grunt.mp3'), // wordless "mm-hm" grunt (man, SFX)
  burnt_a: require('../assets/audio/burnt_a.mp3'), // "Ehn-ehn! E don burn o!"
  burnt_b: require('../assets/audio/burnt_b.mp3'), // "Ah! E don burn!"
  angry_a: require('../assets/audio/angry_a.mp3'), // "Mtchew! Abeg, I no fit wait!" (man)
  angry_b: require('../assets/audio/angry_b.mp3'), // "Abeg! Una too slow!" (man)
};
type Src = keyof typeof SOURCES;
// Voice cues pick a random take (never the same one twice in a row) and are rate-limited
// so the buka doesn't turn into a choir.
const VOICES = {
  burnt: ['burnt_a', 'burnt_b'],
  angry: ['angry_a', 'angry_b'],
} as const satisfies Record<string, readonly Src[]>;
const BELLS: readonly Src[] = ['bell_a', 'bell_b', 'bell_c'];
const GREET_F: readonly Src[] = ['f_afternoon', 'f_aunty', 'f_ehen', 'f_mmm', 'f_hum'];
const GREET_M: readonly Src[] = ['m_aunty', 'm_howfar', 'm_ekasan', 'm_ahh', 'm_mmhm', 'm_grunt'];
export type Sfx =
  | Exclude<Src, `${string}_a` | `${string}_b` | `${string}_c` | `f_${string}` | `m_${string}`>
  | keyof typeof VOICES
  | 'customer';

const VOL: Partial<Record<Src, number>> = {
  sizzle: 0.55, plop: 0.8, pop: 0.8, bad: 0.8, ding: 0.9,
  bell_a: 0.4, bell_b: 0.45,
  f_afternoon: 0.6, f_aunty: 0.6, f_ehen: 0.6, f_mmm: 0.6, f_hum: 0.6, m_aunty: 0.6, m_howfar: 0.6, m_ekasan: 0.6, m_ahh: 0.6, m_mmhm: 0.6, m_grunt: 0.6,
  bell_c: 0.45, angry_a: 0.75, angry_b: 0.75,
};
const VOICE_GAP_MS: Record<keyof typeof VOICES, number> = { burnt: 2500, angry: 4000 };
const GREET_GAP_MS = 6500; // at least this long between two customer voices
const GREET_CHANCE = 0.45; // otherwise just the bell

let enabled = true;
const players: Partial<Record<Src, AudioPlayer>> = {};
const lastVoice: Record<string, number> = {};
const lastTake: Record<string, Src | undefined> = {};

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

// random take from a pool, never repeating the previous one for that pool
function pick(pool: string, takes: readonly Src[]): Src | undefined {
  if (!takes.length) return undefined;
  const choices = takes.length > 1 ? takes.filter((t) => t !== lastTake[pool]) : takes;
  const t = choices[Math.floor(Math.random() * choices.length)];
  lastTake[pool] = t;
  return t;
}

function customerArrives(female?: boolean) {
  raw(pick('bell', BELLS)!);
  const now = Date.now();
  if (now - (lastVoice.greet ?? 0) < GREET_GAP_MS || Math.random() > GREET_CHANCE) return;
  const pool = female === undefined ? [...GREET_F, ...GREET_M] : female ? GREET_F : GREET_M;
  const v = pick('greet', pool.filter((t) => t !== lastTake.greetAny));
  if (!v) return;
  lastVoice.greet = now;
  lastTake.greetAny = v;
  setTimeout(() => { if (enabled) raw(v); }, 280);
}

export function play(name: Sfx, opts?: { female?: boolean }) {
  if (!enabled) return;
  if (name === 'customer') { customerArrives(opts?.female); return; }
  if (name in VOICES) {
    const k = name as keyof typeof VOICES;
    const now = Date.now();
    if (now - (lastVoice[k] ?? 0) < VOICE_GAP_MS[k]) { raw('bad'); return; }
    const t = pick(k, VOICES[k]);
    if (!t) { raw('bad'); return; }
    lastVoice[k] = now;
    raw(t);
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
