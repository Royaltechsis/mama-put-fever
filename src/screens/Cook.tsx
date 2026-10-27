import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { DISHES, INGREDIENTS, stepQty, type IngId, type StationDef, type DishId } from '../data';
import { Draggable, DropZone, type Payload } from '../dnd';
import { IngredientIcon } from '../art/Icons';
import { FoodPortion, Vessel, type VesselState } from '../art/Scenes';
import { Hud, Pulse, Shake, Toasts, useNow, useToasts } from '../ui';
import { C, shadow } from '../theme';
import { play, haptic } from '../fx';
import { timeLeft, type Run } from '../game';

const BURN_WINDOW = 7; // seconds a dish stays perfect before burning

type St = {
  key: string;
  orderIdx: number;
  dish: DishId;
  def: StationDef;
  steps: { ing: IngId; qty: number }[];
  stepIdx: number;
  inStep: number;
  phase: 'adding' | 'cooking' | 'mashing' | 'ready' | 'served';
  cookStart: number;
  quality: number;
  stirNext: number;
  stirOpenUntil: number | null;
  flipped: boolean;
  flipPenalized: boolean;
  finishIdx: number;
  mash: number;
  shake: number;
  burnWarned: boolean;
  burnt: boolean;
  added: number;
  total: number;
};

function makeStations(run: Run, bigPot: boolean): St[] {
  const out: St[] = [];
  run.level.orders.forEach((o, oi) => {
    DISHES[o.dish].stations.forEach((def, si) => {
      const steps = def.steps.map((s) => ({ ing: s.ing, qty: stepQty(s, o.people, bigPot) }));
      out.push({
        key: `${oi}-${si}`, orderIdx: oi, dish: o.dish, def, steps, stepIdx: 0, inStep: 0, phase: 'adding', cookStart: 0,
        quality: 100, stirNext: 2, stirOpenUntil: null, flipped: false, flipPenalized: false, finishIdx: 0, mash: 0, shake: 0,
        burnWarned: false, burnt: false, added: 0, total: steps.reduce((a, s) => a + s.qty, 0),
      });
    });
  });
  return out;
}

