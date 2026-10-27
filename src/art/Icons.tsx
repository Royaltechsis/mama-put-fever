import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect, Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { IngId, PkgId } from '../data';

const Bowl = ({ fill, rim = '#7A4A23', children }: { fill: string; rim?: string; children?: React.ReactNode }) => (
  <G>
    <Ellipse cx={32} cy={30} rx={24} ry={8} fill={fill} />
    {children}
    <Path d="M8 30 Q10 54 32 55 Q54 54 56 30 Z" fill={rim} />
    <Path d="M12 36 Q32 42 52 36" stroke="#00000022" strokeWidth={2} fill="none" />
    <Path d="M14 42 Q32 47 50 42" stroke="#FFC93C" strokeWidth={2.5} fill="none" />
  </G>
);

const Bottle = ({ liquid }: { liquid: string }) => (
  <G>
    <Rect x={26} y={6} width={12} height={8} rx={2} fill="#2B1B12" />
    <Path d="M27 14 h10 v6 q8 4 8 12 v22 q0 4 -4 4 h-18 q-4 0 -4 -4 v-22 q0 -8 8 -12 Z" fill="#E8F4F8" opacity={0.95} />
    <Path d="M20 30 q0 -2 2 -3 h20 q2 1 2 3 v24 q0 4 -4 4 h-16 q-4 0 -4 -4 Z" fill={liquid} />
    <Rect x={22} y={36} width={20} height={10} rx={2} fill="#FFFFFFCC" />
    <Rect x={25} y={39} width={14} height={4} rx={1} fill={liquid} opacity={0.6} />
  </G>
);

export function IngredientIcon({ id, size = 48 }: { id: IngId; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {renderIng(id)}
    </Svg>
  );
}

