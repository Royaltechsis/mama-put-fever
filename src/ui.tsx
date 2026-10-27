import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { C, shadow } from './theme';

export function useNow(ms = 100, active = true) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms, active]);
  return now;
}

export function Btn({ label, onPress, color = C.green, textColor = '#FFF', style, small, disabled, testID }: {
  label: string; onPress: () => void; color?: string; textColor?: string; style?: StyleProp<ViewStyle>; small?: boolean; disabled?: boolean; testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: disabled ? '#C9BBA8' : color, transform: [{ scale: pressed ? 0.96 : 1 }] },
        style,
      ]}
    >
      <Text style={[styles.btnText, small && { fontSize: 14 }, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function naira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-US');
}

export function Hud({ title, timeLeft, total, coins, onQuit }: { title: string; timeLeft: number; total: number; coins: number; onQuit: () => void }) {
  const low = timeLeft <= 15;
  const frac = Math.max(0, Math.min(1, timeLeft / total));
  return (
    <View style={styles.hud}>
      <Pressable onPress={onQuit} style={styles.quit} accessibilityLabel="Quit level" hitSlop={8}>
        <Text style={styles.quitText}>✕</Text>
      </Pressable>
      <View style={{ flex: 1, marginHorizontal: 8 }}>
        <Text style={styles.hudTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.timeBar}>
          <View style={[styles.timeFill, { width: `${frac * 100}%`, backgroundColor: low ? C.red : frac < 0.4 ? C.orange : C.green }]} />
        </View>
      </View>
      <View style={[styles.pill, low && { backgroundColor: C.red }]} testID="timer">
        <Text style={styles.pillText}>⏱ {Math.max(0, Math.ceil(timeLeft))}s</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: C.yellow, marginLeft: 6 }]}>
        <Text style={[styles.pillText, { color: C.ink }]}>{naira(coins)}</Text>
      </View>
    </View>
  );
}

export type ToastMsg = { id: number; text: string; tone: 'good' | 'bad' | 'info' };

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const id = useRef(0);
  const push = (text: string, tone: ToastMsg['tone'] = 'info') => {
    const t = { id: ++id.current, text, tone };
    setToasts((xs) => [...xs.slice(-1), t]);
    setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== t.id)), 1500);
  };
  return { toasts, push };
}

export function Toasts({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      {toasts.map((t) => (
        <Animated.View key={t.id} entering={FadeInDown.duration(160)} exiting={FadeOutUp.duration(200)}
          style={[styles.toast, { backgroundColor: t.tone === 'good' ? C.green : t.tone === 'bad' ? C.red : C.ink }]}>
          <Text style={styles.toastText}>{t.text}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

export function Pulse({ children, active, style }: { children: React.ReactNode; active: boolean; style?: StyleProp<ViewStyle> }) {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = active ? withRepeat(withSequence(withTiming(1.08, { duration: 380 }), withTiming(1, { duration: 380 })), -1) : withTiming(1);
  }, [active]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

export function Shake({ children, trigger, style }: { children: React.ReactNode; trigger: number; style?: StyleProp<ViewStyle> }) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (!trigger) return;
    x.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(-6, { duration: 50 }), withTiming(6, { duration: 50 }), withTiming(0, { duration: 50 }));
  }, [trigger]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

export const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...shadow },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12 },
  btnText: { fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  hud: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: C.greenDark },
  quit: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' },
  quitText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  hudTitle: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  timeBar: { height: 6, borderRadius: 3, backgroundColor: '#FFFFFF33', marginTop: 4, overflow: 'hidden' },
  timeFill: { height: 6, borderRadius: 3 },
  pill: { backgroundColor: '#FFFFFF22', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  pillText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  toastWrap: { position: 'absolute', top: 64, left: 0, right: 0, alignItems: 'center', zIndex: 50 },
  toast: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, marginTop: 4, ...shadow },
  toastText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
