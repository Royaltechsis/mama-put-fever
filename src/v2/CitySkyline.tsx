import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

// A drawn view of each city along the horizon behind the level road, used until a painted backdrop is added
// (docs/road-backdrop-prompts.md). Landmarks are simple shapes in muted, hazy colours so they read as distance.

const rnd = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

type Sky = [string, string, string]; // top, horizon glow, haze tint for far shapes
export const SKY: Record<string, Sky> = {
  lagos: ['#7FB6DE', '#F6D8A8', '#9DB0C0'],
  ibadan: ['#9CC4DE', '#F7DDB0', '#B49A86'],
  ph: ['#6E9FC0', '#F2C79A', '#8FA3A8'],
  enugu: ['#8FC0E0', '#EAF0D8', '#8FA58A'],
  kano: ['#C8C2B0', '#F2D9A8', '#C2A27C'],
  abuja: ['#7DB8E8', '#EAF2F8', '#A4B4C2'],
};

/** a row of buildings along the horizon */
function Block({ seed, x0, x1, base, hMin, hMax, wMin, wMax, colors, windows, roof }: {
  seed: number; x0: number; x1: number; base: number; hMin: number; hMax: number; wMin: number; wMax: number; colors: string[];
  windows?: string; roof?: 'flat' | 'zinc' | 'mud';
}) {
  const r = rnd(seed); const out: React.ReactNode[] = [];
  for (let x = x0, i = 0; x < x1; i++) {
    const w = wMin + r() * (wMax - wMin); const h = hMin + r() * (hMax - hMin); const c = colors[Math.floor(r() * colors.length)];
    const top = base - h;
    out.push(<Rect key={'b' + i} x={x} y={top} width={w} height={h} fill={c} />);
    if (roof === 'zinc') out.push(<Polygon key={'r' + i} points={`${x - 2},${top} ${x + w / 2},${top - h * 0.35} ${x + w + 2},${top}`} fill={['#8A4A2A', '#9C5A32', '#7A3E22', '#A86A3E'][i % 4]} />);
    if (roof === 'mud') [0.15, 0.85].forEach((f, k) => out.push(<Polygon key={'z' + i + k} points={`${x + w * f - 3},${top} ${x + w * f},${top - 7} ${x + w * f + 3},${top}`} fill={c} />));
    if (windows && h > 26) {
      for (let wy = top + 6; wy < base - 8; wy += 9) for (let wx = x + 4; wx < x + w - 5; wx += 7) out.push(<Rect key={`w${i}_${wx}_${wy}`} x={wx} y={wy} width={3} height={4} fill={windows} />);
    }
    x += w + r() * 6;
  }
  return <>{out}</>;
}
function Hills({ y, color, seed, width, amp = 30 }: { y: number; color: string; seed: number; width: number; amp?: number }) {
  const r = rnd(seed); let d = `M 0 ${y}`;
  for (let x = 0; x <= width; x += 120) d += ` Q ${x + 60} ${y - amp * (0.4 + r())} ${x + 120} ${y - amp * 0.2 * r()}`;
  d += ` L ${width} ${y + 200} L 0 ${y + 200} Z`;
  return <Path d={d} fill={color} />;
}
function Water({ y, width, color }: { y: number; width: number; color: string }) {
  return (<>
    <Rect x={0} y={y} width={width} height={14} fill={color} />
    {Array.from({ length: Math.ceil(width / 46) }, (_, i) => <Rect key={i} x={i * 46 + (i % 3) * 9} y={y + 3 + (i % 3) * 3} width={18} height={1.4} fill="#FFFFFF" opacity={0.45} />)}
  </>);
}
function Palm({ x, y, s = 1, c = '#3E5A36' }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0 Q 3 -18 1 -36" stroke="#5A4632" strokeWidth={2.4} fill="none" />
      {[-60, -25, 10, 45, 80, 120].map((a) => <Path key={a} d={`M1 -36 q ${Math.cos((a * Math.PI) / 180) * 10} -6 ${Math.cos((a * Math.PI) / 180) * 18} ${Math.sin((a * Math.PI) / 180) * 9 + 4}`} stroke={c} strokeWidth={3.2} fill="none" strokeLinecap="round" />)}
    </G>
  );
}
function Dome({ x, y, r, c, minarets, mc }: { x: number; y: number; r: number; c: string; minarets?: number; mc?: string }) {
  return (<>
    <Rect x={x - r * 1.3} y={y - r * 0.6} width={r * 2.6} height={r * 0.6} fill={mc ?? '#E8E2D4'} />
    <Path d={`M ${x - r} ${y - r * 0.6} A ${r} ${r} 0 0 1 ${x + r} ${y - r * 0.6} Z`} fill={c} />
    <Rect x={x - 0.8} y={y - r * 1.75} width={1.6} height={r * 0.2} fill={c} />
    {Array.from({ length: minarets ?? 0 }, (_, i) => {
      const mx = x + (i - (minarets! - 1) / 2) * r * 1.4 * (i % 2 ? 1 : 1.25);
      return <G key={i}><Rect x={mx - 2} y={y - r * 2.2} width={4} height={r * 2.2} fill={mc ?? '#E8E2D4'} /><Polygon points={`${mx - 3},${y - r * 2.2} ${mx},${y - r * 2.6} ${mx + 3},${y - r * 2.2}`} fill={c} /></G>;
    })}
  </>);
}