export default function Cook({ run, coins, gas, bigPot, onDone, onQuit }: {
  run: Run; coins: number; gas: boolean; bigPot: boolean; onDone: (quality: number[]) => void; onQuit: () => void;
}) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, 480);
  const now = useNow(100);
  const speed = gas ? 1 / 0.65 : 1;
  const [sts, setSts] = useState<St[]>(() => makeStations(run, bigPot));
  const ref = useRef(sts);
  const { toasts, push } = useToasts();
  const [done, setDone] = useState(false);

  const elapsed = (s: St, t = Date.now()) => ((t - s.cookStart) / 1000) * speed;

  function update(fn: (xs: St[]) => St[]) {
    const next = fn(ref.current);
    ref.current = next;
    setSts(next);
  }

  // shelf: every ingredient the level needs, plus distractors up to 8
  const shelf = useMemo(() => {
    const need: IngId[] = [];
    sts.forEach((s) => {
      s.def.steps.forEach((x) => !need.includes(x.ing) && need.push(x.ing));
      (s.def.finish ?? []).forEach((x) => !need.includes(x) && need.push(x));
    });
    const extras: IngId[] = ['salt', 'ugu', 'yaji', 'garri', 'palmoil', 'meat', 'plantain', 'crayfish', 'egusi', 'onion'];
    for (const e of extras) {
      if (need.length >= 8) break;
      if (!need.includes(e)) need.push(e);
    }
    // stable shuffle so the shelf isn't in recipe order
    return need.map((id, i) => ({ id, k: (i * 7 + run.levelIdx * 3) % 11 })).sort((a, b) => a.k - b.k).map((x) => x.id);
  }, []);

  // ticker: cooking, stir prompts, flips, burning
  useEffect(() => {
    let events: (() => void)[] = [];
    update((xs) => xs.map((s) => {
      if (s.phase === 'cooking') {
        const e = elapsed(s, now);
        let n = { ...s };
        if (s.def.action === 'stir') {
          if (n.stirOpenUntil != null && e > n.stirOpenUntil) {
            n.quality = Math.max(0, n.quality - 6);
            n.stirOpenUntil = null;
            n.stirNext = e + 2.2;
            events.push(() => { push(`Stir the ${s.def.label.toLowerCase()}! −6`, 'bad'); play('bad'); });
          } else if (n.stirOpenUntil == null && e >= n.stirNext && e < s.def.cookTime - 1.2) {
            n.stirOpenUntil = e + 2.6;
          }
        }
        if (e >= s.def.cookTime) {
          if (s.def.action === 'flip' && !s.flipped && !s.flipPenalized) {
            n.quality = Math.max(0, n.quality - 15);
            n.flipPenalized = true;
            events.push(() => { push('You forgot to flip! −15', 'bad'); play('bad'); });
          }
          n.phase = 'ready';
          n.stirOpenUntil = null;
          events.push(() => { play('ding'); haptic.good(); });
        }
        return n;
      }
      if (s.phase === 'ready' && s.def.cookTime > 0) {
        const e = elapsed(s, now);
        const burnAt = s.def.cookTime + BURN_WINDOW;
        if (!s.burnWarned && e >= burnAt - 3) {
          events.push(() => push(`${s.def.label} is about to burn!`, 'bad'));
          return { ...s, burnWarned: true };
        }
        if (!s.burnt && e >= burnAt) {
          events.push(() => { push(`${s.def.label} is burning! 🔥`, 'bad'); play('sizzle'); haptic.bad(); });
          return { ...s, burnt: true };
        }
      }
      return s;
    }));
    events.forEach((f) => f());
  }, [now]);

  // all served → next phase
  useEffect(() => {
    if (!done && sts.every((s) => s.phase === 'served')) {
      setDone(true);
      const q = run.level.orders.map((_, oi) => {
        const mine = sts.filter((s) => s.orderIdx === oi);
        return mine.reduce((a, s) => a + s.quality, 0) / mine.length;
      });
      setTimeout(() => onDone(q), 900);
    }
  }, [sts]);

  function dropIng(i: number, p: Payload) {
    if (p.kind !== 'ing') return;
    const ing = p.id as IngId;
    const events: (() => void)[] = [];
    update((xs) => xs.map((s, j) => {
      if (j !== i) return s;
      const name = INGREDIENTS[ing].name;
      const bad = (msg: string, pen: number) => {
        events.push(() => { push(msg, 'bad'); play('bad'); haptic.bad(); });
        return { ...s, quality: Math.max(0, s.quality - pen), shake: s.shake + 1 };
      };
      if (s.phase === 'adding') {
        const cur = s.steps[s.stepIdx];
        if (ing === cur.ing) {
          let n = { ...s, inStep: s.inStep + 1, added: s.added + 1 };
          events.push(() => play('pop'));
          if (n.inStep >= cur.qty) {
            n.stepIdx += 1;
            n.inStep = 0;
            if (n.stepIdx >= n.steps.length) {
              if (s.def.cookTime > 0) {
                n.phase = 'cooking';
                n.cookStart = Date.now();
                n.stirNext = 1.8;
                events.push(() => { play('sizzle'); push(s.def.action === 'stir' ? 'Cooking! Tap STIR when it bubbles' : 'On the fire! FLIP it halfway', 'info'); });
              } else {
                n.phase = 'mashing';
                events.push(() => push('Now turn the eba! Tap TURN', 'info'));
              }
            }
          }
          return n;
        }
        const later = s.steps.slice(s.stepIdx + 1).some((x) => x.ing === ing) || (s.def.finish ?? []).includes(ing);
        const earlier = s.steps.slice(0, s.stepIdx).some((x) => x.ing === ing);
        if (later) return bad(`Wrong order! ${INGREDIENTS[cur.ing].name} first −8`, 8);
        if (earlier) return bad(`Too much ${name.toLowerCase()}! −8`, 8);
        return bad(`${name} doesn't go in ${s.def.label}! −8`, 8);
      }
      if (s.phase === 'cooking' || s.phase === 'mashing') {
        if ((s.def.finish ?? []).includes(ing)) {
          events.push(() => push(`Add ${name.toLowerCase()} when it's ready`, 'info'));
          return { ...s, shake: s.shake + 1 };
        }
        return bad(`It's already cooking! −8`, 8);
      }
      if (s.phase === 'ready') {
        const fin = s.def.finish ?? [];
        if (s.finishIdx < fin.length && fin[s.finishIdx] === ing) {
          events.push(() => play('pop'));
          return { ...s, finishIdx: s.finishIdx + 1 };
        }
        if (fin.slice(s.finishIdx).includes(ing)) return bad(`${INGREDIENTS[fin[s.finishIdx]].name} first! −8`, 8);
        return bad(`Don't spoil it! ${name} doesn't belong −8`, 8);
      }
      return s;
    }));
    events.forEach((f) => f());
  }

  function serve(p: Payload) {
    if (p.kind !== 'station') return;
    const events: (() => void)[] = [];
    update((xs) => xs.map((s, j) => {
      if (j !== p.idx || s.phase !== 'ready') return s;
      const fin = s.def.finish ?? [];
      if (!s.burnt && s.finishIdx < fin.length) {
        events.push(() => { push(`Add ${INGREDIENTS[fin[s.finishIdx]].name.toLowerCase()} first!`, 'bad'); play('bad'); });
        return { ...s, shake: s.shake + 1 };
      }
      let q = s.quality;
      if (s.burnt) q = Math.max(0, q - 45);
      if (s.finishIdx < fin.length) q = Math.max(0, q - 10);
      events.push(() => {
        play('cash');
        haptic.good();
        push(s.burnt ? 'Served… burnt 😬' : q >= 90 ? 'Perfect! 🔥' : 'Served!', s.burnt ? 'bad' : 'good');
      });
      return { ...s, phase: 'served', quality: q };
    }));
    events.forEach((f) => f());
  }

  function stir(i: number) {
    update((xs) => xs.map((s, j) => {
      if (j !== i || s.stirOpenUntil == null) return s;
      const e = elapsed(s);
      play('plop');
      haptic.pick();
      return { ...s, stirOpenUntil: null, stirNext: e + 2.6 + ((e * 7) % 1.4) };
    }));
  }
  function flip(i: number) {
    const events: (() => void)[] = [];
    update((xs) => xs.map((s, j) => {
      if (j !== i || s.flipped || s.phase !== 'cooking') return s;
      const e = elapsed(s);
      if (e < s.def.cookTime * 0.4) {
        events.push(() => push('Too early to flip', 'info'));
        return s;
      }
      events.push(() => { play('plop'); haptic.pick(); });
      return { ...s, flipped: true };
    }));
    events.forEach((f) => f());
  }
  function mash(i: number) {
    const events: (() => void)[] = [];
    update((xs) => xs.map((s, j) => {
      if (j !== i || s.phase !== 'mashing') return s;
      const m = Math.min(1, s.mash + 1 / 6);
      events.push(() => { play('plop'); haptic.pick(); });
      if (m >= 1) {
        events.push(() => { play('ding'); push('Eba is smooth!', 'good'); });
        return { ...s, mash: 1, phase: 'ready' };
      }
      return { ...s, mash: m };
    }));
    events.forEach((f) => f());
  }
  function bin(i: number) {
    const fresh = makeStations(run, bigPot).find((x) => x.key === ref.current[i].key)!;
    update((xs) => xs.map((s, j) => (j === i ? { ...fresh, quality: 95 } : s)));
    push('Binned it. Start again!', 'info');
    play('bad');
  }

  const tl = timeLeft(run, now);
  const n = sts.length;
  const sw = (W - 12 - (n - 1) * 6) / n;
  const vw = Math.min(sw - 14, n === 1 ? 230 : n === 2 ? 160 : 120);
  const chipSize = n === 1 ? 28 : n === 2 ? 22 : 16;

  // hint: which ingredient to glow (tutorial levels)
  let hintIng: IngId | null = null;
  let hintText = '';
  if (run.level.hint) {
    const s = sts.find((x) => x.phase !== 'served');
    if (s) {
      if (s.phase === 'adding') { hintIng = s.steps[s.stepIdx].ing; hintText = `Drag ${INGREDIENTS[hintIng].name.toLowerCase()} into the pot`; }
      else if (s.phase === 'cooking') hintText = s.stirOpenUntil != null ? 'Tap STIR!' : 'Cooking… watch for STIR';
      else if (s.phase === 'ready' && !s.burnt) hintText = 'Ready! Drag the pot onto the tray';
      else if (s.burnt) hintText = 'Burnt! Bin it 🗑 or serve anyway';
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Hud title={`Lvl ${run.levelIdx + 1} · ${run.level.title}`} timeLeft={tl} total={run.level.time} coins={coins} onQuit={onQuit} />
      <View style={st.tickets}>
        <Text style={st.phaseTag}>1 COOK</Text>
        {run.level.orders.map((o, i) => (
          <View key={i} style={st.ticket}>
            <FoodPortion dish={o.dish} size={22} />
            <Text style={st.ticketText} numberOfLines={1}>{DISHES[o.dish].short} × {o.people}</Text>
          </View>
        ))}
      </View>
      {hintText ? <Animated.Text entering={FadeIn} style={st.hint}>👉 {hintText}</Animated.Text> : null}

      <View style={st.stations}>
        {sts.map((s, i) => {
          const e = s.phase === 'cooking' || s.phase === 'ready' ? elapsed(s, now) : 0;
          const cookFrac = s.def.cookTime ? Math.min(1, e / s.def.cookTime) : s.mash;
          const burnFrac = s.phase === 'ready' && s.def.cookTime ? Math.min(1, (e - s.def.cookTime) / BURN_WINDOW) : 0;
          const vstate: VesselState = s.phase === 'served' ? 'served' : s.burnt ? 'burnt' : s.phase === 'ready' ? 'ready' : s.phase === 'cooking' ? 'cooking' : 'adding';
          const fill = s.phase === 'adding' ? s.added / s.total : 1;
          const color = s.phase === 'adding' ? INGREDIENTS[s.steps[Math.max(0, s.stepIdx - (s.inStep ? 0 : 1))].ing].color : (s.phase === 'ready' || s.phase === 'served') ? s.def.doneColor : s.def.rawColor;
          const beefCount = s.dish === 'suya' ? s.added : s.dish === 'dodo' ? (s.steps[1] ? Math.min(s.added - 1, s.steps[1].qty) * 2 : 0) : 0;
          const fin = s.def.finish ?? [];
          const canServe = s.phase === 'ready' && (s.burnt || s.finishIdx >= fin.length);
          const status = s.phase === 'served' ? 'Served ✓'
            : s.phase === 'adding' ? `Add ${s.steps[s.stepIdx].qty - s.inStep}× ${INGREDIENTS[s.steps[s.stepIdx].ing].name}`
            : s.phase === 'mashing' ? 'Turn it smooth!'
            : s.phase === 'cooking' ? 'Cooking…'
            : s.burnt ? 'BURNT! 🔥'
            : s.finishIdx < fin.length ? `Now add ${INGREDIENTS[fin[s.finishIdx]].name}` : 'READY! Drag to tray';
          return (
            <DropZone key={s.key} id={`station-${i}`} testID={`station-${i}`} accepts={(p) => p.kind === 'ing' && s.phase !== 'served'} onDrop={(p) => dropIng(i, p)}
              style={[st.station, { width: sw }, s.phase === 'served' && { opacity: 0.55 }]}>
              <View style={st.stHead}>
                <Text style={st.stLabel} numberOfLines={1}>{s.def.label}{run.level.orders.length > 1 ? ` (${run.level.orders[s.orderIdx].people})` : ''}</Text>
                {s.phase !== 'served' && (s.stepIdx > 0 || s.inStep > 0 || s.phase !== 'adding') && (
                  <Pressable onPress={() => bin(i)} hitSlop={6} accessibilityLabel="Bin and restart"><Text style={{ fontSize: 13 }}>🗑</Text></Pressable>
                )}
              </View>
              <View style={st.chips}>
                {s.steps.map((x, k) => {
                  const isDone = k < s.stepIdx;
                  const isCur = k === s.stepIdx && s.phase === 'adding';
                  return (
                    <View key={k} style={[st.chip, isCur && st.chipCur, isDone && { opacity: 0.35 }]}>
                      <IngredientIcon id={x.ing} size={chipSize} />
                      <Text style={st.chipQty}>{isDone ? '✓' : isCur ? `${s.inStep}/${x.qty}` : `×${x.qty}`}</Text>
                    </View>
                  );
                })}
                {fin.length > 0 && <Text style={st.then}>then</Text>}
                {fin.map((f, k) => (
                  <View key={'f' + k} style={[st.chip, s.phase === 'ready' && k === s.finishIdx && st.chipCur, k < s.finishIdx && { opacity: 0.35 }]}>
                    <IngredientIcon id={f} size={chipSize} />
                  </View>
                ))}
              </View>
              <Draggable payload={{ kind: 'station', idx: i }} enabled={canServe} ghost={<FoodPortion dish={s.dish} size={64} />} testID={`vessel-${i}`}>
                <Pulse active={canServe && !s.burnt}>
                  <Shake trigger={s.shake} style={{ alignItems: 'center' }}>
                    <Vessel kind={s.def.kind} fill={fill} color={color} state={vstate} count={beefCount} flipped={s.flipped} gas={gas} width={vw} mash={s.mash} />
                  </Shake>
                </Pulse>
                {s.stirOpenUntil != null && s.phase === 'cooking' && (
                  <Animated.View entering={ZoomIn} style={st.promptWrap}>
                    <Pressable onPress={() => stir(i)} style={[st.prompt, { backgroundColor: C.orange }]} testID={`stir-${i}`}>
                      <Text style={st.promptText}>🥄 STIR!</Text>
                    </Pressable>
                  </Animated.View>
                )}
                {s.def.action === 'flip' && s.phase === 'cooking' && !s.flipped && e >= s.def.cookTime * 0.4 && (
                  <Animated.View entering={ZoomIn} style={st.promptWrap}>
                    <Pressable onPress={() => flip(i)} style={[st.prompt, { backgroundColor: C.purple }]} testID={`flip-${i}`}>
                      <Text style={st.promptText}>🔄 FLIP!</Text>
                    </Pressable>
                  </Animated.View>
                )}
                {s.phase === 'mashing' && (
                  <Animated.View entering={ZoomIn} style={st.promptWrap}>
                    <Pressable onPress={() => mash(i)} style={[st.prompt, { backgroundColor: C.teal }]} testID={`mash-${i}`}>
                      <Text style={st.promptText}>✊ TURN {Math.round(s.mash * 6)}/6</Text>
                    </Pressable>
                  </Animated.View>
                )}
              </Draggable>
              <View style={st.bar}>
                {s.phase === 'ready' && s.def.cookTime > 0 ? (
                  <View style={[st.barFill, { width: `${(1 - burnFrac) * 100}%`, backgroundColor: burnFrac > 0.6 ? C.red : C.green }]} />
                ) : (
                  <View style={[st.barFill, { width: `${(s.phase === 'adding' ? fill : s.phase === 'served' ? 1 : cookFrac) * 100}%`, backgroundColor: s.phase === 'adding' ? C.yellow : C.orange }]} />
                )}
              </View>
              <Text style={[st.status, (s.burnt || (burnFrac > 0.6 && s.phase === 'ready')) && { color: C.red }, canServe && !s.burnt && { color: C.green }]} numberOfLines={2}>{status}</Text>
            </DropZone>
          );
        })}
      </View>

      <DropZone id="tray" testID="tray" accepts={(p) => p.kind === 'station'} onDrop={serve} style={st.tray}>
        <Text style={st.trayText}>🍽  Serving tray</Text>
        <View style={{ flexDirection: 'row' }}>
          {sts.filter((s) => s.phase === 'served').map((s) => (
            <Animated.View key={s.key} entering={ZoomIn}><FoodPortion dish={s.dish} size={34} /></Animated.View>
          ))}
        </View>
      </DropZone>

      <View style={st.shelf}>
        <View style={st.shelfBoard}>
          {shelf.map((id) => (
            <Draggable key={id} payload={{ kind: 'ing', id }} ghost={<IngredientIcon id={id} size={60} />} style={st.tileWrap} testID={`ing-${id}`}>
              <Pulse active={hintIng === id} style={[st.tile, hintIng === id && st.tileHint]}>
                <IngredientIcon id={id} size={38} />
                <Text style={st.tileText} numberOfLines={1}>{INGREDIENTS[id].name}</Text>
              </Pulse>
            </Draggable>
          ))}
        </View>
      </View>
      <Toasts toasts={toasts} />
    </View>
  );
}

