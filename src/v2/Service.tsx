import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeOutUp, ZoomIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Draggable, DropZone, type Payload } from '../dnd';
import { play, haptic } from '../fx';
import { useNow } from '../ui';
import { Abs, GText, SW, useS } from './stage';
import { SPR } from './assets';
import { LEVELS2, MENU, scriptFor, stationsFor, goalsFor, type Comp, type Drink, type MenuId } from './data2';
import type { Save2, StockKey } from './save2';
import { LBL, STOCK_INFO, STOCK_OF, RUNNER_MUL } from './dests';

// customer sprites c0, c3, c5 are women; c1, c2, c4 are men (matches the arrival voice)
const FEMALE_CUSTS = [0, 3, 5];

const COOK = { chicken: 5, suya: 5, dodo: 4, puffpuff: 4 } as const;
const BURN_AFTER = 7;
type GrillItem = 'chicken' | 'suya';
type FryItem = 'dodo' | 'puffpuff';
type Slot<T> = { item: T | null; start: number };

type Cust = {
  id: number; who: number; items: { m: MenuId; done: boolean }[]; arrived: number; patience: number; // 0..1
  state: 'waiting' | 'paid' | 'left'; coins: number; tip: number; leftAt: number;
};

const SLOT_X = [96, 268, 440, 612];
const PLATE_X = [300, 382, 464, 546];

export type ServiceResult = { coins: number; served: number; lost: number; total: number; bestCombo: number; stock?: Record<StockKey, number>; runner?: number };