function Lagos({ w, h }: { w: number; h: number }) {
  return (<>
    <Block seed={11} x0={0} x1={w} base={h - 14} hMin={34} hMax={92} wMin={14} wMax={30} colors={['#9FB2C4', '#AFC0CE', '#8EA3B6', '#B9C6D0']} windows="#DCE6EE" />
    <Water y={h - 16} width={w} color="#6E9CB8" />
    {/* the long low bridge across the lagoon */}
    <Rect x={0} y={h - 22} width={w} height={2.5} fill="#7A8794" />
    {Array.from({ length: Math.ceil(w / 34) }, (_, i) => <Rect key={i} x={i * 34} y={h - 20} width={2} height={8} fill="#7A8794" />)}
    <Block seed={5} x0={-10} x1={w} base={h + 4} hMin={14} hMax={34} wMin={20} wMax={44} colors={['#D9B48A', '#C98E68', '#E2C8A4', '#B98A6A', '#D8A276']} windows="#6E5A4A" />
    {Array.from({ length: Math.ceil(w / 90) }, (_, i) => <Palm key={i} x={i * 90 + 30} y={h + 4} s={0.9} />)}
  </>);
}
function Ibadan({ w, h }: { w: number; h: number }) {
  return (<>
    <Hills y={h - 30} color="#A9B49A" seed={3} width={w} amp={26} />
    <Block seed={21} x0={0} x1={w} base={h - 22} hMin={8} hMax={14} wMin={12} wMax={20} colors={['#D8C4A8', '#CDB496', '#E0CDB2']} roof="zinc" />
    {/* Cocoa House */}
    <Rect x={w * 0.32} y={h - 96} width={22} height={80} fill="#C9C4B8" />
    {Array.from({ length: 10 }, (_, i) => <Rect key={i} x={w * 0.32 + 2} y={h - 92 + i * 7.5} width={18} height={2} fill="#8E8A80" />)}
    <Block seed={23} x0={-6} x1={w} base={h + 4} hMin={10} hMax={18} wMin={16} wMax={28} colors={['#E2CCAC', '#D4B892', '#EAD8BC']} roof="zinc" />
  </>);
}
function PH({ w, h }: { w: number; h: number }) {
  return (<>
    <Block seed={31} x0={w * 0.55} x1={w} base={h - 14} hMin={28} hMax={70} wMin={14} wMax={26} colors={['#A4B0B8', '#B4BEC4', '#94A2AC']} windows="#DDE4E8" />
    {/* refinery with a gas flare */}
    {[0.12, 0.17, 0.22].map((f, i) => <Rect key={i} x={w * f} y={h - 70 - i * 8} width={5} height={56 + i * 8} fill="#8E969C" />)}
    <Rect x={w * 0.27} y={h - 86} width={3} height={72} fill="#8E969C" />
    <Ellipse cx={w * 0.27 + 1.5} cy={h - 92} rx={5} ry={9} fill="#FF9A3A" opacity={0.9} />
    <Ellipse cx={w * 0.27 + 1.5} cy={h - 90} rx={2.5} ry={5} fill="#FFE07A" />
    {[0.08, 0.3].map((f, i) => <G key={i}><Rect x={w * f} y={h - 34} width={22} height={20} fill="#A4ACB2" /><Ellipse cx={w * f + 11} cy={h - 34} rx={11} ry={3} fill="#B8C0C4" /></G>)}
    <Water y={h - 16} width={w} color="#5F8C96" />
    <Hills y={h - 2} color="#4E7A4A" seed={33} width={w} amp={12} />
    {Array.from({ length: Math.ceil(w / 70) }, (_, i) => <Palm key={i} x={i * 70 + 20} y={h + 4} s={0.85} c="#2F5A34" />)}
  </>);
}
function Enugu({ w, h }: { w: number; h: number }) {
  return (<>
    <Hills y={h - 40} color="#9AB08A" seed={41} width={w} amp={44} />
    <Hills y={h - 18} color="#6E9256" seed={43} width={w} amp={30} />
    {/* coal mine headframe */}
    <G transform={`translate(${w * 0.4} ${h - 30})`}>
      <Polygon points="-14,0 0,-46 14,0" fill="none" stroke="#4A4A4A" strokeWidth={2.5} />
      {[-34, -22, -10].map((y) => <Rect key={y} x={-12 + (-y / 46) * 4} y={y} width={24 - (-y / 46) * 8} height={1.6} fill="#4A4A4A" />)}
      <Circle cx={0} cy={-46} r={5} fill="none" stroke="#4A4A4A" strokeWidth={2} />
    </G>
    <Block seed={45} x0={-6} x1={w} base={h + 4} hMin={10} hMax={16} wMin={18} wMax={30} colors={['#ECE2D0', '#E0D2BA']} roof="zinc" />
  </>);
}
function Kano({ w, h }: { w: number; h: number }) {
  return (<>
    {/* the old city wall */}
    <Rect x={0} y={h - 24} width={w} height={22} fill="#B98A5A" />
    {Array.from({ length: Math.ceil(w / 14) }, (_, i) => <Polygon key={i} points={`${i * 14},${h - 24} ${i * 14 + 7},${h - 32} ${i * 14 + 14},${h - 24}`} fill="#B98A5A" />)}
    <Dome x={w * 0.36} y={h - 24} r={16} c="#3E8E5A" minarets={4} mc="#E8E0CC" />
    <Dome x={w * 0.74} y={h - 24} r={10} c="#E0D4B8" minarets={2} mc="#D8C8A6" />
    <Block seed={51} x0={-6} x1={w} base={h + 4} hMin={12} hMax={22} wMin={18} wMax={34} colors={['#D4A46C', '#C8965E', '#DEB27C']} roof="mud" />
  </>);
}
function Abuja({ w, h }: { w: number; h: number }) {
  return (<>
    {/* Aso Rock */}
    <Path d={`M ${w * 0.05} ${h - 10} Q ${w * 0.12} ${h - 110} ${w * 0.26} ${h - 96} Q ${w * 0.34} ${h - 70} ${w * 0.4} ${h - 10} Z`} fill="#9C9A94" />
    <Path d={`M ${w * 0.12} ${h - 60} Q ${w * 0.18} ${h - 92} ${w * 0.24} ${h - 88}`} stroke="#B4B2AC" strokeWidth={3} fill="none" />
    <Dome x={w * 0.55} y={h - 10} r={20} c="#D4AF37" minarets={4} mc="#F2EEE4" />
    <Block seed={61} x0={w * 0.7} x1={w} base={h - 6} hMin={30} hMax={84} wMin={14} wMax={24} colors={['#9EC0DA', '#B2CCE0', '#8EB2CE']} windows="#E6F0F8" />
    <Rect x={w * 0.86} y={h - 120} width={3} height={110} fill="#C8CED4" />
    <Block seed={63} x0={-6} x1={w} base={h + 4} hMin={8} hMax={14} wMin={24} wMax={40} colors={['#F2EEE4', '#E6E0D2']} />
  </>);
}
const CITIES: Record<string, (p: { w: number; h: number }) => React.ReactElement> = { lagos: Lagos, ibadan: Ibadan, ph: PH, enugu: Enugu, kano: Kano, abuja: Abuja };

/** sky, haze and the city along the horizon; `w`/`h` in stage units, the horizon is at `h` */
export function CitySkyline({ city, w, h, k }: { city: string; w: number; h: number; k: number }) {
  const sky = SKY[city] ?? SKY.lagos;
  const City = CITIES[city] ?? Lagos;
  return (
    <Svg width={w * k} height={(h + 12) * k} viewBox={`0 0 ${w} ${h + 12}`}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={sky[0]} />
          <Stop offset="1" stopColor={sky[1]} />
        </LinearGradient>
        <LinearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={sky[1]} stopOpacity={0} />
          <Stop offset="1" stopColor={sky[1]} stopOpacity={0.45} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={w} height={h + 12} fill="url(#sky)" />
      <City w={w} h={h} />
      <Rect x={0} y={h * 0.45} width={w} height={h * 0.55 + 12} fill="url(#haze)" />
    </Svg>
  );
}
