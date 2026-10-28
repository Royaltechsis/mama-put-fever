import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { Easing, FadeOut, ZoomIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle as SCircle, Ellipse as SEllipse, Path as SPath, Rect as SRect } from 'react-native-svg';
import { Draggable, DropZone, type Payload } from '../dnd';
import { SPR } from './assets';
import { MENU, type MenuId } from './data2';
import { PlateView } from './PlateView';
import { STAFF, type StaffId } from './save2';
import { Abs, useK, useS } from './stage';

// ---- floor plan (stage units) ----
export const BL = 100; // back lane: staff feet y when walking behind the tables
export const FL = 128; // aisle spot beside a table where staff serve and clear
export const KL = 176; // kitchen lane on the counter top
export const TABLE_W = 92;
export const DOOR_X = 884;
export const WALK_IN = 1.5; // seconds a customer takes to walk to their table

export function tablesFor(seats: number): number[] {
  return ({ 3: [200, 422, 644], 4: [150, 330, 510, 690], 5: [104, 268, 432, 596, 760] } as Record<number, number[]>)[seats] ?? [150, 330, 510, 690];
}
/** walkable gaps: one to the left of the first table, one between each pair, one to the right of the last */
export function aislesFor(cx: number[]): number[] {
  const a = [Math.max(34, cx[0] - TABLE_W / 2 - 34)];
  for (let i = 0; i < cx.length - 1; i++) a.push((cx[i] + cx[i + 1]) / 2);
  a.push(Math.min(812, cx[cx.length - 1] + TABLE_W / 2 + 34));
  return a;
}
export const nearestAisle = (ais: number[], x: number) => ais.reduce((b, v, i) => (Math.abs(v - x) < Math.abs(ais[b] - x) ? i : b), 0);

export type Cust = {
  id: number; who: number; items: { m: MenuId; done: boolean; q?: number }[]; arrived: number; patience: number; // 0..1
  state: 'waiting' | 'eating' | 'paid' | 'leaving' | 'dirty' | 'left'; coins: number; tip: number; leftAt: number; eatUntil: number; q: number; stars: number;
};

