import React from 'react';
import { Z_WALL } from './geom';

// Each city's dining room: its own paint, floor, rug, wall frieze and signature decorations. The "makeover" decor
// upgrade (save.decor.ankara) swaps in each city's upgraded palette.
type Palette = { wall: string; floor: [string, string]; rug: [string, string]; bg: string };
export type RoomTheme = {
  base: Palette; up: Palette;
  panel: string; panelTrim: string; trim: string; // wood panelling along the bottom of the wall and the rug edging
  frieze: string[]; // the patterned band above the panelling
  glass: string; glassGlow: string; frame: string; // windows
  board: string; // menu board
  table: [string, string]; // top, apron
  lights: 'pendant' | 'lantern' | 'chandelier';
  plants: boolean;
  Extras: React.ComponentType;
};

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
function Ball({ r, p, c, emissive, sy = 1 }: { r: number; p: V3; c: string; emissive?: string; sy?: number }) {
  return (
    <mesh position={p} scale={[1, sy, 1]}>
      <sphereGeometry args={[r, 10, 8]} />
      <meshStandardMaterial color={c} flatShading roughness={0.8} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 1.2 : 0} />
    </mesh>
  );
}
const W = Z_WALL + 0.05; // just in front of the back wall

/** a cloth hanging on the wall: a coloured panel with rows of dots for the print */
function Cloth({ x, y, w, h, c, dot, rows = 4 }: { x: number; y: number; w: number; h: number; c: string; dot: string; rows?: number }) {
  const cols = Math.max(2, Math.round(w / 0.22));
  return (
    <group position={[x, y, W]}>
      <B s={[w + 0.1, 0.05, 0.06]} p={[0, h / 2 + 0.03, 0.02]} c="#5E3A1A" />
      <B s={[w, h, 0.03]} p={[0, 0, 0]} c={c} />
      {Array.from({ length: rows * cols }, (_, i) => (
        <B key={i} s={[0.07, 0.07, 0.02]} p={[-w / 2 + (w / cols) * ((i % cols) + 0.5), h / 2 - (h / rows) * (Math.floor(i / cols) + 0.5), 0.02]} c={dot} rot={[0, 0, Math.PI / 4]} />
      ))}
    </group>
  );
}

// ---- Lagos: mustard paint, ankara frieze, string lights (the original room) ----
function LagosExtras() {
  return <>{Array.from({ length: 36 }, (_, i) => <Ball key={i} r={0.05} p={[-8.5 + i * 0.5, 1.78 - Math.sin((i % 6) / 6 * Math.PI) * 0.1, Z_WALL + 0.12]} c="#FFE9A8" emissive="#FFC55A" />)}</>;
}

