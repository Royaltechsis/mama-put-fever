import React from 'react';
import type { Cust, Plan } from '../Dining';
import { MENU } from '../data2';
import type { StaffId } from '../save2';
import { CANVAS_H, CHEF_X, DOOR_X, X_OF, Z_BACK, Z_SEAT, ZPX, kitchenZ, yToZ } from './geom';
import { GLCanvas } from './GLCanvas';
import { CUST_LOOKS, Person, STAFF_LOOKS, type Carry, type PoseOut } from './Person';
import { Room } from './Room';

/** the bits of a staff member's movement state that the 3D scene reads every frame */
export type StaffView = {
  x: number; y: number; fx: number; fy: number; tx: number; ty: number; t0: number; t1: number;
  phase: 'free' | 'moving' | 'working'; carry: string | null; act: string; moving: boolean;
};
export type CrewMember = { id: string; role: StaffId; n: number; rt: StaffView };

const FOOD: Record<string, string> = { jollof: '#D9531E', chicken: '#B5651D', egusi: '#6B8E23', eba: '#F2D16B', suya: '#8B3A1A', yaji: '#C0392B', dodo: '#E5A93A', puffpuff: '#D9A441' };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => v * v * (3 - 2 * v);

/** where a staff member is right now, interpolated every frame so walking is smooth */
export function staffPos(rt: StaffView, now: number) {
  if (rt.phase === 'moving' && rt.t1 > rt.t0) {
    const f = clamp01((now - rt.t0) / (rt.t1 - rt.t0));
    return { x: rt.fx + (rt.tx - rt.fx) * f, y: rt.fy + (rt.ty - rt.fy) * f };
  }
  return { x: rt.x, y: rt.y };
}

function carryKind(emoji: string | null): Carry {
  if (!emoji) return null;
  if (emoji === '🍽' || emoji === '🍗' || emoji === '🍢') return 'plate';
  if (emoji === '🥤') return 'cup';
  return 'item';
}

