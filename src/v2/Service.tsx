import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeOutUp, ZoomIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Draggable, DropZone, type Payload } from '../dnd';
import { play, haptic } from '../fx';
import { useNow } from '../ui';
import { Abs, GText, Scaled, SW, useS } from './stage';
import { SPR } from './assets';
import { LEVELS2, MENU, scriptFor, stationsFor, goalsFor, type Comp, type Drink, type MenuId } from './data2';
import type { Save2, StockKey } from './save2';
import { LBL, STOCK_INFO, STOCK_OF, RUNNER_MUL } from './dests';
import type { PrepResult } from './Prep';
import { WORKERS, chefLevel, chefWinMul, hiredWorkers, staffLvOf, staffSkill, staffSpeed, type StaffId, type WorkerId } from './save2';
import { PlateView } from './PlateView';
import { AISLE_Y, CANVAS_H, DinerOverlay, KL, LANE, ReviewChip, StaffTag, WALK_IN, planFor, seatSpots, useShake, type Cust } from './Dining';
import { CHEF_X, PASS_STAND_X, STAGE_X, X_OF, Z_AISLE, kitchenZ, proj, yToZ } from './world3d/geom';
import { World3D, staffPos, type CrewMember } from './world3d/World3D';
import { CookBar, PotTimeBar, RecipeSheet, Steam } from './CookUI';
import PauseMenu from './PauseMenu';
import { ING, POT_RECIPES, batchStars, cookStars, freshPot, payMul, reviewText, scoreStep, starsText, tipMulQ, windowOf, timingState, type Ing, type PotId, type PotState } from './recipes';

export { PlateView };

const COOK = { chicken: 5, suya: 5, dodo: 4, puffpuff: 4 } as const;
type GrillItem = 'chicken' | 'suya';
type FryItem = 'dodo' | 'puffpuff';
type Slot<T> = { item: T | null; start: number; flipped?: boolean };

const PLATE_X = [300, 382, 464, 546];
// the 2D kitchen is shrunk and tucked under the 3D dining room
const KS = 0.8; // kitchen scale
const KOX = (SW - SW * KS) / 2; // kitchen left offset on the stage
const KWT = 102; // kitchen top offset on the stage
const PASS_PICK_X = STAGE_X(PASS_STAND_X); // waiters collect plates and drinks at the pass counter
const SHELF_ORDER: Ing[] = ['oil', 'onion', 'blend', 'stock', 'rice', 'ugu'];
const POT_X: Record<PotId, number> = { pot: 68, egusi: 186 };
const WALK_SPEED = 150; // stage units per second for a level 1 worker
let SHEET_SEEN = false; // the recipe book opens by itself the first time in a session

type StepT = { x: number; y: number; hold?: number; carry?: string | null; act?: string; fn?: () => void; wait?: () => number; idle?: boolean };
type StaffRt = {
  x: number; y: number; fx: number; fy: number; tx: number; ty: number; t0: number; t1: number;
  q: StepT[]; cur: StepT | null; phase: 'free' | 'moving' | 'working'; waitUntil: number; did: boolean; holdUntil: number;
  carry: string | null; face: 1 | -1; act: string; moving: boolean; tasks: number;
};
type Pt = { x: number; y: number };

export type ServiceResult = {
  tips?: number; coins: number; served: number; lost: number; total: number; bestCombo: number; stock?: Record<StockKey, number>; runner?: number;
  reviews?: { stars: number; text: string }[]; xp?: number; staff?: Record<WorkerId, number>; avgQ?: number;
};