// ---- Ibadan: red-earth walls like the old brown roofs, indigo adire cloths, clay pots and talking drums ----
function Pot({ p, s = 1, c = '#A0522D' }: { p: V3; s?: number; c?: string }) {
  return (
    <group position={p} scale={s}>
      <Ball r={0.26} p={[0, 0.26, 0]} c={c} sy={0.9} />
      <Cyl r={0.12} r2={0.15} h={0.12} p={[0, 0.52, 0]} c={c} seg={10} />
      <B s={[0.5, 0.03, 0.02]} p={[0, 0.3, 0.24]} c="#F2E6CF" />
    </group>
  );
}
function TalkingDrum({ p, rz = 0 }: { p: V3; rz?: number }) {
  return (
    <group position={p} rotation={[0, 0, rz]}>
      <mesh position={[0, 0.17, 0]}><coneGeometry args={[0.13, 0.34, 10, 1, true]} /><meshStandardMaterial color="#8B5A2B" flatShading side={2} /></mesh>
      <mesh position={[0, -0.17, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.13, 0.34, 10, 1, true]} /><meshStandardMaterial color="#8B5A2B" flatShading side={2} /></mesh>
      <Cyl r={0.135} h={0.02} p={[0, 0.34, 0]} c="#EAD9B5" />
      <Cyl r={0.135} h={0.02} p={[0, -0.34, 0]} c="#EAD9B5" />
      {[-1, 1].map((s) => <B key={s} s={[0.01, 0.66, 0.01]} p={[s * 0.07, 0, 0.1]} c="#3A2410" />)}
    </group>
  );
}
function IbadanExtras() {
  return (
    <>
      <Cloth x={-7.6} y={1.62} w={1.1} h={0.62} c="#1F3A6E" dot="#E8E4D8" rows={2} />
      <Cloth x={-4.0} y={1.62} w={0.9} h={0.62} c="#2B4F8E" dot="#F2F0E6" rows={2} />
      <Cloth x={0.1} y={1.62} w={0.9} h={0.62} c="#1F3A6E" dot="#C9D6EA" rows={2} />
      <TalkingDrum p={[3.55, 1.6, W + 0.1]} rz={1.3} />
      <TalkingDrum p={[3.6, 1.85, W + 0.1]} rz={1.6} />
      <Pot p={[-8.2, 0, -1.75]} s={1.4} /><Pot p={[-7.6, 0, -1.9]} s={1.0} c="#8B4513" />
      <Pot p={[-3.7, 0, -1.95]} s={1.1} c="#B5651D" /><Pot p={[3.3, 0, -1.95]} s={1.2} />
      {/* woven mat rolled against the wall */}
      <Cyl r={0.14} h={1.6} p={[2.55, 0.8, -1.95]} c="#D8B46A" seg={8} />
    </>
  );
}

// ---- Port Harcourt: waterside teal, fishing nets, crossed paddles, hurricane lanterns ----
function Net({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const n = 7;
  return (
    <group position={[x, y, W]}>
      {Array.from({ length: n + 1 }, (_, i) => <B key={'v' + i} s={[0.015, h, 0.015]} p={[-w / 2 + (w / n) * i, 0, 0]} c="#E8DCC0" />)}
      {Array.from({ length: n + 1 }, (_, i) => <B key={'h' + i} s={[w, 0.015, 0.015]} p={[0, -h / 2 + (h / n) * i, 0]} c="#E8DCC0" />)}
      {[[-0.3, -0.2], [0.35, 0.25], [0.1, -0.4]].map(([fx, fy], i) => <Ball key={i} r={0.07} p={[fx * w, fy * h, 0.04]} c="#F28C28" />)}
    </group>
  );
}
function Paddle({ p, rz }: { p: V3; rz: number }) {
  return (
    <group position={p} rotation={[0, 0, rz]}>
      <B s={[0.05, 1.5, 0.04]} p={[0, 0, 0]} c="#9C6B3A" />
      <B s={[0.2, 0.45, 0.04]} p={[0, -0.85, 0]} c="#B07A44" />
    </group>
  );
}
export function Lantern({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl r={0.012} h={1.0} p={[0, 0.6, 0]} c="#2A2A2A" seg={4} />
      <Cyl r={0.13} r2={0.08} h={0.06} p={[0, 0.1, 0]} c="#B03A2E" />
      <Ball r={0.11} p={[0, -0.04, 0]} c="#FFF1C4" emissive="#FFB347" sy={1.3} />
      <Cyl r={0.12} h={0.05} p={[0, -0.2, 0]} c="#B03A2E" />
    </group>
  );
}
function PHExtras() {
  return (
    <>
      <Net x={-7.6} y={1.6} w={1.5} h={0.6} />
      <Net x={0.15} y={1.6} w={1.0} h={0.6} />
      <Paddle p={[-4.0, 1.6, W + 0.04]} rz={1.35} />
      <Paddle p={[-4.0, 1.75, W + 0.06]} rz={-1.79} />
      {/* a ring buoy */}
      <mesh position={[3.65, 1.62, W + 0.06]}><torusGeometry args={[0.24, 0.07, 8, 16]} /><meshStandardMaterial color="#F2F2F2" flatShading /></mesh>
      {[0, 1, 2, 3].map((i) => <B key={i} s={[0.08, 0.08, 0.1]} p={[3.65 + 0.24 * Math.cos(i * Math.PI / 2 + 0.78), 1.62 + 0.24 * Math.sin(i * Math.PI / 2 + 0.78), W + 0.09]} c="#D7263D" />)}
      {/* raffia palms */}
      {[[-8.1, -1.75, 1.3], [3.3, -1.95, 1.1]].map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <Cyl r={0.08} r2={0.06} h={1.2} p={[0, 0.6, 0]} c="#7A5A3A" seg={6} />
          {[0, 1, 2, 3, 4, 5].map((k) => <B key={k} s={[0.7, 0.04, 0.16]} p={[Math.cos(k) * 0.3, 1.18, Math.sin(k) * 0.12]} rot={[0, k, -0.45]} c="#3E9B4F" />)}
        </group>
      ))}
    </>
  );
}

