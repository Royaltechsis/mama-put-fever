import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

export type HairStyle = 'none' | 'short' | 'afro' | 'braids' | 'bun' | 'wrap' | 'cap' | 'fila';
export type Look = {
  female?: boolean; // picks the female body when imported models are used
  skin: string; hair: string; hairStyle: HairStyle; hat?: string; top: string; bottom: string;
  h?: number; build?: number; // height and width scale around 1
  long?: boolean; // long sleeves
  dress?: boolean; // wide-leg wrapper instead of trousers
  robe?: boolean; // flowing agbada over the body
  apron?: string; vest?: string; tie?: string; glasses?: boolean; gloves?: boolean; tail?: boolean; lip?: string;
};
export type Carry = null | 'plate' | 'cup' | 'item';
export type PoseOut = {
  x: number; z: number; rotY: number; mode: 'sit' | 'walk' | 'stand'; visible: boolean;
  carry?: Carry; eat?: boolean; busy?: boolean; mood?: 'wait' | 'angry' | 'happy';
};

const SKIN = ['#A06A46', '#8F5A3A', '#B07850', '#7E4C30', '#996444', '#B98458'];
/** the six customer types: who 0,3,5 are women, 1,2,4 are men (matches the arrival voices) */
export const CUST_LOOKS: Look[] = [
  { female: true, skin: SKIN[0], hair: '#161616', hairStyle: 'wrap', hat: '#8E44AD', top: '#E0902A', bottom: '#5B3A8A', dress: true, lip: '#8B2E3C', h: 0.95, build: 0.94 },
  { skin: SKIN[1], hair: '#111111', hairStyle: 'fila', hat: '#2F5FB8', top: '#3A74D6', bottom: '#2F5FB8', robe: true, long: true, h: 1.04, build: 1.05 },
  { skin: SKIN[2], hair: '#111111', hairStyle: 'afro', top: '#D7263D', bottom: '#2B3A55', h: 1.0 },
  { female: true, skin: SKIN[3], hair: '#1A1A1A', hairStyle: 'braids', top: '#F2C230', bottom: '#34495E', lip: '#7A2A3A', h: 0.96, build: 0.92 },
  { skin: SKIN[4], hair: '#111111', hairStyle: 'short', top: '#F4F4F0', bottom: '#1E2A44', tie: '#243B7A', glasses: true, long: true, h: 1.02 },
  { female: true, skin: SKIN[5], hair: '#222222', hairStyle: 'bun', top: '#2FA544', bottom: '#6B4A2B', lip: '#9A3A48', h: 0.94, build: 0.93 },
];
export const STAFF_LOOKS: Record<'cook' | 'waiter' | 'cleaner', Look[]> = {
  cook: [
    { female: true, skin: SKIN[3], hair: '#161616', hairStyle: 'cap', hat: '#F2A93B', top: '#6B3E26', bottom: '#3A2A20', apron: '#F2A93B', tail: true, lip: '#7A2A3A', h: 0.96, build: 0.98 },
    { female: true, skin: SKIN[0], hair: '#161616', hairStyle: 'cap', hat: '#E8F0F2', top: '#F4F4F0', bottom: '#3A2A20', apron: '#E8F0F2', tail: true, lip: '#8B2E3C', h: 0.95 },
  ],
  waiter: [
    { skin: SKIN[4], hair: '#111111', hairStyle: 'short', top: '#F4F4F0', bottom: '#15151A', vest: '#22222A', tie: '#C0392B', glasses: true, long: true, h: 1.03 },
    { skin: SKIN[2], hair: '#111111', hairStyle: 'short', top: '#F4F4F0', bottom: '#15151A', vest: '#22222A', tie: '#C0392B', long: true, h: 1.0 },
    { skin: SKIN[1], hair: '#111111', hairStyle: 'cap', hat: '#22222A', top: '#F4F4F0', bottom: '#15151A', vest: '#22222A', tie: '#C0392B', long: true, h: 1.05 },
  ],
  cleaner: [
    { female: true, skin: SKIN[5], hair: '#161616', hairStyle: 'wrap', hat: '#3FA7D6', top: '#2D7FD6', bottom: '#2D7FD6', gloves: true, lip: '#9A3A48', h: 0.93, build: 1.0 },
    { female: true, skin: SKIN[3], hair: '#161616', hairStyle: 'wrap', hat: '#E8453C', top: '#2D7FD6', bottom: '#2D7FD6', gloves: true, lip: '#7A2A3A', h: 0.95 },
  ],
};

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
type V3 = [number, number, number];

