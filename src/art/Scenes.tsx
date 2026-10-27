import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Pattern, Rect, Polygon, Text as SvgText } from 'react-native-svg';
import type { StationKind, DishId } from '../data';

export type VesselState = 'adding' | 'cooking' | 'ready' | 'burnt' | 'served';

export function Vessel({ kind, fill, color, state, count = 0, flipped, gas, width = 110, mash = 0 }: {
  kind: StationKind; fill: number; color: string; state: VesselState; count?: number; flipped?: boolean; gas?: boolean; width?: number; mash?: number;
}) {
  const h = width * (100 / 120);
  const heat = state === 'cooking' || state === 'ready' || state === 'burnt';
  const flame = gas ? '#3D8BFF' : '#F28C28';
  const burnt = state === 'burnt';
  const c = burnt ? '#2B1B12' : color;
  return (
    <Svg width={width} height={h} viewBox="0 0 120 100">
      {/* steam / smoke */}
      {heat && !burnt && (
        <G opacity={0.75}>
          <Path d="M45 22 q-6 -8 0 -14 q6 -6 0 -12" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M62 20 q-6 -8 0 -14 q6 -6 0 -12" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M79 22 q-6 -8 0 -14 q6 -6 0 -12" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" />
        </G>
      )}
      {burnt && (
        <G>
          <Circle cx={50} cy={14} r={10} fill="#3A3A3A" opacity={0.7} />
          <Circle cx={66} cy={8} r={12} fill="#2A2A2A" opacity={0.7} />
          <Circle cx={80} cy={16} r={8} fill="#4A4A4A" opacity={0.7} />
        </G>
      )}
      {kind === 'pot' && (
        <G>
          <Rect x={18} y={84} width={84} height={12} rx={3} fill="#3A3A3A" />
          {heat && <Path d="M34 86 q4 -10 8 0 M52 86 q4 -12 8 0 M70 86 q4 -10 8 0" fill={flame} stroke={flame} strokeWidth={2} />}
          <Path d="M20 40 Q20 86 60 86 Q100 86 100 40 Z" fill="#2E2E2E" />
          <Rect x={8} y={42} width={14} height={6} rx={3} fill="#2E2E2E" />
          <Rect x={98} y={42} width={14} height={6} rx={3} fill="#2E2E2E" />
          <Ellipse cx={60} cy={40} rx={40} ry={10} fill="#1A1A1A" />
          {fill > 0 && <Ellipse cx={60} cy={40 + (1 - fill) * 6} rx={36 * (0.6 + 0.4 * fill)} ry={8 * (0.6 + 0.4 * fill)} fill={c} />}
          {fill > 0 && !burnt && state !== 'adding' && (
            <G>
              <Circle cx={48} cy={40} r={2} fill="#FFFFFF66" />
              <Circle cx={70} cy={38} r={2.5} fill="#FFFFFF55" />
            </G>
          )}
          <Path d="M28 56 Q60 66 92 56" stroke="#4A4A4A" strokeWidth={2} fill="none" />
        </G>
      )}
      {kind === 'grill' && (
        <G>
          <Rect x={24} y={60} width={6} height={36} fill="#3A3A3A" />
          <Rect x={90} y={60} width={6} height={36} fill="#3A3A3A" />
          <Path d="M12 46 H108 L100 70 H20 Z" fill="#4A4A4A" />
          <Rect x={18} y={46} width={84} height={10} fill={heat ? '#E2531B' : '#5A3A2A'} />
          {heat && [26, 40, 54, 68, 82, 96].map((x, i) => <Circle key={i} cx={x} cy={51} r={3} fill="#FFC93C" opacity={0.8} />)}
          {[22, 34, 46, 58, 70, 82, 94].map((x) => <Line key={x} x1={x} y1={42} x2={x} y2={46} stroke="#888" strokeWidth={1} />)}
          <Line x1={14} y1={44} x2={106} y2={44} stroke="#999" strokeWidth={2} />
          {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
            <G key={i} transform={`translate(${20 + i * 14} 0)`}>
              <Line x1={0} y1={30} x2={10} y2={46} stroke="#C9A06A" strokeWidth={2} />
              <Rect x={1} y={30} width={8} height={12} rx={3} fill={c} transform="rotate(-30 5 36)" />
              {flipped && !burnt && <Path d="M2 34 l6 4" stroke="#2B1B12" strokeWidth={1.5} />}
            </G>
          ))}
        </G>
      )}
      {kind === 'pan' && (
        <G>
          <Rect x={22} y={86} width={70} height={10} rx={3} fill="#3A3A3A" />
          {heat && <Path d="M36 88 q4 -10 8 0 M52 88 q4 -12 8 0 M68 88 q4 -10 8 0" fill={flame} stroke={flame} strokeWidth={2} />}
          <Rect x={92} y={60} width={26} height={7} rx={3} fill="#5E3A1A" transform="rotate(-8 92 60)" />
          <Ellipse cx={57} cy={66} rx={44} ry={16} fill="#2E2E2E" />
          <Ellipse cx={57} cy={63} rx={38} ry={12} fill={fill > 0 ? '#F6C94588' : '#1A1A1A'} />
          {Array.from({ length: Math.min(count, 7) }).map((_, i) => {
            const pos = [[38, 60], [52, 58], [66, 60], [80, 63], [44, 68], [58, 69], [72, 68]][i];
            return <Ellipse key={i} cx={pos[0]} cy={pos[1]} rx={7} ry={4.5} fill={c} stroke={flipped ? '#9A4E12' : '#D9A21A'} strokeWidth={1.2} />;
          })}
        </G>
      )}
      {kind === 'bowl' && (
        <G>
          <Ellipse cx={60} cy={44} rx={46} ry={12} fill="#5E3A1A" />
          {fill > 0 && <Ellipse cx={60} cy={45} rx={40} ry={9} fill={mash > 0 ? color : '#7FB8E0'} />}
          {mash > 0 && <Ellipse cx={60} cy={42 - mash * 8} rx={18 + mash * 8} ry={6 + mash * 8} fill={color} />}
          {mash >= 1 && <Path d="M48 34 q12 -6 24 0" stroke="#FFFFFF88" strokeWidth={2} fill="none" />}
          <Path d="M14 44 Q16 92 60 92 Q104 92 106 44 Q60 60 14 44 Z" fill="#8B5A2B" />
          <Path d="M22 62 Q60 76 98 62" stroke="#FFC93C" strokeWidth={3} fill="none" />
          <Path d="M28 72 Q60 84 92 72" stroke="#D7263D" strokeWidth={3} fill="none" />
        </G>
      )}
    </Svg>
  );
}

