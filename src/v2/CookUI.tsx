import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { ING, POT_RECIPES, windowOf, type PotId, type RStep } from './recipes';
import { Abs, GText, Panel, useS } from './stage';

/** grill/fryer timing bar: amber while cooking, then green (perfect), lime, orange, red (burns) with a marker */
export function CookBar({ e, cook, burn }: { e: number; cook: number; burn: number }) {
  const S = useS();
  const segs = [cook, 2, 1.5, 1.5, Math.max(0.4, burn - 5)];
  const cols = ['#F2A93B', '#3FCB5A', '#A5D63F', '#F28C28', '#D7263D'];
  const total = segs.reduce((a, b) => a + b, 0);
  const frac = Math.max(0, Math.min(1, e / total));
  return (
    <View style={{ marginHorizontal: S(4), height: S(11), justifyContent: 'center' }}>
      <View style={{ height: S(7), flexDirection: 'row', borderRadius: S(4), overflow: 'hidden', borderWidth: S(1), borderColor: '#FFF', backgroundColor: '#0006' }}>
        {segs.map((s, i) => <View key={i} style={{ flex: s, backgroundColor: cols[i] }} />)}
      </View>
      <View style={{ position: 'absolute', left: `${frac * 100}%`, marginLeft: S(-1.5), width: S(3), height: S(11), backgroundColor: '#FFF', borderRadius: S(2), borderWidth: S(0.8), borderColor: '#2B1B12' }} />
    </View>
  );
}

/** pot ingredient timer: grey = too early, green = add it now, red = too late */
export function PotTimeBar({ dt, step, winMul }: { dt: number; step: RStep; winMul: number }) {
  const S = useS();
  const w = windowOf(step, winMul);
  const segs = [w.from, w.to - w.from, 3];
  const total = segs.reduce((a, b) => a + b, 0);
  const frac = Math.max(0, Math.min(1, dt / total));
  const cols = ['#9AA7B5', '#3FCB5A', '#D7263D'];
  return (
    <View style={{ height: S(11), justifyContent: 'center' }}>
      <View style={{ height: S(7), flexDirection: 'row', borderRadius: S(4), overflow: 'hidden', borderWidth: S(1), borderColor: '#FFF', backgroundColor: '#0006' }}>
        {segs.map((s, i) => <View key={i} style={{ flex: s, backgroundColor: cols[i] }} />)}
      </View>
      <View style={{ position: 'absolute', left: `${frac * 100}%`, marginLeft: S(-1.5), width: S(3), height: S(11), backgroundColor: '#FFF', borderRadius: S(2), borderWidth: S(0.8), borderColor: '#2B1B12' }} />
    </View>
  );
}

function Puff({ delay, dx }: { delay: number; dx: number }) {
  const S = useS();
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1)); }, []);
  const st = useAnimatedStyle(() => ({ opacity: (1 - p.value) * 0.7, transform: [{ translateY: -p.value * S(26) }, { translateX: dx * S(1) * p.value }, { scale: 0.6 + p.value * 0.8 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: S(11), height: S(11), borderRadius: S(6), backgroundColor: '#FFFFFF' }, st]} />;
}
/** rising steam over a pot that is cooking or full */
export function Steam({ on, smoke }: { on: boolean; smoke?: boolean }) {
  const S = useS();
  if (!on) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: S(40), top: S(8), width: S(40), height: S(20) }}>
      <Puff delay={0} dx={-6} /><Puff delay={450} dx={5} /><Puff delay={900} dx={-2} />
      {smoke && <Text style={{ position: 'absolute', left: S(10), top: S(-14), fontSize: S(15) }}>💨</Text>}
    </View>
  );
}

/** the recipe book: ingredient order with the time to wait between each, plus how quality turns into pay */
export function RecipeSheet({ pots, hasGrill, hasFry, titles, onClose }: { pots: PotId[]; hasGrill: boolean; hasFry: boolean; titles?: Partial<Record<PotId, string>>; onClose: () => void }) {
  const S = useS();
  const T = ({ children, size = 10, bold, color = '#3A2416' }: { children: React.ReactNode; size?: number; bold?: boolean; color?: string }) => (
    <Text style={{ color, fontSize: S(size), fontWeight: bold ? '900' : '700' }}>{children}</Text>
  );
  return (
    <Abs x={150} y={42} w={544} h={236} style={{ zIndex: 700 }}>
      <Panel w={544} h={236}>
        <View style={{ flex: 1, padding: S(10) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <GText size={18} color="#5E3A1A" stroke="#FFF">📜 Recipe book</GText>
            <Pressable onPress={onClose} testID="sheet-close" style={{ width: S(26), height: S(26), borderRadius: S(13), backgroundColor: '#D7263D', borderWidth: S(2), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>✕</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', marginTop: S(4), gap: S(10) }}>
            {pots.map((p) => {
              const r = POT_RECIPES[p];
              return (
                <View key={p} style={{ width: S(170) }}>
                  <T size={12} bold color="#B24A12">{titles?.[p] ?? r.title}</T>
                  {r.steps.map((s, i) => (
                    <View key={i} style={{ marginTop: S(2) }}>
                      <T bold>{i + 1}. {ING[s.ing].emoji} {ING[s.ing].label}</T>
                      <T size={8.5} color="#7A4A22">{s.tip}{s.wait > 0 ? ` · wait ${s.wait}–${Math.round(s.wait + s.win)}s` : ''}</T>
                    </View>
                  ))}
                  <T size={8.5} bold color="#1E7A32">Then simmer {r.simmer}s and tap the pot {r.stirs}x to stir</T>
                </View>
              );
            })}
            <View style={{ flex: 1 }}>
              {(hasGrill || hasFry) && (<>
                <T size={12} bold color="#B24A12">Grill and fryer</T>
                {hasGrill && <T size={8.5} color="#7A4A22">Tap the item to flip it when 🔄 shows (chicken, suya)</T>}
                <T size={8.5} color="#7A4A22">Take it off in the green zone for 5★. Orange is risky, red burns.</T>
              </>)}
              <View style={{ height: S(5) }} />
              <T size={12} bold color="#B24A12">Quality decides pay</T>
              <T size={8.5} color="#7A4A22">★★★★★ full price, big tip</T>
              <T size={8.5} color="#7A4A22">★★★★ 90% · ★★★ 75%, small tip</T>
              <T size={8.5} color="#7A4A22">★★ 55%, no tip · ★ sent back</T>
              <T size={8.5} color="#7A4A22">Slow service lowers the review too.</T>
            </View>
          </View>
        </View>
      </Panel>
    </Abs>
  );
}