/** a rounded limb or body part */
function Cap({ r, len, p, rot, s, c, seg = 8, rough = 0.78 }: { r: number; len: number; p?: V3; rot?: V3; s?: V3; c: string; seg?: number; rough?: number }) {
  return (
    <mesh position={p} rotation={rot} scale={s}>
      <capsuleGeometry args={[r, len, 3, seg]} />
      <meshStandardMaterial color={c} roughness={rough} />
    </mesh>
  );
}
function Ball({ r, p, s, c, seg = 10, rough = 0.7 }: { r: number; p?: V3; s?: V3; c: string; seg?: number; rough?: number }) {
  return (
    <mesh position={p} scale={s}>
      <sphereGeometry args={[r, seg, Math.max(6, seg - 2)]} />
      <meshStandardMaterial color={c} roughness={rough} />
    </mesh>
  );
}
function Block({ s, p, rot, c, rough = 0.8 }: { s: V3; p?: V3; rot?: V3; c: string; rough?: number }) {
  return (
    <mesh position={p} rotation={rot}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={rough} />
    </mesh>
  );
}
function Tube({ r, h, p, rot, s, c, r2, seg = 12 }: { r: number; h: number; p?: V3; rot?: V3; s?: V3; c: string; r2?: number; seg?: number }) {
  return (
    <mesh position={p} rotation={rot} scale={s}>
      <cylinderGeometry args={[r2 ?? r, r, h, seg]} />
      <meshStandardMaterial color={c} roughness={0.8} />
    </mesh>
  );
}
const darker = (hex: string, f = 0.78) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f); const g = Math.round(((n >> 8) & 255) * f); const b = Math.round((n & 255) * f);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
};

type Refs = Record<string, Group | null>;

/**
 * A procedurally modelled person (about 1.75 m): rounded limbs, a shaped torso, neck, a face with ears, nose, eyes, brows and
 * lips, hair and clothing that match the look, and a walk / sit / stand / carry / eat / work animation set. Faces +Z.
 */