export default function Service({ levelIdx, save, onEnd, onQuit }: { levelIdx: number; save: Save2; onEnd: (r: ServiceResult) => void; onQuit: () => void }) {
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
  const pour = [2.4, 1.5, 0.9][up.drinks ?? 0];
  const plateN = 3 + (up.plates ?? 0);
  const patienceMul = 1 + (save.decor.ankara ? 0.15 : 0) + (save.decor.fans ? 0.1 : 0);
  const tipMul = save.decor.music ? 1.2 : 1;

  const t0 = useRef(Date.now());
  const now = useNow(100);
  const t = (now - t0.current) / 1000;
  const [, force] = useState(0);
  const g = useRef({
    custs: [] as (Cust | null)[],
    nextIdx: 0,
    pot: { portions: potCap, step: 0, cookStart: 0 },
    egusi: { portions: 4, step: 0, cookStart: 0 },
    grill: Array.from({ length: grillN }, () => ({ item: null, start: 0 } as Slot<GrillItem>)),
    fryer: Array.from({ length: fryN }, () => ({ item: null, start: 0 } as Slot<FryItem>)),
    cups: [{ item: null, start: 0 }, { item: null, start: 0 }] as Slot<Drink>[],
    plates: Array.from({ length: plateN }, () => [] as Comp[]),
    coins: 0, served: 0, lost: 0, combo: 0, bestCombo: 0, lastServe: 0,
    pops: [] as { id: number; x: number; y: number; text: string; color: string }[],
    shake: {} as Record<string, number>,
    ended: false,
    msg: null as null | { text: string; id: number },
    stock: { ...save.stock } as Record<StockKey, number>,
    runner: 0,
  });
  if (g.current.custs.length === 0) g.current.custs = [null, null, null, null];
  const G = g.current;
  if (Platform.OS === 'web' && typeof window !== 'undefined') (window as any).__mp = { G, t: () => (Date.now() - t0.current) / 1000, COOK, BURN_AFTER, fryFast, pour, MENU };
  const rerender = () => force((x) => x + 1);
  let popId = useRef(0);
  const pop = (x: number, y: number, text: string, color = '#FFC93C') => {
    const id = ++popId.current;
    G.pops.push({ id, x, y, text, color });
    setTimeout(() => { G.pops = G.pops.filter((p) => p.id !== id); rerender(); }, 1100);
  };
  const say = (text: string) => { G.msg = { text, id: Date.now() }; setTimeout(() => { if (G.msg && Date.now() - G.msg.id > 1300) { G.msg = null; rerender(); } }, 1400); };
  const shake = (key: string) => { G.shake[key] = (G.shake[key] ?? 0) + 1; };

  // ---- tick ----
  useEffect(() => {
    if (G.ended) return;
    // spawn
    const free = G.custs.findIndex((c) => c === null);
    if (free >= 0 && G.nextIdx < script.length && t >= script[G.nextIdx].at) {
      const sc = script[G.nextIdx++];
      // choose a free slot spread out
      const order = [1, 2, 0, 3];
      const slot = order.find((s) => G.custs[s] === null)!;
      G.custs[slot] = { id: G.nextIdx, who: sc.who, items: sc.items.map((m) => ({ m, done: false })), arrived: t, patience: 1, state: 'waiting', coins: 0, tip: 0, leftAt: 0 };
      play('customer', { female: FEMALE_CUSTS.includes(sc.who) });
    }
    // patience
    G.custs.forEach((c, i) => {
      if (!c || c.state !== 'waiting') return;
      c.patience = Math.max(0, 1 - (t - c.arrived) / (lv.patience * patienceMul));
      if (c.patience <= 0) {
        c.state = 'left'; c.leftAt = t; G.lost++; G.combo = 0;
        play('angry'); haptic.bad(); say('A customer left angry! 😤');
        setTimeout(() => { if (G.custs[i] === c) { G.custs[i] = null; rerender(); } }, 900);
      }
    });
    // pot cooking
    if (G.pot.step === 99 && t - G.pot.cookStart >= 5) { G.pot = { portions: potCap, step: 0, cookStart: 0 }; play('ding'); }
    if (G.egusi.step === 99 && t - G.egusi.cookStart >= 5) { G.egusi = { portions: 4, step: 0, cookStart: 0 }; play('ding'); }
    // burn warnings
    G.grill.forEach((s) => { if (s.item && t - s.start >= COOK[s.item] + BURN_AFTER && t - s.start < COOK[s.item] + BURN_AFTER + 0.12) play('burnt'); });
    G.fryer.forEach((s) => { if (!s.item) return; const e = (t - s.start) / fryFast; if (e >= COOK[s.item] + BURN_AFTER && e < COOK[s.item] + BURN_AFTER + 0.12 / fryFast) play('burnt'); });
    // end?
    const allDone = G.nextIdx >= script.length && G.custs.every((c) => c === null);
    if (t >= lv.duration || allDone) {
      G.ended = true;
      // auto-collect uncollected coins
      G.custs.forEach((c) => { if (c && c.state === 'paid') G.coins += c.coins + c.tip; });
      setTimeout(() => onEnd({ coins: G.coins, served: G.served, lost: G.lost + G.custs.filter((c) => c && c.state === 'waiting').length + (script.length - G.nextIdx), total: script.length, bestCombo: G.bestCombo, stock: { ...G.stock }, runner: G.runner }), 900);
    }
  }, [now]);

  // ---- helpers ----
  const grillState = (s: Slot<GrillItem>) => {
    if (!s.item) return 'empty';
    const e = t - s.start;
    return e < COOK[s.item] ? 'cooking' : e < COOK[s.item] + BURN_AFTER ? 'ready' : 'burnt';
  };
  const fryState = (s: Slot<FryItem>) => {
    if (!s.item) return 'empty';
    const e = (t - s.start) / fryFast;
    return e < COOK[s.item] ? 'cooking' : e < COOK[s.item] + BURN_AFTER ? 'ready' : 'burnt';
  };
  const cupReady = (s: Slot<Drink>) => !!s.item && t - s.start >= pour;

  function addToPlate(pi: number, c: Comp): boolean {
    const p = G.plates[pi];
    if (p.includes(c)) { shake('plate' + pi); play('bad'); return false; }
    if (c === 'yaji' && !p.includes('suya')) { say(`Put ${LBL.suya.toLowerCase()} on the plate first, then ${LBL.yaji.toLowerCase()}`); shake('plate' + pi); play('bad'); return false; }
    // plates hold one dish: block mixing that can never match a menu item
    const next = [...p, c];
    const ok = (Object.keys(MENU) as MenuId[]).some((m) => MENU[m].comps && next.every((x) => MENU[m].comps!.includes(x)));
    if (!ok) { say("That combo isn't on the menu"); shake('plate' + pi); play('bad'); return false; }
    G.plates[pi] = next;
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

  function serve(ci: number, what: { comps?: Comp[]; drink?: Drink }): boolean {
    const c = G.custs[ci];
    if (!c || c.state !== 'waiting') return false;
    const idx = c.items.findIndex((it) => !it.done && (what.drink ? MENU[it.m].drink === what.drink : !!MENU[it.m].comps && MENU[it.m].comps!.length === what.comps!.length && MENU[it.m].comps!.every((x) => what.comps!.includes(x))));
    if (idx < 0) { shake('cust' + ci); play('bad'); haptic.bad(); say("That's not what they ordered"); return false; }
    c.items[idx].done = true;
    play('pop'); haptic.drop();
    pop(SLOT_X[ci] + 40, 70, '✓', '#7BE36A');
    if (c.items.every((it) => it.done)) {
      const price = c.items.reduce((a, it) => a + MENU[it.m].price, 0);
      const since = t - G.lastServe;
      G.combo = since < 12 ? G.combo + 1 : 1;
      G.lastServe = t;
      G.bestCombo = Math.max(G.bestCombo, G.combo);
      const tip = Math.round((price * 0.25 * c.patience * tipMul + (G.combo >= 2 ? 50 * Math.min(G.combo, 5) : 0)) / 50) * 50;
      c.state = 'paid'; c.coins = price; c.tip = tip; c.leftAt = t; G.served++;
      play(G.combo >= 2 ? 'combo' : 'lick'); haptic.good();
      if (G.combo >= 2) say(`Combo x${G.combo}! 🔥`);
      // auto-collect after a while so the line keeps moving
      setTimeout(() => collect(ci, c.id), 6000);
    }
    return true;
  }
  function collect(ci: number, id?: number) {
    const c = G.custs[ci];
    if (!c || c.state !== 'paid' || (id != null && c.id !== id)) return;
    G.coins += c.coins + c.tip;
    pop(SLOT_X[ci] + 10, 150, `+₦${(c.coins + c.tip).toLocaleString('en-US')}`);
    play('cash');
    G.custs[ci] = null;
    rerender();
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
    pop(420, 250, `−₦${cost.toLocaleString('en-US')}`, '#FF8A7A');
    return true;
  }
  // ---- drops ----
  function onDropGrill(i: number, p: Payload) {
    if (p.kind !== 'src') return;
    const item: GrillItem | null = p.id === 'chicken_raw' ? 'chicken' : p.id === 'suya_raw' ? 'suya' : null;
    if (!item) return;
    if (G.grill[i].item) { shake('grill' + i); return; }
    if (!useStock(p.id)) return;
    G.grill[i] = { item, start: t }; play('sizzle'); rerender();
  }
  function onDropFryer(i: number, p: Payload) {
    if (p.kind !== 'src') return;
    const item: FryItem | null = p.id === 'plantain' ? 'dodo' : p.id === 'batter' ? 'puffpuff' : null;
    if (!item || G.fryer[i].item) { shake('fry' + i); return; }
    if (!useStock(p.id)) return;
    G.fryer[i] = { item, start: t }; play('sizzle'); rerender();
  }
  function potDrop(which: 'pot' | 'egusi', p: Payload) {
    if (p.kind !== 'src') return;
    const P = which === 'pot' ? G.pot : G.egusi;
    const recipe = which === 'pot' ? ['blend', 'rice'] : ['blend', 'ugu'];
    if (P.portions > 0 || P.step === 99) { say(P.step === 99 ? 'It\'s cooking…' : 'Pot still has food. Serve it first'); shake(which); return; }
    if (p.id === recipe[P.step]) {
      if (!useStock(p.id)) return;
      P.step++; play('plop');
      if (P.step >= recipe.length) { P.step = 99; P.cookStart = t; play('sizzle'); }
    } else { say(`Recipe order: ${recipe.map((r) => (LBL as any)[r] ?? r).join(' → ').toLowerCase()}`); shake(which); play('bad'); }
    rerender();
  }
  function onDropPlate(pi: number, p: Payload) {
    let ok = false;
    if (p.kind === 'grill') {
      const s = G.grill[p.idx]; const stt = grillState(s);
      if (stt === 'ready' && s.item) { ok = addToPlate(pi, s.item); if (ok) G.grill[p.idx] = { item: null, start: 0 }; }
      else if (stt === 'burnt') say('Burnt! Drag it to the bin');
    } else if (p.kind === 'fryer') {
      const s = G.fryer[p.idx]; const stt = fryState(s);
      if (stt === 'ready' && s.item) { ok = addToPlate(pi, s.item); if (ok) G.fryer[p.idx] = { item: null, start: 0 }; }
      else if (stt === 'burnt') say('Burnt! Drag it to the bin');
    } else if (p.kind === 'pot') {
      const P = p.id === 'jollof' ? G.pot : G.egusi;
      if (P.portions > 0) { ok = addToPlate(pi, p.id === 'jollof' ? 'jollof' : 'egusi'); if (ok) P.portions--; }
    } else if (p.kind === 'src' && (p.id === 'eba' || p.id === 'yaji')) {
      ok = addToPlate(pi, p.id as Comp);
    }
    rerender();
  }
  function onDropCust(ci: number, p: Payload) {
    if (p.kind === 'plate') {
      const comps = G.plates[p.idx];
      if (!comps.length) return;
      if (serve(ci, { comps })) G.plates[p.idx] = [];
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
    else return;
    G.coins = Math.max(0, G.coins - 50); play('plop'); pop(780, 300, '−₦50', '#FF8A7A'); rerender();
  }

  // ---- taps (Cooking Fever lets you tap too) ----
  const tapSrcGrill = (id: string) => { const i = G.grill.findIndex((s) => !s.item); if (i >= 0) onDropGrill(i, { kind: 'src', id }); else say('Grill is full'); };
  const tapSrcFry = (id: string) => { const i = G.fryer.findIndex((s) => !s.item); if (i >= 0) onDropFryer(i, { kind: 'src', id }); else say('Fryer is full'); };
  const tapToPlate = (p: Payload, c: Comp) => { const pi = plateFor(c); if (pi >= 0) onDropPlate(pi, p); else { say('No free plate for that'); play('bad'); } };
  const tapPlate = (pi: number) => {
    const comps = G.plates[pi]; if (!comps.length) return;
    const ci = G.custs.findIndex((c) => c && c.state === 'waiting' && c.items.some((it) => !it.done && MENU[it.m].comps && MENU[it.m].comps!.length === comps.length && MENU[it.m].comps!.every((x) => comps.includes(x))));
    if (ci >= 0) onDropCust(ci, { kind: 'plate', idx: pi }); else { say('Nobody ordered that yet'); shake('plate' + pi); play('bad'); rerender(); }
  };
  const tapCup = (k: number) => {
    const s = G.cups[k]; if (!s.item || !cupReady(s)) return;
    const ci = G.custs.findIndex((c) => c && c.state === 'waiting' && c.items.some((it) => !it.done && MENU[it.m].drink === s.item));
    if (ci >= 0) onDropCust(ci, { kind: 'cup', idx: k }); else { say('Nobody wants that drink yet'); }
  };
  const pourDrink = (d: Drink) => { const k = G.cups.findIndex((s) => !s.item); if (k < 0) { say('Serve the cups first'); return; } if (!useStock('drinks')) return; G.cups[k] = { item: d, start: t }; play('plop'); rerender(); };

  // ---- render ----
  const tl = Math.max(0, lv.duration - t);
  const custCount = `${G.served + G.lost}/${script.length}`;
  const stars = goals.filter((x) => G.coins >= x).length;

  return (
    <View style={{ flex: 1 }}>
      <Image source={SPR.bg[save.decor.ankara ? 1 : 0]} style={{ position: 'absolute', left: 0, top: S(-85), width: S(SW), height: S(475) }} resizeMode="cover" />

      {/* customers */}
      {G.custs.map((c, i) => c && (
        <Customer key={c.id} c={c} x={SLOT_X[i]} t={t} shakeN={G.shake['cust' + i] ?? 0} onDrop={(p) => onDropCust(i, p)} onCollect={() => collect(i)} idx={i} />
      ))}

      {/* back row: pots, plates, drinks */}
      {st.has('pot') && (
        <PotStation x={6} y={178} w={124} label="jollof" portions={G.pot.portions} cap={potCap} step={G.pot.step} cookFrac={G.pot.step === 99 ? (t - G.pot.cookStart) / 5 : 0}
          shakeN={G.shake.pot ?? 0} onDrop={(p) => potDrop('pot', p)} onTap={() => tapToPlate({ kind: 'pot', id: 'jollof' }, 'jollof')} sprite={SPR.appl.pot} heap={SPR.food.jollof} recipe={['blend', 'rice']} />
      )}
      {st.has('egusi') && (
        <PotStation x={134} y={182} w={104} label="egusi" portions={G.egusi.portions} cap={4} step={G.egusi.step} cookFrac={G.egusi.step === 99 ? (t - G.egusi.cookStart) / 5 : 0}
          shakeN={G.shake.egusi ?? 0} onDrop={(p) => potDrop('egusi', p)} onTap={() => tapToPlate({ kind: 'pot', id: 'egusi' }, 'egusi')} sprite={SPR.appl.egusipot} heap={LBL.egusi === 'egusi' ? null : SPR.food.egusi} recipe={['blend', 'ugu']} />
      )}
      {G.plates.map((pl, i) => (
        <Plate key={i} x={PLATE_X[i] - (plateN === 4 ? 30 : 0)} y={204} comps={pl} idx={i} shakeN={G.shake['plate' + i] ?? 0} onDrop={(p) => onDropPlate(i, p)} onTap={() => tapPlate(i)} />
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

      {/* front row */}
      {st.has('pot') && <>
        <Source id="blend" x={8} y={272} w={56} sprite={SPR.props.blend} label={LBL.blend} count={cnt('blend')} />
        <Source id="rice" x={66} y={270} w={58} sprite={SPR.props.rice} label={LBL.rice} count={cnt('rice')} />
      </>}
      {st.has('egusi') && <>
        <Source id="ugu" x={136} y={276} w={48} sprite={SPR.props.ugu} label={LBL.ugu} count={cnt('ugu')} />
        <Source id="eba" x={186} y={272} w={54} sprite={SPR.food.eba} label={LBL.eba} tray onTap={() => tapToPlate({ kind: 'src', id: 'eba' }, 'eba')} />
      </>}
      {(st.has('grillChicken') || st.has('grillSuya')) && (
        <>
          {st.has('grillChicken') && <Source id="chicken_raw" x={246} y={st.has('grillSuya') ? 258 : 278} w={st.has('grillSuya') ? 48 : 56} sprite={SPR.food.chicken_raw} label={LBL.chicken} count={cnt('chicken_raw')} tray onTap={() => tapSrcGrill('chicken_raw')} />}
          {st.has('grillSuya') && <Source id="suya_raw" x={246} y={st.has('grillChicken') ? 304 : 278} w={st.has('grillChicken') ? 48 : 56} sprite={SPR.food.suya_raw} label={LBL.suya} count={cnt('suya_raw')} tray onTap={() => tapSrcGrill('suya_raw')} />}
          <Abs x={304} y={252} w={168} h={102}>
            <Image source={SPR.appl.grill} style={{ position: 'absolute', width: S(168), height: S(102) }} resizeMode="stretch" />
          </Abs>
          {G.grill.map((s, i) => {
            const stt = grillState(s);
            const sx = 318 + i * (140 / grillN);
            const sprite = !s.item ? null : stt === 'cooking' ? SPR.food[s.item === 'chicken' ? 'chicken_raw' : 'suya_raw'] : stt === 'ready' ? SPR.food[s.item] : SPR.burnt[s.item];
            return (
              <Abs key={i} x={sx} y={246} w={140 / grillN - 2} h={60}>
                <DropZone id={`grill-${i}`} testID={`grill-${i}`} accepts={(p) => p.kind === 'src' && (p.id === 'chicken_raw' || p.id === 'suya_raw') && !s.item} onDrop={(p) => onDropGrill(i, p)} style={{ flex: 1, borderRadius: S(10), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#FFC93C', backgroundColor: '#FFC93C33' }}>
                  {sprite && (
                    <Draggable payload={{ kind: 'grill', idx: i }} enabled={stt !== 'cooking'} onTap={() => stt === 'ready' && s.item && tapToPlate({ kind: 'grill', idx: i }, s.item)} ghost={<Image source={sprite} style={{ width: S(60), height: S(60) }} resizeMode="contain" />} style={{ flex: 1 }} testID={`grillitem-${i}`}>
                      <Cooking stt={stt}>
                        <Image source={sprite} style={{ width: '100%', height: S(56) }} resizeMode="contain" />
                      </Cooking>
                      <Bar frac={stt === 'cooking' ? (t - s.start) / COOK[s.item!] : stt === 'ready' ? 1 - (t - s.start - COOK[s.item!]) / BURN_AFTER : 0} color={stt === 'ready' ? '#7BE36A' : '#FFC93C'} />
                    </Draggable>
                  )}
                </DropZone>
              </Abs>
            );
          })}
        </>
      )}
      {(st.has('fryerDodo') || st.has('fryerPuff')) && (
        <>
          {st.has('fryerDodo') && <Source id="plantain" x={496} y={st.has('fryerPuff') ? 258 : 278} w={st.has('fryerPuff') ? 46 : 52} sprite={SPR.food.plantain} label={LBL.plantain} count={cnt('plantain')} onTap={() => tapSrcFry('plantain')} />}
          {st.has('fryerPuff') && <Source id="batter" x={496} y={st.has('fryerDodo') ? 304 : 278} w={st.has('fryerDodo') ? 46 : 52} sprite={SPR.props.batter} label={LBL.batter} count={cnt('batter')} onTap={() => tapSrcFry('batter')} />}
          <Abs x={556} y={250} w={124} h={104}>
            <Image source={SPR.appl.fryer} style={{ position: 'absolute', width: S(124), height: S(104) }} resizeMode="stretch" />
          </Abs>
          {G.fryer.map((s, i) => {
            const stt = fryState(s);
            const sx = 566 + i * (96 / fryN);
            const sprite = !s.item ? null : stt === 'cooking' ? SPR.food[s.item === 'dodo' ? 'plantain' : 'dough'] : stt === 'ready' ? SPR.food[s.item] : SPR.burnt[s.item];
            return (
              <Abs key={i} x={sx} y={248} w={96 / fryN - 2} h={56}>
                <DropZone id={`fry-${i}`} testID={`fry-${i}`} accepts={(p) => p.kind === 'src' && (p.id === 'plantain' || p.id === 'batter') && !s.item} onDrop={(p) => onDropFryer(i, p)} style={{ flex: 1, borderRadius: S(10), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#FFC93C', backgroundColor: '#FFC93C33' }}>
                  {sprite && (
                    <Draggable payload={{ kind: 'fryer', idx: i }} enabled={stt !== 'cooking'} onTap={() => stt === 'ready' && s.item && tapToPlate({ kind: 'fryer', idx: i }, s.item)} ghost={<Image source={sprite} style={{ width: S(56), height: S(56) }} resizeMode="contain" />} style={{ flex: 1 }} testID={`fryitem-${i}`}>
                      <Cooking stt={stt}><Image source={sprite} style={{ width: '100%', height: S(48) }} resizeMode="contain" /></Cooking>
                      <Bar frac={stt === 'cooking' ? (t - s.start) / fryFast / COOK[s.item!] : stt === 'ready' ? 1 - ((t - s.start) / fryFast - COOK[s.item!]) / BURN_AFTER : 0} color={stt === 'ready' ? '#7BE36A' : '#FFC93C'} />
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
        <DropZone id="bin" testID="bin" accepts={(p) => p.kind !== 'src' && p.kind !== 'pot'} onDrop={onDropBin} style={{ flex: 1, borderRadius: S(12), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#FF8A7A' }}>
          <Image source={SPR.props.bin} style={{ width: S(54), height: S(66) }} resizeMode="contain" />
        </DropZone>
      </Abs>

      {/* HUD */}
      <Hud2 tl={tl} total={lv.duration} coins={G.coins} goals={goals} stars={stars} cust={custCount} name={`${levelIdx + 1}. ${lv.name}`} onQuit={onQuit} />
      {G.msg && (
        <Animated.View key={G.msg.id} entering={ZoomIn.duration(150)} exiting={FadeOut} pointerEvents="none" style={{ position: 'absolute', top: S(46), left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#2B1B12DD', paddingHorizontal: S(14), paddingVertical: S(5), borderRadius: S(14) }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>{G.msg.text}</Text></View>
        </Animated.View>
      )}
      {G.pops.map((p) => (
        <Animated.View key={p.id} entering={ZoomIn.duration(200)} exiting={FadeOutUp.duration(500)} pointerEvents="none" style={{ position: 'absolute', left: S(p.x), top: S(p.y) }}>
          <GText size={20} color={p.color}>{p.text}</GText>
        </Animated.View>
      ))}
      {G.ended && (
        <Animated.View entering={FadeIn} pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#0006', alignItems: 'center', justifyContent: 'center' }]}>
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

function Source({ id, x, y, w, sprite, label, tray, onTap, count }: { id: string; x: number; y: number; w: number; sprite: any; label: string; tray?: boolean; onTap?: () => void; count?: number }) {
  const S = useS();
  return (
    <Abs x={x} y={y} w={w} h={w + 6}>
      <Draggable payload={{ kind: 'src', id }} onTap={onTap} ghost={<Image source={sprite} style={{ width: S(56), height: S(56) }} resizeMode="contain" />} testID={`src-${id}`} style={{ flex: 1, alignItems: 'center' }}>
        {tray && <Image source={SPR.appl.tray} style={{ position: 'absolute', top: S(w * 0.35), width: S(w + 4), height: S(w * 0.6) }} resizeMode="stretch" />}
        <Image source={sprite} style={{ width: S(w), height: S(w * 0.9) }} resizeMode="contain" />
        <View style={{ backgroundColor: '#2B1B12B0', borderRadius: S(6), paddingHorizontal: S(4), marginTop: S(-6) }}>
          <Text style={{ color: '#FFF', fontSize: S(8.5), fontWeight: '800' }} numberOfLines={1}>{label}</Text>
        </View>
        {count != null && <View pointerEvents="none" style={{ position: 'absolute', right: S(-4), top: S(-4), minWidth: S(18), height: S(16), borderRadius: S(8), backgroundColor: count <= 5 ? '#D7263D' : '#2B1B12D0', borderWidth: S(1), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: S(3) }}><Text style={{ color: '#FFF', fontSize: S(8.5), fontWeight: '900' }}>{count}</Text></View>}
      </Draggable>
    </Abs>
  );
}

function PotStation({ x, y, w, portions, cap, step, cookFrac, shakeN, onDrop, onTap, sprite, heap, recipe, label }: {
  x: number; y: number; w: number; portions: number; cap: number; step: number; cookFrac: number; shakeN: number; onDrop: (p: Payload) => void; onTap: () => void; sprite: any; heap: any; recipe: string[]; label: string;
}) {
  const S = useS();
  const sh = useShake(shakeN);
  const empty = portions <= 0;
  return (
    <Abs x={x} y={y} w={w} h={w * 0.9}>
      <DropZone id={`pot-${label}`} testID={`pot-${label}`} accepts={(p) => p.kind === 'src' && empty && step !== 99} onDrop={onDrop} style={{ flex: 1, borderRadius: S(16), borderWidth: S(2), borderColor: 'transparent' }}>
        <Draggable payload={{ kind: 'pot', id: label }} enabled={!empty} onTap={onTap} ghost={heap ? <Image source={heap} style={{ width: S(56), height: S(46) }} resizeMode="contain" /> : <Image source={SPR.food.egusi} style={{ width: S(56), height: S(46) }} resizeMode="contain" />} style={{ flex: 1 }} testID={`potsrc-${label}`}>
          <Animated.View style={[{ flex: 1 }, sh]}>
            <Image source={sprite} style={{ width: S(w), height: S(w * 0.86) }} resizeMode="contain" />
            {heap && !empty && <Image source={heap} style={{ position: 'absolute', left: S(w * 0.22), top: S(w * 0.08), width: S(w * 0.56), height: S(w * 0.32) }} resizeMode="contain" />}
          </Animated.View>
        </Draggable>
        <View pointerEvents="none" style={{ position: 'absolute', right: S(2), top: S(2), backgroundColor: empty ? '#D7263D' : '#0B6E4F', borderRadius: S(10), paddingHorizontal: S(6), paddingVertical: S(1), borderWidth: S(1.5), borderColor: '#FFF' }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(11) }}>{step === 99 ? '🔥' : empty ? 'EMPTY' : `${portions}/${cap}`}</Text>
        </View>
        {empty && step !== 99 && (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: S(-2), alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFC93C', borderRadius: S(8), paddingHorizontal: S(5), borderWidth: S(1.5), borderColor: '#A8520E' }}>
              <Text style={{ fontSize: S(9), fontWeight: '900', color: '#2B1B12' }}>Add {((LBL as any)[recipe[step]] ?? recipe[step]).toLowerCase()} {step + 1}/{recipe.length}</Text>
            </View>
          </View>
        )}
        {step === 99 && <View pointerEvents="none" style={{ position: 'absolute', left: S(10), right: S(10), bottom: S(4) }}><Bar frac={cookFrac} color="#FFC93C" /></View>}
      </DropZone>
    </Abs>
  );
}

function useShake(n: number) {
  const x = useSharedValue(0);
  useEffect(() => { if (n) x.value = withSequence(withTiming(-6, { duration: 50 }), withTiming(6, { duration: 50 }), withTiming(-4, { duration: 50 }), withTiming(0, { duration: 50 })); }, [n]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}

const COMP_SPR: Record<Comp, any> = {} as any;
function compSprite(c: Comp) {
  return c === 'jollof' ? SPR.food.jollof : c === 'chicken' ? SPR.food.chicken : c === 'egusi' ? SPR.food.egusi : c === 'eba' ? SPR.food.eba : c === 'suya' ? SPR.food.suya : c === 'yaji' ? SPR.props.yaji : c === 'dodo' ? SPR.food.dodo : SPR.food.puffpuff;
}
const COMP_POS: Record<Comp, [number, number, number]> = {
  jollof: [10, 4, 46], egusi: [30, 6, 36], eba: [6, 8, 30], chicken: [36, 2, 34], suya: [14, 6, 46], yaji: [44, 18, 18], dodo: [36, 16, 30], puffpuff: [16, 4, 42],
};

export function PlateView({ comps, w = 78 }: { comps: Comp[]; w?: number }) {
  const S = useS();
  const k = w / 78;
  return (
    <View style={{ width: S(w), height: S(w * 0.66) }}>
      <Image source={SPR.food.plate} style={{ position: 'absolute', width: S(w), height: S(w * 0.66) }} resizeMode="contain" />
      {comps.map((c) => {
        const [x, y, size] = COMP_POS[c];
        return <Image key={c} source={compSprite(c)} style={{ position: 'absolute', left: S(x * k), top: S(y * k), width: S(size * k), height: S(size * k * 0.85) }} resizeMode="contain" />;
      })}
    </View>
  );
}

function Plate({ x, y, comps, idx, shakeN, onDrop, onTap }: { x: number; y: number; comps: Comp[]; idx: number; shakeN: number; onDrop: (p: Payload) => void; onTap: () => void }) {
  const S = useS();
  const sh = useShake(shakeN);
  return (
    <Abs x={x} y={y} w={78} h={60}>
      <DropZone id={`plate-${idx}`} testID={`plate-${idx}`} accepts={(p) => p.kind === 'grill' || p.kind === 'fryer' || p.kind === 'pot' || (p.kind === 'src' && (p.id === 'eba' || p.id === 'yaji'))} onDrop={onDrop}
        style={{ flex: 1, borderRadius: S(30), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#7BE36A', backgroundColor: '#7BE36A33' }}>
        <Draggable payload={{ kind: 'plate', idx }} enabled={comps.length > 0} onTap={onTap} ghost={<PlateView comps={comps} w={70} />} testID={`platesrc-${idx}`}>
          <Animated.View style={sh}><PlateView comps={comps} /></Animated.View>
        </Draggable>
      </DropZone>
    </Abs>
  );
}

function Customer({ c, x, t, shakeN, onDrop, onCollect, idx }: { c: Cust; x: number; t: number; shakeN: number; onDrop: (p: Payload) => void; onCollect: () => void; idx: number }) {
  const S = useS();
  const bob = useSharedValue(0);
  useEffect(() => { bob.value = withRepeat(withSequence(withTiming(-3, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1); }, []);
  const sh = useShake(shakeN);
  const bobSt = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const mood = c.state === 'left' ? '😤' : c.state === 'paid' ? '😍' : c.patience > 0.6 ? '' : c.patience > 0.3 ? '😐' : '😠';
  const color = c.patience > 0.6 ? '#7BE36A' : c.patience > 0.3 ? '#FFC93C' : '#FF5A4A';
  const waiting = c.state === 'waiting';
  return (
    <>
      <Animated.View entering={FadeIn.duration(350)} exiting={FadeOut.duration(400)} style={{ position: 'absolute', left: S(x - 10), top: S(38), width: S(150), height: S(140), overflow: 'hidden' }}>
        <DropZone id={`cust-${idx}`} testID={`cust-${idx}`} accepts={(p) => waiting && (p.kind === 'plate' || p.kind === 'cup' || p.kind === 'grill' || p.kind === 'fryer')} onDrop={onDrop} style={{ flex: 1, borderRadius: S(20), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#7BE36A', backgroundColor: '#7BE36A22' }}>
          <Animated.View style={[bobSt, sh, { alignItems: 'center', opacity: c.state === 'left' ? 0.5 : 1 }]}>
            <Image source={SPR.cust[c.who]} style={{ width: S(120), height: S(150), marginTop: S(8) }} resizeMode="contain" />
          </Animated.View>
        </DropZone>
      </Animated.View>
      {waiting && (
        <Animated.View entering={ZoomIn.delay(200)} pointerEvents="none" style={{ position: 'absolute', left: S(x + 92), top: S(40), alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: S(12), padding: S(4), borderWidth: S(2), borderColor: '#5E3A1A', minWidth: S(52) }}>
            {c.items.map((it, k) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', opacity: it.done ? 0.35 : 1 }}>
                {MENU[it.m].drink ? <Image source={SPR.props[MENU[it.m].drink!]} style={{ width: S(30), height: S(34) }} resizeMode="contain" /> : <PlateView comps={MENU[it.m].comps!} w={46} />}
                {it.done && <Text style={{ fontSize: S(12), color: '#2FA544', fontWeight: '900' }}>✓</Text>}
              </View>
            ))}
          </View>
          <View style={{ marginTop: S(3), width: S(54), height: S(8), backgroundColor: '#0007', borderRadius: S(4), overflow: 'hidden', borderWidth: S(1), borderColor: '#FFF' }}>
            <View style={{ width: `${c.patience * 100}%`, height: '100%', backgroundColor: color }} />
          </View>
          {mood ? <Text style={{ fontSize: S(16), marginTop: S(1) }}>{mood}</Text> : null}
        </Animated.View>
      )}
      {c.state === 'paid' && (
        <Abs x={x + 20} y={150} w={80} h={40}>
          <Draggable payload={{ kind: 'src', id: 'coins' }} enabled={false} onTap={onCollect} testID={`coins-${idx}`} style={{ flex: 1, alignItems: 'center' }}>
            <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
              <Image source={SPR.props.coins} style={{ width: S(50), height: S(34) }} resizeMode="contain" />
              <View style={{ backgroundColor: '#2B1B12CC', borderRadius: S(8), paddingHorizontal: S(5), marginTop: S(-6) }}><Text style={{ color: '#FFC93C', fontWeight: '900', fontSize: S(10) }}>₦{(c.coins + c.tip).toLocaleString('en-US')}</Text></View>
            </Animated.View>
          </Draggable>
        </Abs>
      )}
    </>
  );
}

function Hud2({ tl, total, coins, goals, stars, cust, name, onQuit }: { tl: number; total: number; coins: number; goals: number[]; stars: number; cust: string; name: string; onQuit: () => void }) {
  const S = useS();
  const frac = Math.min(1, coins / goals[2]);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: S(36), flexDirection: 'row', alignItems: 'center', paddingHorizontal: S(8) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F5FB0', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(8), height: S(28) }}>
        <Text style={{ color: '#FFC93C', fontWeight: '900', fontSize: S(14) }}>₦{coins.toLocaleString('en-US')}</Text>
        <View style={{ width: S(140), height: S(10), backgroundColor: '#0006', borderRadius: S(5), marginLeft: S(8), overflow: 'visible' }}>
          <View style={{ width: `${frac * 100}%`, height: '100%', backgroundColor: '#FFC93C', borderRadius: S(5) }} />
          {goals.map((gv, i) => (
            <Text key={i} style={{ position: 'absolute', left: `${(gv / goals[2]) * 100 - 6}%`, top: S(-7), fontSize: S(13) }}>{i < stars ? '⭐' : '☆'}</Text>
          ))}
        </View>
      </View>
      <View style={{ marginLeft: S(8), backgroundColor: '#FFFFFFE6', borderRadius: S(12), paddingHorizontal: S(8), height: S(26), justifyContent: 'center', borderWidth: S(2), borderColor: '#5E3A1A' }}>
        <Text style={{ fontWeight: '900', color: '#2B1B12', fontSize: S(12) }}>🧍 {cust}</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ backgroundColor: '#2B1B12CC', borderRadius: S(10), paddingHorizontal: S(10), height: S(24), justifyContent: 'center' }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(12) }} numberOfLines={1}>{name}</Text></View>
      </View>
      <View testID="timer" style={{ backgroundColor: tl < 15 ? '#D7263D' : '#2FA544', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center' }}>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(14) }}>⏱ {Math.ceil(tl)}s</Text>
      </View>
      <Draggable payload={{ kind: 'src', id: 'quit' }} enabled={false} onTap={onQuit} testID="quit" style={{ marginLeft: S(6), width: S(28), height: S(28), borderRadius: S(14), backgroundColor: '#D7263D', borderWidth: S(2), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>II</Text>
      </Draggable>
    </View>
  );
}
