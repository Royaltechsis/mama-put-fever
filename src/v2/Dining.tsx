import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { Easing, FadeOut, ZoomIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Draggable, DropZone, type Payload } from '../dnd';
import { SPR } from './assets';
import { MENU, type MenuId } from './data2';
import { PlateView } from './PlateView';
import { ROLE_INFO, type StaffId } from './save2';
import { Abs, useK, useS } from './stage';
import { X_OF, Z_SEAT, proj } from './world3d/geom';

export { AISLE_Y, CANVAS_H, KL, LANE } from './world3d/geom';
export const WALK_IN = 1.6; // seconds a customer takes to walk to their seat
const SEAT_DX = 40;
const T2_W = 112;
const T1_W = 64;

export type Table = { cx: number; w: number; seats: number[] };
export type Plan = { tables: Table[]; seatX: number[]; seatTable: number[]; aisles: number[]; bubbleLeft: boolean[] };

/** two seats per table side by side, so 3 seats = 2 tables, 6 seats = 3 tables. x values are stage px (the 3D room maps them to metres) */
export function planFor(seats: number): Plan {
  const nT = Math.ceil(seats / 2);
  const cxs = nT === 1 ? [372] : nT === 2 ? [200, 500] : [118, 372, 626];
  const tables: Table[] = []; const seatX: number[] = []; const seatTable: number[] = []; const bubbleLeft: boolean[] = [];
  for (let t = 0; t < nT; t++) {
    const mine = [t * 2, t * 2 + 1].filter((i) => i < seats);
    tables.push({ cx: cxs[t], w: mine.length === 2 ? T2_W : T1_W, seats: mine });
    mine.forEach((i, k) => {
      seatX[i] = mine.length === 2 ? cxs[t] + (k === 0 ? -SEAT_DX : SEAT_DX) : cxs[t];
      seatTable[i] = t;
      bubbleLeft[i] = mine.length === 2 ? k === 0 : false;
    });
  }
  const aisles = [Math.max(30, cxs[0] - tables[0].w / 2 - 40)];
  for (let t = 0; t < nT - 1; t++) aisles.push((cxs[t] + tables[t].w / 2 + cxs[t + 1] - tables[t + 1].w / 2) / 2);
  aisles.push(cxs[nT - 1] + tables[nT - 1].w / 2 + 40);
  return { tables, seatX, seatTable, aisles, bubbleLeft };
}

export type Cust = {
  id: number; who: number; items: { m: MenuId; done: boolean; q?: number }[]; arrived: number; patience: number; // 0..1
  state: 'waiting' | 'eating' | 'paid' | 'leaving' | 'dirty' | 'left'; coins: number; tip: number; leftAt: number; eatUntil: number; q: number; stars: number;
};

