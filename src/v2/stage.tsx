import React, { createContext, useContext } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Pressable, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export const SW = 844;
export const SH = 390;

const KCtx = createContext(1);
export const useK = () => useContext(KCtx);

/** Fixed 844x390 logical stage, scaled to fit the screen (letterboxed). Children use S(n) for sizes. */
export function Stage({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const portrait = height > width * 1.1;
  const k = Math.min(width / SW, height / SH);
  if (portrait) return <RotateHint />;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E120A' }}>
      <KCtx.Provider value={k}>
        <View style={{ width: SW * k, height: SH * k, overflow: 'hidden' }}>{children}</View>
      </KCtx.Provider>
    </View>
  );
}

function RotateHint() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B6E4F', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <Text style={{ fontSize: 64 }}>📱↻</Text>
      <Text style={{ color: '#FFC93C', fontWeight: '900', fontSize: 24, marginTop: 12, textAlign: 'center' }}>Turn your phone sideways</Text>
      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15, marginTop: 8, textAlign: 'center' }}>Mama Put Fever plays in landscape, like a real kitchen counter.</Text>
    </View>
  );
}

export function useS() {
  const k = useK();
  return (n: number) => n * k;
}

/** absolute box in stage units */
export function Abs({ x, y, w, h, children, style, pointerEvents }: { x: number; y: number; w?: number; h?: number; children?: React.ReactNode; style?: StyleProp<ViewStyle>; pointerEvents?: 'none' | 'box-none' | 'auto' }) {
  const S = useS();
  return (
    <View pointerEvents={pointerEvents} style={[{ position: 'absolute', left: S(x), top: S(y), width: w != null ? S(w) : undefined, height: h != null ? S(h) : undefined }, style]}>
      {children}
    </View>
  );
}

let gid = 0;
/** chunky glossy game button (gradient + highlight + dark rim) */
export function GameBtn({ label, onPress, color = 'green', w = 160, h = 44, size = 18, disabled, testID, style }: {
  label: string; onPress: () => void; color?: 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'grey'; w?: number; h?: number; size?: number; disabled?: boolean; testID?: string; style?: StyleProp<ViewStyle>;
}) {
  const S = useS();
  const pal = {
    green: ['#7BE36A', '#2FA544', '#1B6E2B'], orange: ['#FFC65A', '#F28C28', '#A8520E'], blue: ['#7CC8FF', '#2D7FD6', '#18467F'],
    red: ['#FF8A7A', '#D7263D', '#7E1020'], purple: ['#C59BFF', '#7B4BC4', '#44236F'], grey: ['#E3D8C8', '#A99A86', '#6E604E'],
  }[disabled ? 'grey' : color];
  const id = React.useMemo(() => `gb${gid++}`, []);
  return (
    <Pressable onPress={onPress} disabled={disabled} testID={testID} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [{ width: S(w), height: S(h), transform: [{ scale: pressed ? 0.94 : 1 }] }, style]}>
      <Svg width={S(w)} height={S(h)} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={pal[0]} />
            <Stop offset="1" stopColor={pal[1]} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={S(3)} width={S(w)} height={S(h) - S(3)} rx={S(h) / 2.6} fill={pal[2]} />
        <Rect x={0} y={0} width={S(w)} height={S(h) - S(4)} rx={S(h) / 2.6} fill={`url(#${id})`} />
        <Rect x={S(10)} y={S(4)} width={S(w) - S(20)} height={(S(h) - S(4)) * 0.38} rx={S(h) / 5} fill="#FFFFFF" opacity={0.35} />
      </Svg>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: S(4) }}>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(size), textShadowColor: pal[2], textShadowOffset: { width: 0, height: S(2) }, textShadowRadius: S(1) }}>{label}</Text>
      </View>
    </Pressable>
  );
}

/** outlined cartoon text */
export function GText({ children, size = 16, color = '#FFF', stroke = '#5E3A1A', style }: { children: React.ReactNode; size?: number; color?: string; stroke?: string; style?: StyleProp<TextStyle> }) {
  const S = useS();
  return (
    <Text style={[{ color, fontSize: S(size), fontWeight: '900', textShadowColor: stroke, textShadowOffset: { width: 0, height: S(2) }, textShadowRadius: S(2) }, style]}>{children}</Text>
  );
}

/** gradient panel (blue Cooking-Fever-ish banner by default) */
export function Panel({ w, h, children, color = 'cream', style }: { w: number; h: number; children?: React.ReactNode; color?: 'cream' | 'blue' | 'green'; style?: StyleProp<ViewStyle> }) {
  const S = useS();
  const id = React.useMemo(() => `pn${gid++}`, []);
  const pal = { cream: ['#FFFBEF', '#F6E3BE', '#B9824C'], blue: ['#4FA8F5', '#1F5FB0', '#123D73'], green: ['#3FBF7F', '#0B6E4F', '#074634'] }[color];
  return (
    <View style={[{ width: S(w), height: S(h) }, style]}>
      <Svg width={S(w)} height={S(h)} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={pal[0]} />
            <Stop offset="1" stopColor={pal[1]} />
          </LinearGradient>
        </Defs>
        <Rect x={S(1.5)} y={S(1.5)} width={S(w) - S(3)} height={S(h) - S(3)} rx={S(16)} fill={`url(#${id})`} stroke={pal[2]} strokeWidth={S(3)} />
        <Rect x={S(8)} y={S(5)} width={S(w) - S(16)} height={S(10)} rx={S(5)} fill="#FFFFFF" opacity={0.35} />
      </Svg>
      {children}
    </View>
  );
}
