import React, { useEffect, useMemo, useRef } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { SH, SW, useS } from './stage';
import { SPR } from './assets';
import type { Level2 } from './data2';
import { CitySkyline } from './CitySkyline';
import { ROAD_ART } from './roadArt';

// The level select is a road through the city the restaurant is in. The road scrolls sideways in front of a view of
// the city (a painted backdrop when there is one, else a drawn skyline) that drifts past more slowly, for depth.

const X0 = 340; // first level, clear of the left panel
const STEP = 104; // road distance between levels
const HORIZON = 196; // where the ground meets the city
const PARALLAX = 0.3; // how fast the city drifts compared with the road
export const nodePos = (i: number) => ({ x: X0 + i * STEP, y: 270 + Math.sin(i * 0.85) * 42 + Math.sin(i * 0.31 + 1) * 12 });
/** nearer the bottom of the screen = closer = bigger */
const depth = (y: number) => 0.78 + Math.max(0, Math.min(1, (y - HORIZON) / (SH - HORIZON))) * 0.32;

type Look = {
  ground: [string, string]; speck: string; // verge colour (far, near) and its texture
  road: string; kerb: string; line: string | null; // surface, edge and centre line (null for a dirt road)
  post: 'lamp' | 'pole' | 'palm';
};
const LOOKS: Record<string, Look> = {
  lagos: { ground: ['#A9A27A', '#7E7A56'], speck: '#5E5A3E', road: '#55565B', kerb: '#C9C2B2', line: '#E8C33A', post: 'lamp' },
  ibadan: { ground: ['#B8805A', '#8E5636'], speck: '#6E3E24', road: '#B0643A', kerb: '#8A4A2A', line: null, post: 'pole' },
  ph: { ground: ['#7E9668', '#566E46'], speck: '#3E5232', road: '#5A5C5E', kerb: '#BDB6A6', line: '#F2F2F2', post: 'palm' },
  enugu: { ground: ['#86A26A', '#5E7E48'], speck: '#435E32', road: '#5E5E60', kerb: '#C2BBAA', line: '#F2F2F2', post: 'pole' },
  kano: { ground: ['#D8BC8A', '#BC9762'], speck: '#9C7A4A', road: '#C9A46E', kerb: '#A68050', line: null, post: 'lamp' },
  abuja: { ground: ['#9CB27A', '#6E8A52'], speck: '#4E6A3A', road: '#4C4E54', kerb: '#E2DED4', line: '#F2F2F2', post: 'lamp' },
};

/** a smooth road through the points (Catmull-Rom turned into cubic beziers) */
function roadPath(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]; const p1 = pts[i]; const p2 = pts[i + 1]; const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d;
}
const hash = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

/** roadside furniture: a street lamp, an electricity pole or a palm, standing at (x, y) and scaled for distance */
function Post({ kind, x, y, s }: { kind: Look['post']; x: number; y: number; s: number }) {
  const h = 62 * s;
  if (kind === 'palm') return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={0} cy={0} rx={12} ry={3.5} fill="#000" opacity={0.18} />
      <Path d="M0 0 Q 5 -30 2 -62" stroke="#6E5A42" strokeWidth={4} fill="none" />
      {[-70, -30, 5, 40, 80, 125, 160].map((a) => <Path key={a} d={`M2 -62 q ${Math.cos((a * Math.PI) / 180) * 14} -9 ${Math.cos((a * Math.PI) / 180) * 26} ${Math.sin((a * Math.PI) / 180) * 12 + 7}`} stroke="#3E6A3A" strokeWidth={5} fill="none" strokeLinecap="round" />)}
    </G>
  );
  if (kind === 'pole') return (
    <G>
      <Rect x={x - 1.6 * s} y={y - h} width={3.2 * s} height={h} fill="#6E5A46" />
      <Rect x={x - 10 * s} y={y - h + 6 * s} width={20 * s} height={2.4 * s} fill="#6E5A46" />
      <Ellipse cx={x} cy={y} rx={6 * s} ry={2 * s} fill="#000" opacity={0.18} />
    </G>
  );
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={6 * s} ry={2 * s} fill="#000" opacity={0.18} />
      <Rect x={x - 1.4 * s} y={y - h} width={2.8 * s} height={h} fill="#4A4E54" />
      <Path d={`M ${x} ${y - h} q ${8 * s} ${-4 * s} ${14 * s} ${2 * s}`} stroke="#4A4E54" strokeWidth={2.4 * s} fill="none" />
      <Rect x={x + 10 * s} y={y - h + 1 * s} width={8 * s} height={3 * s} rx={1.5 * s} fill="#E8E2C8" />
    </G>
  );
}