// ---- Enugu: Coal City green, coal-grey stone, isiagu cloths, palm-wine gourds and a miner's lamp ----
function Gourd({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Ball r={0.2} p={[0, 0.2, 0]} c="#C9A25A" />
      <Ball r={0.11} p={[0, 0.45, 0]} c="#C9A25A" />
      <Cyl r={0.035} h={0.12} p={[0, 0.58, 0]} c="#8A6A3A" />
    </group>
  );
}
function EnuguExtras() {
  return (
    <>
      <Cloth x={-7.6} y={1.62} w={1.1} h={0.62} c="#B3202A" dot="#111111" rows={2} />
      <Cloth x={0.1} y={1.62} w={0.9} h={0.62} c="#141414" dot="#D9A441" rows={2} />
      {/* miner's lamp on a hook */}
      <group position={[-4.0, 1.6, W + 0.1]}>
        <B s={[0.04, 0.3, 0.04]} p={[0, 0.3, 0]} c="#333" />
        <Cyl r={0.14} h={0.36} p={[0, 0, 0]} c="#3A3A3A" />
        <Cyl r={0.1} h={0.2} p={[0, 0.02, 0.06]} c="#FFE9A8" emissive="#FFC55A" />
      </group>
      {/* a basket of coal */}
      <group position={[-8.0, 0, -1.8]}>
        <Cyl r={0.36} r2={0.42} h={0.36} p={[0, 0.18, 0]} c="#B5864F" />
        {[[0, 0], [0.15, 0.08], [-0.14, 0.05], [0.05, -0.15], [-0.08, -0.12]].map(([x, z], i) => <Ball key={i} r={0.12} p={[x, 0.4, z]} c="#1E1E1E" />)}
      </group>
      <Gourd p={[-7.3, 0, -1.9]} s={1.2} /><Gourd p={[3.2, 0, -1.95]} s={1.1} /><Gourd p={[3.6, 0, -1.9]} s={0.85} />
      <Gourd p={[-3.8, 0, -1.95]} s={1.0} />
    </>
  );
}