export function FoodPortion({ dish, size = 56 }: { dish: DishId; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={40} rx={28} ry={14} fill="#FFFFFF" stroke="#DDD" strokeWidth={1.5} />
      {dish === 'jollof' && (
        <G>
          <Ellipse cx={30} cy={36} rx={18} ry={9} fill="#D9481C" />
          {[22, 28, 34, 38, 25, 31].map((x, i) => <Circle key={i} cx={x} cy={33 + (i % 3) * 2} r={1.3} fill="#F28C28" />)}
          <Rect x={40} y={34} width={10} height={8} rx={3} fill="#7A3022" />
        </G>
      )}
      {dish === 'egusi' && (
        <G>
          <Ellipse cx={22} cy={36} rx={11} ry={8} fill="#F5D77A" />
          <Ellipse cx={42} cy={38} rx={13} ry={7} fill="#C9772A" />
          <Circle cx={38} cy={36} r={2} fill="#2E8B3D" />
          <Circle cx={46} cy={39} r={2} fill="#2E8B3D" />
          <Rect x={40} y={33} width={6} height={4} rx={1} fill="#7A3022" />
        </G>
      )}
      {dish === 'suya' && (
        <G>
          {[0, 1, 2].map((i) => <Rect key={i} x={16 + i * 11} y={30 + (i % 2) * 3} width={10} height={8} rx={2} fill="#6B2E14" />)}
          <Circle cx={22} cy={30} r={1.3} fill="#D7263D" />
          <Circle cx={36} cy={32} r={1.3} fill="#D7263D" />
          <Path d="M44 34 q4 -4 8 0" stroke="#8E4585" strokeWidth={2} fill="none" />
        </G>
      )}
      {dish === 'dodo' && (
        <G>
          {[[22, 36], [32, 34], [42, 37], [27, 42], [38, 43]].map(([x, y], i) => (
            <Ellipse key={i} cx={x} cy={y} rx={6} ry={4} fill="#D9821E" stroke="#9A4E12" strokeWidth={1} />
          ))}
        </G>
      )}
    </Svg>
  );
}

