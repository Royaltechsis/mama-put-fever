// Recipes, timing windows and quality scoring for the cooking mini game.

export type PotId = 'pot' | 'egusi';

export type Ing = 'oil' | 'onion' | 'blend' | 'stock' | 'rice' | 'ugu';
export const ING: Record<Ing, { label: string; emoji: string }> = {
  oil: { label: 'Oil', emoji: '🫗' },
  onion: { label: 'Onion', emoji: '🧅' },
  blend: { label: 'Pepper mix', emoji: '🌶' },
  stock: { label: 'Stock', emoji: '🍲' },
  rice: { label: 'Rice', emoji: '🍚' },
  ugu: { label: 'Ugu', emoji: '🥬' },
};

/** wait = seconds after the previous ingredient before the ideal window opens; win = how long it stays open */
export type RStep = { ing: Ing; wait: number; win: number; tip: string };
export type PotRecipe = { title: string; steps: RStep[]; simmer: number; stirs: number };

export const POT_RECIPES: Record<PotId, PotRecipe> = {
  pot: {
    title: 'Jollof rice',
    simmer: 7,
    stirs: 3,
    steps: [
      { ing: 'oil', wait: 0, win: 99, tip: 'Heat the oil' },
      { ing: 'onion', wait: 2.5, win: 2.6, tip: 'Fry the onions till soft' },
      { ing: 'blend', wait: 3, win: 3, tip: 'Pour in the pepper mix, fry till dark' },
      { ing: 'stock', wait: 4, win: 3, tip: 'Add stock and let it boil' },
      { ing: 'rice', wait: 3.5, win: 3, tip: 'Rinse the rice in, then cover' },
    ],
  },
  egusi: {
    title: 'Egusi soup',
    simmer: 6,
    stirs: 2,
    steps: [
      { ing: 'oil', wait: 0, win: 99, tip: 'Heat the palm oil' },
      { ing: 'blend', wait: 2.5, win: 2.8, tip: 'Fry the pepper mix' },
      { ing: 'stock', wait: 3.5, win: 3, tip: 'Add stock, let it bubble' },
      { ing: 'ugu', wait: 3, win: 3, tip: 'Fold in the ugu leaves' },
    ],
  },
};

export type PotState = {
  portions: number;
  step: number;
  stepAt: number;
  scores: number[];
  cooking: boolean;
  cookStart: number;
  stirs: number;
  lastStir: number;
  q: number; // stars of the finished batch (1-5)
};
export const freshPot = (portions: number): PotState => ({ portions, step: 0, stepAt: 0, scores: [], cooking: false, cookStart: 0, stirs: 0, lastStir: 0, q: 4 });

/** where `dt` seconds after the previous step sits relative to the step's ideal window */
export function windowOf(step: RStep, winMul: number) {
  const win = step.win >= 99 ? 99 : step.win * winMul;
  return { from: step.wait, to: step.wait + win };
}
export function timingState(dt: number, step: RStep, winMul: number): 'early' | 'perfect' | 'late' {
  const w = windowOf(step, winMul);
  return dt < w.from ? 'early' : dt <= w.to ? 'perfect' : 'late';
}
/** 0..1 */
export function scoreStep(dt: number, step: RStep, winMul: number): number {
  const w = windowOf(step, winMul);
  if (dt >= w.from && dt <= w.to) return 1;
  if (dt < w.from) { const d = w.from - dt; return d <= 1.2 ? 0.7 : d <= 2.5 ? 0.45 : 0.25; }
  const d = dt - w.to;
  return d <= 1.2 ? 0.75 : d <= 3 ? 0.5 : 0.3;
}
export function batchStars(scores: number[], stirs: number, need: number): number {
  const avg = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
  const stirMul = stirs >= need ? 1 : stirs === 0 ? 0.62 : 0.82;
  const v = avg * stirMul;
  return v >= 0.93 ? 5 : v >= 0.78 ? 4 : v >= 0.6 ? 3 : v >= 0.45 ? 2 : 1;
}

/** grill and fryer: 0 = burnt, 1..5 stars once ready */
export function cookStars(e: number, cook: number, burn: number, needsFlip: boolean, flipped: boolean): number {
  const over = e - cook;
  if (over < 0) return -1;
  if (over >= burn) return 0;
  const base = over <= 2 ? 5 : over <= 3.5 ? 4 : over <= 5 ? 3 : 2;
  return needsFlip && !flipped ? Math.min(base, 3) : base;
}

export const starsText = (n: number) => '★'.repeat(Math.max(0, Math.round(n))) + '☆'.repeat(Math.max(0, 5 - Math.round(n)));

/** what a customer pays and tips for a given plate quality */
export function payMul(q: number) { return q >= 4.5 ? 1 : q >= 3.5 ? 0.9 : q >= 2.5 ? 0.75 : 0.55; }
export function tipMulQ(q: number) { return q >= 4.5 ? 1.3 : q >= 3.5 ? 1 : q >= 2.5 ? 0.4 : 0; }

const REVIEWS: Record<number, string[]> = {
  5: ['This jollof is correct! 🔥', 'Mama put don cook! Perfect.', 'Best buka in town o!', 'I will bring my whole family.'],
  4: ['Very nice, sha!', 'Good food, good vibes.', 'Tasty. Small wait only.'],
  3: ['E dey okay, nothing special.', 'Not bad, not great.', 'Food was fine. Could be better.'],
  2: ['Hmm, the food was off today.', 'Too slow and too salty 😒', 'I have eaten better.'],
  1: ['Ah ah! This food is bad 🤢', 'Never again. Wasted my money.', 'Burnt and cold. Mba!', 'I waited forever for nothing!'],
};
export function reviewText(stars: number, seed: number) {
  const pool = REVIEWS[Math.max(1, Math.min(5, stars))];
  return pool[Math.abs(seed) % pool.length];
}