export function Person({ look, pose }: { look: Look; pose: () => PoseOut }) {
  const R = useRef<Refs>({});
  const set = (k: string) => (g: Group | null) => { R.current[k] = g; };
  const st = useRef({ ang: 0, sit: 0, walk: 0, carry: 0, init: false, phase: Math.random() * 20, kind: null as Carry });

  useFrame((state, dt) => {
    const g = R.current.root; if (!g) return;
    const p = pose();
    g.visible = p.visible;
    if (!p.visible) return;
    const c = st.current;
    if (!c.init) { c.ang = p.rotY; c.sit = p.mode === 'sit' ? 1 : 0; c.walk = p.mode === 'walk' ? 1 : 0; c.init = true; }
    const t = state.clock.elapsedTime + c.phase;
    const k = (rate: number) => Math.min(1, dt * rate);
    c.ang += wrapAngle(p.rotY - c.ang) * k(9);
    c.sit += ((p.mode === 'sit' ? 1 : 0) - c.sit) * k(11);
    c.walk += ((p.mode === 'walk' ? 1 : 0) - c.walk) * k(12);
    c.carry += ((p.carry ? 1 : 0) - c.carry) * k(10);
    g.position.set(p.x, 0, p.z);
    g.rotation.y = c.ang;
    const sit = c.sit; const walk = c.walk; const carry = c.carry;
    const w = t * 9.2;
    const sw = Math.sin(w) * walk;
    const rot = (key: string, x?: number, y?: number, z?: number) => { const o = R.current[key]; if (!o) return; if (x !== undefined) o.rotation.x = x; if (y !== undefined) o.rotation.y = y; if (z !== undefined) o.rotation.z = z; };
    const breathe = Math.sin(t * 2.1) * 0.5 + 0.5;
    // whole body: drop onto the chair, step bob, breathing
    const lift = R.current.lift;
    if (lift) lift.position.y = -0.44 * sit + walk * Math.abs(Math.sin(w)) * 0.035 + breathe * 0.004;
    // legs
    rot('hipL', -Math.PI / 2 * sit + sw * 0.62 * (1 - sit));
    rot('hipR', -Math.PI / 2 * sit - sw * 0.62 * (1 - sit));
    rot('kneeL', Math.PI / 2 * sit + Math.max(0, -Math.sin(w + 0.4)) * 1.0 * walk * (1 - sit));
    rot('kneeR', Math.PI / 2 * sit + Math.max(0, Math.sin(w + 0.4)) * 1.0 * walk * (1 - sit));
    // torso: lean, twist against the stride, lean in to eat
    const eatLean = p.eat ? 0.1 + Math.sin(t * 3) * 0.015 : 0;
    rot('torso', 0.05 * walk + 0.03 * sit + eatLean + (p.mood === 'angry' ? -0.05 : 0), -sw * 0.1 + (p.mood === 'wait' ? Math.sin(t * 0.8) * 0.05 : 0), Math.sin(w * 0.5) * 0.02 * walk);
    // head: looks around while idle, shakes when angry, nods when happy
    const idleLook = (1 - walk) * (p.mood === 'wait' ? 0.45 : 0.22);
    const angry = p.mood === 'angry';
    rot('head', (p.mood === 'happy' ? Math.sin(t * 5) * 0.08 : 0) + (angry ? 0.1 : 0) - 0.03 * carry, angry ? Math.sin(t * 14) * 0.45 : Math.sin(t * 0.75) * idleLook, 0);
    // arms
    const swing = walk * (1 - carry);
    let sL = -0.12 - 0.5 * sit - sw * 0.55 * swing; let sR = -0.12 - 0.5 * sit + sw * 0.55 * swing;
    let eL = -0.18 - 0.55 * sit - 0.25 * walk; let eR = eL;
    let zL = 0; let zR = 0;
    if (carry > 0.01) { sL += (-1.0 - sL) * carry; sR += (-1.0 - sR) * carry; eL += (-1.15 - eL) * carry; eR += (-1.15 - eR) * carry; zL = 0.12 * carry; zR = -0.12 * carry; }
    if (p.eat) { sR = -0.85; eR = -1.0 - (Math.sin(t * 5.5) * 0.5 + 0.5) * 1.15; sL = -0.55; eL = -1.1; }
    if (p.busy && walk < 0.4) { sR = -1.05 + Math.sin(t * 8) * 0.35; eR = -0.7; zR = Math.sin(t * 8) * 0.35; sL = -0.5; eL = -0.7; }
    if (angry) { sL = -0.5; sR = -0.5; eL = -1.5; eR = -1.5; zL = -0.3; zR = 0.3; }
    rot('armL', sL, undefined, zL); rot('armR', sR, undefined, zR);
    rot('elbowL', eL); rot('elbowR', eR);
    // what is being carried
    const it = R.current.item;
    if (it) {
      it.visible = !!p.carry;
      if (p.carry) {
        it.position.set(0, 1.12, 0.36);
        if (c.kind !== p.carry) { c.kind = p.carry; it.children.forEach((ch) => { ch.visible = ch.name === p.carry; }); }
      }
    }
  });

  const H = look.h ?? 1; const Wd = look.build ?? 1;
  const skin = look.skin; const lip = look.lip ?? '#6E3A2A';
  const sleeve = look.top; const skinDark = darker(skin, 0.8);
  const longSleeve = !!look.long || !!look.robe;
  const shirt = look.top;
  const bottom = look.bottom; const shoe = '#241A14';
  return (
    <group ref={set('root')} scale={[Wd * H, H, Wd * H]}>
      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, 0.85, 1]}>
        <circleGeometry args={[0.36, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.26} depthWrite={false} />
      </mesh>
      <group ref={set('lift')}>
        {/* legs: thigh and shin pivot so they fold into a sitting pose */}
        {[-1, 1].map((side) => (
          <group key={side} ref={set(side < 0 ? 'hipL' : 'hipR')} position={[side * 0.095, 0.93, 0]}>
            <Cap r={look.dress ? 0.1 : 0.078} len={look.dress ? 0.3 : 0.28} p={[0, -0.215, 0]} c={bottom} s={look.dress ? [1, 1, 0.9] : undefined} />
            <group ref={set(side < 0 ? 'kneeL' : 'kneeR')} position={[0, -0.43, 0]}>
              <Cap r={look.dress ? 0.085 : 0.056} len={0.31} p={[0, -0.213, 0]} c={bottom} />
              <Cap r={0.052} len={0.14} p={[0, -0.435, 0.07]} rot={[Math.PI / 2, 0, 0]} s={[1, 1, 0.78]} c={shoe} />
              <Block s={[0.1, 0.018, 0.27]} p={[0, -0.475, 0.07]} c="#0E0A08" />
              <Tube r={0.063} h={0.035} p={[0, -0.385, 0]} c={darker(bottom, 0.8)} seg={10} />
            </group>
          </group>
        ))}
        {/* pelvis and belt */}
        <Cap r={0.115} len={0.17} p={[0, 0.95, 0]} rot={[0, 0, Math.PI / 2]} s={[1, 1, 0.78]} c={bottom} />
        <Tube r={0.158} h={0.035} p={[0, 1.03, 0]} s={[1.0, 1, 0.7]} c="#2A1D14" seg={14} />
        {/* torso group leans and twists */}
        <group ref={set('torso')} position={[0, 1.02, 0]}>
          <Tube r={0.185} r2={0.152} h={0.48} p={[0, 0.24, 0]} s={[1.0, 1, 0.64]} c={shirt} seg={14} />
          <Cap r={0.07} len={0.27} p={[0, 0.46, 0]} rot={[0, 0, Math.PI / 2]} c={shirt} />
          {look.robe && <Tube r={0.3} r2={0.2} h={0.78} p={[0, -0.08, 0]} s={[1.0, 1, 0.8]} c={shirt} seg={16} />}
          {look.vest && <Tube r={0.19} r2={0.158} h={0.44} p={[0, 0.22, 0.012]} s={[1.0, 1, 0.68]} c={look.vest} seg={14} />}
          {look.apron && (<>
            <Tube r={0.19} r2={0.17} h={0.5} p={[0, 0.1, 0.022]} s={[0.92, 1, 0.64]} c={look.apron} seg={14} />
            <Block s={[0.03, 0.2, 0.01]} p={[-0.08, 0.5, 0.1]} rot={[0.2, 0, 0.15]} c={darker(look.apron, 0.85)} />
            <Block s={[0.03, 0.2, 0.01]} p={[0.08, 0.5, 0.1]} rot={[0.2, 0, -0.15]} c={darker(look.apron, 0.85)} />
          </>)}
          {look.tie && (<>
            <Block s={[0.045, 0.08, 0.012]} p={[0, 0.43, 0.12]} c={look.tie} />
            <Block s={[0.05, 0.26, 0.012]} p={[0, 0.27, 0.122]} c={look.tie} />
          </>)}
          {look.tie && [0.13, 0.05].map((y) => <Ball key={y} r={0.008} p={[0, y, 0.119]} c="#E8E4DA" seg={6} />)}
          {(look.tie || look.vest) && (<>
            <Block s={[0.07, 0.025, 0.04]} p={[-0.045, 0.49, 0.09]} rot={[0, 0, 0.5]} c="#F4F4F0" />
            <Block s={[0.07, 0.025, 0.04]} p={[0.045, 0.49, 0.09]} rot={[0, 0, -0.5]} c="#F4F4F0" />
          </>)}
          {/* neck and head */}
          <Tube r={0.052} h={0.1} p={[0, 0.54, 0]} c={skin} seg={10} />
          <group ref={set('head')} position={[0, 0.69, 0]}>
            <Ball r={0.112} s={[0.92, 1.12, 1.0]} c={skin} seg={16} rough={0.62} />
            <Ball r={0.03} p={[-0.108, -0.005, 0]} s={[0.55, 1, 0.8]} c={skin} seg={8} />
            <Ball r={0.03} p={[0.108, -0.005, 0]} s={[0.55, 1, 0.8]} c={skin} seg={8} />
            <Ball r={0.07} p={[0, -0.075, 0.035]} s={[1.0, 0.8, 0.9]} c={skin} seg={12} rough={0.62} />
            <Block s={[0.017, 0.055, 0.022]} p={[0, 0.0, 0.106]} c={skin} />
            <Ball r={0.021} p={[0, -0.025, 0.112]} s={[1, 1.15, 1]} c={skinDark} seg={8} />
            {[-1, 1].map((e) => (
              <group key={e}>
                <Ball r={0.02} p={[e * 0.044, 0.02, 0.098]} s={[1.2, 0.8, 0.5]} c="#F4F1EA" seg={8} />
                <Ball r={0.0125} p={[e * 0.044, 0.02, 0.1085]} c="#4A2E1A" seg={8} />
                <Ball r={0.0075} p={[e * 0.044, 0.02, 0.1125]} c="#0E0A08" seg={6} />
                <Block s={[0.044, 0.007, 0.009]} p={[e * 0.044, 0.037, 0.107]} c="#1A1210" />
                <Block s={[0.045, 0.01, 0.01]} p={[e * 0.046, 0.052, 0.1]} rot={[0, 0, -e * 0.12]} c={look.hair} />
              </group>
            ))}
            <Block s={[0.05, 0.011, 0.01]} p={[0, -0.063, 0.103]} c={lip} />
            <Block s={[0.036, 0.008, 0.008]} p={[0, -0.074, 0.1]} c={darker(lip, 0.9)} />
            {look.glasses && [-1, 1].map((e) => (
              <mesh key={e} position={[e * 0.044, 0.02, 0.112]}><torusGeometry args={[0.03, 0.004, 5, 14]} /><meshStandardMaterial color="#15151A" /></mesh>
            ))}
            {look.glasses && <Block s={[0.03, 0.005, 0.005]} p={[0, 0.025, 0.114]} c="#15151A" />}
            {/* hair and headwear */}
            {look.hairStyle === 'short' && <mesh position={[0, 0.022, -0.012]}><sphereGeometry args={[0.122, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} /><meshStandardMaterial color={look.hair} roughness={0.9} /></mesh>}
            {look.hairStyle === 'afro' && <mesh position={[0, 0.035, -0.045]}><sphereGeometry args={[0.165, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.46]} /><meshStandardMaterial color={look.hair} roughness={0.95} /></mesh>}
            {look.hairStyle === 'fila' && (<>
              <mesh position={[0, 0.03, -0.012]}><sphereGeometry args={[0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.38]} /><meshStandardMaterial color={look.hair} roughness={0.9} /></mesh>
              <Tube r={0.1} r2={0.118} h={0.14} p={[0, 0.095, -0.005]} c={look.hat ?? '#2F5FB8'} seg={14} />
              <Tube r={0.1} r2={0.1} h={0.012} p={[0, 0.167, -0.005]} c={darker(look.hat ?? '#2F5FB8', 0.85)} seg={14} />
            </>)}
            {look.hairStyle === 'braids' && (<>
              <mesh position={[0, 0.026, -0.016]}><sphereGeometry args={[0.122, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} /><meshStandardMaterial color={look.hair} roughness={0.9} /></mesh>
              {[-0.1, -0.05, 0, 0.05, 0.1].map((x, i) => <Cap key={i} r={0.018} len={0.3} p={[x, -0.13, -0.085 + Math.abs(x) * -0.2]} rot={[0.12, 0, x * 0.5]} c={look.hair} seg={5} rough={0.9} />)}
            </>)}
            {look.hairStyle === 'bun' && (<>
              <mesh position={[0, 0.022, -0.016]}><sphereGeometry args={[0.122, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} /><meshStandardMaterial color={look.hair} roughness={0.9} /></mesh>
              <Ball r={0.06} p={[0, 0.13, -0.07]} c={look.hair} seg={10} rough={0.9} />
            </>)}
            {look.hairStyle === 'wrap' && (<>
              <mesh position={[0, 0.03, -0.014]}><sphereGeometry args={[0.13, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} /><meshStandardMaterial color={look.hat ?? look.hair} roughness={0.7} /></mesh>
              <Ball r={0.07} p={[0.04, 0.15, -0.015]} s={[1.5, 0.9, 1]} c={look.hat ?? look.hair} seg={10} rough={0.7} />
              <Ball r={0.05} p={[-0.05, 0.14, -0.02]} s={[1.2, 0.8, 1]} c={darker(look.hat ?? look.hair, 0.88)} seg={8} rough={0.7} />
            </>)}
            {look.hairStyle === 'cap' && (<>
              <mesh position={[0, 0.03, -0.014]}><sphereGeometry args={[0.126, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} /><meshStandardMaterial color={look.hat ?? look.hair} roughness={0.8} /></mesh>
              <Block s={[0.18, 0.012, 0.08]} p={[0, 0.062, 0.11]} rot={[0.1, 0, 0]} c={look.hat ?? look.hair} />
              {look.tail && <Cap r={0.03} len={0.14} p={[0, -0.02, -0.14]} rot={[0.5, 0, 0]} c={look.hair} seg={6} rough={0.9} />}
              {look.tail && <mesh position={[0, 0.0, -0.1]}><sphereGeometry args={[0.1, 10, 8, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.4]} /><meshStandardMaterial color={look.hair} roughness={0.9} /></mesh>}
            </>)}
          </group>
          {/* arms */}
          {[-1, 1].map((side) => (
            <group key={side} ref={set(side < 0 ? 'armL' : 'armR')} position={[side * 0.215, 0.46, 0]}>
              <Cap r={look.robe ? 0.07 : 0.047} len={0.2} p={[0, -0.145, 0]} c={sleeve} />
              <group ref={set(side < 0 ? 'elbowL' : 'elbowR')} position={[0, -0.29, 0]}>
                <Cap r={look.robe ? 0.062 : 0.039} len={0.2} p={[0, -0.137, 0]} c={longSleeve ? sleeve : look.gloves ? '#F2D13C' : skin} />
                <Ball r={0.042} p={[0, -0.3, 0.005]} s={[0.9, 1.15, 0.7]} c={look.gloves ? '#F2D13C' : skin} seg={8} rough={0.6} />
                <Block s={[0.052, 0.05, 0.026]} p={[0, -0.335, 0.012]} c={look.gloves ? '#F2D13C' : skin} />
                <Cap r={0.012} len={0.035} p={[-side * 0.034, -0.3, 0.022]} rot={[0.3, 0, -side * 0.5]} c={look.gloves ? '#F2D13C' : skin} seg={6} rough={0.6} />
                {longSleeve && !look.robe && <Tube r={0.044} h={0.03} p={[0, -0.255, 0]} c={darker(sleeve, 0.88)} seg={10} />}
              </group>
            </group>
          ))}
        </group>
        {/* what is being carried: all variants exist, the one matching the pose is shown */}
        <group ref={set('item')} visible={false}>
          <group name="plate" visible={false}>
            <Tube r={0.22} r2={0.2} h={0.03} c="#F4F1EA" seg={16} />
            <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#D9531E" roughness={0.8} /></mesh>
          </group>
          <group name="cup" visible={false}>
            <Tube r={0.07} r2={0.055} h={0.2} p={[0, 0.08, 0]} c="#C0392B" seg={12} />
          </group>
          <group name="item" visible={false}>
            <Block s={[0.2, 0.14, 0.2]} p={[0, 0.05, 0]} c="#C98A3C" />
          </group>
        </group>
      </group>
    </group>
  );
}
