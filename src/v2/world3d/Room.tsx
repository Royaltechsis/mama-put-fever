import React, { useMemo } from 'react';
import type { Plan } from '../Dining';
import { CHEF_X, PASS_X, PPM, X_OF, Z_SEAT, Z_TABLE, Z_WALL } from './geom';
import { Lantern, themeFor } from './themes';

type V3 = [number, number, number];
function B({ s, p, c, rot, emissive }: { s: V3; p: V3; c: string; rot?: V3; emissive?: string }) {
  return (
    <mesh position={p} rotation={rot}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} flatShading roughness={0.85} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.9 : 0} />
    </mesh>
  );
}
function Cyl({ r, h, p, c, seg = 10, r2, emissive }: { r: number; h: number; p: V3; c: string; seg?: number; r2?: number; emissive?: string }) {
  return (
    <mesh position={p}>
      <cylinderGeometry args={[r2 ?? r, r, h, seg]} />
      <meshStandardMaterial color={c} flatShading roughness={0.85} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.9 : 0} />
    </mesh>
  );
}
function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl r={0.26} r2={0.2} h={0.42} p={[0, 0.21, 0]} c="#B5651D" seg={8} />
      <mesh position={[0, 0.78, 0]}><icosahedronGeometry args={[0.36, 0]} /><meshStandardMaterial color="#2F8A3A" flatShading /></mesh>
      <mesh position={[0.18, 1.02, 0.05]}><icosahedronGeometry args={[0.24, 0]} /><meshStandardMaterial color="#47A64A" flatShading /></mesh>
      <mesh position={[-0.17, 0.98, -0.05]}><icosahedronGeometry args={[0.22, 0]} /><meshStandardMaterial color="#3A9A44" flatShading /></mesh>
    </group>
  );
}
function Lamp({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl r={0.012} h={1.2} p={[0, 0.6, 0]} c="#2A2A2A" seg={4} />
      <mesh position={[0, 0, 0]}><coneGeometry args={[0.36, 0.3, 8, 1, true]} /><meshStandardMaterial color="#2F3A33" flatShading side={2} /></mesh>
      <mesh position={[0, -0.1, 0]}><sphereGeometry args={[0.09, 8, 6]} /><meshStandardMaterial color="#FFE9A8" emissive="#FFC55A" emissiveIntensity={1.4} /></mesh>
    </group>
  );
}

function Chandelier({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl r={0.012} h={1.0} p={[0, 0.6, 0]} c="#B8860B" seg={4} />
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.025, 6, 16]} /><meshStandardMaterial color="#D4AF37" flatShading /></mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i) * 0.32, 0.06, Math.sin(i) * 0.32]}><sphereGeometry args={[0.055, 6, 5]} /><meshStandardMaterial color="#FFF4D0" emissive="#FFD27A" emissiveIntensity={1.5} /></mesh>
      ))}
      <mesh position={[0, -0.12, 0]}><octahedronGeometry args={[0.1, 0]} /><meshStandardMaterial color="#E8F4FF" emissive="#BFE0FF" emissiveIntensity={0.6} flatShading /></mesh>
    </group>
  );
}

const CHAIR_COLORS = [{ seat: '#E23B2E', frame: '#B32418' }, { seat: '#B97C45', frame: '#7A4A22' }, { seat: '#C8283A', frame: '#6E4220' }];

