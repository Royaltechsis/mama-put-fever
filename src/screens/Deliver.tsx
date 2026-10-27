import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';
import { CUSTOMERS, DISHES } from '../data';
import { Draggable, DropZone, type Payload } from '../dnd';
import { GhanaBag, Okada, Road, Customer } from '../art/Scenes';
import { Hud, Toasts, useNow, useToasts } from '../ui';
import { C, shadow } from '../theme';
import { play, haptic } from '../fx';
import { timeLeft, type Run } from '../game';

type Route = { name: string; secs: number; jam: boolean; desc: string };

export default function Deliver({ run, coins, onRide, onDone, onQuit }: {
  run: Run; coins: number; onRide: () => void; onDone: (secs: number, note: string) => void; onQuit: () => void;
}) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, 480);
  const now = useNow(250);
  const orders = run.level.orders;
  const [loaded, setLoaded] = useState<boolean[]>(() => orders.map(() => false));
  const [route, setRoute] = useState<Route | null>(null);
  const [stage, setStage] = useState<'load' | 'route' | 'ride1' | 'light' | 'ride2' | 'arrived'>('load');
  const [green, setGreen] = useState(false);
  const extra = useRef(0);
  const note = useRef('');
  const { toasts, push } = useToasts();
  const x = useSharedValue(0);
  const sceneH = 210;
  const bikeW = 168;

  const routes = useMemo<Route[]>(() => {
    const jam = (run.levelIdx * 5 + 1) % 3;
    const base: Route[] = [
      { name: 'Express road', secs: 5, jam: false, desc: 'Fastest when clear' },
      { name: 'Back streets', secs: 8, jam: false, desc: 'Bumpy but steady' },
      { name: 'Main road', secs: 11, jam: false, desc: 'Long way round' },
    ];
    base[jam] = { ...base[jam], jam: true, secs: base[jam].secs + 10, desc: 'Go-slow reported! 🚧' };
    return base;
  }, []);

  function load(p: Payload) {
    if (p.kind !== 'parcel') return;
    play('pop'); haptic.drop();
    const next = loaded.map((v, i) => (i === p.idx ? true : v));
    setLoaded(next);
    if (next.every(Boolean)) {
      push('All loaded! Pick a route', 'good');
      setTimeout(() => setStage('route'), 400);
    }
  }

  function go(r: Route) {
    setRoute(r);
    onRide();
    play('horn');
    setStage('ride1');
    x.value = withTiming(W * 0.38, { duration: 1400, easing: Easing.out(Easing.quad) });
    setTimeout(() => setStage('light'), 1450);
  }

  // traffic light cycle
  useEffect(() => {
    if (stage !== 'light') return;
    let g = false;
    setGreen(false);
    const tick = setInterval(() => { g = !g; setGreen(g); }, 900);
    const auto = setTimeout(() => finishLight(null), 5000);
    return () => { clearInterval(tick); clearTimeout(auto); };
  }, [stage]);

  const lightDone = useRef(false);
  function finishLight(tapGreen: boolean | null) {
    if (lightDone.current) return;
    lightDone.current = true;
    if (tapGreen === true) { extra.current = -3; note.current = 'Sharp sharp at the junction (−3s)'; push('Sharp sharp! −3s', 'good'); play('ding'); haptic.good(); }
    else if (tapGreen === false) { extra.current = 4; note.current = 'Jumped the red light (+4s)'; push('Wahala! Red light +4s', 'bad'); play('bad'); haptic.bad(); }
    else { extra.current = 3; note.current = 'Waited too long at the junction (+3s)'; push('Too slow at the junction +3s', 'bad'); }
    setStage('ride2');
    x.value = withTiming(W - bikeW - 10, { duration: 1200, easing: Easing.in(Easing.quad) });
    setTimeout(() => { setStage('arrived'); play('cash'); }, 1300);
  }

  useEffect(() => {
    if (stage !== 'arrived' || !route) return;
    const t = setTimeout(() => onDone(route.secs + extra.current, `${route.name}: ${route.secs}s${route.jam ? ' (go-slow!)' : ''}. ${note.current}`), 1500);
    return () => clearTimeout(t);
  }, [stage]);

  const bikeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const cust = CUSTOMERS[orders[0].customer];

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Hud title={`Lvl ${run.levelIdx + 1} · ${run.level.title}`} timeLeft={timeLeft(run, now)} total={run.level.time} coins={coins} onQuit={onQuit} />
      <View style={s.top}>
        <Text style={s.phaseTag}>3 DELIVER</Text>
        <Text style={s.topText}>{stage === 'load' ? 'Drag the bags onto the okada' : stage === 'route' ? 'Choose the fastest route' : stage === 'light' ? 'Tap GO when the light is green!' : stage === 'arrived' ? 'Delivered!' : 'On the way…'}</Text>
      </View>
      <View style={{ height: sceneH, overflow: 'hidden' }}>
        <Road width={W} height={sceneH} />
        {(stage === 'light' || stage === 'ride2' || stage === 'ride1') && (
          <View style={[s.light, { left: W * 0.38 + bikeW - 6 }]}>
            <Svg width={22} height={52}>
              <Rect x={1} y={1} width={20} height={50} rx={6} fill="#2B1B12" />
              <Circle cx={11} cy={14} r={7} fill={stage === 'light' && !green ? '#FF3B30' : '#5A2A2A'} />
              <Circle cx={11} cy={36} r={7} fill={stage === 'light' && green ? '#34C759' : stage === 'ride2' ? '#34C759' : '#1F4A2A'} />
            </Svg>
          </View>
        )}
        {stage === 'arrived' && (
          <Animated.View entering={ZoomIn} style={s.custBubble}>
            <Customer skin={cust.skin} wrap={cust.wrap} female={cust.female} size={58} mood="happy" />
            <Text style={s.custText}>Food don land! 🙌</Text>
          </Animated.View>
        )}
        <Animated.View style={[s.bike, { top: sceneH * 0.6 - bikeW * 0.42 }, bikeStyle]}>
          <DropZone id="okada" testID="okada" accepts={(p) => p.kind === 'parcel'} onDrop={load} style={s.bikeZone}>
            <Okada width={bikeW} loaded={loaded.filter(Boolean).length / loaded.length} />
          </DropZone>
        </Animated.View>
      </View>

      {stage === 'load' && (
        <View style={s.parcels}>
          {orders.map((o, i) => !loaded[i] && (
            <Draggable key={i} payload={{ kind: 'parcel', idx: i }} ghost={<GhanaBag width={90} fullness={1} sealed />} testID={`parcel-${i}`}>
              <View style={s.parcel}>
                <GhanaBag width={110} fullness={1} sealed />
                <Text style={s.parcelText}>{CUSTOMERS[o.customer].name}</Text>
                <Text style={s.parcelSub}>{DISHES[o.dish].short} ×{o.people}</Text>
              </View>
            </Draggable>
          ))}
        </View>
      )}

      {stage === 'route' && (
        <Animated.View entering={FadeInUp} style={s.routes}>
          {routes.map((r, i) => (
            <Pressable key={r.name} onPress={() => go(r)} style={({ pressed }) => [s.route, r.jam && s.routeJam, pressed && { transform: [{ scale: 0.97 }] }]} testID={`route-${i}`}>
              <Text style={s.routeIcon}>{['🛣️', '🏘️', '🛤️'][i]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.routeName}>{r.name}</Text>
                <Text style={[s.routeDesc, r.jam && { color: C.red }]}>{r.desc}</Text>
              </View>
              <Text style={[s.routeSecs, r.jam && { color: C.red }]}>{r.jam ? `${r.secs - 10}s + jam` : `${r.secs}s`}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {stage === 'light' && (
        <Animated.View entering={FadeIn} style={s.goWrap}>
          <Pressable onPress={() => finishLight(green)} style={({ pressed }) => [s.go, { backgroundColor: green ? C.green : C.red, transform: [{ scale: pressed ? 0.95 : 1 }] }]} testID="go">
            <Text style={s.goText}>{green ? 'GO! 🏍️' : 'Wait…'}</Text>
          </Pressable>
          <Text style={s.goHint}>Green = −3s · Red = +4s</Text>
        </Animated.View>
      )}
      {(stage === 'ride1' || stage === 'ride2' || stage === 'arrived') && route && (
        <View style={s.goWrap}>
          <View style={s.track}>
            <Text style={{ fontSize: 26 }}>🏪</Text>
            <View style={s.trackLine}>
              <View style={[s.trackFill, { width: stage === 'ride1' ? '40%' : '100%' }]} />
            </View>
            <Text style={{ fontSize: 26 }}>{stage === 'arrived' ? '🎉' : '🏠'}</Text>
          </View>
          <Text style={s.rideText}>{stage === 'arrived' ? `Delivered to ${cust.name}!` : `${route.name} · ${route.secs}s${route.jam ? ' (stuck in go-slow 😩)' : ''}`}</Text>
        </View>
      )}
      <Toasts toasts={toasts} />
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#FCE8C4', gap: 8 },
  phaseTag: { backgroundColor: C.teal, color: '#FFF', fontWeight: '900', fontSize: 11, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  topText: { fontWeight: '800', color: C.ink, fontSize: 13, flex: 1 },
  bike: { position: 'absolute', left: 8 },
  bikeZone: { borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  light: { position: 'absolute', top: 40 },
  custBubble: { position: 'absolute', right: 10, top: 8, backgroundColor: '#FFF', borderRadius: 16, padding: 6, alignItems: 'center', ...shadow },
  custText: { fontWeight: '900', color: C.ink, fontSize: 12 },
  parcels: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14, backgroundColor: C.woodLight, borderTopWidth: 5, borderTopColor: C.woodDark },
  parcel: { alignItems: 'center', backgroundColor: '#FFF4E0', padding: 8, borderRadius: 16, ...shadow },
  parcelText: { fontWeight: '900', color: C.ink, fontSize: 13 },
  parcelSub: { fontWeight: '700', color: C.inkSoft, fontSize: 11 },
  routes: { flex: 1, padding: 10, gap: 8 },
  route: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 12, borderWidth: 2, borderColor: '#EBD9BC', ...shadow },
  routeJam: { borderColor: '#F5B7B1', backgroundColor: '#FFF4F2' },
  routeIcon: { fontSize: 26, marginRight: 10 },
  routeName: { fontWeight: '900', fontSize: 16, color: C.ink },
  routeDesc: { fontWeight: '700', fontSize: 12, color: C.inkSoft },
  routeSecs: { fontWeight: '900', fontSize: 16, color: C.green },
  goWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  go: { width: 170, height: 170, borderRadius: 85, alignItems: 'center', justifyContent: 'center', ...shadow },
  goText: { color: '#FFF', fontWeight: '900', fontSize: 28 },
  goHint: { marginTop: 10, fontWeight: '800', color: C.inkSoft },
  track: { flexDirection: 'row', alignItems: 'center', width: '80%', marginBottom: 14 },
  trackLine: { flex: 1, height: 10, backgroundColor: '#EADBC4', borderRadius: 5, marginHorizontal: 8, overflow: 'hidden' },
  trackFill: { height: 10, backgroundColor: C.green, borderRadius: 5 },
  rideText: { fontWeight: '900', color: C.ink, fontSize: 15, textAlign: 'center', paddingHorizontal: 16 },
});