// ---- Kano: sand mud walls with zanko points, indigo dye cloths, calabashes and brass lanterns ----
function KanoExtras() {
  return (
    <>
      {/* zanko: the pointed horns along the top of a Hausa mud wall */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-8.4 + i * 1.5, 3.7, Z_WALL - 0.05]}><coneGeometry args={[0.16, 0.45, 4]} /><meshStandardMaterial color="#C99358" flatShading /></mesh>
      ))}
      {/* raised geometric relief on the wall */}
      {[-6, -2, 2.2].map((x) => [[-1.15, 0], [1.15, 0]].map(([dx], k) => (
        <group key={x + '_' + k} position={[x + dx, 1.55, W]}>
          <B s={[0.28, 0.28, 0.04]} p={[0, 0, 0]} c="#E8C38E" rot={[0, 0, Math.PI / 4]} />
          <B s={[0.14, 0.14, 0.05]} p={[0, 0, 0.01]} c="#1F3A8A" rot={[0, 0, Math.PI / 4]} />
        </group>
      )))}
      <Cloth x={-7.6} y={1.62} w={1.0} h={0.62} c="#1F3A8A" dot="#9DB4E8" rows={2} />
      <Cloth x={0.1} y={1.62} w={0.8} h={0.62} c="#2E4F9E" dot="#E8EEF8" rows={2} />
      {/* stacked calabashes */}
      {[[-8.2, -1.75], [3.3, -1.95], [-3.8, -1.95]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Ball r={0.3} p={[0, 0.22, 0]} c="#D9A441" sy={0.7} />
          <Ball r={0.22} p={[0, 0.52, 0]} c="#E0B050" sy={0.7} />
          <B s={[0.44, 0.03, 0.02]} p={[0, 0.22, 0.29]} c="#8B3A1A" />
        </group>
      ))}
      {/* brass lantern on the wall */}
      <group position={[3.7, 1.62, W + 0.12]}>
        <Cyl r={0.1} r2={0.04} h={0.12} p={[0, 0.25, 0]} c="#B8860B" />
        <Cyl r={0.12} h={0.3} p={[0, 0.04, 0]} c="#FFE2A0" emissive="#FFB347" />
        <Cyl r={0.13} h={0.04} p={[0, -0.13, 0]} c="#B8860B" />
      </group>
    </>
  );
}