function renderIng(id: IngId) {
  switch (id) {
    case 'rice':
      return (
        <G>
          <Path d="M12 18 Q14 8 32 8 Q50 8 52 18 L54 52 Q54 58 46 58 H18 Q10 58 10 52 Z" fill="#E9D8B4" />
          <Path d="M12 18 Q32 26 52 18" stroke="#B9935A" strokeWidth={2} fill="none" />
          <Rect x={18} y={30} width={28} height={16} rx={3} fill="#0B6E4F" />
          <SvgText x={32} y={42} fontSize={10} fontWeight="bold" fill="#FFF" textAnchor="middle">RICE</SvgText>
          <Ellipse cx={32} cy={14} rx={14} ry={4} fill="#FFFDF5" />
        </G>
      );
    case 'blend':
      return (
        <Bowl fill="#D7263D">
          <Circle cx={24} cy={28} r={2} fill="#F28C28" />
          <Circle cx={38} cy={29} r={2.4} fill="#F28C28" />
          <Path d="M30 22 q4 -6 8 -2" stroke="#2E8B3D" strokeWidth={3} fill="none" strokeLinecap="round" />
        </Bowl>
      );
    case 'onion':
      return (
        <G>
          <Path d="M32 8 Q36 16 44 22 Q54 30 50 44 Q46 56 32 56 Q18 56 14 44 Q10 30 20 22 Q28 16 32 8 Z" fill="#8E4585" />
          <Path d="M32 12 Q26 30 28 54" stroke="#C48BBF" strokeWidth={2} fill="none" />
          <Path d="M32 12 Q40 30 38 54" stroke="#C48BBF" strokeWidth={2} fill="none" />
          <Path d="M30 8 q2 -6 4 0" stroke="#7FA650" strokeWidth={3} fill="none" />
        </G>
      );
    case 'vegoil':
      return <Bottle liquid="#F6C945" />;
    case 'palmoil':
      return <Bottle liquid="#E2531B" />;
    case 'cube':
      return (
        <G>
          <Polygon points="32,10 54,20 54,44 32,54 10,44 10,20" fill="#E8A21A" />
          <Polygon points="32,10 54,20 32,30 10,20" fill="#FFD25E" />
          <Polygon points="32,30 54,20 54,44 32,54" fill="#C9831A" />
          <Path d="M14 33 L30 41" stroke="#D7263D" strokeWidth={4} />
          <Path d="M36 41 L50 34" stroke="#D7263D" strokeWidth={4} />
          <Circle cx={32} cy={20} r={3} fill="#D7263D" />
        </G>
      );
    case 'meat':
      return (
        <G>
          <Rect x={8} y={26} width={22} height={18} rx={7} fill="#8B3A2B" />
          <Rect x={28} y={18} width={26} height={20} rx={8} fill="#A0442F" />
          <Rect x={22} y={36} width={24} height={18} rx={7} fill="#7A3022" />
          <Path d="M32 22 q8 2 16 0" stroke="#F1D1C1" strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M12 32 q6 3 12 0" stroke="#F1D1C1" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'egusi':
      return (
        <Bowl fill="#E9D8A6">
          {[18, 24, 30, 36, 42, 46, 21, 27, 33, 39].map((x, i) => (
            <Ellipse key={i} cx={x} cy={i < 6 ? 28 : 32} rx={2.2} ry={1.4} fill="#C9B27A" />
          ))}
        </Bowl>
      );
    case 'ugu':
      return (
        <G>
          <Path d="M32 56 Q14 44 16 24 Q30 26 32 56 Z" fill="#2E8B3D" />
          <Path d="M32 56 Q50 44 48 24 Q34 26 32 56 Z" fill="#3FA34D" />
          <Path d="M32 54 Q24 30 32 8 Q42 30 32 54 Z" fill="#27773A" />
          <Path d="M32 52 L32 14" stroke="#9FD39A" strokeWidth={1.5} />
        </G>
      );
    case 'garri':
      return (
        <Bowl fill="#F3E3B5" rim="#5E3A1A">
          {[20, 26, 32, 38, 44, 23, 29, 35, 41].map((x, i) => (
            <Circle key={i} cx={x} cy={i < 5 ? 28 : 31} r={1.2} fill="#D8C08A" />
          ))}
        </Bowl>
      );
    case 'hotwater':
      return (
        <G>
          <Path d="M24 4 q-4 6 0 10 q4 4 0 10" stroke="#B9D7EA" strokeWidth={2.5} fill="none" />
          <Path d="M34 2 q-4 6 0 10 q4 4 0 10" stroke="#B9D7EA" strokeWidth={2.5} fill="none" />
          <Path d="M14 28 Q14 22 22 22 H42 Q50 22 50 28 L52 54 Q52 58 46 58 H18 Q12 58 12 54 Z" fill="#9AA5B1" />
          <Path d="M50 30 Q60 32 58 44" stroke="#9AA5B1" strokeWidth={4} fill="none" />
          <Path d="M14 32 L4 26" stroke="#9AA5B1" strokeWidth={5} strokeLinecap="round" />
          <Rect x={22} y={18} width={20} height={5} rx={2} fill="#2B1B12" />
          <Rect x={16} y={38} width={34} height={6} fill="#7FB8E0" opacity={0.8} />
        </G>
      );
    case 'beef':
      return (
        <G>
          <Line x1={6} y1={58} x2={58} y2={6} stroke="#C9A06A" strokeWidth={3} strokeLinecap="round" />
          <Rect x={12} y={36} width={14} height={12} rx={4} fill="#B23A3A" transform="rotate(-45 19 42)" />
          <Rect x={24} y={24} width={14} height={12} rx={4} fill="#C0453F" transform="rotate(-45 31 30)" />
          <Rect x={36} y={12} width={14} height={12} rx={4} fill="#B23A3A" transform="rotate(-45 43 18)" />
          <Path d="M17 40 l4 4 M29 28 l4 4 M41 16 l4 4" stroke="#F1D1C1" strokeWidth={2} />
        </G>
      );
    case 'yaji':
      return (
        <G>
          <Ellipse cx={32} cy={50} rx={26} ry={7} fill="#F4E6CF" />
          <Path d="M10 50 Q20 18 32 16 Q44 18 54 50 Z" fill="#9C5B2E" />
          {[22, 30, 38, 26, 34, 42, 28].map((x, i) => (
            <Circle key={i} cx={x} cy={30 + (i % 3) * 6} r={1.6} fill={i % 2 ? '#D7263D' : '#5E3A1A'} />
          ))}
        </G>
      );
    case 'plantain':
      return (
        <G>
          <Path d="M10 20 Q14 52 50 50 Q56 49 56 44 Q30 46 20 18 Q16 12 10 20 Z" fill="#F2C230" />
          <Path d="M14 22 Q22 44 50 46" stroke="#D9A21A" strokeWidth={2} fill="none" />
          <Circle cx={12} cy={18} r={3.5} fill="#3A2A1A" />
          <Circle cx={55} cy={46} r={2.5} fill="#3A2A1A" />
          <Circle cx={30} cy={40} r={1.5} fill="#7A5A1A" />
          <Circle cx={40} cy={44} r={1.2} fill="#7A5A1A" />
        </G>
      );
    case 'salt':
      return (
        <G>
          <Path d="M20 22 h24 l-2 34 q0 4 -4 4 h-12 q-4 0 -4 -4 Z" fill="#F4F4F4" stroke="#C8C8C8" strokeWidth={1.5} />
          <Path d="M20 22 q12 -14 24 0 Z" fill="#B0B8C0" />
          <Circle cx={28} cy={16} r={1.2} fill="#555" />
          <Circle cx={32} cy={14} r={1.2} fill="#555" />
          <Circle cx={36} cy={16} r={1.2} fill="#555" />
          <Rect x={24} y={34} width={16} height={10} rx={2} fill="#1B998B" />
        </G>
      );
    case 'crayfish':
      return (
        <G>
          <Ellipse cx={32} cy={50} rx={24} ry={7} fill="#F4E6CF" />
          {[[20, 38], [34, 34], [44, 44], [26, 48]].map(([x, y], i) => (
            <Path key={i} d={`M${x} ${y} q8 -10 14 -2 q-4 2 -6 6 q-4 -2 -8 -4 Z`} fill="#E07A3F" stroke="#B2531F" strokeWidth={1} />
          ))}
        </G>
      );
  }
}

export function PkgIcon({ id, size = 48 }: { id: PkgId; size?: number }) {
  const multi = id.endsWith('5') || id === 'water6';
  const base = id.replace(/\d+$/, '') as string;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {multi && <G transform="translate(-6 -6)" opacity={0.55}>{renderPkg(base)}</G>}
      {multi && <G transform="translate(-3 -3)" opacity={0.8}>{renderPkg(base)}</G>}
      {renderPkg(base)}
    </Svg>
  );
}