/** everything that doesn't move: floor, walls, tables, chairs, the pass counter and the kitchen behind it */
function RoomImpl({ plan, chairTier, ankara, city }: { plan: Plan; chairTier: number; ankara: boolean; city: string }) {
  const boards = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);
  const frieze = useMemo(() => Array.from({ length: 62 }, (_, i) => i), []);
  const cc = CHAIR_COLORS[chairTier] ?? CHAIR_COLORS[0];
  const th = themeFor(city);
  const pal = ankara ? th.up : th.base;
  const [floorA, floorB] = pal.floor;
  const wall = pal.wall;
  const Fixture = th.lights === 'lantern' ? Lantern : th.lights === 'chandelier' ? Chandelier : Lamp;
  return (
    <>
      {/* floor */}
      <B s={[18.4, 0.1, 6.4]} p={[0, -0.06, 0.4]} c="#8A5A34" />
      {boards.map((i) => <B key={i} s={[0.6, 0.02, 6.4]} p={[-8.7 + i * 0.6, 0.0, 0.4]} c={i % 2 ? floorA : floorB} />)}
      {/* rug under the tables */}
      <B s={[10.6, 0.02, 3.2]} p={[-0.6, 0.02, 0.1]} c={pal.rug[0]} />
      <B s={[10.2, 0.025, 2.8]} p={[-0.6, 0.025, 0.1]} c={pal.rug[1]} />
      <B s={[9.4, 0.03, 0.06]} p={[-0.6, 0.03, -1.2]} c={th.trim} />
      <B s={[9.4, 0.03, 0.06]} p={[-0.6, 0.03, 1.4]} c={th.trim} />

      {/* back wall: the city's paint, wood panelling, a patterned frieze, windows and a menu board */}
      <B s={[18.4, 3.6, 0.2]} p={[0, 1.8, Z_WALL - 0.1]} c={wall} />
      <B s={[18.4, 0.95, 0.24]} p={[0, 0.475, Z_WALL - 0.02]} c={th.panel} />
      <B s={[18.4, 0.06, 0.28]} p={[0, 0.98, Z_WALL - 0.02]} c={th.panelTrim} />
      {frieze.map((i) => <B key={i} s={[0.27, 0.22, 0.05]} p={[-8.9 + i * 0.29, 1.12, Z_WALL + 0.02]} c={th.frieze[i % th.frieze.length]} />)}
      {[-6, -2, 2.2].map((x) => (
        <group key={x} position={[x, 2.15, Z_WALL + 0.03]}>
          <B s={[1.9, 1.15, 0.06]} p={[0, 0, 0]} c={th.frame} />
          <B s={[1.7, 0.95, 0.07]} p={[0, 0, 0.02]} c={th.glass} emissive={th.glassGlow} />
          <B s={[0.05, 0.95, 0.09]} p={[0, 0, 0.03]} c={th.frame} />
          <B s={[1.7, 0.05, 0.09]} p={[0, 0, 0.03]} c={th.frame} />
        </group>
      ))}
      <B s={[2.2, 1.0, 0.07]} p={[5.2, 2.2, Z_WALL + 0.04]} c={th.board} />
      <B s={[2.35, 1.15, 0.05]} p={[5.2, 2.2, Z_WALL + 0.02]} c="#6E4220" />
      {[0, 1, 2].map((i) => <B key={i} s={[1.4 - i * 0.25, 0.04, 0.02]} p={[5.0 - i * 0.05, 2.45 - i * 0.22, Z_WALL + 0.09]} c="#F1ECDD" />)}
      <Fixture p={[-4.9, 3.2, -0.2]} /><Fixture p={[-0.1, 3.2, -0.2]} /><Fixture p={[4.2, 3.2, -0.2]} />
      {th.plants && <><Plant p={[-8.0, 0, -1.7]} s={1.3} /><Plant p={[-3.9, 0, -1.9]} s={1.0} /><Plant p={[3.2, 0, -1.9]} s={1.1} /></>}
      <th.Extras />

      {/* tables and chairs */}
      {plan.tables.map((tb, ti) => {
        const X = X_OF(tb.cx); const W = tb.w / PPM + 0.35;
        return (
          <group key={ti}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[X, 0.03, Z_TABLE + 0.05]}><planeGeometry args={[W + 0.5, 1.5]} /><meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} /></mesh>
            <B s={[W, 0.07, 0.98]} p={[X, 0.78, Z_TABLE]} c={th.table[0]} />
            <B s={[W - 0.06, 0.1, 0.9]} p={[X, 0.69, Z_TABLE]} c={th.table[1]} />
            {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <B key={sx + '_' + sz} s={[0.09, 0.74, 0.09]} p={[X + sx * (W / 2 - 0.12), 0.37, Z_TABLE + sz * 0.38]} c="#6E4220" />))}
            {tb.seats.length === 2 && (<>
              <Cyl r={0.05} h={0.12} p={[X, 0.88, Z_TABLE - 0.18]} c="#E8F0F2" seg={8} />
              <mesh position={[X, 0.98, Z_TABLE - 0.18]}><icosahedronGeometry args={[0.07, 0]} /><meshStandardMaterial color="#47A64A" flatShading /></mesh>
              <Cyl r={0.025} h={0.07} p={[X - 0.22, 0.84, Z_TABLE - 0.1]} c="#EDE6D6" seg={6} />
              <Cyl r={0.025} h={0.07} p={[X + 0.22, 0.84, Z_TABLE - 0.1]} c="#3A2A1A" seg={6} />
            </>)}
            {tb.seats.map((i) => {
              const cx = X_OF(plan.seatX[i]);
              return (
                <group key={i}>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.03, Z_SEAT - 0.05]}><planeGeometry args={[0.8, 0.9]} /><meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} /></mesh>
                  <B s={[0.52, 0.07, 0.52]} p={[cx, 0.405, Z_SEAT]} c={cc.seat} />
                  <B s={[0.52, 0.6, 0.07]} p={[cx, 0.78, Z_SEAT - 0.29]} c={cc.seat} />
                  <B s={[0.5, 0.06, 0.09]} p={[cx, 1.1, Z_SEAT - 0.29]} c={cc.frame} />
                  {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <B key={sx + '_' + sz} s={[0.06, 0.4, 0.06]} p={[cx + sx * 0.22, 0.2, Z_SEAT + sz * 0.22]} c={cc.frame} />))}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* the pass: a counter along the right wall with the kitchen behind it */}
      <B s={[1.0, 1.05, 5.4]} p={[PASS_X, 0.525, 0.3]} c="#8A5A34" />
      <B s={[1.2, 0.07, 5.6]} p={[PASS_X - 0.02, 1.08, 0.3]} c="#E3B075" />
      <B s={[0.1, 0.35, 5.2]} p={[PASS_X + 0.45, 1.28, 0.3]} c="#C9B79A" />
      {[-1.6, -0.2, 1.2].map((z) => (
        <group key={z} position={[PASS_X - 0.05, 1.12, z]}>
          <Cyl r={0.2} r2={0.18} h={0.03} p={[0, 0, 0]} c="#F4F1EA" seg={10} />
          <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.12, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#D9531E" flatShading /></mesh>
        </group>
      ))}
      <B s={[1.8, 0.1, 6.0]} p={[CHEF_X + 0.9, -0.04, 0.3]} c="#6A6F73" />
      <B s={[0.3, 3.4, 6.0]} p={[CHEF_X + 1.6, 1.7, 0.3]} c="#E8E4D8" />
      <B s={[0.9, 0.95, 4.6]} p={[CHEF_X + 1.0, 0.475, 0.3]} c="#3A3F44" />
      {[-1.5, -0.2, 1.1].map((z) => (
        <group key={z} position={[CHEF_X + 1.0, 0.95, z]}>
          <Cyl r={0.3} r2={0.26} h={0.3} p={[0, 0.15, 0]} c="#9AA3A8" seg={10} />
          <Cyl r={0.2} r2={0.2} h={0.01} p={[0, 0.31, 0]} c="#C9743A" seg={10} />
        </group>
      ))}
      {[-1.6, -0.5, 0.6, 1.7].map((z, i) => <Cyl key={z} r={0.2 + (i % 2) * 0.05} r2={0.18} h={0.22} p={[CHEF_X + 1.35, 2.1 + (i % 2) * 0.3, z]} c="#B7BEC2" seg={9} />)}
      {[-1.9, -0.6, 0.7, 2.0].map((z) => <B key={z} s={[0.05, 0.5, 0.05]} p={[CHEF_X + 1.45, 2.9, z]} c="#555B60" />)}
      <Plant p={[7.9, 0, 2.7]} s={1.2} />
    </>
  );
}

export const Room = React.memo(RoomImpl);