export function AnkaraBand({ width, height = 16 }: { width: number; height?: number }) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <Pattern id="ank" x={0} y={0} width={32} height={16} patternUnits="userSpaceOnUse">
          <Rect width={32} height={16} fill="#6A3E9E" />
          <Polygon points="0,8 8,0 16,8 8,16" fill="#F28C28" />
          <Circle cx={8} cy={8} r={3} fill="#FFC93C" />
          <Polygon points="16,8 24,0 32,8 24,16" fill="#1B998B" />
          <Circle cx={24} cy={8} r={3} fill="#FFF4E0" />
          <Circle cx={24} cy={8} r={1.4} fill="#D7263D" />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#ank)" />
    </Svg>
  );
}

export function Customer({ skin, wrap, female, mood = 'happy', size = 80 }: {
  skin: string; wrap: string; female: boolean; mood?: 'happy' | 'ok' | 'sad' | 'angry'; size?: number;
}) {
  const mouth = {
    happy: 'M24 44 Q32 54 40 44',
    ok: 'M25 47 Q32 50 39 47',
    sad: 'M25 50 Q32 44 39 50',
    angry: 'M24 50 Q32 45 40 50',
  }[mood];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={31} fill="#FFF4E0" />
      <Path d="M10 64 Q12 48 32 48 Q52 48 54 64 Z" fill={wrap} />
      <Ellipse cx={32} cy={34} rx={15} ry={17} fill={skin} />
      {female ? (
        <G>
          <Path d="M12 26 Q14 6 32 6 Q52 6 54 24 Q50 18 44 22 Q38 12 30 18 Q22 12 18 22 Q14 20 12 26 Z" fill={wrap} />
          <Path d="M46 10 Q58 4 56 18 Q52 12 46 14 Z" fill={wrap} />
          <Path d="M18 22 Q32 14 46 22" stroke="#FFC93C" strokeWidth={2} fill="none" />
        </G>
      ) : (
        <G>
          <Path d="M17 24 Q18 12 32 12 Q46 12 47 24 Z" fill={wrap} />
          <Path d="M17 24 Q32 20 47 24" stroke="#FFC93C" strokeWidth={1.5} fill="none" />
          <Path d="M44 14 Q50 10 50 20" fill={wrap} />
        </G>
      )}
      {mood === 'angry' ? (
        <G>
          <Path d="M22 31 l7 2 M42 31 l-7 2" stroke="#2B1B12" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={26} cy={36} r={2} fill="#2B1B12" />
          <Circle cx={38} cy={36} r={2} fill="#2B1B12" />
        </G>
      ) : mood === 'happy' ? (
        <G>
          <Path d="M23 36 q3 -4 6 0 M35 36 q3 -4 6 0" stroke="#2B1B12" strokeWidth={2} fill="none" strokeLinecap="round" />
          <Circle cx={21} cy={41} r={2.4} fill="#E86A6A" opacity={0.6} />
          <Circle cx={43} cy={41} r={2.4} fill="#E86A6A" opacity={0.6} />
        </G>
      ) : (
        <G>
          <Circle cx={26} cy={36} r={2} fill="#2B1B12" />
          <Circle cx={38} cy={36} r={2} fill="#2B1B12" />
        </G>
      )}
      <Path d={mouth} stroke="#2B1B12" strokeWidth={2.2} fill={mood === 'happy' ? '#8B1E1E' : 'none'} strokeLinecap="round" />
    </Svg>
  );
}