export function useShake(n: number) {
  const x = useSharedValue(0);
  useEffect(() => { if (n) x.value = withSequence(withTiming(-6, { duration: 50 }), withTiming(6, { duration: 50 }), withTiming(-4, { duration: 50 }), withTiming(0, { duration: 50 })); }, [n]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}

// ---- furniture ----
const CHAIRS: [string, string][] = [['#E23B2E', '#B32418'], ['#9A6232', '#6E4220'], ['#7A4A28', '#5A341A']];
function ChairArt({ tier, w, h }: { tier: number; w: number; h: number }) {
  const S = useS();
  const colors = CHAIRS[tier] ?? CHAIRS[0];
  return (
    <Svg width={S(w)} height={S(h)} viewBox="0 0 104 124">
      {tier === 0 && (<>
        <SRect x={10} y={8} width={84} height={70} rx={22} fill={colors[0]} />
        <SRect x={10} y={8} width={84} height={14} rx={7} fill="#FF6A5A" opacity={0.6} />
        {[28, 44, 60, 76].map((xx) => <SRect key={xx} x={xx - 4} y={30} width={8} height={34} rx={4} fill={colors[1]} />)}
        <SRect x={14} y={74} width={10} height={50} rx={4} fill={colors[1]} /><SRect x={80} y={74} width={10} height={50} rx={4} fill={colors[1]} />
      </>)}
      {tier === 1 && (<>
        <SRect x={12} y={4} width={12} height={120} rx={3} fill={colors[1]} /><SRect x={80} y={4} width={12} height={120} rx={3} fill={colors[1]} />
        {[12, 34, 56].map((yy) => <SRect key={yy} x={12} y={yy} width={80} height={14} rx={3} fill={colors[0]} />)}
      </>)}
      {tier === 2 && (<>
        <SRect x={8} y={2} width={88} height={84} rx={16} fill={colors[1]} />
        <SRect x={16} y={10} width={72} height={68} rx={14} fill="#C8283A" />
        {[30, 52, 74].map((xx) => <SCircle key={xx} cx={xx} cy={44} r={3} fill="#8E1424" />)}
        <SRect x={14} y={84} width={10} height={40} rx={3} fill={colors[1]} /><SRect x={80} y={84} width={10} height={40} rx={3} fill={colors[1]} />
      </>)}
    </Svg>
  );
}

/** chair behind the diner and the table in front of them: the diner's torso is hidden by the tabletop */
export function TableSet({ cx, tier }: { cx: number; tier: number }) {
  const S = useS();
  return (
    <>
      <Abs x={cx - 40} y={52} w={80} h={96} pointerEvents="none" style={{ zIndex: 205 }}><ChairArt tier={tier} w={80} h={96} /></Abs>
      <Abs x={cx - TABLE_W / 2} y={100} w={TABLE_W} h={36} pointerEvents="none" style={{ zIndex: 234 }}>
        <Svg width={S(TABLE_W)} height={S(36)} viewBox="0 0 92 36">
          <SRect x={10} y={18} width={6} height={18} rx={2} fill="#6E4220" />
          <SRect x={76} y={18} width={6} height={18} rx={2} fill="#6E4220" />
          <SRect x={2} y={11} width={88} height={9} rx={3} fill="#A8692F" />
          <SRect x={2} y={0} width={88} height={15} rx={7} fill="#D9A15E" stroke="#8A5426" strokeWidth={1.5} />
          <SRect x={10} y={2.5} width={72} height={4} rx={2} fill="#FFFFFF" opacity={0.28} />
          <SRect x={6} y={8} width={80} height={1.2} fill="#8A5426" opacity={0.35} />
        </Svg>
      </Abs>
    </>
  );
}

export function DirtyPlate({ w = 74 }: { w?: number }) {
  const S = useS();
  return (
    <Svg width={S(w)} height={S(w * 0.54)} viewBox="0 0 74 40">
      <SEllipse cx={37} cy={24} rx={34} ry={14} fill="#00000033" />
      <SEllipse cx={37} cy={20} rx={33} ry={14} fill="#F4F1EA" stroke="#C9C2B2" strokeWidth={1.5} />
      <SEllipse cx={37} cy={20} rx={22} ry={9} fill="#E9E3D6" />
      <SPath d="M 22 18 q 8 -6 16 0 q 6 4 12 -2" stroke="#C8501E" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.75} />
      <SCircle cx={46} cy={23} r={2.5} fill="#B5651D" /><SCircle cx={28} cy={24} r={2} fill="#7A9A3A" />
      <SRect x={50} y={4} width={4} height={18} rx={2} fill="#B8BEC6" transform="rotate(35 52 13)" />
    </Svg>
  );
}