const st = StyleSheet.create({
  tickets: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#FCE8C4', gap: 6 },
  phaseTag: { backgroundColor: C.red, color: '#FFF', fontWeight: '900', fontSize: 11, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  ticket: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, flexShrink: 1, ...shadow, elevation: 1 },
  ticketText: { fontWeight: '800', color: C.ink, fontSize: 12, marginLeft: 3 },
  hint: { textAlign: 'center', backgroundColor: C.yellow, color: C.ink, fontWeight: '800', paddingVertical: 4, fontSize: 13 },
  stations: { flex: 1, flexDirection: 'row', paddingHorizontal: 6, paddingTop: 6, gap: 6, alignItems: 'stretch' },
  station: { backgroundColor: C.paper, borderRadius: 14, padding: 6, borderWidth: 2, borderColor: '#EBD9BC', alignItems: 'center', justifyContent: 'space-between' },
  stHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  stLabel: { fontWeight: '900', color: C.ink, fontSize: 13, flexShrink: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 3, gap: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6EBD8', borderRadius: 8, paddingHorizontal: 3, paddingVertical: 1, borderWidth: 1.5, borderColor: 'transparent' },
  chipCur: { borderColor: C.orange, backgroundColor: '#FFF1D6' },
  chipQty: { fontSize: 11, fontWeight: '900', color: C.ink, marginLeft: 1 },
  then: { fontSize: 10, color: C.inkSoft, alignSelf: 'center', fontWeight: '700' },
  promptWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  prompt: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, ...shadow },
  promptText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  bar: { alignSelf: 'stretch', height: 7, backgroundColor: '#EADBC4', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  barFill: { height: 7, borderRadius: 4 },
  status: { fontSize: 11, fontWeight: '800', color: C.inkSoft, textAlign: 'center', marginTop: 3 },
  tray: { marginHorizontal: 6, marginVertical: 6, height: 50, borderRadius: 14, backgroundColor: C.woodLight, borderWidth: 2, borderColor: C.wood, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  trayText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  shelf: { backgroundColor: C.wood, paddingTop: 6, paddingBottom: 8, paddingHorizontal: 4, borderTopWidth: 5, borderTopColor: C.woodDark },
  shelfBoard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  tileWrap: { width: '25%', padding: 3 },
  tile: { backgroundColor: '#FFF4E0', borderRadius: 12, alignItems: 'center', paddingVertical: 4, borderWidth: 2, borderColor: '#E9CFA6' },
  tileHint: { borderColor: C.orange, backgroundColor: '#FFE7B8' },
  tileText: { fontSize: 10, fontWeight: '800', color: C.ink },
});
