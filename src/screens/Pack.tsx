import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { CONTAINER_INFO, CUSTOMERS, DISHES, PACKAGING, PKG_ORDER, SIDE_INFO, containerNeeded, type Container, type PkgId, type SideId } from '../data';
import { Draggable, DropZone, type Payload } from '../dnd';
import { PkgIcon } from '../art/Icons';
import { FoodPortion, GhanaBag } from '../art/Scenes';
import { Btn, Hud, Shake, Toasts, useNow, useToasts } from '../ui';
import { C, shadow } from '../theme';
import { play, haptic } from '../fx';
import { timeLeft, type PackResult, type Run } from '../game';

type Bag = { counts: Record<string, number>; history: PkgId[]; sealed: boolean; wrong: number; extras: number; shake: number };
const emptyBag = (): Bag => ({ counts: {}, history: [], sealed: false, wrong: 0, extras: 0, shake: 0 });

export default function Pack({ run, coins, onDone, onQuit }: { run: Run; coins: number; onDone: (r: PackResult[]) => void; onQuit: () => void }) {
  const now = useNow(250);
  const orders = run.level.orders;
  const [bags, setBags] = useState<Bag[]>(() => orders.map(emptyBag));
  const [active, setActive] = useState(0);
  const { toasts, push } = useToasts();
  const o = orders[active];
  const bag = bags[active];
  const need = containerNeeded(o);
  const cust = CUSTOMERS[o.customer];

  const setBag = (i: number, fn: (b: Bag) => Bag) => setBags((bs) => bs.map((b, j) => (j === i ? fn(b) : b)));

  function drop(p: Payload) {
    if (p.kind !== 'pkg' || bag.sealed) return;
    const pk = PACKAGING[p.id as PkgId];
    const isContainer = pk.kind === 'pack' || pk.kind === 'foil' || pk.kind === 'cooler';
    if (isContainer && pk.kind !== o.container) {
      push(`${DISHES[o.dish].short} goes in ${CONTAINER_INFO[o.container].plural}! −5`, 'bad');
      play('bad'); haptic.bad();
      setBag(active, (b) => ({ ...b, wrong: b.wrong + 1, shake: b.shake + 1 }));
      return;
    }
    if (!isContainer && !(pk.kind in o.sides)) {
      push(`${cust.name} didn't order ${SIDE_INFO[pk.kind as SideId].plural}! −5`, 'bad');
      play('bad'); haptic.bad();
      setBag(active, (b) => ({ ...b, wrong: b.wrong + 1, shake: b.shake + 1 }));
      return;
    }
    play('pop');
    setBag(active, (b) => ({ ...b, counts: { ...b.counts, [pk.kind]: (b.counts[pk.kind] ?? 0) + pk.units }, history: [...b.history, p.id as PkgId] }));
  }

  function undo() {
    setBag(active, (b) => {
      if (!b.history.length || b.sealed) return b;
      const last = b.history[b.history.length - 1];
      const pk = PACKAGING[last];
      return { ...b, counts: { ...b.counts, [pk.kind]: (b.counts[pk.kind] ?? 0) - pk.units }, history: b.history.slice(0, -1) };
    });
    play('plop');
  }

  function seal() {
    const have = bag.counts[o.container] ?? 0;
    if (!have) { push('Pack the food first!', 'bad'); play('bad'); return; }
    const short = need - have;
    if (short > 0) push(`Sealed — ${short} ${short === 1 ? CONTAINER_INFO[o.container].name : CONTAINER_INFO[o.container].plural} short!`, 'bad');
    else if (short < 0) push(`Sealed — ${-short} extra, wasted!`, 'bad');
    else push('Bag sealed! ✓', 'good');
    play('ding'); haptic.good();
    const next = bags.map((b, j) => (j === active ? { ...b, sealed: true } : b));
    setBags(next);
    const nextOpen = next.findIndex((b) => !b.sealed);
    if (nextOpen >= 0) setTimeout(() => setActive(nextOpen), 500);
  }

  useEffect(() => {
    if (bags.every((b) => b.sealed)) {
      const res: PackResult[] = orders.map((ord, i) => ({
        container: ord.container,
        have: bags[i].counts[ord.container] ?? 0,
        need: containerNeeded(ord),
        sides: (Object.keys(ord.sides) as SideId[]).map((k) => ({ kind: k, have: bags[i].counts[k] ?? 0, need: ord.sides[k]! })),
        extras: 0,
        wrong: bags[i].wrong,
      }));
      const t = setTimeout(() => onDone(res), 800);
      return () => clearTimeout(t);
    }
  }, [bags]);

  const rows: { key: string; label: string; have: number; need: number; icon: PkgId }[] = [
    { key: o.container, label: CONTAINER_INFO[o.container].plural, have: bag.counts[o.container] ?? 0, need, icon: o.container === 'cooler' ? 'cooler' : o.container === 'foil' ? 'foil1' : 'pack1' },
    ...(Object.keys(o.sides) as SideId[]).map((k) => ({ key: k, label: SIDE_INFO[k].plural, have: bag.counts[k] ?? 0, need: o.sides[k]!, icon: (k === 'water' ? 'water1' : k === 'slaw' ? 'slaw1' : 'side1') as PkgId })),
  ];
  const fullness = Math.min(1, rows.reduce((a, r) => a + Math.min(r.have, r.need), 0) / rows.reduce((a, r) => a + r.need, 0));

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Hud title={`Lvl ${run.levelIdx + 1} · ${run.level.title}`} timeLeft={timeLeft(run, now)} total={run.level.time} coins={coins} onQuit={onQuit} />
      <View style={s.top}>
        <Text style={s.phaseTag}>2 PACKAGE</Text>
        {orders.length > 1 && orders.map((ord, i) => (
          <Pressable key={i} onPress={() => setActive(i)} style={[s.tab, i === active && s.tabOn]}>
            <Text style={[s.tabText, i === active && { color: '#FFF' }]}>{bags[i].sealed ? '✓ ' : ''}{DISHES[ord.dish].short} ×{ord.people}</Text>
          </Pressable>
        ))}
      </View>

      <Animated.View key={active} entering={FadeIn} style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FoodPortion dish={o.dish} size={44} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={s.cardTitle}>{cust.name}: {DISHES[o.dish].short} for {o.people}</Text>
            <Text style={s.cardSub}>
              {o.container === 'cooler' ? `Coolers hold 10 portions each → ${need} coolers` : `One ${CONTAINER_INFO[o.container].name} per person`}
            </Text>
          </View>
        </View>
        <View style={s.rows}>
          {rows.map((r) => {
            const ok = r.have === r.need;
            const over = r.have > r.need;
            return (
              <View key={r.key} style={s.row} testID={`row-${r.key}`}>
                <PkgIcon id={r.icon} size={26} />
                <Text style={s.rowLabel}>{r.label}</Text>
                <Text style={[s.rowCount, { color: ok ? C.green : over ? C.red : C.orange }]}>{r.have}/{r.need} {ok ? '✓' : over ? '!' : ''}</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      <View style={s.bagArea}>
        <DropZone id="bag" testID="bag" accepts={(p) => p.kind === 'pkg' && !bag.sealed} onDrop={drop} style={s.bagZone}>
          <Shake trigger={bag.shake} style={{ alignItems: 'center' }}>
            <GhanaBag width={200} fullness={fullness} sealed={bag.sealed} />
          </Shake>
          <View style={s.bagItems} pointerEvents="none">
            {bag.history.slice(-10).map((id, k) => (
              <Animated.View key={Math.max(0, bag.history.length - 10) + k} entering={ZoomIn.duration(180)} style={{ marginHorizontal: -3 }}><PkgIcon id={id} size={34} /></Animated.View>
            ))}
          </View>
          <Text style={s.bagHint}>{bag.sealed ? 'Sealed ✓' : 'Drag packs & sides into the bag'}</Text>
        </DropZone>
        <View style={s.bagBtns}>
          <Btn small label="↩ Undo" color={C.inkSoft} onPress={undo} disabled={!bag.history.length || bag.sealed} />
          <Btn small label="Seal bag ✓" color={C.green} onPress={seal} disabled={bag.sealed} testID="seal" />
        </View>
      </View>

      <View style={s.shelf}>
        <View style={s.shelfBoard}>
          {PKG_ORDER.map((id) => (
            <Draggable key={id} payload={{ kind: 'pkg', id }} ghost={<PkgIcon id={id} size={56} />} style={s.tileWrap} testID={`pkg-${id}`}>
              <View style={s.tile}>
                <PkgIcon id={id} size={34} />
                <Text style={s.tileText} numberOfLines={1}>{PACKAGING[id].label}</Text>
              </View>
            </Draggable>
          ))}
        </View>
      </View>
      <Toasts toasts={toasts} />
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#FCE8C4', gap: 6 },
  phaseTag: { backgroundColor: C.purple, color: '#FFF', fontWeight: '900', fontSize: 11, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  tab: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#FFF' },
  tabOn: { backgroundColor: C.green },
  tabText: { fontWeight: '800', fontSize: 12, color: C.ink },
  card: { margin: 8, padding: 10, backgroundColor: C.paper, borderRadius: 16, borderWidth: 2, borderColor: '#EBD9BC' },
  cardTitle: { fontWeight: '900', fontSize: 15, color: C.ink },
  cardSub: { fontSize: 12, color: C.inkSoft, fontWeight: '700', marginTop: 2 },
  rows: { marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  rowLabel: { flex: 1, marginLeft: 6, fontWeight: '800', color: C.ink, textTransform: 'capitalize' },
  rowCount: { fontWeight: '900', fontSize: 16 },
  bagArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bagZone: { alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 2, borderColor: 'transparent', paddingHorizontal: 20, paddingVertical: 2 },
  bagItems: { position: 'absolute', top: 54, flexDirection: 'row', flexWrap: 'wrap', width: 170, justifyContent: 'center' },
  bagHint: { fontSize: 12, fontWeight: '800', color: C.inkSoft },
  bagBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  shelf: { backgroundColor: C.wood, paddingTop: 6, paddingBottom: 8, paddingHorizontal: 4, borderTopWidth: 5, borderTopColor: C.woodDark },
  shelfBoard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  tileWrap: { width: '25%', padding: 3 },
  tile: { backgroundColor: '#FFF4E0', borderRadius: 12, alignItems: 'center', paddingVertical: 4, borderWidth: 2, borderColor: '#E9CFA6' },
  tileText: { fontSize: 10, fontWeight: '800', color: C.ink },
});