export function GhanaBag({ width = 150, fullness = 0, sealed }: { width?: number; fullness?: number; sealed?: boolean }) {
  const h = width * 0.72;
  const bulge = 4 + fullness * 10;
  return (
    <Svg width={width} height={h} viewBox="0 0 150 108">
      <Defs>
        <Pattern id="chk" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
          <Rect width={20} height={20} fill="#F4F1EA" />
          <Rect width={10} height={20} fill="#2D4F9E" opacity={0.55} />
          <Rect width={20} height={10} fill="#D7263D" opacity={0.45} />
        </Pattern>
      </Defs>
      <Path d="M48 28 Q48 8 62 8 M102 28 Q102 8 88 8" stroke="#2D4F9E" strokeWidth={6} fill="none" />
      <Path d={`M14 28 H136 Q${140 + bulge} 66 136 102 H14 Q${10 - bulge} 66 14 28 Z`} fill="url(#chk)" stroke="#2D4F9E" strokeWidth={2} />
      <Path d="M14 40 H136" stroke={sealed ? '#0B6E4F' : '#999'} strokeWidth={sealed ? 4 : 2} strokeDasharray={sealed ? '0' : '6 4'} />
    </Svg>
  );
}

export function Okada({ width = 200, loaded = 0 }: { width?: number; loaded?: number }) {
  return (
    <Svg width={width} height={width * 0.6} viewBox="0 0 200 120">
      <Circle cx={46} cy={92} r={22} fill="#2B1B12" />
      <Circle cx={46} cy={92} r={10} fill="#9AA5B1" />
      <Circle cx={156} cy={92} r={22} fill="#2B1B12" />
      <Circle cx={156} cy={92} r={10} fill="#9AA5B1" />
      <Path d="M46 92 L80 64 H128 L156 92" stroke="#3A3A3A" strokeWidth={6} fill="none" />
      <Path d="M70 70 Q100 50 136 62 L146 80 H84 Z" fill="#D7263D" />
      <Path d="M138 62 L150 40" stroke="#3A3A3A" strokeWidth={5} />
      <Rect x={144} y={34} width={18} height={6} rx={3} fill="#3A3A3A" />
      <Circle cx={164} cy={52} r={5} fill="#FFC93C" />
      {/* delivery box */}
      <Rect x={18} y={26} width={54} height={40} rx={4} fill="#0B6E4F" />
      <Rect x={18} y={26} width={54} height={8} rx={3} fill="#074634" />
      <SvgText x={45} y={53} fontSize={8.5} fontWeight="bold" fill="#FFC93C" textAnchor="middle">MAMAPUT</SvgText>
      {loaded > 0 && <Rect x={22} y={60} width={46 * Math.min(1, loaded)} height={3} fill="#FFC93C" />}
      {/* rider */}
      <Path d="M96 60 L108 30 L124 30 L130 58 Z" fill="#F28C28" />
      <Path d="M100 60 L92 84 M126 58 L136 80" stroke="#2D4F9E" strokeWidth={8} strokeLinecap="round" />
      <Path d="M120 36 L144 46" stroke="#5C3A21" strokeWidth={6} strokeLinecap="round" />
      <Circle cx={116} cy={20} r={12} fill="#5C3A21" />
      <Path d="M103 20 Q104 6 116 6 Q130 6 130 20 Z" fill="#FFC93C" />
      <Rect x={116} y={16} width={14} height={5} rx={2} fill="#2B1B12" opacity={0.7} />
    </Svg>
  );
}