function Customer3D({ c, seat, plan, now }: { c: Cust; seat: number; plan: Plan; now: () => number }) {
  const look = CUST_LOOKS[c.who % CUST_LOOKS.length];
  const sx = X_OF(plan.seatX[seat]);
  const pose = (): PoseOut => {
    const t = now();
    const leaving = c.state === 'leaving' || c.state === 'left';
    if (c.state === 'dirty') return { x: sx, z: Z_SEAT, rotY: 0, mode: 'sit', visible: false };
    const mood = c.state === 'left' ? 'angry' : c.state === 'paid' ? 'happy' : c.state === 'waiting' ? 'wait' : undefined;
    if (leaving) {
      const dt = t - c.leftAt;
      if (dt < 0.35) return { x: sx, z: Z_SEAT + (Z_BACK - Z_SEAT) * ease(dt / 0.35), rotY: Math.PI, mode: 'walk', visible: true, mood };
      const f = clamp01((dt - 0.35) / 1.5);
      return { x: sx + (DOOR_X - sx) * f, z: Z_BACK, rotY: -Math.PI / 2, mode: 'walk', visible: f < 1, mood };
    }
    if (t < c.arrived) {
      const total = 1.6; const spawn = c.arrived - total; const settle = 0.35;
      const f = clamp01((t - spawn) / (total - settle));
      if (t < c.arrived - settle) return { x: DOOR_X + (sx - DOOR_X) * f, z: Z_BACK, rotY: Math.PI / 2, mode: 'walk', visible: true };
      const g = ease(clamp01((t - (c.arrived - settle)) / settle));
      return { x: sx, z: Z_BACK + (Z_SEAT - Z_BACK) * g, rotY: Math.PI / 2 * (1 - g), mode: 'walk', visible: true };
    }
    return { x: sx, z: Z_SEAT, rotY: 0, mode: 'sit', visible: true, eat: c.state === 'eating', mood };
  };
  const dish = c.items.find((it) => MENU[it.m].comps);
  const food = dish ? FOOD[MENU[dish.m].comps![0]] ?? '#D9531E' : '#C0392B';
  const onTable = c.state === 'eating' || c.state === 'dirty';
  return (
    <>
      <Person look={look} pose={pose} />
      {onTable && (
        <group position={[sx, 0.83, -0.2]}>
          {dish ? (<>
            <mesh castShadow><cylinderGeometry args={[0.24, 0.21, 0.03, 10]} /><meshStandardMaterial color="#F4F1EA" flatShading /></mesh>
            <mesh position={[0, 0.04, 0]} castShadow><sphereGeometry args={[0.14, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={c.state === 'dirty' ? '#9A7A5A' : food} flatShading /></mesh>
          </>) : (
            <mesh position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[0.07, 0.055, 0.2, 8]} /><meshStandardMaterial color={c.state === 'dirty' ? '#D8D0C0' : food} flatShading /></mesh>
          )}
        </group>
      )}
    </>
  );
}

function Staff3D({ m, now }: { m: CrewMember; now: () => number }) {
  const looks = STAFF_LOOKS[m.role];
  const look = looks[m.n % looks.length];
  const last = React.useRef(0);
  const pose = (): PoseOut => {
    const t = now();
    const { x, y } = staffPos(m.rt, t);
    const cook = m.role === 'cook';
    const X = cook ? CHEF_X : X_OF(x);
    const Z = cook ? kitchenZ(x) : yToZ(y);
    const moving = m.rt.moving || (m.rt.phase === 'moving' && m.rt.t1 > t);
    const dx = m.rt.tx - m.rt.fx; const dz = cook ? (m.rt.tx - m.rt.fx) * 0.0045 : yToZ(m.rt.ty) - yToZ(m.rt.fy);
    if (moving && (Math.abs(dx) > 0.5 || Math.abs(dz) > 0.01)) last.current = cook ? (dx > 0 ? 0.0 : Math.PI) : Math.atan2(dx / 56, dz);
    else if (!moving) last.current = cook ? -Math.PI / 2 : last.current;
    const carry = carryKind(m.rt.carry);
    return { x: X, z: Z, rotY: cook && moving ? (dx > 0 ? 0 : Math.PI) : last.current, mode: moving ? 'walk' : 'stand', visible: true, carry, busy: !moving && !!m.rt.act };
  };
  return <Person look={look} pose={pose} />;
}

export function World3D({ k, plan, custs, crew, chairTier, ankara, now, paused }: {
  k: number; plan: Plan; custs: (Cust | null)[]; crew: CrewMember[]; chairTier: number; ankara: boolean; now: () => number; paused: boolean;
}) {
  const nth: Record<string, number> = {};
  return (
    <GLCanvas width={844 * k} height={CANVAS_H * k} zoom={ZPX * k} paused={paused}>
      <color attach="background" args={[ankara ? '#2A1A12' : '#3A2418']} />
      <ambientLight intensity={1.9} color="#FFE9CF" />
      <hemisphereLight args={['#FFF1D6', '#9A6A44', 1.3]} />
      <directionalLight position={[-5, 12, 9]} intensity={2.4} color="#FFE3B8" />
      <directionalLight position={[8, 5, -9]} intensity={0.9} color="#FFD6A0" />
      <pointLight position={[-4.9, 3, -0.2]} intensity={14} distance={10} color="#FFB45A" />
      <pointLight position={[4.2, 3, -0.2]} intensity={14} distance={9} color="#FFB45A" />
      <Room plan={plan} chairTier={chairTier} ankara={ankara} />
      {custs.map((c, i) => c && <Customer3D key={c.id} c={c} seat={i} plan={plan} now={now} />)}
      {crew.map((m) => { nth[m.role] = (nth[m.role] ?? -1) + 1; return <Staff3D key={m.id} m={{ ...m, n: nth[m.role] }} now={now} />; })}
    </GLCanvas>
  );
}