/** a level as a chunky coin standing on the road */
function Coin({ r, top, side, locked }: { r: number; top: string; side: string; locked: boolean }) {
  const ry = r * 0.78; const h = r * 0.34; const w = r * 2 + 8;
  return (
    <Svg width={w} height={r * 2 + h + 14} style={{ position: 'absolute', left: -4, top: 0 }}>
      <Ellipse cx={w / 2} cy={ry + h + r * 0.3 + 4} rx={r * 1.05} ry={r * 0.42} fill="#000" opacity={0.3} />
      <Rect x={4} y={ry} width={r * 2} height={h} fill={side} />
      <Ellipse cx={w / 2} cy={ry + h} rx={r} ry={ry} fill={side} />
      <Ellipse cx={w / 2} cy={ry} rx={r} ry={ry} fill="#F4EEE2" />
      <Ellipse cx={w / 2} cy={ry} rx={r - 3} ry={ry - 3} fill={top} />
      {!locked && <Ellipse cx={w / 2 - r * 0.32} cy={ry - ry * 0.42} rx={r * 0.42} ry={ry * 0.22} fill="#FFFFFF" opacity={0.28} />}
    </Svg>
  );
}

function Bounce({ children }: { children: React.ReactNode }) {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withRepeat(withSequence(withTiming(-6, { duration: 500, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) })), -1); }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