export function Stall({ width = 320 }: { width?: number }) {
  return (
    <Svg width={width} height={width * 0.62} viewBox="0 0 320 200">
      {/* awning */}
      <Rect x={10} y={10} width={300} height={16} rx={4} fill="#5E3A1A" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Path key={i} d={`M${10 + i * 30} 26 h30 v22 q-15 12 -30 0 Z`} fill={i % 2 ? '#FFF4E0' : '#0B6E4F'} />
      ))}
      <Rect x={22} y={48} width={8} height={130} fill="#8B5A2B" />
      <Rect x={290} y={48} width={8} height={130} fill="#8B5A2B" />
      {/* sign */}
      <Rect x={90} y={56} width={140} height={30} rx={6} fill="#FFC93C" stroke="#5E3A1A" strokeWidth={3} />
      <SvgText x={160} y={77} fontSize={16} fontWeight="bold" fill="#5E3A1A" textAnchor="middle">MAMAPUT</SvgText>
      {/* mama */}
      <Path d="M130 178 Q132 120 160 118 Q188 120 190 178 Z" fill="#D7263D" />
      <Path d="M130 150 Q160 160 190 150" stroke="#FFC93C" strokeWidth={4} fill="none" />
      <Ellipse cx={160} cy={108} rx={16} ry={18} fill="#6B3E26" />
      <Path d="M140 100 Q142 78 160 78 Q180 78 182 98 Q176 92 168 96 Q160 86 152 94 Q146 90 140 100 Z" fill="#6A3E9E" />
      <Path d="M174 82 Q190 74 186 92 Q182 84 174 86 Z" fill="#6A3E9E" />
      <Path d="M152 112 Q160 120 168 112" stroke="#2B1B12" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M150 104 q3 -4 6 0 M164 104 q3 -4 6 0" stroke="#2B1B12" strokeWidth={2} fill="none" />
      {/* ladle */}
      <Path d="M192 140 L214 104" stroke="#9AA5B1" strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx={216} cy={100} rx={7} ry={5} fill="#9AA5B1" />
      {/* counter */}
      <Rect x={10} y={160} width={300} height={34} rx={4} fill="#B9824C" />
      <Rect x={10} y={160} width={300} height={8} fill="#8B5A2B" />
      {/* pots */}
      <Path d="M40 150 Q40 172 66 172 Q92 172 92 150 Z" fill="#2E2E2E" />
      <Ellipse cx={66} cy={150} rx={26} ry={7} fill="#D9481C" />
      <Path d="M228 150 Q228 172 254 172 Q280 172 280 150 Z" fill="#2E2E2E" />
      <Ellipse cx={254} cy={150} rx={26} ry={7} fill="#C9772A" />
      <Circle cx={248} cy={148} r={3} fill="#2E8B3D" />
      <Path d="M56 142 q-4 -8 0 -14 M72 140 q-4 -8 0 -14 M246 140 q-4 -8 0 -14 M262 142 q-4 -8 0 -14" stroke="#FFFFFF" strokeWidth={2.5} fill="none" />
    </Svg>
  );
}

export function Star({ on, size = 28 }: { on: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6 Z"
        fill={on ? '#FFC93C' : '#E6D9C3'} stroke={on ? '#E8A21A' : '#CDBFA6'} strokeWidth={1.2} />
    </Svg>
  );
}

export function Road({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height}>
      <Rect width={width} height={height} fill="#BDE4F4" />
      <Rect y={height * 0.55} width={width} height={height * 0.45} fill="#7FA650" />
      {Array.from({ length: 6 }).map((_, i) => (
        <G key={i}>
          <Rect x={i * (width / 5) + 6} y={height * 0.22} width={width / 7} height={height * 0.33} fill={['#F4E6CF', '#E9C9A0', '#D9E4F0', '#F2D0C4', '#E8E0B0', '#F4E6CF'][i]} />
          <Rect x={i * (width / 5) + 12} y={height * 0.3} width={10} height={10} fill="#5E3A1A" opacity={0.5} />
          <Path d={`M${i * (width / 5) + 2} ${height * 0.22} l${width / 14 + 4} -14 l${width / 14 + 4} 14 Z`} fill="#8B5A2B" />
        </G>
      ))}
      <Rect y={height * 0.6} width={width} height={height * 0.3} fill="#4A4A4A" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Rect key={i} x={i * (width / 8)} y={height * 0.745} width={width / 16} height={3} fill="#FFC93C" />
      ))}
    </Svg>
  );
}