// ---- Abuja: cream marble, gold trim, green-white-green, chandeliers ----
function Flag({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl r={0.02} h={1.9} p={[0, 0.95, 0]} c="#C9A227" seg={6} />
      <Ball r={0.04} p={[0, 1.92, 0]} c="#D4AF37" />
      {['#1E7B45', '#FFFFFF', '#1E7B45'].map((c, i) => <B key={i} s={[0.22, 0.45, 0.01]} p={[0.13 + i * 0.22, 1.6, 0]} c={c} />)}
    </group>
  );
}
function AbujaExtras() {
  return (
    <>
      {/* gold-framed painting of Aso Rock */}
      <group position={[0.1, 1.62, W]} scale={0.65}>
        <B s={[1.25, 0.95, 0.05]} p={[0, 0, 0]} c="#D4AF37" />
        <B s={[1.1, 0.8, 0.06]} p={[0, 0, 0.01]} c="#8EC9E8" />
        <mesh position={[0, -0.15, 0.06]} scale={[1.4, 0.8, 0.2]}><sphereGeometry args={[0.32, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#7A6A5A" flatShading /></mesh>
        <B s={[1.1, 0.12, 0.07]} p={[0, -0.34, 0.02]} c="#3E8E41" />
      </group>
      <Flag p={[-8.4, 0, -1.9]} /><Flag p={[3.0, 0, -2.0]} />
      {/* gold pillars */}
      {[-8.9, 4.6].map((x) => <Cyl key={x} r={0.16} h={3.6} p={[x, 1.8, Z_WALL + 0.12]} c="#E9DFC9" seg={12} />)}
      {[-8.9, 4.6].map((x) => <Cyl key={x + 'c'} r={0.22} h={0.12} p={[x, 3.55, Z_WALL + 0.12]} c="#D4AF37" seg={12} />)}
    </>
  );
}

const pal = (wall: string, floor: [string, string], rug: [string, string], bg: string): Palette => ({ wall, floor, rug, bg });

export const ROOM_THEMES: Record<string, RoomTheme> = {
  lagos: {
    base: pal('#E4B04E', ['#C99A66', '#B98957'], ['#B5523B', '#C9654A'], '#3A2418'),
    up: pal('#1F6B6B', ['#B98A5C', '#A87A4E'], ['#7B2D26', '#8E3A30'], '#2A1A12'),
    panel: '#7A4A28', panelTrim: '#4A2A14', trim: '#E0B050',
    frieze: ['#E8501F', '#2A9D8F', '#8E44AD', '#F2A93B'],
    glass: '#9FD4E8', glassGlow: '#6FB6D6', frame: '#5E3A1A', board: '#2B3A33',
    table: ['#D9A15E', '#A8692F'], lights: 'pendant', plants: true, Extras: LagosExtras,
  },
  ibadan: {
    base: pal('#C46A3F', ['#B65E3C', '#A4512F'], ['#D8B46A', '#C9A05A'], '#3A1E12'),
    up: pal('#E8D6B8', ['#B65E3C', '#A4512F'], ['#1F3A6E', '#2B4F8E'], '#2E1A10'),
    panel: '#5A3420', panelTrim: '#3A2010', trim: '#8B4513',
    frieze: ['#1F3A6E', '#E8E4D8', '#2B4F8E', '#F2F0E6'],
    glass: '#B9DCE8', glassGlow: '#88BFD6', frame: '#4A2A14', board: '#3A2A1E',
    table: ['#C98B4E', '#8B5A2B'], lights: 'pendant', plants: false, Extras: IbadanExtras,
  },
  ph: {
    base: pal('#2F8FA0', ['#8A6B4A', '#7A5C3D'], ['#C8A86A', '#D9BC80'], '#10303A'),
    up: pal('#F2E2C0', ['#8A6B4A', '#7A5C3D'], ['#1F7A8C', '#2A93A6'], '#16323A'),
    panel: '#6B5B4A', panelTrim: '#3E3328', trim: '#F2C230',
    frieze: ['#C0392B', '#F2C230', '#1A1A1A', '#F2C230'],
    glass: '#5FB3D6', glassGlow: '#3E9BC6', frame: '#5B4632', board: '#1F3A40',
    table: ['#B98A5C', '#7A5C3D'], lights: 'lantern', plants: false, Extras: PHExtras,
  },
  enugu: {
    base: pal('#2E7D4F', ['#9A8A78', '#8A7A68'], ['#B3202A', '#C83A3A'], '#142A1C'),
    up: pal('#F1EADB', ['#9A8A78', '#8A7A68'], ['#2E7D4F', '#3A9A62'], '#1A2A1E'),
    panel: '#3A3A3A', panelTrim: '#1E1E1E', trim: '#D9A441',
    frieze: ['#1A1A1A', '#D9A441', '#F1E6CF', '#8B3A1A'],
    glass: '#A8D0DA', glassGlow: '#7AB2C2', frame: '#2A2A2A', board: '#1E2A22',
    table: ['#B8865A', '#7A5434'], lights: 'pendant', plants: true, Extras: EnuguExtras,
  },
  kano: {
    base: pal('#D9A86A', ['#C8945C', '#B8844E'], ['#9E2B25', '#B23A30'], '#3A2614'),
    up: pal('#F2E2C4', ['#C8945C', '#B8844E'], ['#1F3A8A', '#2E4F9E'], '#2E2010'),
    panel: '#9C6A3A', panelTrim: '#6E4620', trim: '#F2EEE2',
    frieze: ['#1F3A8A', '#F2EEE2', '#2E7D32', '#F2EEE2'],
    glass: '#E8D0A0', glassGlow: '#E0B870', frame: '#7A4A22', board: '#3A2A1A',
    table: ['#C99A66', '#8E5E32'], lights: 'lantern', plants: false, Extras: KanoExtras,
  },
  abuja: {
    base: pal('#EDE3D0', ['#E6DCCB', '#D8CCB8'], ['#1E7B45', '#2A9058'], '#2A2418'),
    up: pal('#F7F1E4', ['#E6DCCB', '#D8CCB8'], ['#8E1B2E', '#A82A3E'], '#2A2014'),
    panel: '#5A3A22', panelTrim: '#D4AF37', trim: '#D4AF37',
    frieze: ['#1E7B45', '#FFFFFF', '#D4AF37', '#FFFFFF'],
    glass: '#BFE0F0', glassGlow: '#8CC6E2', frame: '#D4AF37', board: '#1E3A2A',
    table: ['#7A4A28', '#5A341A'], lights: 'chandelier', plants: true, Extras: AbujaExtras,
  },
};
export const themeFor = (city: string) => ROOM_THEMES[city] ?? ROOM_THEMES.lagos;