export function LevelRoad({ city, levels, stars, unlocked, onPlay }: { city: string; levels: Level2[]; stars: number[]; unlocked: number; onPlay: (i: number) => void }) {
  const S = useS();
  const look = LOOKS[city] ?? LOOKS.lagos;
  const art = ROAD_ART[city];
  const n = levels.length;
  const pts = useMemo(() => Array.from({ length: n }, (_, i) => nodePos(i)), [n]);
  const width = pts[n - 1].x + 240;
  const backW = SW + (width - SW) * PARALLAX + 40; // how much city the drifting backdrop needs to cover
  const full = useMemo(() => roadPath([{ x: 0, y: pts[0].y + 30 }, ...pts, { x: width, y: pts[n - 1].y }]), [pts, width]);
  const done = useMemo(() => roadPath([{ x: 0, y: pts[0].y + 30 }, ...pts.slice(0, unlocked + 1)]), [pts, unlocked]);
  // posts on alternating sides of the road, between levels
  const posts = useMemo(() => Array.from({ length: n + 1 }, (_, i) => {
    const a = nodePos(i - 1); const b = nodePos(i); const far = i % 2 === 0;
    const y = Math.max(HORIZON + 8, Math.min(SH - 6, (a.y + b.y) / 2 + (far ? -30 : 34)));
    return { x: (a.x + b.x) / 2, y, s: depth(y) };
  }), [n]);
  const specks = useMemo(() => Array.from({ length: Math.ceil(width / 9) }, (_, i) => ({ x: hash(i + 1) * width, y: HORIZON + 4 + hash(i + 2) * (SH - HORIZON), r: 0.8 + hash(i + 4) * 2 })), [width]);

  const off = useSharedValue(0);
  const scroll = useRef<ScrollViewInstance>(null);
  const placed = useRef(false);
  /** once the road has its size, bring the current level into view */
  const place = () => {
    if (placed.current) return;
    placed.current = true;
    const x = S(Math.max(0, pts[unlocked].x - 560));
    scroll.current?.scrollTo({ x, animated: false }); off.value = x / S(1);
  };
  const drift = useAnimatedStyle(() => ({ transform: [{ translateX: -off.value * PARALLAX }] }));
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // a mouse wheel scrolls the road sideways
    const node = (scroll.current as any)?.getScrollableNode?.() as HTMLElement | undefined;
    const wheel = (e: WheelEvent) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { node!.scrollLeft += e.deltaY; e.preventDefault(); } };
    node?.addEventListener('wheel', wheel, { passive: false });
    return () => node?.removeEventListener('wheel', wheel);
  }, []);

  // painted backdrops are scaled so their middle (the horizon) lines up with the road's horizon
  const artH = HORIZON * 2;
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, flexDirection: 'row' }, drift]}>
        {art ? art.map((a, i) => <Image key={i} source={a.src} style={{ width: S((artH * a.w) / a.h), height: S(artH) }} resizeMode="cover" />)
          : <CitySkyline city={city} w={backW} h={HORIZON} k={S(1)} />}
      </Animated.View>
      <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}
        onScroll={(e) => { off.value = e.nativeEvent.contentOffset.x / S(1); }} onContentSizeChange={place}
        style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} contentContainerStyle={{ width: S(width), height: S(SH) }}>
        <Svg width={S(width)} height={S(SH)} viewBox={`0 0 ${width} ${SH}`} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Defs>
            <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={look.ground[0]} stopOpacity={art ? 0 : 1} />
              <Stop offset="0.25" stopColor={look.ground[0]} stopOpacity={art ? 0.35 : 1} />
              <Stop offset="1" stopColor={look.ground[1]} stopOpacity={art ? 0.7 : 1} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={HORIZON} width={width} height={SH - HORIZON} fill="url(#ground)" />
          {specks.map((t, i) => <Ellipse key={i} cx={t.x} cy={t.y} rx={t.r * 1.8} ry={t.r * 0.7} fill={look.speck} opacity={0.22} />)}
          {/* the road: shadow, kerb, surface, centre line, then a gold trail over the levels already reached */}
          <Path d={full} stroke="#000" strokeOpacity={0.25} strokeWidth={50} fill="none" strokeLinecap="round" transform="translate(0 5)" />
          <Path d={full} stroke={look.kerb} strokeWidth={46} fill="none" strokeLinecap="round" />
          <Path d={full} stroke={look.road} strokeWidth={38} fill="none" strokeLinecap="round" />
          {look.line ? <Path d={full} stroke={look.line} strokeWidth={2.2} strokeDasharray="14 12" fill="none" />
            : <>{[-8, 8].map((o) => <Path key={o} d={full} stroke="#000" strokeOpacity={0.12} strokeWidth={4} fill="none" transform={`translate(0 ${o})`} />)}</>}
          <Path d={done} stroke="#E8B33A" strokeOpacity={0.85} strokeWidth={6} fill="none" strokeLinecap="round" />
          {posts.filter((p) => p.y < 260).map((p, i) => <Post key={'b' + i} kind={look.post} x={p.x} y={p.y} s={p.s} />)}
        </Svg>
        {pts.map((p, i) => {
          const lv = levels[i];
          const locked = i > unlocked; const current = i === unlocked; const st = stars[i] ?? 0;
          const r = 24 * depth(p.y);
          const [top, side] = locked ? ['#9A9288', '#5E574E'] : current ? ['#3FAE52', '#1F6A2E'] : lv.bulk ? ['#7E52B8', '#46286E'] : ['#E0862A', '#8E4A12'];
          const boxW = r * 2 + 8;
          const chapter = i > 0 && i % 10 === 0;
          return (
            <View key={'l' + i} style={{ position: 'absolute', left: S(p.x - boxW / 2), top: S(p.y - r * 0.78 - 2), width: S(boxW), alignItems: 'center' }}>
              {chapter && (
                <View pointerEvents="none" style={{ position: 'absolute', left: S(-56), top: S(-54), alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#1F5A3A', borderRadius: S(3), borderWidth: S(1.5), borderColor: '#F2F2F2', paddingHorizontal: S(6), paddingVertical: S(2) }}>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(8.5) }}>PART {i / 10 + 1}</Text>
                  </View>
                  <View style={{ width: S(3), height: S(28), backgroundColor: '#8A9096' }} />
                </View>
              )}
              <Pressable testID={`level-${i + 1}`} disabled={locked} onPress={() => onPlay(i)}
                style={({ pressed }) => ({ width: S(boxW), height: S(r * 2 + r * 0.34 + 8), transform: [{ scale: pressed ? 0.9 : 1 }] })}>
                <Coin r={S(r)} top={top} side={side} locked={locked} />
                <View style={{ position: 'absolute', left: 0, right: 0, top: S(r * 0.78 - 12 * depth(p.y)), alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S((locked ? 14 : 18) * depth(p.y)), textShadowColor: '#0008', textShadowOffset: { width: 0, height: S(1.5) }, textShadowRadius: S(1) }}>{locked ? '🔒' : i + 1}</Text>
                </View>
              </Pressable>
              {!locked && (
                <View pointerEvents="none" style={{ flexDirection: 'row', marginTop: S(-6), backgroundColor: '#0006', borderRadius: S(6), paddingHorizontal: S(3) }}>
                  {[0, 1, 2].map((k) => <Text key={k} style={{ fontSize: S(9 * depth(p.y)), color: k < st ? '#FFC93C' : '#FFFFFF66' }}>★</Text>)}
                </View>
              )}
              {lv.bulk && !locked && <Text style={{ fontSize: S(7.5), color: '#FFF', fontWeight: '900', backgroundColor: '#5E3A8E', paddingHorizontal: S(4), borderRadius: S(5), overflow: 'hidden', marginTop: S(1) }}>OWAMBE</Text>}
              {current && (
                <View pointerEvents="none" style={{ position: 'absolute', top: S(-48 * depth(p.y)), alignItems: 'center' }}>
                  <Bounce>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ width: S(36), height: S(36), borderRadius: S(18), backgroundColor: '#FFF', borderWidth: S(2.5), borderColor: '#E8B33A', overflow: 'hidden', alignItems: 'center' }}>
                        <Image source={SPR.staff.cook} style={{ width: S(40), height: S(48), marginTop: S(-2) }} resizeMode="cover" />
                      </View>
                      <View style={{ width: 0, height: 0, borderLeftWidth: S(5), borderRightWidth: S(5), borderTopWidth: S(7), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#E8B33A' }} />
                    </View>
                  </Bounce>
                </View>
              )}
            </View>
          );
        })}
        {/* posts in front of the road go over it */}
        <Svg pointerEvents="none" width={S(width)} height={S(SH)} viewBox={`0 0 ${width} ${SH}`} style={{ position: 'absolute', left: 0, top: 0 }}>
          {posts.filter((p) => p.y >= 260).map((p, i) => <Post key={'f' + i} kind={look.post} x={p.x} y={p.y} s={p.s} />)}
        </Svg>
        {/* the end of the road: the city's finish line */}
        <View pointerEvents="none" style={{ position: 'absolute', left: S(pts[n - 1].x + 60), top: S(pts[n - 1].y - 70), alignItems: 'center' }}>
          <View style={{ backgroundColor: '#1F5A3A', borderWidth: S(1.5), borderColor: '#FFF', borderRadius: S(3), paddingHorizontal: S(6), paddingVertical: S(3) }}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(10) }}>🏆 FINISH</Text>
          </View>
          <View style={{ width: S(3), height: S(40), backgroundColor: '#8A9096' }} />
        </View>
      </ScrollView>
    </View>
  );
}