function renderPkg(base: string) {
  switch (base) {
    case 'pack':
      return (
        <G>
          <Path d="M8 30 L56 30 L52 54 Q52 56 50 56 H14 Q12 56 12 54 Z" fill="#FFFFFF" stroke="#C9C9C9" strokeWidth={1.5} />
          <Path d="M8 30 L14 16 H50 L56 30 Z" fill="#F4F4F4" stroke="#C9C9C9" strokeWidth={1.5} />
          <Rect x={26} y={27} width={12} height={5} rx={2} fill="#D9D9D9" />
          <Path d="M18 42 h28" stroke="#E2E2E2" strokeWidth={2} />
        </G>
      );
    case 'foil':
      return (
        <G>
          <Path d="M10 24 L30 14 L54 22 L56 44 L34 54 L12 46 Z" fill="#C9D1D9" />
          <Path d="M10 24 L34 32 L54 22" stroke="#9BA6B1" strokeWidth={1.5} fill="none" />
          <Path d="M34 32 L34 54" stroke="#9BA6B1" strokeWidth={1.5} />
          <Path d="M16 28 l8 3 M40 36 l8 -3" stroke="#FFFFFF" strokeWidth={2} />
        </G>
      );
    case 'cooler':
      return (
        <G>
          <Rect x={8} y={22} width={48} height={34} rx={5} fill="#2D6FB5" />
          <Rect x={6} y={14} width={52} height={12} rx={4} fill="#F4F4F4" />
          <Rect x={24} y={8} width={16} height={8} rx={3} fill="none" stroke="#F4F4F4" strokeWidth={3} />
          <Rect x={14} y={32} width={36} height={6} rx={3} fill="#4A8BD1" />
          <SvgText x={32} y={51} fontSize={9} fontWeight="bold" fill="#FFF" textAnchor="middle">10</SvgText>
        </G>
      );
    case 'water':
      return (
        <G>
          <Rect x={26} y={6} width={12} height={6} rx={2} fill="#1B6FB5" />
          <Path d="M26 12 h12 v4 q8 4 8 12 v26 q0 4 -4 4 h-20 q-4 0 -4 -4 v-26 q0 -8 8 -12 Z" fill="#CFEAF8" stroke="#8CC4E3" strokeWidth={1.5} />
          <Rect x={18} y={32} width={28} height={10} fill="#1B998B" />
          <Path d="M20 48 q12 4 24 0" stroke="#8CC4E3" strokeWidth={1.5} fill="none" />
        </G>
      );
    case 'slaw':
      return (
        <G>
          <Path d="M12 26 h40 l-4 28 q0 2 -2 2 h-28 q-2 0 -2 -2 Z" fill="#FFFFFF" stroke="#C9C9C9" strokeWidth={1.5} />
          <Ellipse cx={32} cy={26} rx={20} ry={6} fill="#EFF7E1" />
          <Path d="M18 25 q4 -3 8 0 M30 24 q4 -3 8 0 M40 26 q3 -2 6 0" stroke="#7FB34D" strokeWidth={2} fill="none" />
          <Path d="M22 27 l6 -1 M36 27 l5 1" stroke="#F28C28" strokeWidth={2} />
        </G>
      );
    case 'side':
      return (
        <G>
          <Ellipse cx={32} cy={42} rx={24} ry={12} fill="#FFFFFF" stroke="#C9C9C9" strokeWidth={1.5} />
          {[[22, 38], [32, 36], [42, 39], [27, 45], [38, 46]].map(([x, y], i) => (
            <Ellipse key={i} cx={x} cy={y} rx={6} ry={4} fill="#D9821E" stroke="#B5621A" strokeWidth={1} />
          ))}
        </G>
      );
  }
  return null;
}