export function useShake(n: number) {
  const x = useSharedValue(0);
  useEffect(() => { if (n) x.value = withSequence(withTiming(-6, { duration: 50 }), withTiming(6, { duration: 50 }), withTiming(-4, { duration: 50 }), withTiming(0, { duration: 50 })); }, [n]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}

/** where a seat's head and table spot land on the stage */
export function seatSpots(seatStageX: number) {
  const X = X_OF(seatStageX);
  return { head: proj(X, 1.55, Z_SEAT), plate: proj(X, 0.86, -0.2) };
}

/** the 2D layer over a seat: drop target, order bubble, coins to collect and the dirty plate to clear. The person, chair and table are 3D. */
export function DinerOverlay({ c, cx, t, idx, shakeN, bubbleLeft, onDrop, onCollect, onClear }: {
  c: Cust; cx: number; t: number; idx: number; shakeN: number; bubbleLeft: boolean;
  onDrop: (p: Payload) => void; onCollect: () => void; onClear: () => void;
}) {
  const S = useS();
  const sh = useShake(shakeN);
  const { head, plate } = seatSpots(cx);
  const seated = (c.state === 'waiting' || c.state === 'eating' || c.state === 'paid') && t >= c.arrived;
  const waiting = c.state === 'waiting' && seated;
  const mood = c.state === 'left' ? '😤' : c.state === 'paid' || c.state === 'eating' ? '😍' : c.patience > 0.6 ? '' : c.patience > 0.3 ? '😐' : '😠';
  const barColor = c.patience > 0.6 ? '#7BE36A' : c.patience > 0.3 ? '#FFC93C' : '#FF5A4A';
  const BW = 52;
  const bx = bubbleLeft ? head.x - 44 - BW : head.x + 44;
  return (
    <>
      <Abs x={head.x - 36} y={head.y - 26} w={72} h={104} style={{ zIndex: 260 }}>
        <DropZone id={`cust-${idx}`} testID={`cust-${idx}`} accepts={(p) => waiting && (p.kind === 'plate' || p.kind === 'cup' || p.kind === 'grill' || p.kind === 'fryer')} onDrop={onDrop}
          style={{ flex: 1, borderRadius: S(20), borderWidth: S(2), borderColor: 'transparent' }} hoverStyle={{ borderColor: '#7BE36A', backgroundColor: '#7BE36A22' }}>
          <Animated.View style={[{ flex: 1 }, sh]} />
        </DropZone>
      </Abs>
      {waiting && (
        <Animated.View entering={ZoomIn.delay(150)} pointerEvents="none" style={{ position: 'absolute', left: S(bx), top: S(head.y - 46), alignItems: 'center', zIndex: 300 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: S(12), padding: S(4), borderWidth: S(2), borderColor: '#5E3A1A', minWidth: S(BW - 8) }}>
            {c.items.map((it, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', opacity: it.done ? 0.35 : 1 }}>
                {MENU[it.m].drink ? <Image source={SPR.props[MENU[it.m].drink!]} style={{ width: S(24), height: S(28) }} resizeMode="contain" /> : <PlateView comps={MENU[it.m].comps!} w={40} />}
                {it.done && <Text style={{ fontSize: S(12), color: '#2FA544', fontWeight: '900' }}>✓</Text>}
              </View>
            ))}
          </View>
          <View style={{ marginTop: S(3), width: S(46), height: S(8), backgroundColor: '#0007', borderRadius: S(4), overflow: 'hidden', borderWidth: S(1), borderColor: '#FFF' }}>
            <View style={{ width: `${c.patience * 100}%`, height: '100%', backgroundColor: barColor }} />
          </View>
          {mood ? <Text style={{ fontSize: S(15), marginTop: S(1) }}>{mood}</Text> : null}
        </Animated.View>
      )}
      {c.state === 'dirty' && (
        <Abs x={plate.x - 28} y={plate.y - 20} w={56} h={34} style={{ zIndex: 270 }}>
          <Draggable payload={{ kind: 'src', id: 'dirty' }} enabled={false} onTap={onClear} testID={`dirty-${idx}`} style={{ flex: 1 }}>
            <View style={{ flex: 1 }} />
          </Draggable>
        </Abs>
      )}
      {c.state === 'paid' && (
        <Abs x={plate.x - 30} y={plate.y - 56} w={60} h={50} style={{ zIndex: 270 }}>
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
export function ReviewChip({ x, y, stars, text }: { x: number; y: number; stars: number; text: string }) {
  const S = useS();
  const col = stars >= 4 ? '#2FA544' : stars === 3 ? '#C98A1B' : '#D7263D';
  return (
    <Animated.View entering={ZoomIn.duration(180)} exiting={FadeOut.duration(400)} pointerEvents="none" style={{ position: 'absolute', left: S(x - 62), top: S(y), width: S(124), zIndex: 320 }}>
      <View style={{ backgroundColor: '#FFFFFFF2', borderRadius: S(9), paddingHorizontal: S(5), paddingVertical: S(2), borderWidth: S(1.5), borderColor: col, alignItems: 'center' }}>
        <Text style={{ color: col, fontWeight: '900', fontSize: S(10) }}>{'★'.repeat(stars) + '☆'.repeat(5 - stars)}</Text>
        <Text style={{ color: '#3A2416', fontWeight: '700', fontSize: S(8.5), textAlign: 'center' }} numberOfLines={2}>{text}</Text>
      </View>
    </Animated.View>
  );
}

/** a floating name tag that follows a staff member's head; position is tweened between the 10 Hz game ticks */
export function StaffTag({ role, name, lv, energy, act, x, y }: { role: StaffId; name: string; lv: number; energy: number; act: string; x: number; y: number }) {
  const S = useS();
  const k = useK();
  const ax = useSharedValue(x);
  const ay = useSharedValue(y);
  useEffect(() => {
    ax.value = withTiming(x, { duration: 120, easing: Easing.linear });
    ay.value = withTiming(y, { duration: 120, easing: Easing.linear });
  }, [x, y]);
  const pos = useAnimatedStyle(() => ({ left: (ax.value - 34) * k, top: ay.value * k }));
  const info = ROLE_INFO[role];
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: S(68), alignItems: 'center', zIndex: 310 }, pos]}>
      {act ? <Text style={{ fontSize: S(14), marginBottom: S(-2) }}>{act}</Text> : null}
      <View style={{ backgroundColor: info.color, borderRadius: S(5), paddingHorizontal: S(4) }}>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(7.5) }}>{name}{lv > 1 ? ` Lv${lv}` : ''}</Text>
      </View>
      <View style={{ marginTop: S(1), width: S(30), height: S(3), backgroundColor: '#0008', borderRadius: S(2), overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(0, Math.min(1, energy)) * 100}%`, height: '100%', backgroundColor: energy > 0.8 ? '#7BE36A' : energy > 0.65 ? '#FFC93C' : '#FF8A7A' }} />
      </View>
    </Animated.View>
  );
}
