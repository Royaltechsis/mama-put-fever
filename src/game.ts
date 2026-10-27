import { CONTAINER_INFO, DISHES, LEVELS, containerNeeded, type Level, type SideId, type Container } from './data';

export type PackResult = {
  container: Container;
  have: number;
  need: number;
  sides: { kind: SideId; have: number; need: number }[];
  extras: number; // units of things nobody ordered
  wrong: number; // wrong drops (wrong container / side not ordered)
};

export type Run = {
  levelIdx: number;
  level: Level;
  phase: 'intro' | 'cook' | 'pack' | 'deliver' | 'results';
  deadline: number;
  frozenAt: number | null;
  cookQuality: number[]; // per order 0..100
  packs: PackResult[];
  timeLeftAtDelivery: number;
  failed: boolean;
  failReason?: string;
  deliveryNote?: string;
};

export function newRun(levelIdx: number): Run {
  return {
    levelIdx,
    level: LEVELS[levelIdx],
    phase: 'intro',
    deadline: 0,
    frozenAt: null,
    cookQuality: [],
    packs: [],
    timeLeftAtDelivery: 0,
    failed: false,
  };
}

export function timeLeft(run: Run, now: number) {
  if (!run.deadline) return run.level.time;
  const ref = run.frozenAt ?? now;
  return (run.deadline - ref) / 1000;
}

export type Result = {
  quality: number;
  accuracy: number;
  speed: number;
  stars: number;
  food: number;
  tip: number;
  waste: number;
  total: number;
  mood: 'happy' | 'ok' | 'sad' | 'angry';
  quote: string;
};

const QUOTES: Record<number, string[]> = {
  3: ['Chai! This food sweet die! 🔥', 'Mama Put, you do well! My guests are dancing!', 'E choke! Na you go cook my wedding o!', 'Sharp sharp delivery, food still hot. God bless you!'],
  2: ['Not bad o. Next time, sharp sharp!', 'Food is fine, small delay sha.', 'We enjoyed it. Just count the packs well next time.'],
  1: ['Hmm. Wetin happen to this food?', 'We manage am like that.', 'Half my people never chop o!'],
  0: ['Na wa o! My people waited till they slept!', 'I no go order again o!', 'Is this food or punishment?'],
};

export const starFor = (score: number) => (score >= 85 ? 3 : score >= 65 ? 2 : score >= 40 ? 1 : 0);

export function computeResult(run: Run): Result {
  const orders = run.level.orders;
  if (run.failed) {
    return { quality: 0, accuracy: 0, speed: 0, stars: 0, food: 0, tip: 0, waste: 0, total: 0, mood: 'angry', quote: pick(QUOTES[0], run.levelIdx) };
  }
  const quality = avg(run.cookQuality.length ? run.cookQuality : [0]);
  // accuracy
  let need = 0, got = 0, extras = 0, wrong = 0;
  run.packs.forEach((p) => {
    need += p.need; got += Math.min(p.have, p.need); extras += Math.max(0, p.have - p.need) * (CONTAINER_INFO[p.container].per > 1 ? 3 : 1);
    p.sides.forEach((s) => { need += s.need; got += Math.min(s.have, s.need); extras += Math.max(0, s.have - s.need); });
    extras += p.extras; wrong += p.wrong;
  });
  const accuracy = clamp(Math.round((need ? (got / need) * 100 : 100) - extras * 3 - wrong * 5), 0, 100);
  const frac = run.timeLeftAtDelivery / run.level.time;
  const speed = run.timeLeftAtDelivery <= 0 ? 15 : clamp(Math.round(30 + frac * 150), 0, 100);
  const overall = (quality + accuracy + speed) / 3;
  const stars = starFor(overall);
  const base = orders.reduce((s, o) => s + o.people * DISHES[o.dish].price, 0);
  const food = round50(base * (0.4 + 0.6 * (quality / 100)) * (0.4 + 0.6 * (accuracy / 100)));
  const tip = speed >= 60 ? round50(base * 0.3 * ((speed - 50) / 50)) : 0;
  const waste = extras * 100;
  const total = Math.max(0, food + tip - waste);
  const mood = stars === 3 ? 'happy' : stars === 2 ? 'ok' : stars === 1 ? 'sad' : 'angry';
  return { quality: Math.round(quality), accuracy, speed, stars, food, tip, waste, total, mood, quote: pick(QUOTES[stars], run.levelIdx + Math.round(overall)) };
}

function pick<T>(xs: T[], seed: number) { return xs[Math.abs(seed) % xs.length]; }
function avg(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / xs.length; }
export function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function round50(v: number) { return Math.round(v / 50) * 50; }

export { containerNeeded };