// ---- customers ----
/** a customer seated at table `idx`: walks in from the door, orders, eats at the table, pays and walks out */
export function DinerView({ c, cx, t, sc, idx, tier, shakeN, bubbleLeft, onDrop, onCollect, onClear }: {
  c: Cust; cx: number; t: number; sc: number; idx: number; tier: number; shakeN: number; bubbleLeft: boolean;
  onDrop: (p: Payload) => void; onCollect: () => void; onClear: () => void;
}) {
  const S = useS();
  const k = useK();
  const tx = useSharedValue(DOOR_X - cx);
  const bob = useSharedValue(0);
  const sh = useShake(shakeN);
  const leaving = c.state === 'leaving' || c.state === 'left';
  const walking = t < c.arrived || leaving;
  useEffect(() => { tx.value = withTiming(0, { duration: WALK_IN * 1000, easing: Easing.out(Easing.quad) }); }, []);
  useEffect(() => { if (leaving) tx.value = withTiming(DOOR_X - cx + 60, { duration: 1500, easing: Easing.in(Easing.quad) }); }, [leaving]);
  useEffect(() => {
    const d = walking ? 170 : 700; const a = walking ? -5 : -2;
    bob.value = withRepeat(withSequence(withTiming(a, { duration: d, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: d, easing: Easing.inOut(Easing.quad) })), -1);
  }, [walking]);
  const moveSt = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value * k }] }));
  const bobSt = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value * k }] }));
  const sw = 120 * sc; const shh = 150 * sc;
  const waiting = c.state === 'waiting' && t >= c.arrived;
  const mood = c.state === 'left' ? '😤' : c.state === 'paid' || c.state === 'eating' ? '😍' : c.patience > 0.6 ? '' : c.patience > 0.3 ? '😐' : '😠';
  const barColor = c.patience > 0.6 ? '#7BE36A' : c.patience > 0.3 ? '#FFC93C' : '#FF5A4A';
  const BW = 60;
  const bx = bubbleLeft ? cx - 38 - BW : cx + 38;
  const food = c.items.find((it) => MENU[it.m].comps);
  return (
    <>
      {c.state !== 'dirty' && (
        <Animated.View style={[{ position: 'absolute', left: S(cx - sw / 2), top: S(42), width: S(sw), height: S(66), overflow: 'hidden', zIndex: 215, opacity: leaving ? 0.85 : 1 }, moveSt]}>
          <Animated.View style={[bobSt, sh]}>
            <Image source={SPR.cust[c.who]} style={{ width: S(sw), height: S(shh) }} resizeMode="contain" />
          </Animated.View>
        </Animated.View>
      )}
      <Abs x={cx - 52} y={44} w={104} h={90} style={{ zIndex: 260 }}>
        <DropZone id={`cust-${idx}`} testID={`cust-${idx}`} accepts={(p) => waiting && (p.kind === 'plate' || p.kind === 'cup' || p.kind === 'grill' || p.kind === 'fryer')} onDrop={onDrop}
          style={{ flex: 1, borderRadius: S(20), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#7BE36A', backgroundColor: '#7BE36A22' }}>
          <View style={{ flex: 1 }} />
        </DropZone>
      </Abs>
      {waiting && (
        <Animated.View entering={ZoomIn.delay(150)} pointerEvents="none" style={{ position: 'absolute', left: S(bx), top: S(44), alignItems: 'center', zIndex: 300 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: S(12), padding: S(4), borderWidth: S(2), borderColor: '#5E3A1A', minWidth: S(BW - 6) }}>
            {c.items.map((it, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', opacity: it.done ? 0.35 : 1 }}>
                {MENU[it.m].drink ? <Image source={SPR.props[MENU[it.m].drink!]} style={{ width: S(28), height: S(32) }} resizeMode="contain" /> : <PlateView comps={MENU[it.m].comps!} w={46} />}
                {it.done && <Text style={{ fontSize: S(12), color: '#2FA544', fontWeight: '900' }}>✓</Text>}
              </View>
            ))}
          </View>
          <View style={{ marginTop: S(3), width: S(52), height: S(8), backgroundColor: '#0007', borderRadius: S(4), overflow: 'hidden', borderWidth: S(1), borderColor: '#FFF' }}>
            <View style={{ width: `${c.patience * 100}%`, height: '100%', backgroundColor: barColor }} />
          </View>
          {mood ? <Text style={{ fontSize: S(15), marginTop: S(1) }}>{mood}</Text> : null}
        </Animated.View>
      )}
      {c.state === 'eating' && (
        <Abs x={cx - 22} y={86} w={46} h={34} pointerEvents="none" style={{ zIndex: 240 }}>
          <View style={{ alignItems: 'center' }}>
            {food ? <PlateView comps={MENU[food.m].comps!} w={46} /> : <Image source={SPR.props[MENU[c.items[0].m].drink!]} style={{ width: S(24), height: S(30) }} resizeMode="contain" />}
            <Text style={{ position: 'absolute', top: S(-14 - 4 * Math.abs(Math.sin(t * 8))), right: S(4), fontSize: S(14) }}>🥄</Text>
          </View>
        </Abs>
      )}
      {c.state === 'dirty' && (
        <Abs x={cx - 26} y={88} w={52} h={32} style={{ zIndex: 270 }}>
          <Draggable payload={{ kind: 'src', id: 'dirty' }} enabled={false} onTap={onClear} testID={`dirty-${idx}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <DirtyPlate w={52} />
          </Draggable>
        </Abs>
      )}
      {c.state === 'paid' && (
        <Abs x={cx - 30} y={64} w={60} h={50} style={{ zIndex: 270 }}>
          <Draggable payload={{ kind: 'src', id: 'coins' }} enabled={false} onTap={onCollect} testID={`coins-${idx}`} style={{ flex: 1, alignItems: 'center' }}>
            <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
              <Image source={SPR.props.coins} style={{ width: S(46), height: S(32) }} resizeMode="contain" />
              <View style={{ backgroundColor: '#2B1B12CC', borderRadius: S(8), paddingHorizontal: S(5), marginTop: S(-6) }}><Text style={{ color: '#FFC93C', fontWeight: '900', fontSize: S(10) }}>₦{(c.coins + c.tip).toLocaleString('en-US')}</Text></View>
            </Animated.View>
          </Draggable>
        </Abs>
      )}
    </>
  );
}

/** a short speech chip over a table after the customer's verdict */
export function ReviewChip({ x, stars, text }: { x: number; stars: number; text: string }) {
  const S = useS();
  const col = stars >= 4 ? '#2FA544' : stars === 3 ? '#C98A1B' : '#D7263D';
  return (
    <Animated.View entering={ZoomIn.duration(180)} exiting={FadeOut.duration(400)} pointerEvents="none" style={{ position: 'absolute', left: S(x - 62), top: S(36), width: S(124), zIndex: 320 }}>
      <View style={{ backgroundColor: '#FFFFFFF2', borderRadius: S(9), paddingHorizontal: S(5), paddingVertical: S(2), borderWidth: S(1.5), borderColor: col, alignItems: 'center' }}>
        <Text style={{ color: col, fontWeight: '900', fontSize: S(10) }}>{'★'.repeat(stars) + '☆'.repeat(5 - stars)}</Text>
        <Text style={{ color: '#3A2416', fontWeight: '700', fontSize: S(8.5), textAlign: 'center' }} numberOfLines={2}>{text}</Text>
      </View>
    </Animated.View>
  );
}

// ---- staff ----
const STAFF_LABEL: Record<StaffId, string> = { cook: 'Cook', waiter: 'Waiter', cleaner: 'Cleaner' };
export function StaffSprite({ id, x, y, face, moving, carry, act, energy, lv }: { id: StaffId; x: number; y: number; face: 1 | -1; moving: boolean; carry: string | null; act: string; energy: number; lv: number }) {
  const S = useS();
  const k = useK();
  const ax = useSharedValue(x);
  const ay = useSharedValue(y);
  const bob = useSharedValue(0);
  useEffect(() => {
    ax.value = withTiming(x, { duration: 120, easing: Easing.linear });
    ay.value = withTiming(y, { duration: 120, easing: Easing.linear });
  }, [x, y]);
  useEffect(() => {
    bob.value = moving
      ? withRepeat(withSequence(withTiming(-4, { duration: 150, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) })), -1)
      : withTiming(0, { duration: 120 });
  }, [moving]);
  const pos = useAnimatedStyle(() => ({ left: (ax.value - 30) * k, top: (ay.value - 66) * k, zIndex: Math.round(100 + ay.value) }));
  const body = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value * k }, { scaleX: face }, { rotate: moving ? `${bob.value * -0.6}deg` : '0deg' }] }));
  const info = STAFF[id];
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: S(60), height: S(66), alignItems: 'center' }, pos]}>
      <Animated.View style={body}><Image source={SPR.staff[id]} style={{ width: S(60), height: S(62) }} resizeMode="contain" /></Animated.View>
      <View style={{ position: 'absolute', bottom: S(-2), backgroundColor: info.color, borderRadius: S(5), paddingHorizontal: S(4), flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(7.5) }}>{STAFF_LABEL[id]} {lv > 1 ? `Lv${lv}` : ''}</Text>
      </View>
      <View style={{ position: 'absolute', bottom: S(-7), width: S(34), height: S(3), backgroundColor: '#0008', borderRadius: S(2), overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(0, Math.min(1, energy)) * 100}%`, height: '100%', backgroundColor: energy > 0.8 ? '#7BE36A' : energy > 0.65 ? '#FFC93C' : '#FF8A7A' }} />
      </View>
      {carry ? <Text style={{ position: 'absolute', right: S(-6), top: S(14), fontSize: S(18) }}>{carry}</Text> : null}
      {act ? <Text style={{ position: 'absolute', top: S(-12), left: S(2), fontSize: S(15) }}>{act}</Text> : null}
    </Animated.View>
  );
}
