import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import Animated, { ZoomIn, FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Draggable, DropZone, type Payload } from '../dnd';
import { DISHES, INGREDIENTS, PACKAGING, CONTAINER_INFO, containerNeeded, stepQty, type Level as BulkLevel, type PkgId, type IngId } from '../data';
import { IngredientIcon, PkgIcon } from '../art/Icons';
import { Okada, Road, GhanaBag } from '../art/Scenes';
import { play, haptic } from '../fx';
import { useNow } from '../ui';
import { Abs, GText, GameBtn, Panel, SW, useS } from './stage';
import { SPR } from './assets';

export type EventResult = { naira: number; quality: number; accuracy: number; onTime: boolean; note: string };

const ROUTES = [
  { name: 'Third Mainland Bridge', desc: 'Go-slow on the bridge', secs: 3.6, risk: 0 },
  { name: 'Ikorodu Road', desc: 'Moving small small', secs: 2.6, risk: 0 },
  { name: 'Back streets', desc: 'Fast, but potholes…', secs: 1.8, risk: 0.35 },
];

export default function OwambeEvent({ bulk, bigPot, onDone }: { bulk: BulkLevel; bigPot: boolean; onDone: (r: EventResult) => void }) {
  const S = useS();
  const o = bulk.orders[0];
  const dish = DISHES[o.dish];
  const station = dish.stations[0];
  const steps = station.steps.map((s) => ({ ing: s.ing as IngId, need: stepQty(s, o.people, bigPot) }));
  const finish = (station.finish ?? []) as IngId[];
  const need = containerNeeded(o);
  const sides = Object.entries(o.sides ?? {}).filter(([, n]) => (n ?? 0) > 0) as [string, number][];

  const [phase, setPhase] = useState<'brief' | 'cook' | 'pack' | 'ride' | 'done'>('brief');
  const [deadline, setDeadline] = useState(0);
  const now = useNow(100, phase !== 'brief' && phase !== 'done');
  const tl = deadline ? Math.max(0, (deadline - now) / 1000) : bulk.time;

  // cook state
  const [stepIdx, setStepIdx] = useState(0);
  const [added, setAdded] = useState(0);
  const [fin, setFin] = useState<IngId[]>([]);
  const [cookStart, setCookStart] = useState(0);
  const [stirs, setStirs] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [quality, setQuality] = useState(0);
  const cookTime = station.cookTime || 6;
  const cooking = stepIdx >= steps.length && cookStart > 0;
  const ce = cooking ? (now - cookStart) / 1000 : 0;
  const cstate = !cooking ? 'adding' : ce < cookTime ? 'cooking' : ce < cookTime + 6 ? 'ready' : 'burnt';

  // pack state
  const [packs, setPacks] = useState(0);
  const [sideHave, setSideHave] = useState<Record<string, number>>({});
  const [extra, setExtra] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [route, setRoute] = useState<number | null>(null);
  const rideX = useSharedValue(0);
  const rideSt = useAnimatedStyle(() => ({ transform: [{ translateX: rideX.value }] }));
  const ended = useRef(false);
  if (Platform.OS === 'web' && typeof window !== 'undefined') (window as any).__ev = { steps, finish, need, container: o.container, sides };

  useEffect(() => {
    if (phase !== 'brief' && phase !== 'done' && phase !== 'ride' && tl <= 0 && !ended.current) {
      ended.current = true; setPhase('done'); play('bad');
      setTimeout(() => onDone({ naira: 0, quality: 0, accuracy: 0, onTime: false, note: 'Time ran out — the party chopped somewhere else 😢' }), 1500);
    }
  }, [now]);

  function dropIng(p: Payload) {
    if (p.kind !== 'ing') return;
    if (stepIdx < steps.length) {
      const s = steps[stepIdx];
      if (p.id !== s.ing) { setMistakes((m) => m + 1); play('bad'); haptic.bad(); return; }
      play('plop'); haptic.drop();
      if (added + 1 >= s.need) {
        setAdded(0); setStepIdx(stepIdx + 1);
        if (stepIdx + 1 >= steps.length) { setCookStart(Date.now()); play('sizzle'); }
      } else setAdded(added + 1);
    } else if (cstate === 'ready' && finish.includes(p.id as IngId) && !fin.includes(p.id as IngId)) {
      setFin([...fin, p.id as IngId]); play('plop');
    } else { play('bad'); }
  }
  function dishOut() {
    if (cstate !== 'ready' && cstate !== 'burnt') return;
    const q = Math.max(0, Math.min(100, (cstate === 'burnt' ? 35 : 75) + Math.min(stirs, 3) * 6 + fin.length * 4 - mistakes * 5 - (finish.length - fin.length) * 8));
    setQuality(q); play('ding'); setPhase('pack');
  }
  function dropPkg(p: Payload) {
    if (p.kind !== 'pkg') return;
    const pk = PACKAGING[p.id as PkgId];
    play('plop'); haptic.drop();
    if (pk.kind === o.container) setPacks((n) => n + pk.units);
    else if (sides.some(([k]) => k === pk.kind)) setSideHave((h) => ({ ...h, [pk.kind]: (h[pk.kind] ?? 0) + pk.units }));
    else { setExtra((e) => e + 1); play('bad'); }
  }
  function seal() {
    const parts = [Math.min(packs, need) / need - Math.max(0, packs - need) / need * 0.5];
    sides.forEach(([k, n]) => { const h = sideHave[k] ?? 0; parts.push(Math.min(h, n) / n - Math.max(0, h - n) / n * 0.5); });
    const acc = Math.max(0, Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100 - extra * 10));
    setAccuracy(acc); play('pop'); setPhase('ride');
  }
  function ride(i: number) {
    if (route != null) return;
    setRoute(i); play('horn');
    const r = ROUTES[i];
    const pothole = r.risk > 0 && (Math.round(now / 100) % 3 === 0);
    const secs = r.secs + (pothole ? 1.5 : 0);
    rideX.value = withTiming(S(SW + 40), { duration: secs * 1000, easing: Easing.inOut(Easing.quad) });
    const left = tl - secs * 4; // each ride second = 4 game seconds
    setTimeout(() => {
      const onTime = left > 0;
      const base = o.people * dish.price;
      const naira = Math.round((base * (0.35 + 0.65 * ((quality + accuracy) / 200)) * (onTime ? 1 : 0.5) + (onTime ? Math.min(left, 60) * 20 : 0)) / 50) * 50;
      play('cash'); haptic.good(); setPhase('done');
      onDone({ naira, quality, accuracy, onTime, note: pothole ? 'Pothole wahala on the back street, small delay!' : onTime ? 'Okada reached sharp sharp, food still hot!' : 'Arrived late, the MC was vexing.' });
    }, secs * 1000 + 400);
  }

  const shelfIngs = useMemo(() => {
    const ids = Array.from(new Set([...steps.map((s) => s.ing), ...finish]));
    const decoys: IngId[] = (['salt', 'crayfish', 'pepper', 'onion', 'cube'] as IngId[]).filter((x) => INGREDIENTS[x] && !ids.includes(x)).slice(0, Math.max(0, 8 - ids.length));
    return [...ids, ...decoys].sort();
  }, []);
  const pkgTiles: PkgId[] = [o.container === 'pack' ? 'pack1' : o.container === 'foil' ? 'foil1' : 'cooler', ...(o.container === 'pack' ? ['pack5'] : o.container === 'foil' ? ['foil5'] : []) as PkgId[], 'water1', 'water6', 'slaw1'];

  return (
    <View style={{ flex: 1 }}>
      <Image source={SPR.bg[0]} style={{ position: 'absolute', left: 0, top: S(-85), width: S(SW), height: S(475) }} resizeMode="cover" />
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#3A1D4A88' }} />
      {/* header */}
      <View style={{ position: 'absolute', left: S(8), right: S(8), top: S(6), height: S(30), flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#7B4BC4', borderRadius: S(12), paddingHorizontal: S(10), height: S(28), justifyContent: 'center', borderWidth: S(2), borderColor: '#FFF' }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>🎉 {bulk.title}</Text>
        </View>
        <View style={{ flex: 1 }} />
        {['cook', 'pack', 'ride'].map((ph, i) => (
          <View key={ph} style={{ marginRight: S(6), paddingHorizontal: S(8), height: S(22), borderRadius: S(11), justifyContent: 'center', backgroundColor: phase === ph ? '#FFC93C' : '#FFFFFF55' }}>
            <Text style={{ fontWeight: '900', fontSize: S(11), color: '#2B1B12' }}>{i + 1}. {ph === 'cook' ? `Cook for ${o.people}` : ph === 'pack' ? 'Package' : 'Deliver'}</Text>
          </View>
        ))}
        <View testID="ev-timer" style={{ backgroundColor: tl < 15 ? '#D7263D' : '#2FA544', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center' }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(14) }}>⏱ {Math.ceil(tl)}s</Text>
        </View>
      </View>

      {phase === 'brief' && (
        <Animated.View entering={ZoomIn} style={{ position: 'absolute', left: S(172), top: S(60) }}>
          <Panel w={500} h={290}>
            <View style={{ flex: 1, alignItems: 'center', padding: S(16) }}>
              <GText size={26} color="#FFC93C">Owambe order! 🎉</GText>
              <Text style={{ fontSize: S(16), fontWeight: '900', color: '#2B1B12', marginTop: S(8), textAlign: 'center' }}>
                {o.dish === 'suya' ? `Suya for ${o.people} guests` : `${dish.short} for ${o.people} guests`}
              </Text>
              <Text style={{ fontSize: S(13), fontWeight: '700', color: '#5E3A1A', marginTop: S(6), textAlign: 'center' }}>
                Cook one big batch (more people = more of everything), pack {need} {CONTAINER_INFO[o.container].plural}{sides.map(([k, n]) => ` + ${n} ${k}`).join('')}, then send the okada.
              </Text>
              <View style={{ flexDirection: 'row', marginTop: S(10), alignItems: 'center' }}>
                <Image source={SPR.appl.pot} style={{ width: S(80), height: S(70) }} resizeMode="contain" />
                <Text style={{ fontSize: S(22) }}> → </Text>
                <Image source={o.container === 'cooler' ? SPR.props.cooler : SPR.props.pack} style={{ width: S(70), height: S(60) }} resizeMode="contain" />
                <Text style={{ fontSize: S(22) }}> → 🛵</Text>
              </View>
              <GameBtn label="Let's go!" testID="ev-start" w={200} h={46} onPress={() => { setDeadline(Date.now() + bulk.time * 1000); setPhase('cook'); }} style={{ marginTop: S(10) }} />
            </View>
          </Panel>
        </Animated.View>
      )}

      {phase === 'cook' && (
        <>
          <Abs x={20} y={50} w={330} h={330}>
            <DropZone id="ev-pot" testID="ev-pot" accepts={(p) => p.kind === 'ing'} onDrop={dropIng} style={{ flex: 1, alignItems: 'center', borderRadius: S(30), borderWidth: S(3), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#FFC93C', backgroundColor: '#FFC93C22' }}>
              <Image source={o.dish === 'suya' ? SPR.appl.grill : SPR.appl.pot} style={{ width: S(300), height: S(250) }} resizeMode="contain" />
              {cooking && o.dish !== 'suya' && <Image source={SPR.food.jollof} style={{ position: 'absolute', top: S(30), width: S(150), height: S(80), opacity: cstate === 'burnt' ? 0.6 : 1 }} resizeMode="contain" />}
              {cooking && o.dish === 'suya' && <View style={{ position: 'absolute', top: S(60), flexDirection: 'row' }}>{[0, 1, 2, 3].map((i) => <Image key={i} source={cstate === 'cooking' ? SPR.food.suya_raw : cstate === 'burnt' ? SPR.burnt.suya : SPR.food.suya} style={{ width: S(60), height: S(60) }} resizeMode="contain" />)}</View>}
              <View style={{ position: 'absolute', bottom: S(4), left: S(20), right: S(20), alignItems: 'center' }}>
                {!cooking && <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(14), backgroundColor: '#2B1B12CC', paddingHorizontal: S(10), borderRadius: S(10) }}>Drag ingredients in, in order</Text>}
                {cooking && (
                  <>
                    <View style={{ alignSelf: 'stretch', height: S(10), backgroundColor: '#0007', borderRadius: S(5), overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${Math.min(1, cstate === 'cooking' ? ce / cookTime : (ce - cookTime) / 6) * 100}%`, backgroundColor: cstate === 'cooking' ? '#FFC93C' : cstate === 'ready' ? '#7BE36A' : '#D7263D' }} />
                    </View>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(14), marginTop: S(2) }}>{cstate === 'cooking' ? 'Cooking… stir it!' : cstate === 'ready' ? (finish.length > fin.length ? `Ready! Add ${finish.filter((f) => !fin.includes(f)).map((f) => INGREDIENTS[f].name).join(' + ')}, then dish out` : 'Ready! Dish out now!') : 'Burning!! Dish out!'}</Text>
                  </>
                )}
              </View>
            </DropZone>
          </Abs>
          {cooking && cstate === 'cooking' && (
            <Abs x={360} y={120} w={120} h={50}><GameBtn label={o.dish === 'suya' ? `🔄 Flip ${stirs}` : `🥄 Stir ${stirs}`} color="purple" w={120} h={46} size={15} testID="ev-stir" onPress={() => { setStirs((s) => s + 1); play('plop'); }} /></Abs>
          )}
          {cooking && cstate !== 'cooking' && (
            <Abs x={360} y={120} w={130} h={50}><GameBtn label="Dish out!" color={cstate === 'burnt' ? 'red' : 'green'} w={130} h={46} testID="ev-dishout" onPress={dishOut} /></Abs>
          )}
          {/* recipe */}
          <Abs x={360} y={46} w={470} h={64}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#FFFBEFEE', borderRadius: S(12), padding: S(4), borderWidth: S(2), borderColor: '#B9824C' }}>
              {steps.map((s, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: S(6), opacity: i < stepIdx ? 0.45 : 1, backgroundColor: i === stepIdx ? '#FFC93C' : 'transparent', borderRadius: S(8), paddingHorizontal: S(3) }}>
                  <IngredientIcon id={s.ing} size={S(22)} />
                  <Text style={{ fontWeight: '900', fontSize: S(11), color: '#2B1B12' }}>{i < stepIdx ? '✓' : i === stepIdx ? `${added}/${s.need}` : `×${s.need}`}</Text>
                </View>
              ))}
              {finish.map((f) => (
                <View key={f} style={{ flexDirection: 'row', alignItems: 'center', marginRight: S(6), opacity: fin.includes(f) ? 0.45 : 1 }}>
                  <Text style={{ fontSize: S(10), fontWeight: '800' }}>then </Text><IngredientIcon id={f} size={S(22)} />
                </View>
              ))}
            </View>
          </Abs>
          <Abs x={500} y={176} w={330} h={206}>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#8B5A2BEE', borderRadius: S(14), padding: S(4), borderTopWidth: S(5), borderTopColor: '#5E3A1A' }}>
              {shelfIngs.map((id) => (
                <View key={id} style={{ width: '25%', padding: S(3) }}>
                  <Draggable payload={{ kind: 'ing', id }} ghost={<IngredientIcon id={id} size={S(54)} />} testID={`ev-ing-${id}`}>
                    <View style={{ backgroundColor: '#FFF4E0', borderRadius: S(10), alignItems: 'center', paddingVertical: S(3), borderWidth: S(2), borderColor: stepIdx < steps.length && steps[stepIdx].ing === id ? '#F28C28' : '#E9CFA6' }}>
                      <IngredientIcon id={id} size={S(34)} />
                      <Text style={{ fontSize: S(9), fontWeight: '800', color: '#2B1B12' }} numberOfLines={1}>{INGREDIENTS[id].name}</Text>
                    </View>
                  </Draggable>
                </View>
              ))}
            </View>
          </Abs>
        </>
      )}

      {phase === 'pack' && (
        <>
          <Abs x={20} y={50} w={300} h={330}>
            <DropZone id="ev-bag" testID="ev-bag" accepts={(p) => p.kind === 'pkg'} onDrop={dropPkg} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: S(30), borderWidth: S(3), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#7BE36A', backgroundColor: '#7BE36A22' }}>
              <GhanaBag width={S(220)} fullness={Math.min(1, packs / Math.max(1, need))} />
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13), marginTop: S(4) }}>Drag packs into the Ghana-must-go bag</Text>
            </DropZone>
          </Abs>
          <Abs x={330} y={50} w={500} h={110}>
            <Panel w={500} h={104}>
              <View style={{ padding: S(10), flexDirection: 'row', flexWrap: 'wrap' }}>
                <Counter label={CONTAINER_INFO[o.container].plural} have={packs} need={need} testID="ev-count-main" />
                {sides.map(([k, n]) => <Counter key={k} label={k} have={sideHave[k] ?? 0} need={n} testID={`ev-count-${k}`} />)}
                {extra > 0 && <Text style={{ color: '#D7263D', fontWeight: '900', fontSize: S(12) }}>Not ordered: {extra}</Text>}
              </View>
            </Panel>
          </Abs>
          <Abs x={330} y={168} w={500} h={150}>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#8B5A2BEE', borderRadius: S(14), padding: S(4), borderTopWidth: S(5), borderTopColor: '#5E3A1A' }}>
              {pkgTiles.map((id) => (
                <View key={id} style={{ width: '20%', padding: S(3) }}>
                  <Draggable payload={{ kind: 'pkg', id }} ghost={<PkgIcon id={id} size={S(54)} />} testID={`ev-pkg-${id}`}>
                    <View style={{ backgroundColor: '#FFF4E0', borderRadius: S(10), alignItems: 'center', paddingVertical: S(4), borderWidth: S(2), borderColor: '#E9CFA6' }}>
                      <PkgIcon id={id} size={S(40)} />
                      <Text style={{ fontSize: S(9), fontWeight: '800', color: '#2B1B12' }} numberOfLines={1}>{PACKAGING[id].label}</Text>
                    </View>
                  </Draggable>
                </View>
              ))}
            </View>
          </Abs>
          <Abs x={560} y={326} w={200} h={50}><GameBtn label="Seal the bag ✓" testID="ev-seal" w={200} h={46} onPress={seal} /></Abs>
        </>
      )}

      {(phase === 'ride' || (phase === 'done' && route != null)) && (
        <>
          <Abs x={0} y={230} w={SW} h={160}><Road width={S(SW)} height={S(160)} /></Abs>
          <Animated.View style={[{ position: 'absolute', left: S(10), top: S(250) }, rideSt]}><Okada width={S(170)} loaded={1} /></Animated.View>
          {route == null && (
            <View style={{ position: 'absolute', left: S(20), right: S(20), top: S(50), flexDirection: 'row', justifyContent: 'space-between' }}>
              {ROUTES.map((r, i) => (
                <Animated.View key={i} entering={ZoomIn.delay(i * 80)}>
                  <Panel w={250} h={150}>
                    <View style={{ flex: 1, alignItems: 'center', padding: S(10) }}>
                      <Text style={{ fontSize: S(15), fontWeight: '900', color: '#2B1B12' }}>{r.name}</Text>
                      <Text style={{ fontSize: S(12), fontWeight: '700', color: '#5E3A1A', marginTop: S(4) }}>{r.desc}</Text>
                      <Text style={{ fontSize: S(12), fontWeight: '900', color: '#0B6E4F', marginTop: S(4) }}>≈{Math.round(r.secs * 4)} min ride</Text>
                      <GameBtn label="Ride! 🛵" color="orange" w={150} h={42} size={16} testID={`ev-route-${i}`} onPress={() => ride(i)} style={{ marginTop: S(8) }} />
                    </View>
                  </Panel>
                </Animated.View>
              ))}
            </View>
          )}
        </>
      )}
      {phase === 'done' && route == null && null}
    </View>
  );
}

function Counter({ label, have, need, testID }: { label: string; have: number; need: number; testID?: string }) {
  const S = useS();
  const ok = have === need;
  return (
    <View testID={testID} style={{ marginRight: S(14), alignItems: 'center' }}>
      <Text style={{ fontSize: S(24), fontWeight: '900', color: ok ? '#2FA544' : have > need ? '#D7263D' : '#2B1B12' }}>{have}/{need}</Text>
      <Text style={{ fontSize: S(11), fontWeight: '800', color: '#5E3A1A' }}>{label}</Text>
    </View>
  );
}