export default function Service({ levelIdx, save, onEnd, onQuit, onRestart, sound, music, onToggleSound, onToggleMusic, prep }: {
  prep?: PrepResult | null; levelIdx: number; save: Save2; onEnd: (r: ServiceResult) => void; onQuit: () => void; onRestart: () => void;
  sound: boolean; music: boolean; onToggleSound: () => void; onToggleMusic: () => void;
}) {
  const S = useS();
  const lv = LEVELS2[levelIdx];
  const st = useMemo(() => stationsFor(lv), [levelIdx]);
  const script = useMemo(() => scriptFor(levelIdx), [levelIdx]);
  const goals = useMemo(() => goalsFor(levelIdx), [levelIdx]);
  const up = save.kitchen;
  const grillN = 2 + (up.grill ?? 0);
  const potCap = 4 + 2 * (up.pot ?? 0);
  const fryN = (up.fryer ?? 0) >= 2 ? 3 : 2;
  const fryFast = (up.fryer ?? 0) >= 1 ? 0.75 : 1;
  const pour = [2.4, 1.5, 0.9][up.drinks ?? 0] * (save.deco?.gen ? 0.7 : 1);
  const seats = Math.max(3, Math.min(5, save.seats ?? 4));
  const plan = useMemo(() => planFor(seats), [seats]);
  const TX = plan.seatX; // x of each seat
  const AIS = plan.aisles;
  const plateN = 3 + (up.plates ?? 0);
  const rating = save.rating ?? 3.5;
  const chefXp = save.xp ?? 0;
  // difficulty: harder on later days, easier timing windows as the chef levels up
  const winMul = chefWinMul(chefXp) * (1 - Math.min(0.3, levelIdx * 0.025));
  const burnAfter = Math.max(4.5, 6.5 - levelIdx * 0.15);
  const gapMul = (rating >= 4.2 ? 0.9 : rating < 2.5 ? 1.15 : 1) * 0.9;
  const patBase = lv.patience * 0.8;
  const patienceMul = (1 + (save.decor.ankara ? 0.15 : 0) + (save.decor.fans ? 0.1 : 0) + (save.deco?.tv ? 0.15 : 0) + (save.deco?.canopy ? 0.05 : 0) + ((save.chair ?? 0) >= 2 ? 0.1 : 0)) * (1 + (rating - 3) * 0.05);
  const tipMul = (save.decor.music ? 1.2 : 1) * ([1, 1.1, 1.25][save.chair ?? 0] ?? 1) * (1 + (rating - 3) * 0.08) * (1 + 0.03 * (chefLevel(chefXp) - 1));
  const pots = useMemo(() => [...(st.has('pot') ? ['pot' as PotId] : []), ...(st.has('egusi') ? ['egusi' as PotId] : [])], [st]);
  const shelf = useMemo(() => SHELF_ORDER.filter((i) => pots.some((p) => POT_RECIPES[p].steps.some((s) => s.ing === i))), [pots]);
  const potTitle = (p: PotId) => { const n = (p === 'pot' ? LBL.jollof : LBL.egusi) || POT_RECIPES[p].title; return n.charAt(0).toUpperCase() + n.slice(1); };

  const t0 = useRef(Date.now());
  const now = useNow(100);
  // pausing freezes game time: pauseAt is the moment of the pause and pausedTotal the time spent paused so far
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const pauseAt = useRef<number | null>(null);
  const pausedTotal = useRef(0);
  const clock = (ms: number) => ((pauseAt.current ?? ms) - t0.current - pausedTotal.current) / 1000;
  const t = clock(now);
  const tn = () => clock(Date.now()); // always-current game time for callbacks that outlive a render
  const setPause = (on: boolean) => {
    if (on === pausedRef.current) return;
    if (on) pauseAt.current = Date.now();
    else { pausedTotal.current += Date.now() - (pauseAt.current ?? Date.now()); pauseAt.current = null; }
    pausedRef.current = on; setPaused(on);
  };
  /** like setTimeout, but waits out a pause */
  const later = (fn: () => void, ms: number) => { setTimeout(function run() { if (pausedRef.current) { setTimeout(run, 150); return; } fn(); }, ms); };
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setPause(!pausedRef.current); };
    const vis = () => { if (document.hidden) setPause(true); };
    window.addEventListener('keydown', key); document.addEventListener('visibilitychange', vis);
    return () => { window.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', vis); };
  }, []);
  const [, force] = useState(0);
  const [sheet, setSheet] = useState(() => { const open = !SHEET_SEEN; SHEET_SEEN = true; return open; });
  const g = useRef({
    custs: [] as (Cust | null)[],
    nextIdx: 0,
    pot: freshPot(potCap),
    egusi: freshPot(4),
    grill: Array.from({ length: grillN }, () => ({ item: null, start: 0 } as Slot<GrillItem>)),
    fryer: Array.from({ length: fryN }, () => ({ item: null, start: 0 } as Slot<FryItem>)),
    cups: [{ item: null, start: 0 }, { item: null, start: 0 }] as Slot<Drink>[],
    plates: Array.from({ length: plateN }, () => [] as Comp[]),
    plateQ: {} as Record<number, Partial<Record<Comp, number>>>,
    coins: 0, served: 0, lost: 0, combo: 0, bestCombo: 0, lastServe: 0,
    pops: [] as { id: number; x: number; y: number; text: string; color: string }[],
    revPops: [] as { id: number; x: number; stars: number; text: string }[],
    reviews: [] as { stars: number; text: string }[],
    xp: 0, qSum: 0, qN: 0,
    shake: {} as Record<string, number>,
    ended: false,
    msg: null as null | { text: string; id: number },
    stock: { ...save.stock, pepper: (save.stock.pepper ?? 0) + (prep?.pepper ?? 0) } as Record<StockKey, number>,
    runner: 0,
    tips: 0, cooler: prep?.cooler ?? 0, tray: prep?.tray ?? 0,
    claim: {} as Record<string, boolean>,
    st: {} as Record<string, StaffRt>,
  });
  if (g.current.custs.length === 0) g.current.custs = Array.from({ length: seats }, () => null);
  const G = g.current;
  const crew = hiredWorkers(save);
  const roleOf = (w: WorkerId): StaffId => WORKERS[w].role;
  /** where a worker waits when idle: cooks behind the counter, waiters at the left of the room, cleaners at the right */
  const homeOf = (w: WorkerId): Pt => {
    const role = roleOf(w); const n = crew.filter((x) => roleOf(x) === role).indexOf(w);
    if (role === 'cook') return { x: 88 + n * 62, y: KL };
    if (role === 'waiter') return { x: PASS_PICK_X - n * 60, y: LANE };
    return { x: AIS[0] + n * 56, y: LANE };
  };
  crew.forEach((k) => {
    if (!G.st[k]) {
      const h = homeOf(k);
      G.st[k] = { x: h.x, y: h.y, fx: h.x, fy: h.y, tx: h.x, ty: h.y, t0: 0, t1: 0, q: [], cur: null, phase: 'free', waitUntil: 0, did: false, holdUntil: 0, carry: null, face: 1, act: '', moving: false, tasks: 0 };
    }
  });
  if (Platform.OS === 'web' && typeof window !== 'undefined') (window as any).__mp = { G, t: tn, COOK, burnAfter, fryFast, pour, MENU, winMul };
  const rerender = () => force((x) => x + 1);
  let popId = useRef(0);
  const pop = (x: number, y: number, text: string, color = '#FFC93C') => {
    const id = ++popId.current;
    G.pops.push({ id, x, y, text, color });
    later(() => { G.pops = G.pops.filter((p) => p.id !== id); rerender(); }, 1100);
  };
  /** a pop-up at a spot in the (scaled) kitchen's own coordinates */
  const kpop = (x: number, y: number, text: string, color?: string) => pop(KOX + x * KS, KWT + y * KS, text, color);
  const headOf = (ci: number) => seatSpots(TX[ci]).head;
  const say = (text: string) => { G.msg = { text, id: Date.now() }; setTimeout(() => { if (G.msg && Date.now() - G.msg.id > 1300) { G.msg = null; rerender(); } }, 1400); };
  const shake = (key: string) => { G.shake[key] = (G.shake[key] ?? 0) + 1; };
  const addReview = (ci: number, stars: number) => {
    const text = reviewText(stars, Math.floor(Math.random() * 1000));
    G.reviews.push({ stars, text });
    const id = ++popId.current;
    G.revPops.push({ id, x: TX[ci], stars, text });
    later(() => { G.revPops = G.revPops.filter((r) => r.id !== id); rerender(); }, 3000);
  };

  // ---- tick ----
  useEffect(() => {
    if (G.ended || pausedRef.current) return;
    // spawn
    const free = G.custs.findIndex((c) => c === null);
    if (free >= 0 && G.nextIdx < script.length && t >= script[G.nextIdx].at * gapMul) {
      const sc = script[G.nextIdx++];
      const frees = G.custs.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
      const slot = frees[Math.floor(Math.random() * frees.length)];
      G.custs[slot] = { id: G.nextIdx, who: sc.who, items: sc.items.map((m) => ({ m, done: false })), arrived: t + WALK_IN, patience: 1, state: 'waiting', coins: 0, tip: 0, leftAt: 0, eatUntil: 0, q: 0, stars: 0 };
      play('customer', { female: [0, 3, 5].includes(sc.who) });
    }
    // patience (counts from the moment they sit down)
    G.custs.forEach((c, i) => {
      if (!c || c.state !== 'waiting' || t < c.arrived) return;
      c.patience = Math.max(0, 1 - (t - c.arrived) / (patBase * patienceMul));
      if (c.patience <= 0) {
        c.state = 'left'; c.leftAt = t; G.lost++; G.combo = 0;
        play('angry'); haptic.bad(); say('A customer left angry! 😤');
        addReview(i, 1);
        later(() => { if (G.custs[i] === c) { G.custs[i] = null; rerender(); } }, 1700);
      }
    });
    // pots: simmer, then the batch gets its quality
    pots.forEach((which) => {
      const P = G[which]; const rec = POT_RECIPES[which];
      if (P.cooking && t - P.cookStart >= rec.simmer) {
        P.q = batchStars(P.scores, P.stirs, rec.stirs);
        G[which] = { ...freshPot(which === 'pot' ? potCap : 4), q: P.q };
        play('ding'); say(`${potTitle(which)} ready: ${starsText(P.q)}`);
      }
    });
    // burn warnings
    G.grill.forEach((s) => { if (s.item && t - s.start >= COOK[s.item] + burnAfter && t - s.start < COOK[s.item] + burnAfter + 0.12) play('burnt'); });
    G.fryer.forEach((s) => { if (!s.item) return; const e = (t - s.start) / fryFast; if (e >= COOK[s.item] + burnAfter && e < COOK[s.item] + burnAfter + 0.12 / fryFast) play('burnt'); });
    // eating -> pays (coins appear on the table)
    G.custs.forEach((c, i) => {
      if (c && c.state === 'eating' && t >= c.eatUntil) { c.state = 'paid'; c.leftAt = t; const id = c.id; later(() => collect(i, id), 6000); }
    });
    // morning prep: the cooler refills the pot instantly
    if (G.cooler > 0 && st.has('pot') && G.pot.portions <= 0 && !G.pot.cooking && G.pot.step === 0) {
      const n = Math.min(G.cooler, potCap); G.cooler -= n; G.pot = { ...freshPot(n), q: 4 }; play('plop'); say(`${n} ${LBL.jollof} from the cooler!`);
    }
    staffTick();
    // end?
    const allDone = G.nextIdx >= script.length && G.custs.every((c) => c === null || c.state === 'dirty' || c.state === 'leaving');
    if (t >= lv.duration || allDone) {
      G.ended = true;
      G.custs.forEach((c) => { if (c && (c.state === 'paid' || c.state === 'eating')) { G.coins += c.coins + c.tip; G.tips += c.tip; } });
      const staff: Record<WorkerId, number> = {};
      Object.keys(G.st).forEach((k) => { staff[k] = G.st[k].tasks; });
      setTimeout(() => onEnd({
        coins: G.coins, served: G.served, lost: G.lost + G.custs.filter((c) => c && c.state === 'waiting').length + (script.length - G.nextIdx), total: script.length, bestCombo: G.bestCombo,
        tips: G.tips, stock: { ...G.stock }, runner: G.runner, reviews: G.reviews, xp: G.xp, staff, avgQ: G.qN ? G.qSum / G.qN : undefined,
      }), 900);
    }
  }, [now]);

  // ---- helpers ----
  const grillQ = (s: Slot<GrillItem>) => (s.item ? cookStars(t - s.start, COOK[s.item], burnAfter, true, !!s.flipped) : -1);
  const fryQ = (s: Slot<FryItem>) => (s.item ? cookStars((t - s.start) / fryFast, COOK[s.item], burnAfter, false, true) : -1);
  const stateOf = (q: number, has: boolean) => (!has ? 'empty' : q < 0 ? 'cooking' : q === 0 ? 'burnt' : 'ready');
  const grillState = (s: Slot<GrillItem>) => stateOf(grillQ(s), !!s.item);
  const fryState = (s: Slot<FryItem>) => stateOf(fryQ(s), !!s.item);
  const cupReady = (s: Slot<Drink>) => !!s.item && t - s.start >= pour;
  const plateAvg = (pi: number): number | null => {
    const m = G.plateQ[pi];
    const v = G.plates[pi].map((c) => m?.[c]).filter((x): x is number => typeof x === 'number');
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };

  function addToPlate(pi: number, c: Comp, q?: number): boolean {
    const p = G.plates[pi];
    if (p.includes(c)) { shake('plate' + pi); play('bad'); return false; }
    if (c === 'yaji' && !p.includes('suya')) { say(`Put ${LBL.suya.toLowerCase()} on the plate first, then ${LBL.yaji.toLowerCase()}`); shake('plate' + pi); play('bad'); return false; }
    // plates hold one dish: block mixing that can never match a menu item
    const next = [...p, c];
    const ok = (Object.keys(MENU) as MenuId[]).some((m) => MENU[m].comps && next.every((x) => MENU[m].comps!.includes(x)));
    if (!ok) { say("That combo isn't on the menu"); shake('plate' + pi); play('bad'); return false; }
    G.plates[pi] = next;
    const qm = (G.plateQ[pi] ??= {});
    if (q != null) qm[c] = q; else delete qm[c];
    play('plop');
    return true;
  }
  const plateFor = (c: Comp) => {
    // prefer a plate that already has a partner, else an empty one
    let best = -1;
    G.plates.forEach((p, i) => {
      if (best >= 0 && G.plates[best].length > 0) return;
      const next = [...p, c];
      if (p.includes(c)) return;
      if (c === 'yaji' && !p.includes('suya')) return;
      const ok = (Object.keys(MENU) as MenuId[]).some((m) => MENU[m].comps && next.every((x) => MENU[m].comps!.includes(x)));
      if (!ok) return;
      if (p.length > 0) best = i; else if (best < 0) best = i;
    });
    return best;
  };

  function serve(ci: number, what: { comps?: Comp[]; drink?: Drink; q?: number }): boolean {
    const c = G.custs[ci];
    if (!c || c.state !== 'waiting') return false;
    if (tn() < c.arrived) { say('Let them sit down first 🙂'); return false; }
    const idx = c.items.findIndex((it) => !it.done && (what.drink ? MENU[it.m].drink === what.drink : !!MENU[it.m].comps && MENU[it.m].comps!.length === what.comps!.length && MENU[it.m].comps!.every((x) => what.comps!.includes(x))));
    if (idx < 0) { shake('cust' + ci); play('bad'); haptic.bad(); say("That's not what they ordered"); return false; }
    const q = what.q ?? 4;
    if (q < 1.5) {
      // a ruined dish goes straight back
      c.arrived -= patBase * patienceMul * 0.22;
      shake('cust' + ci); play('angry'); haptic.bad(); say('Yuck! They sent it back 🤢');
      pop(headOf(ci).x - 10, headOf(ci).y - 34, '🤢', '#FF8A7A');
      return true;
    }
    c.items[idx].done = true; c.items[idx].q = q;
    play('pop'); haptic.drop();
    pop(headOf(ci).x + 16, headOf(ci).y - 34, '✓', '#7BE36A');
    G.xp += Math.max(0, Math.round(q) - 2);
    if (c.items.every((it) => it.done)) {
      const price = c.items.reduce((a, it) => a + MENU[it.m].price, 0);
      const avgQ = c.items.reduce((a, it) => a + (it.q ?? 4), 0) / c.items.length;
      const now2 = tn();
      const since = now2 - G.lastServe;
      G.combo = since < 12 ? G.combo + 1 : 1;
      G.lastServe = now2;
      G.bestCombo = Math.max(G.bestCombo, G.combo);
      const bonus = G.combo >= 2 ? 50 * Math.min(G.combo, 5) : 0;
      const tip = Math.round((price * 0.25 * c.patience * tipMul * tipMulQ(avgQ) + bonus * (avgQ >= 3.5 ? 1 : 0.4)) / 50) * 50;
      const speedAdj = c.patience > 0.65 ? 0.4 : c.patience < 0.25 ? -0.8 : 0;
      c.q = avgQ; c.stars = Math.max(1, Math.min(5, Math.round(avgQ + speedAdj)));
      c.state = 'eating'; c.eatUntil = now2 + 3.4; c.coins = Math.round((price * payMul(avgQ)) / 50) * 50; c.tip = tip; c.leftAt = now2; G.served++;
      G.qSum += avgQ; G.qN++; G.xp += [0, 0, 1, 3, 5, 8][c.stars];
      addReview(ci, c.stars);
      play(G.combo >= 2 ? 'combo' : 'lick'); haptic.good();
      if (G.combo >= 2) say(`Combo x${G.combo}! 🔥`);
    }
    return true;
  }
  function collect(ci: number, id?: number) {
    const c = G.custs[ci];
    if (!c || c.state !== 'paid' || (id != null && c.id !== id)) return;
    G.coins += c.coins + c.tip; G.tips += c.tip;
    pop(headOf(ci).x - 22, headOf(ci).y - 34, `+₦${(c.coins + c.tip).toLocaleString('en-US')}`);
    play('cash');
    c.state = 'leaving'; c.leftAt = tn();
    const cid = c.id;
    later(() => { const cc = G.custs[ci]; if (cc && cc.id === cid && cc.state === 'leaving') { cc.state = 'dirty'; cc.leftAt = tn(); rerender(); } }, 1500);
    rerender();
  }
  function clearPlate(ci: number) {
    const c = G.custs[ci];
    if (!c || c.state !== 'dirty') return;
    G.custs[ci] = null; G.claim['c' + ci] = false; play('plop'); rerender();
  }
  const tapTray = () => { if (G.tray <= 0) return; const pi = plateFor('dodo'); if (pi < 0) { say('No free plate for that'); play('bad'); return; } if (addToPlate(pi, 'dodo', 4)) { G.tray--; rerender(); } };

  // ---- hired help: they walk the floor between the tables ----
  const speedOf = (k: WorkerId) => WALK_SPEED * staffSpeed(staffLvOf(save, k)) * energyOf(k);
  function energyOf(k: WorkerId) { return Math.max(0.62, 1 - 0.38 * (tn() / lv.duration) * (1 - 0.1 * (staffLvOf(save, k) - 1))); }
  const posOf = (s: StaffRt): Pt => ({ x: s.x, y: s.y });
  /** cooks stay on the kitchen lane; everyone else walks the lane in front of the tables, then up beside a table */
  const route = (from: Pt, to: Pt): Pt[] => {
    if (from.y >= KL - 10 && to.y >= KL - 10) return [to];
    const pts: Pt[] = [];
    if (Math.abs(from.y - LANE) > 1) pts.push({ x: from.x, y: LANE });
    if (Math.abs(from.x - to.x) > 1) pts.push({ x: to.x, y: LANE });
    pts.push(to);
    return pts.filter((q, i) => i === pts.length - 1 || Math.hypot(q.x - (i ? pts[i - 1].x : from.x), q.y - (i ? pts[i - 1].y : from.y)) > 1);
  };
  const leg = (from: Pt, to: Pt, extra: Partial<StepT> = {}): StepT[] => route(from, to).map((p, i, arr) => (i === arr.length - 1 ? { ...p, ...extra } : p));
  /** the spot beside a table, in the aisle next to the customer in seat `ci` */
  const tableSpot = (ci: number, fromX: number): Pt => {
    const ti = plan.seatTable[ci]; const tb = plan.tables[ti]; const k2 = tb.seats.indexOf(ci);
    const left = tb.seats.length === 2 ? k2 === 0 : Math.abs(tb.cx - tb.w / 2 - 30 - fromX) <= Math.abs(tb.cx + tb.w / 2 + 30 - fromX);
    return { x: left ? tb.cx - tb.w / 2 - 30 : tb.cx + tb.w / 2 + 30, y: AISLE_Y };
  };
  const plateX = (pi: number) => PLATE_X[pi] - (plateN === 4 ? 30 : 0) + 39;
  const shelfX = (ing: Ing) => 6 + (shelf.indexOf(ing) % 3) * 40 + 18;
  const grillX = (i: number) => 318 + i * (140 / grillN) + 140 / grillN / 2;

  function startStep(k: WorkerId, s: StaffRt, step: StepT) {
    const now2 = tn();
    s.cur = step; s.fx = s.x; s.fy = s.y; s.tx = step.x; s.ty = step.y;
    s.t0 = now2; s.t1 = now2 + Math.hypot(s.tx - s.fx, s.ty - s.fy) / speedOf(k);
    s.phase = 'moving'; s.did = false;
    if (Math.abs(s.tx - s.fx) > 1) s.face = s.tx > s.fx ? 1 : -1;
  }
  function nextStep(k: WorkerId, s: StaffRt) {
    const step = s.q.shift();
    if (step) startStep(k, s, step); else { s.cur = null; s.phase = 'free'; s.act = ''; s.moving = false; }
  }
  const assign = (k: WorkerId, steps: StepT[]) => { const s = G.st[k]; s.q = steps; s.cur = null; s.phase = 'free'; nextStep(k, s); };
  function advance(k: WorkerId, s: StaffRt) {
    const now2 = tn();
    for (let n = 0; n < 6; n++) {
      if (s.phase === 'moving') {
        if (now2 < s.t1) {
          const f = (now2 - s.t0) / Math.max(0.001, s.t1 - s.t0);
          s.x = s.fx + (s.tx - s.fx) * f; s.y = s.fy + (s.ty - s.fy) * f; s.moving = true;
          return;
        }
        s.x = s.tx; s.y = s.ty; s.moving = false; s.phase = 'working'; s.did = false;
        s.waitUntil = s.cur?.wait ? s.cur.wait() : now2; s.act = s.cur?.act ?? '';
      }
      if (s.phase === 'working') {
        s.moving = false;
        if (!s.did) {
          if (now2 < s.waitUntil) return;
          s.did = true; s.cur?.fn?.();
          if (s.cur && s.cur.carry !== undefined) s.carry = s.cur.carry;
          s.holdUntil = now2 + (s.cur?.hold ?? 0.15);
        }
        if (now2 < s.holdUntil) return;
        s.act = ''; nextStep(k, s);
        if ((s.phase as StaffRt['phase']) === 'free') return;
        continue;
      }
      return;
    }
  }
  function staffTick() {
    crew.forEach((k) => {
      const s = G.st[k]; if (!s) return;
      advance(k, s);
      if (!(s.phase === 'free' || s.cur?.idle)) return;
      if (think(k, s)) return;
      const home = homeOf(k);
      if (s.phase === 'free' && Math.hypot(s.x - home.x, s.y - home.y) > 2) assign(k, leg(posOf(s), home).map((p) => ({ ...p, idle: true })));
    });
  }
  function think(k: WorkerId, s: StaffRt): boolean {
    const from = posOf(s);
    const role = roleOf(k);
    if (role === 'cleaner') {
      const i = G.custs.findIndex((c, ci) => c && c.state === 'dirty' && tn() - c.leftAt > 0.6 && !G.claim['c' + ci]);
      if (i < 0) return false;
      G.claim['c' + i] = true;
      assign(k, leg(from, tableSpot(i, s.x), { act: '🧽', wait: () => tn() + 0.9, hold: 0.2, fn: () => { clearPlate(i); s.tasks++; } }));
      return true;
    }
    if (role === 'waiter') {
      const ci0 = G.custs.findIndex((c, ci) => c && c.state === 'paid' && tn() - c.leftAt > 0.8 && !G.claim['c' + ci]);
      if (ci0 >= 0) {
        const id = G.custs[ci0]!.id; G.claim['c' + ci0] = true;
        assign(k, leg(from, tableSpot(ci0, s.x), { act: '💰', hold: 0.5, fn: () => { collect(ci0, id); G.claim['c' + ci0] = false; s.tasks++; } }));
        return true;
      }
      for (let pi = 0; pi < G.plates.length; pi++) {
        const p = G.plates[pi];
        if (!p.length || G.claim['p' + pi] || (plateAvg(pi) ?? 4) < 1.5) continue;
        const ci = G.custs.findIndex((c, i) => c && c.state === 'waiting' && tn() >= c.arrived && !G.claim['o' + i] && c.items.some((it) => !it.done && MENU[it.m].comps && MENU[it.m].comps!.length === p.length && MENU[it.m].comps!.every((x) => p.includes(x))));
        if (ci < 0) continue;
        const id = G.custs[ci]!.id; G.claim['p' + pi] = true; G.claim['o' + ci] = true;
        let held: { comps: Comp[]; q: number | null; qm: Partial<Record<Comp, number>> } | null = null;
        const pick: Pt = { x: PASS_PICK_X, y: LANE };
        assign(k, [
          ...leg(from, pick, { act: '🍽', hold: 0.3, carry: '🍽', fn: () => { if (G.plates[pi].length) { held = { comps: [...G.plates[pi]], q: plateAvg(pi), qm: { ...(G.plateQ[pi] ?? {}) } }; G.plates[pi] = []; rerender(); } } }),
          ...leg(pick, tableSpot(ci, pick.x), {
            act: '🍽', hold: 0.45, carry: null,
            fn: () => {
              const h = held as typeof held;
              G.claim['p' + pi] = false; G.claim['o' + ci] = false;
              if (!h) return;
              const cc = G.custs[ci];
              const ok = !!cc && cc.id === id && serve(ci, { comps: h.comps, q: h.q ?? 4 });
              if (!ok && !G.plates[pi].length) { G.plates[pi] = h.comps; G.plateQ[pi] = h.qm; }
              s.tasks++; rerender();
            },
          }),
        ]);
        return true;
      }
      for (let k2 = 0; k2 < G.cups.length; k2++) {
        const cup = G.cups[k2];
        if (!cup.item || !cupReady(cup) || G.claim['u' + k2]) continue;
        const d = cup.item;
        const ci = G.custs.findIndex((c, i) => c && c.state === 'waiting' && tn() >= c.arrived && !G.claim['o' + i] && c.items.some((it) => !it.done && MENU[it.m].drink === d));
        if (ci < 0) continue;
        const id = G.custs[ci]!.id; G.claim['u' + k2] = true; G.claim['o' + ci] = true;
        let held: Drink | null = null;
        const pick: Pt = { x: PASS_PICK_X, y: LANE };
        assign(k, [
          ...leg(from, pick, { act: '🥤', hold: 0.3, carry: '🥤', fn: () => { if (G.cups[k2].item === d) { held = d; G.cups[k2] = { item: null, start: 0 }; rerender(); } } }),
          ...leg(pick, tableSpot(ci, pick.x), {
            act: '🥤', hold: 0.45, carry: null,
            fn: () => {
              const h = held as typeof held;
              G.claim['u' + k2] = false; G.claim['o' + ci] = false;
              if (!h) return;
              const cc = G.custs[ci];
              const ok = !!cc && cc.id === id && serve(ci, { drink: h });
              if (!ok && !G.cups[k2].item) G.cups[k2] = { item: h, start: 0 };
              s.tasks++; rerender();
            },
          }),
        ]);
        return true;
      }
      return false;
    }
    // cook: pots first (timed), then stirring, grill pickup, flipping and loading
    const skill = staffSkill(staffLvOf(save, k));
    for (const which of pots) {
      const P = G[which]; const rec = POT_RECIPES[which];
      if (P.portions > 0 || P.cooking || P.step >= rec.steps.length || G.claim['k' + which] || (which === 'pot' && G.cooler > 0)) continue;
      const step = rec.steps[P.step];
      if (P.step > 0 && tn() < P.stepAt + step.wait - 2.6) continue;
      const myStep = P.step; G.claim['k' + which] = true;
      const w = windowOf(step, winMul);
      const err = (Math.random() * 2 - 1) * (1 - skill) * 2.0;
      const shelfAt: Pt = { x: shelfX(step.ing), y: KL }; const potAt: Pt = { x: POT_X[which], y: KL };
      assign(k, [
        ...leg(from, shelfAt, { act: '🧺', hold: 0.25, carry: ING[step.ing].emoji }),
        ...leg(shelfAt, potAt, {
          act: '🥄', hold: 0.2, carry: null,
          wait: () => (myStep === 0 ? tn() : G[which].stepAt + (w.from + w.to) / 2 + err),
          fn: () => { G.claim['k' + which] = false; if (G[which].step === myStep && !G[which].cooking) potDrop(which, { kind: 'src', id: step.ing }); s.tasks++; },
        }),
      ]);
      return true;
    }
    for (const which of pots) {
      const P = G[which]; const rec = POT_RECIPES[which];
      if (!P.cooking || P.stirs >= rec.stirs || G.claim['s' + which]) continue;
      if (tn() - P.cookStart < (P.stirs + 1) * (rec.simmer / (rec.stirs + 2)) + (1 - skill) * 1.5) continue;
      G.claim['s' + which] = true;
      assign(k, leg(from, { x: POT_X[which], y: KL }, { act: '🥄', hold: 0.3, fn: () => { G.claim['s' + which] = false; stir(which); s.tasks++; } }));
      return true;
    }
    for (let i = 0; i < G.grill.length; i++) {
      const slot = G.grill[i]; const q = grillQ(slot);
      if (!slot.item || q <= 0 || G.claim['g' + i] || plateFor(slot.item) < 0) continue;
      if (tn() - slot.start - COOK[slot.item] < (1 - skill) * 2.2) continue;
      G.claim['g' + i] = true;
      const item = slot.item; let held: { item: GrillItem; q: number } | null = null;
      const at: Pt = { x: grillX(i), y: KL }; const pi0 = plateFor(item); const plateAt: Pt = { x: plateX(Math.max(0, pi0)), y: KL };
      assign(k, [
        ...leg(from, at, { act: '🍗', hold: 0.25, carry: item === 'chicken' ? '🍗' : '🍢', fn: () => { const sl = G.grill[i]; const qq = grillQ(sl); if (sl.item === item && qq > 0) { held = { item, q: qq }; G.grill[i] = { item: null, start: 0 }; rerender(); } } }),
        ...leg(at, plateAt, {
          hold: 0.2, carry: null,
          fn: () => {
            G.claim['g' + i] = false;
            const h = held as typeof held; if (!h) return;
            const pi = plateFor(h.item);
            if (pi >= 0) addToPlate(pi, h.item, h.q); else say('No plate free: the cook binned it');
            s.tasks++; rerender();
          },
        }),
      ]);
      return true;
    }
    for (let i = 0; i < G.grill.length; i++) {
      const slot = G.grill[i];
      if (!slot.item || slot.flipped || G.claim['f' + i]) continue;
      const e = tn() - slot.start;
      if (e < COOK[slot.item] * 0.45 + (1 - skill) * 1.0 || e >= COOK[slot.item]) continue;
      G.claim['f' + i] = true;
      assign(k, leg(from, { x: grillX(i), y: KL }, { act: '🔄', hold: 0.2, fn: () => { G.claim['f' + i] = false; flipGrill(i); s.tasks++; } }));
      return true;
    }
    const want: Record<string, number> = {};
    G.custs.forEach((c) => c && c.state === 'waiting' && c.items.forEach((it) => !it.done && MENU[it.m].comps?.forEach((x) => { want[x] = (want[x] ?? 0) + 1; })));
    for (const [comp, src, stn, emoji] of [['chicken', 'chicken_raw', 'grillChicken', '🍗'], ['suya', 'suya_raw', 'grillSuya', '🍢']] as const) {
      if (!st.has(stn) || G.claim['r' + comp]) continue;
      const have = G.grill.filter((sl) => sl.item === comp && grillState(sl) !== 'burnt').length + G.plates.filter((p) => p.includes(comp)).length;
      const empty = G.grill.findIndex((sl) => !sl.item);
      if ((want[comp] ?? 0) > have && empty >= 0) {
        G.claim['r' + comp] = true;
        const srcAt: Pt = { x: 270, y: KL }; const slotAt: Pt = { x: grillX(empty), y: KL };
        assign(k, [
          ...leg(from, srcAt, { act: emoji, hold: 0.2, carry: emoji }),
          ...leg(srcAt, slotAt, { hold: 0.2, carry: null, fn: () => { G.claim['r' + comp] = false; tapSrcGrill(src); s.tasks++; } }),
        ]);
        return true;
      }
    }
    return false;
  }

  // ---- market stock ----
  const cnt = (src: string) => { const k = STOCK_OF[src]; return k ? G.stock[k] ?? 0 : undefined; };
  function useStock(src: string): boolean {
    const k = STOCK_OF[src];
    if (!k) return true;
    if ((G.stock[k] ?? 0) > 0) { G.stock[k]--; return true; }
    // out of stock: the errand boy runs to market (double price, paid from today's takings)
    const it = STOCK_INFO[k];
    const cost = Math.round((it.price * RUNNER_MUL) / 2 / 100) * 100; // half a market pack at double price
    G.stock[k] = Math.floor(it.pack / 2) - 1;
    G.runner += cost; G.coins = Math.max(0, G.coins - cost);
    say(`Out of ${it.name.toLowerCase()}! Errand boy bought more (−₦${cost.toLocaleString('en-US')})`);
    kpop(420, 250, `−₦${cost.toLocaleString('en-US')}`, '#FF8A7A');
    return true;
  }
  // ---- drops ----
  function onDropGrill(i: number, p: Payload) {
    if (p.kind !== 'src') return;
    const item: GrillItem | null = p.id === 'chicken_raw' ? 'chicken' : p.id === 'suya_raw' ? 'suya' : null;
    if (!item) return;
    if (G.grill[i].item) { shake('grill' + i); return; }
    if (!useStock(p.id)) return;
    G.grill[i] = { item, start: tn(), flipped: false }; play('sizzle'); rerender();
  }
  function onDropFryer(i: number, p: Payload) {
    if (p.kind !== 'src') return;
    const item: FryItem | null = p.id === 'plantain' ? 'dodo' : p.id === 'batter' ? 'puffpuff' : null;
    if (!item || G.fryer[i].item) { shake('fry' + i); return; }
    if (!useStock(p.id)) return;
    G.fryer[i] = { item, start: tn() }; play('sizzle'); rerender();
  }
  function flipGrill(i: number) {
    const s = G.grill[i];
    if (!s.item || s.flipped) return;
    const e = tn() - s.start;
    if (e >= COOK[s.item]) return;
    if (e < COOK[s.item] * 0.35) { say('Wait till it sizzles on one side'); return; }
    s.flipped = true; play('plop'); kpop(grillX(i) - 14, 230, '🔄', '#7BE36A'); rerender();
  }
  function stir(which: PotId) {
    const P = G[which]; const rec = POT_RECIPES[which];
    if (!P.cooking) return;
    if (P.stirs > rec.stirs) { say('That is enough stirring!'); return; }
    P.stirs++; P.lastStir = tn(); play('plop'); kpop(POT_X[which] - 8, 160, '🥄', '#FFF'); rerender();
  }
  /** an ingredient goes into the pot: it has to be the right one, and the timing sets the quality */
  function potDrop(which: PotId, p: Payload) {
    if (p.kind !== 'src') return;
    const P = G[which]; const rec = POT_RECIPES[which];
    if (!(p.id in ING)) return;
    if (P.cooking) { say("It's simmering. Tap the pot to stir 🥄"); shake(which); return; }
    if (P.portions > 0) { say('Pot still has food. Serve it first'); shake(which); return; }
    const step = rec.steps[P.step];
    if (!step) return;
    if (!useStock(p.id)) return;
    const px = POT_X[which] - 20;
    if (p.id !== step.ing) {
      P.scores.push(0.15); play('bad'); haptic.bad(); shake(which);
      say(`Wrong ingredient! The ${potTitle(which).toLowerCase()} suffers 😬`);
      kpop(px, 150, '✗', '#FF8A7A'); rerender(); return;
    }
    const now2 = tn();
    const dt = P.step === 0 ? 0 : now2 - P.stepAt;
    P.scores.push(P.step === 0 ? 1 : scoreStep(dt, step, winMul));
    if (P.step > 0) {
      const ts = timingState(dt, step, winMul);
      kpop(px, 150, ts === 'perfect' ? 'Perfect!' : ts === 'early' ? 'Too early' : 'Too late', ts === 'perfect' ? '#7BE36A' : ts === 'early' ? '#FFC93C' : '#FF8A7A');
    }
    P.step++; P.stepAt = now2; play('plop');
    if (P.step >= rec.steps.length) { P.cooking = true; P.cookStart = now2; play('sizzle'); }
    rerender();
  }
  function onDropPlate(pi: number, p: Payload) {
    let ok = false;
    if (p.kind === 'grill') {
      const s = G.grill[p.idx]; const stt = grillState(s);
      if (stt === 'ready' && s.item) {
        if (!s.flipped) say('Not flipped: one side is undercooked');
        ok = addToPlate(pi, s.item, grillQ(s)); if (ok) G.grill[p.idx] = { item: null, start: 0 };
      } else if (stt === 'burnt') say('Burnt! Drag it to the bin');
    } else if (p.kind === 'fryer') {
      const s = G.fryer[p.idx]; const stt = fryState(s);
      if (stt === 'ready' && s.item) { ok = addToPlate(pi, s.item, fryQ(s)); if (ok) G.fryer[p.idx] = { item: null, start: 0 }; }
      else if (stt === 'burnt') say('Burnt! Drag it to the bin');
    } else if (p.kind === 'pot') {
      const P = p.id === 'jollof' ? G.pot : G.egusi;
      if (P.portions > 0) { ok = addToPlate(pi, p.id === 'jollof' ? 'jollof' : 'egusi', P.q); if (ok) P.portions--; }
    } else if (p.kind === 'src' && (p.id === 'eba' || p.id === 'yaji')) {
      ok = addToPlate(pi, p.id as Comp);
    }
    rerender();
  }
  function onDropCust(ci: number, p: Payload) {
    if (p.kind === 'plate') {
      const comps = G.plates[p.idx];
      if (!comps.length) return;
      if (serve(ci, { comps, q: plateAvg(p.idx) ?? 4 })) G.plates[p.idx] = [];
    } else if (p.kind === 'cup') {
      const s = G.cups[p.idx];
      if (s.item && cupReady(s) && serve(ci, { drink: s.item })) G.cups[p.idx] = { item: null, start: 0 };
    } else if (p.kind === 'grill' || p.kind === 'fryer') {
      say('Put it on a plate first 🍽');
    }
    rerender();
  }
  function onDropBin(p: Payload) {
    if (p.kind === 'plate') G.plates[p.idx] = [];
    else if (p.kind === 'grill') G.grill[p.idx] = { item: null, start: 0 };
    else if (p.kind === 'fryer') G.fryer[p.idx] = { item: null, start: 0 };
    else if (p.kind === 'cup') G.cups[p.idx] = { item: null, start: 0 };
    else if (p.kind === 'pot') {
      const which: PotId = p.id === 'jollof' ? 'pot' : 'egusi';
      if (G[which].portions <= 0) return;
      G[which] = freshPot(0);
    } else return;
    G.coins = Math.max(0, G.coins - 50); play('plop'); kpop(780, 300, '−₦50', '#FF8A7A'); rerender();
  }

  // ---- taps (Cooking Fever lets you tap too) ----
  const tapSrcGrill = (id: string) => { const i = G.grill.findIndex((s) => !s.item); if (i >= 0) onDropGrill(i, { kind: 'src', id }); else say('Grill is full'); };
  const tapSrcFry = (id: string) => { const i = G.fryer.findIndex((s) => !s.item); if (i >= 0) onDropFryer(i, { kind: 'src', id }); else say('Fryer is full'); };
  const tapToPlate = (p: Payload, c: Comp) => { const pi = plateFor(c); if (pi >= 0) onDropPlate(pi, p); else { say('No free plate for that'); play('bad'); } };
  const tapPot = (which: PotId) => { if (G[which].cooking) stir(which); else tapToPlate({ kind: 'pot', id: which === 'pot' ? 'jollof' : 'egusi' }, which === 'pot' ? 'jollof' : 'egusi'); };
  const tapIng = (id: Ing) => {
    const cand = pots.filter((p) => POT_RECIPES[p].steps.some((s) => s.ing === id) && G[p].portions <= 0 && !G[p].cooking);
    if (!cand.length) { say(pots.some((p) => G[p].cooking) ? "It's simmering. Tap the pot to stir 🥄" : 'Pot still has food. Serve it first'); return; }
    const pick = cand.find((p) => POT_RECIPES[p].steps[G[p].step]?.ing === id) ?? cand.find((p) => G[p].step > 0) ?? cand[0];
    potDrop(pick, { kind: 'src', id });
  };
  const tapPlate = (pi: number) => {
    const comps = G.plates[pi]; if (!comps.length) return;
    const ci = G.custs.findIndex((c) => c && c.state === 'waiting' && t >= c.arrived && c.items.some((it) => !it.done && MENU[it.m].comps && MENU[it.m].comps!.length === comps.length && MENU[it.m].comps!.every((x) => comps.includes(x))));
    if (ci >= 0) onDropCust(ci, { kind: 'plate', idx: pi }); else { say('Nobody ordered that yet'); shake('plate' + pi); play('bad'); rerender(); }
  };
  const tapCup = (k: number) => {
    const s = G.cups[k]; if (!s.item || !cupReady(s)) return;
    const ci = G.custs.findIndex((c) => c && c.state === 'waiting' && t >= c.arrived && c.items.some((it) => !it.done && MENU[it.m].drink === s.item));
    if (ci >= 0) onDropCust(ci, { kind: 'cup', idx: k }); else { say('Nobody wants that drink yet'); }
  };
  const pourDrink = (d: Drink) => { const k = G.cups.findIndex((s) => !s.item); if (k < 0) { say('Serve the cups first'); return; } if (!useStock('drinks')) return; G.cups[k] = { item: d, start: tn() }; play('plop'); rerender(); };

  // ---- render ----
  const tl = Math.max(0, lv.duration - t);
  const custCount = `${G.served + G.lost}/${script.length}`;
  const stars = goals.filter((x) => G.coins >= x).length;
  const crew3d: CrewMember[] = crew.filter((k) => G.st[k]).map((k) => ({ id: k, role: roleOf(k), n: 0, rt: G.st[k] }));
  const hasGrill = st.has('grillChicken') || st.has('grillSuya');
  const hasFry = st.has('fryerDodo') || st.has('fryerPuff');
  const shelfSpr: Partial<Record<Ing, any>> = { blend: SPR.props.blend, rice: SPR.props.rice, ugu: SPR.props.ugu };
  const shelfLbl = (i: Ing) => (i === 'blend' ? LBL.blend : i === 'rice' ? LBL.rice : i === 'ugu' ? LBL.ugu : ING[i].label);

  return (
    <View style={{ flex: 1 }}>
      <World3D k={S(1)} plan={plan} custs={G.custs} crew={crew3d} chairTier={save.chair ?? 0} ankara={!!save.decor.ankara} now={tn} paused={paused} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: S(CANVAS_H), width: S(SW), height: S(390 - CANVAS_H), overflow: 'hidden' }}>
        <Image source={SPR.bg[save.decor.ankara ? 1 : 0]} style={{ position: 'absolute', left: 0, top: S(-355 * 0.609), width: S(SW), height: S(475) }} resizeMode="stretch" />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: S(CANVAS_H - 2), width: S(SW), height: S(4), backgroundColor: '#3A2010', opacity: 0.8 }} />

      {/* the 2D layer over the 3D seats: drop targets, order bubbles, coins, dirty plates */}
      {G.custs.map((c, i) => c && (
        <DinerOverlay key={c.id} c={c} cx={TX[i]} t={t} idx={i} shakeN={G.shake['cust' + i] ?? 0} bubbleLeft={plan.bubbleLeft[i]}
          onDrop={(p) => onDropCust(i, p)} onCollect={() => collect(i)} onClear={() => clearPlate(i)} />
      ))}
      {G.revPops.map((r) => { const h = seatSpots(r.x).head; return <ReviewChip key={r.id} x={h.x} y={Math.max(38, h.y - 74)} stars={r.stars} text={r.text} />; })}
      {crew.filter((k) => G.st[k]).map((k) => {
        const rt = G.st[k]; const pos = staffPos(rt, tn()); const cook = roleOf(k) === 'cook';
        const head = proj(cook ? CHEF_X : X_OF(pos.x), 2.05, cook ? kitchenZ(pos.x) : yToZ(pos.y));
        return <StaffTag key={k} role={roleOf(k)} name={WORKERS[k].name.split(' ')[0]} lv={staffLvOf(save, k)} energy={energyOf(k)} act={rt.act} x={head.x} y={Math.max(38, head.y - 14)} />;
      })}

      {/* kitchen: the 2D cooking area, shrunk to fit under the dining room */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: S(KOX), top: S(KWT), width: S(SW * KS), height: S(390 * KS) }}>
      <Scaled f={KS}>
      {G.cooler > 0 && st.has('pot') && (
        <Abs x={2} y={136} w={56} h={44} pointerEvents="none">
          <Image source={SPR.props.cooler} style={{ width: S(46), height: S(40) }} resizeMode="contain" />
          <View style={{ position: 'absolute', right: 0, top: 0, backgroundColor: '#2FA544', borderRadius: S(8), paddingHorizontal: S(4) }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(10) }}>{G.cooler}</Text></View>
        </Abs>
      )}
      {G.tray > 0 && st.has('fryerDodo') && (
        <Abs x={630} y={198} w={62} h={52}>
          <Draggable payload={{ kind: 'src', id: 'tray' }} enabled={false} onTap={tapTray} testID="prep-tray" style={{ flex: 1, alignItems: 'center' }}>
            <Image source={SPR.food.dodo} style={{ width: S(54), height: S(40) }} resizeMode="contain" />
            <View style={{ position: 'absolute', right: 0, top: 0, backgroundColor: '#2FA544', borderRadius: S(8), paddingHorizontal: S(4) }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(10) }}>{G.tray}</Text></View>
          </Draggable>
        </Abs>
      )}

      {/* back row: pots, plates, drinks */}
      {st.has('pot') && (
        <PotStation x={6} y={178} w={124} label="jollof" P={G.pot} cap={potCap} rec={POT_RECIPES.pot} t={t} winMul={winMul}
          shakeN={G.shake.pot ?? 0} onDrop={(p) => potDrop('pot', p)} onTap={() => tapPot('pot')} sprite={SPR.appl.pot} heap={SPR.food.jollof} />
      )}
      {st.has('egusi') && (
        <PotStation x={134} y={182} w={104} label="egusi" P={G.egusi} cap={4} rec={POT_RECIPES.egusi} t={t} winMul={winMul}
          shakeN={G.shake.egusi ?? 0} onDrop={(p) => potDrop('egusi', p)} onTap={() => tapPot('egusi')} sprite={SPR.appl.egusipot} heap={LBL.egusi === 'egusi' ? null : SPR.food.egusi} />
      )}
      {G.plates.map((pl, i) => (
        <Plate key={i} x={PLATE_X[i] - (plateN === 4 ? 30 : 0)} y={204} comps={pl} idx={i} q={plateAvg(i)} shakeN={G.shake['plate' + i] ?? 0} onDrop={(p) => onDropPlate(i, p)} onTap={() => tapPlate(i)} />
      ))}
      {st.has('drinks') && (
        <>
          <Abs x={694} y={150} w={150} h={130}>
            <Draggable payload={{ kind: 'src', id: 'jug' }} enabled={false} onTap={() => pourDrink('zobo')} style={{ position: 'absolute', left: 0, top: 0, width: S(75), height: S(130) }} testID="jug-zobo"><View style={{ flex: 1 }} /></Draggable>
            <Draggable payload={{ kind: 'src', id: 'jug' }} enabled={false} onTap={() => pourDrink('chapman')} style={{ position: 'absolute', left: S(75), top: 0, width: S(75), height: S(130) }} testID="jug-chapman"><View style={{ flex: 1 }} /></Draggable>
            <Image pointerEvents="none" source={SPR.appl.dispenser} style={{ width: S(150), height: S(130), position: 'absolute' }} resizeMode="contain" />
          </Abs>
          {G.cups.map((s, k) => (
            <Abs key={k} x={706 + k * 54} y={236} w={50} h={64}>
              {s.item && (
                <Draggable payload={{ kind: 'cup', idx: k }} enabled={cupReady(s)} onTap={() => tapCup(k)} ghost={<Image source={SPR.props[s.item]} style={{ width: S(46), height: S(60) }} resizeMode="contain" />} testID={`cup-${k}`}>
                  <Image source={SPR.props[s.item]} style={{ width: S(50), height: S(64), opacity: cupReady(s) ? 1 : 0.55 }} resizeMode="contain" />
                  {!cupReady(s) && <Bar frac={(t - s.start) / pour} color="#7CC8FF" />}
                </Draggable>
              )}
            </Abs>
          ))}
        </>
      )}

      {/* front row: the ingredient shelf, then the grill and fryer */}
      {shelf.map((ing, i) => (
        <Source key={ing} id={ing} x={6 + (i % 3) * 40} y={270 + Math.floor(i / 3) * 42} w={36} sprite={shelfSpr[ing]} emoji={ING[ing].emoji} label={shelfLbl(ing)} count={cnt(ing)} onTap={() => tapIng(ing)} />
      ))}
      {st.has('egusi') && <Source id="eba" x={186} y={272} w={54} sprite={SPR.food.eba} label={LBL.eba} tray onTap={() => tapToPlate({ kind: 'src', id: 'eba' }, 'eba')} />}
      {hasGrill && (
        <>
          {st.has('grillChicken') && <Source id="chicken_raw" x={246} y={st.has('grillSuya') ? 258 : 278} w={st.has('grillSuya') ? 48 : 56} sprite={SPR.food.chicken_raw} label={LBL.chicken} count={cnt('chicken_raw')} tray onTap={() => tapSrcGrill('chicken_raw')} />}
          {st.has('grillSuya') && <Source id="suya_raw" x={246} y={st.has('grillChicken') ? 304 : 278} w={st.has('grillChicken') ? 48 : 56} sprite={SPR.food.suya_raw} label={LBL.suya} count={cnt('suya_raw')} tray onTap={() => tapSrcGrill('suya_raw')} />}
          <Abs x={304} y={252} w={168} h={102}>
            <Image source={SPR.appl.grill} style={{ position: 'absolute', width: S(168), height: S(102) }} resizeMode="stretch" />
          </Abs>
          {G.grill.map((s, i) => {
            const stt = grillState(s);
            const q = grillQ(s);
            const e = t - s.start;
            const sx = 318 + i * (140 / grillN);
            const sprite = !s.item ? null : stt === 'cooking' ? SPR.food[s.item === 'chicken' ? 'chicken_raw' : 'suya_raw'] : stt === 'ready' ? SPR.food[s.item] : SPR.burnt[s.item];
            const needsFlip = !!s.item && !s.flipped && stt === 'cooking' && e >= COOK[s.item] * 0.45;
            return (
              <Abs key={i} x={sx} y={246} w={140 / grillN - 2} h={60}>
                <DropZone id={`grill-${i}`} testID={`grill-${i}`} accepts={(p) => p.kind === 'src' && (p.id === 'chicken_raw' || p.id === 'suya_raw') && !s.item} onDrop={(p) => onDropGrill(i, p)} style={{ flex: 1, borderRadius: S(10), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#FFC93C', backgroundColor: '#FFC93C33' }}>
                  {sprite && (
                    <Draggable payload={{ kind: 'grill', idx: i }} enabled={stt !== 'cooking'} onTap={() => (stt === 'cooking' ? flipGrill(i) : stt === 'ready' && s.item && tapToPlate({ kind: 'grill', idx: i }, s.item))} ghost={<Image source={sprite} style={{ width: S(60), height: S(60) }} resizeMode="contain" />} style={{ flex: 1 }} testID={`grillitem-${i}`}>
                      <Cooking stt={stt}>
                        <Image source={sprite} style={{ width: '100%', height: S(52) }} resizeMode="contain" />
                      </Cooking>
                      <CookBar e={e} cook={COOK[s.item!]} burn={burnAfter} />
                      {needsFlip && <Text pointerEvents="none" style={{ position: 'absolute', top: S(-12), alignSelf: 'center', fontSize: S(16) }}>🔄</Text>}
                      {stt === 'ready' && <Text pointerEvents="none" style={{ position: 'absolute', top: S(-8), right: S(0), color: q >= 4 ? '#7BE36A' : q === 3 ? '#FFC93C' : '#FF8A7A', fontWeight: '900', fontSize: S(10), textShadowColor: '#000', textShadowRadius: S(2) }}>{q}★</Text>}
                    </Draggable>
                  )}
                </DropZone>
              </Abs>
            );
          })}
        </>
      )}
      {hasFry && (
        <>
          {st.has('fryerDodo') && <Source id="plantain" x={496} y={st.has('fryerPuff') ? 258 : 278} w={st.has('fryerPuff') ? 46 : 52} sprite={SPR.food.plantain} label={LBL.plantain} count={cnt('plantain')} onTap={() => tapSrcFry('plantain')} />}
          {st.has('fryerPuff') && <Source id="batter" x={496} y={st.has('fryerDodo') ? 304 : 278} w={st.has('fryerDodo') ? 46 : 52} sprite={SPR.props.batter} label={LBL.batter} count={cnt('batter')} onTap={() => tapSrcFry('batter')} />}
          <Abs x={556} y={250} w={124} h={104}>
            <Image source={SPR.appl.fryer} style={{ position: 'absolute', width: S(124), height: S(104) }} resizeMode="stretch" />
          </Abs>
          {G.fryer.map((s, i) => {
            const stt = fryState(s);
            const q = fryQ(s);
            const e = (t - s.start) / fryFast;
            const sx = 566 + i * (96 / fryN);
            const sprite = !s.item ? null : stt === 'cooking' ? SPR.food[s.item === 'dodo' ? 'plantain' : 'dough'] : stt === 'ready' ? SPR.food[s.item] : SPR.burnt[s.item];
            return (
              <Abs key={i} x={sx} y={248} w={96 / fryN - 2} h={56}>
                <DropZone id={`fry-${i}`} testID={`fry-${i}`} accepts={(p) => p.kind === 'src' && (p.id === 'plantain' || p.id === 'batter') && !s.item} onDrop={(p) => onDropFryer(i, p)} style={{ flex: 1, borderRadius: S(10), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#FFC93C', backgroundColor: '#FFC93C33' }}>
                  {sprite && (
                    <Draggable payload={{ kind: 'fryer', idx: i }} enabled={stt !== 'cooking'} onTap={() => stt === 'ready' && s.item && tapToPlate({ kind: 'fryer', idx: i }, s.item)} ghost={<Image source={sprite} style={{ width: S(56), height: S(56) }} resizeMode="contain" />} style={{ flex: 1 }} testID={`fryitem-${i}`}>
                      <Cooking stt={stt}><Image source={sprite} style={{ width: '100%', height: S(44) }} resizeMode="contain" /></Cooking>
                      <CookBar e={e} cook={COOK[s.item!]} burn={burnAfter} />
                      {stt === 'ready' && <Text pointerEvents="none" style={{ position: 'absolute', top: S(-8), right: S(0), color: q >= 4 ? '#7BE36A' : q === 3 ? '#FFC93C' : '#FF8A7A', fontWeight: '900', fontSize: S(10), textShadowColor: '#000', textShadowRadius: S(2) }}>{q}★</Text>}
                    </Draggable>
                  )}
                </DropZone>
              </Abs>
            );
          })}
        </>
      )}
      {st.has('grillSuya') && <Source id="yaji" x={722} y={300} w={50} sprite={SPR.props.yaji} label={LBL.yaji} onTap={() => tapToPlate({ kind: 'src', id: 'yaji' }, 'yaji')} />}
      <Abs x={782} y={286} w={58} h={70}>
        <DropZone id="bin" testID="bin" accepts={(p) => p.kind !== 'src'} onDrop={onDropBin} style={{ flex: 1, borderRadius: S(12), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#FF8A7A' }}>
          <Image source={SPR.props.bin} style={{ width: S(54), height: S(66) }} resizeMode="contain" />
        </DropZone>
      </Abs>

      </Scaled>
      </View>

      {/* HUD */}
      <Hud2 tl={tl} total={lv.duration} coins={G.coins} goals={goals} stars={stars} cust={custCount} name={`${levelIdx + 1}. ${lv.name}`} rating={rating} onSheet={() => setSheet((v) => !v)} onPause={() => setPause(true)} />
      {sheet && <RecipeSheet pots={pots} hasGrill={hasGrill} hasFry={hasFry} titles={{ pot: potTitle('pot'), egusi: potTitle('egusi') }} onClose={() => setSheet(false)} />}
      {G.msg && (
        <Animated.View key={G.msg.id} entering={ZoomIn.duration(150)} exiting={FadeOut} pointerEvents="none" style={{ position: 'absolute', top: S(46), left: 0, right: 0, alignItems: 'center', zIndex: 650 }}>
          <View style={{ backgroundColor: '#2B1B12DD', paddingHorizontal: S(14), paddingVertical: S(5), borderRadius: S(14) }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>{G.msg.text}</Text></View>
        </Animated.View>
      )}
      {G.pops.map((p) => (
        <Animated.View key={p.id} entering={ZoomIn.duration(200)} exiting={FadeOutUp.duration(500)} pointerEvents="none" style={{ position: 'absolute', left: S(p.x), top: S(p.y), zIndex: 640 }}>
          <GText size={20} color={p.color}>{p.text}</GText>
        </Animated.View>
      ))}
      {paused && !G.ended && (
        <PauseMenu level={`${levelIdx + 1}. ${lv.name}`} timeLeft={tl} coins={G.coins} sound={sound} music={music} onResume={() => setPause(false)} onRestart={onRestart} onQuit={onQuit} onToggleSound={onToggleSound} onToggleMusic={onToggleMusic} />
      )}
      {G.ended && (
        <Animated.View entering={FadeIn} pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#0006', alignItems: 'center', justifyContent: 'center', zIndex: 800 }]}>
          <GText size={40}>{tl <= 0 ? "Time's up!" : 'All served!'}</GText>
        </Animated.View>
      )}
    </View>
  );
}

function Bar({ frac, color }: { frac: number; color: string }) {
  const S = useS();
  return (
    <View style={{ height: S(6), backgroundColor: '#0006', borderRadius: S(3), marginHorizontal: S(6), overflow: 'hidden' }}>
      <View style={{ height: S(6), width: `${Math.max(0, Math.min(1, frac)) * 100}%`, backgroundColor: color, borderRadius: S(3) }} />
    </View>
  );
}

function Cooking({ stt, children }: { stt: string; children: React.ReactNode }) {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = stt === 'ready' ? withRepeat(withSequence(withTiming(1.1, { duration: 300 }), withTiming(1, { duration: 300 })), -1) : stt === 'cooking' ? withRepeat(withSequence(withTiming(1.03, { duration: 160 }), withTiming(0.98, { duration: 160 })), -1) : withTiming(1);
  }, [stt]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={a}>{children}</Animated.View>;
}

function Source({ id, x, y, w, sprite, emoji, label, tray, onTap, count }: { id: string; x: number; y: number; w: number; sprite?: any; emoji?: string; label: string; tray?: boolean; onTap?: () => void; count?: number }) {
  const S = useS();
  const art = sprite
    ? <Image source={sprite} style={{ width: S(w), height: S(w * 0.9) }} resizeMode="contain" />
    : <View style={{ width: S(w * 0.86), height: S(w * 0.8), borderRadius: S(w * 0.4), backgroundColor: '#FFF6E4', borderWidth: S(1.5), borderColor: '#B9824C', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: S(w * 0.48) }}>{emoji}</Text></View>;
  return (
    <Abs x={x} y={y} w={w} h={w + 6}>
      <Draggable payload={{ kind: 'src', id }} onTap={onTap} ghost={sprite ? <Image source={sprite} style={{ width: S(56), height: S(56) }} resizeMode="contain" /> : <Text style={{ fontSize: S(40) }}>{emoji}</Text>} testID={`src-${id}`} style={{ flex: 1, alignItems: 'center' }}>
        {tray && <Image source={SPR.appl.tray} style={{ position: 'absolute', top: S(w * 0.35), width: S(w + 4), height: S(w * 0.6) }} resizeMode="stretch" />}
        {art}
        <View style={{ backgroundColor: '#2B1B12B0', borderRadius: S(6), paddingHorizontal: S(3), marginTop: S(-6) }}>
          <Text style={{ color: '#FFF', fontSize: S(w < 40 ? 7 : 8.5), fontWeight: '800' }} numberOfLines={1}>{label}</Text>
        </View>
        {count != null && <View pointerEvents="none" style={{ position: 'absolute', right: S(-4), top: S(-4), minWidth: S(18), height: S(16), borderRadius: S(8), backgroundColor: count <= 5 ? '#D7263D' : '#2B1B12D0', borderWidth: S(1), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: S(3) }}><Text style={{ color: '#FFF', fontSize: S(8.5), fontWeight: '900' }}>{count}</Text></View>}
      </Draggable>
    </Abs>
  );
}

function PotStation({ x, y, w, P, cap, rec, t, winMul, shakeN, onDrop, onTap, sprite, heap, label }: {
  x: number; y: number; w: number; P: PotState; cap: number; rec: { steps: { ing: Ing; wait: number; win: number; tip: string }[]; simmer: number; stirs: number }; t: number; winMul: number;
  shakeN: number; onDrop: (p: Payload) => void; onTap: () => void; sprite: any; heap: any; label: string;
}) {
  const S = useS();
  const sh = useShake(shakeN);
  const empty = P.portions <= 0;
  const step = rec.steps[P.step];
  const smoking = P.cooking && P.stirs === 0 && t - P.cookStart > rec.simmer * 0.55;
  return (
    <Abs x={x} y={y} w={w} h={w * 0.9}>
      <DropZone id={`pot-${label}`} testID={`pot-${label}`} accepts={(p) => p.kind === 'src' && empty && !P.cooking && p.id in ING} onDrop={onDrop} style={{ flex: 1, borderRadius: S(16), borderWidth: S(2), borderColor: 'transparent' }}>
        <Draggable payload={{ kind: 'pot', id: label }} enabled={!empty} onTap={onTap} ghost={heap ? <Image source={heap} style={{ width: S(56), height: S(46) }} resizeMode="contain" /> : <Image source={SPR.food.egusi} style={{ width: S(56), height: S(46) }} resizeMode="contain" />} style={{ flex: 1 }} testID={`potsrc-${label}`}>
          <Animated.View style={[{ flex: 1 }, sh]}>
            <Image source={sprite} style={{ width: S(w), height: S(w * 0.86) }} resizeMode="contain" />
            {heap && !empty && <Image source={heap} style={{ position: 'absolute', left: S(w * 0.22), top: S(w * 0.08), width: S(w * 0.56), height: S(w * 0.32) }} resizeMode="contain" />}
            <Steam on={P.cooking || !empty} smoke={smoking} />
          </Animated.View>
        </Draggable>
        <View pointerEvents="none" style={{ position: 'absolute', right: S(2), top: S(2), backgroundColor: empty ? '#D7263D' : '#0B6E4F', borderRadius: S(10), paddingHorizontal: S(6), paddingVertical: S(1), borderWidth: S(1.5), borderColor: '#FFF' }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(11) }}>{P.cooking ? '🔥' : empty ? 'EMPTY' : `${P.portions}/${cap}`}</Text>
        </View>
        {!empty && (
          <View pointerEvents="none" style={{ position: 'absolute', left: S(2), top: S(2), backgroundColor: '#2B1B12D0', borderRadius: S(8), paddingHorizontal: S(4), borderWidth: S(1), borderColor: '#FFF' }}>
            <Text style={{ color: P.q >= 4 ? '#7BE36A' : P.q === 3 ? '#FFC93C' : '#FF8A7A', fontWeight: '900', fontSize: S(10) }}>{P.q}★</Text>
          </View>
        )}
        {empty && !P.cooking && step && (
          <View pointerEvents="none" style={{ position: 'absolute', left: S(6), right: S(6), bottom: S(22) }}>
            <View style={{ alignSelf: 'center', backgroundColor: '#FFC93C', borderRadius: S(8), paddingHorizontal: S(5), borderWidth: S(1.5), borderColor: '#A8520E', marginBottom: S(2) }}>
              <Text style={{ fontSize: S(9), fontWeight: '900', color: '#2B1B12' }}>{P.step === 0 ? 'Start the recipe' : `Step ${P.step + 1}/${rec.steps.length}`}</Text>
            </View>
            {P.step > 0 && <PotTimeBar dt={t - P.stepAt} step={step} winMul={winMul} />}
          </View>
        )}
        {P.cooking && (
          <View pointerEvents="none" style={{ position: 'absolute', left: S(8), right: S(8), bottom: S(22) }}>
            <View style={{ alignSelf: 'center', backgroundColor: smoking ? '#D7263D' : '#0B6E4F', borderRadius: S(8), paddingHorizontal: S(5), borderWidth: S(1.5), borderColor: '#FFF', marginBottom: S(2) }}>
              <Text style={{ fontSize: S(9), fontWeight: '900', color: '#FFF' }}>{smoking ? 'Stir it! 🥄' : `Tap to stir 🥄 ${Math.min(P.stirs, rec.stirs)}/${rec.stirs}`}</Text>
            </View>
            <Bar frac={(t - P.cookStart) / rec.simmer} color="#FFC93C" />
          </View>
        )}
      </DropZone>
    </Abs>
  );
}

const COMP_QCOL = (q: number) => (q >= 4 ? '#7BE36A' : q >= 3 ? '#FFC93C' : '#FF8A7A');
function Plate({ x, y, comps, idx, q, shakeN, onDrop, onTap }: { x: number; y: number; comps: Comp[]; idx: number; q: number | null; shakeN: number; onDrop: (p: Payload) => void; onTap: () => void }) {
  const S = useS();
  const sh = useShake(shakeN);
  return (
    <Abs x={x} y={y} w={78} h={60}>
      <DropZone id={`plate-${idx}`} testID={`plate-${idx}`} accepts={(p) => p.kind === 'grill' || p.kind === 'fryer' || p.kind === 'pot' || (p.kind === 'src' && (p.id === 'eba' || p.id === 'yaji'))} onDrop={onDrop}
        style={{ flex: 1, borderRadius: S(30), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#7BE36A', backgroundColor: '#7BE36A33' }}>
        <Draggable payload={{ kind: 'plate', idx }} enabled={comps.length > 0} onTap={onTap} ghost={<PlateView comps={comps} w={70} />} testID={`platesrc-${idx}`}>
          <Animated.View style={sh}><PlateView comps={comps} /></Animated.View>
        </Draggable>
        {comps.length > 0 && q != null && (
          <View pointerEvents="none" style={{ position: 'absolute', right: S(-2), top: S(-6), backgroundColor: '#2B1B12D0', borderRadius: S(8), paddingHorizontal: S(4), borderWidth: S(1), borderColor: '#FFF' }}>
            <Text style={{ color: COMP_QCOL(q), fontWeight: '900', fontSize: S(10) }}>{q.toFixed(q % 1 ? 1 : 0)}★</Text>
          </View>
        )}
      </DropZone>
    </Abs>
  );
}

function Hud2({ tl, total, coins, goals, stars, cust, name, rating, onSheet, onPause }: { tl: number; total: number; coins: number; goals: number[]; stars: number; cust: string; name: string; rating: number; onSheet: () => void; onPause: () => void }) {
  const S = useS();
  const frac = Math.min(1, coins / goals[2]);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: S(36), flexDirection: 'row', alignItems: 'center', paddingHorizontal: S(8), zIndex: 600 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F5FB0', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(8), height: S(28) }}>
        <Text style={{ color: '#FFC93C', fontWeight: '900', fontSize: S(14) }}>₦{coins.toLocaleString('en-US')}</Text>
        <View style={{ width: S(120), height: S(10), backgroundColor: '#0006', borderRadius: S(5), marginLeft: S(8), overflow: 'visible' }}>
          <View style={{ width: `${frac * 100}%`, height: '100%', backgroundColor: '#FFC93C', borderRadius: S(5) }} />
          {goals.map((gv, i) => (
            <Text key={i} style={{ position: 'absolute', left: `${(gv / goals[2]) * 100 - 6}%`, top: S(-7), fontSize: S(13) }}>{i < stars ? '⭐' : '☆'}</Text>
          ))}
        </View>
      </View>
      <View style={{ marginLeft: S(6), backgroundColor: '#FFFFFFE6', borderRadius: S(12), paddingHorizontal: S(7), height: S(26), justifyContent: 'center', borderWidth: S(2), borderColor: '#5E3A1A' }}>
        <Text style={{ fontWeight: '900', color: '#2B1B12', fontSize: S(12) }}>🧍 {cust}</Text>
      </View>
      <View testID="rating" style={{ marginLeft: S(6), backgroundColor: '#FFFFFFE6', borderRadius: S(12), paddingHorizontal: S(7), height: S(26), justifyContent: 'center', borderWidth: S(2), borderColor: '#B9824C' }}>
        <Text style={{ fontWeight: '900', color: '#8A5A00', fontSize: S(12) }}>⭐ {rating.toFixed(1)}</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ backgroundColor: '#2B1B12CC', borderRadius: S(10), paddingHorizontal: S(8), height: S(24), justifyContent: 'center' }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(11) }} numberOfLines={1}>{name}</Text></View>
      </View>
      <Draggable payload={{ kind: 'src', id: 'sheet' }} enabled={false} onTap={onSheet} testID="sheet" style={{ marginRight: S(6), width: S(28), height: S(28), borderRadius: S(14), backgroundColor: '#FFC93C', borderWidth: S(2), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: S(14) }}>📜</Text>
      </Draggable>
      <View testID="timer" style={{ backgroundColor: tl < 15 ? '#D7263D' : '#2FA544', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center' }}>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(14) }}>⏱ {Math.ceil(tl)}s</Text>
      </View>
      <Draggable payload={{ kind: 'src', id: 'pause' }} enabled={false} onTap={onPause} testID="pause" style={{ marginLeft: S(6), width: S(28), height: S(28), borderRadius: S(14), backgroundColor: '#1F5FB0', borderWidth: S(2), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>II</Text>
      </Draggable>
    </View>
  );
}
