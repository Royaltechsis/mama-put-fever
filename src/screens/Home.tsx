import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { DISHES, LEVELS, UPGRADES, type DishId, type UpgradeId } from '../data';
import { AnkaraBand, FoodPortion, Stall, Star } from '../art/Scenes';
import { Btn, naira } from '../ui';
import { C, shadow } from '../theme';
import type { Save } from '../storage';

export default function Home({ save, onPlay, onBuy, onToggleSound, onReset }: {
  save: Save; onPlay: (idx: number) => void; onBuy: (u: UpgradeId) => void; onToggleSound: () => void; onReset: () => void;
}) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, 480);
  const next = Math.min(save.unlocked, LEVELS.length - 1);
  const totalStars = save.stars.reduce((a, b) => a + (b || 0), 0);
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <AnkaraBand width={W} height={16} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={s.header}>
          <View style={s.coin}><Text style={s.coinText} testID="coins">{naira(save.coins)}</Text></View>
          <View style={s.coin}><Text style={s.coinText}>⭐ {totalStars}/{LEVELS.length * 3}</Text></View>
          <Pressable onPress={onToggleSound} style={s.sound} accessibilityLabel="Toggle sound"><Text style={{ fontSize: 18 }}>{save.sound ? '🔊' : '🔇'}</Text></Pressable>
        </View>
        <Animated.Text entering={ZoomIn.springify()} style={s.title}>Mama Put</Animated.Text>
        <Animated.Text entering={ZoomIn.delay(120).springify()} style={s.title2}>FEVER</Animated.Text>
        <Text style={s.tag}>Cook · Package · Deliver — before the customer vex!</Text>
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Stall width={Math.min(W - 24, 360)} />
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <Btn label={save.unlocked === 0 && !save.stars.length ? '▶  Start cooking' : `▶  Play level ${next + 1}`} color={C.orange} onPress={() => onPlay(next)} style={{ marginTop: 8 }} testID="play" />
        </View>

        <Text style={s.section}>Levels</Text>
        <View style={s.grid}>
          {LEVELS.map((lv, i) => {
            const locked = i > save.unlocked;
            const stars = save.stars[i] ?? 0;
            return (
              <Animated.View key={i} entering={FadeInDown.delay(i * 30)} style={s.lvWrap}>
                <Pressable disabled={locked} onPress={() => onPlay(i)} style={[s.lv, locked && s.lvLocked, i === next && s.lvNext]} testID={`level-${i}`}>
                  <Text style={[s.lvNum, locked && { color: '#B9A88F' }]}>{locked ? '🔒' : i + 1}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[0, 1, 2].map((k) => <Star key={k} on={k < stars} size={12} />)}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
        <Text style={s.levelName}>Next: {LEVELS[next].title} · {LEVELS[next].orders.map((o) => `${DISHES[o.dish].short} for ${o.people}`).join(' + ')}</Text>

        <Text style={s.section}>Dishes</Text>
        <View style={s.dishes}>
          {(Object.keys(DISHES) as DishId[]).map((d) => {
            const open = save.unlocked >= DISHES[d].unlockLevel;
            return (
              <View key={d} style={[s.dish, !open && { opacity: 0.45 }]}>
                <FoodPortion dish={d} size={46} />
                <Text style={s.dishName} numberOfLines={1}>{open ? DISHES[d].short : `Lvl ${DISHES[d].unlockLevel + 1}`}</Text>
                <Text style={s.dishPrice}>{open ? `${naira(DISHES[d].price)}/plate` : '🔒'}</Text>
              </View>
            );
          })}
        </View>

        <Text style={s.section}>Upgrade your buka</Text>
        {(Object.keys(UPGRADES) as UpgradeId[]).map((u) => {
          const up = UPGRADES[u];
          const owned = !!save.upgrades[u];
          const afford = save.coins >= up.price;
          return (
            <View key={u} style={s.up}>
              <Text style={{ fontSize: 30 }}>{u === 'stove' ? '🔥' : '🍲'}</Text>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={s.upName}>{up.name}</Text>
                <Text style={s.upDesc}>{up.desc}</Text>
              </View>
              {owned ? <Text style={s.owned}>Owned ✓</Text> : (
                <Btn small label={naira(up.price)} color={afford ? C.green : '#C9BBA8'} disabled={!afford} onPress={() => onBuy(u)} testID={`buy-${u}`} />
              )}
            </View>
          );
        })}
        <Pressable onPress={onReset} style={{ alignSelf: 'center', marginTop: 18 }}><Text style={s.reset}>Reset progress</Text></Pressable>
        <Text style={s.foot}>Prototype · made with Expo + React Native</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  coin: { backgroundColor: C.yellow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, ...shadow, elevation: 2 },
  coinText: { fontWeight: '900', color: C.ink },
  sound: { marginLeft: 'auto', width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', ...shadow, elevation: 2 },
  title: { fontSize: 44, fontWeight: '900', color: C.green, textAlign: 'center', marginTop: 4, letterSpacing: -1 },
  title2: { fontSize: 30, fontWeight: '900', color: C.orange, textAlign: 'center', marginTop: -8, letterSpacing: 8 },
  tag: { textAlign: 'center', color: C.inkSoft, fontWeight: '700', marginTop: 4, paddingHorizontal: 20 },
  section: { fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 20, marginBottom: 8, paddingHorizontal: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  lvWrap: { width: '20%', padding: 4 },
  lv: { backgroundColor: '#FFF', borderRadius: 14, alignItems: 'center', paddingVertical: 8, borderWidth: 2, borderColor: '#EBD9BC' },
  lvLocked: { backgroundColor: '#F1E6D3' },
  lvNext: { borderColor: C.orange, backgroundColor: '#FFF1D6' },
  lvNum: { fontWeight: '900', fontSize: 18, color: C.ink },
  levelName: { paddingHorizontal: 16, marginTop: 6, color: C.inkSoft, fontWeight: '700', fontSize: 13 },
  dishes: { flexDirection: 'row', paddingHorizontal: 10 },
  dish: { flex: 1, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, marginHorizontal: 4, paddingVertical: 8 },
  dishName: { fontWeight: '900', color: C.ink, fontSize: 12 },
  dishPrice: { fontWeight: '700', color: C.inkSoft, fontSize: 10 },
  up: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 14, marginBottom: 8, borderRadius: 16, padding: 12, ...shadow, elevation: 2 },
  upName: { fontWeight: '900', color: C.ink, fontSize: 15 },
  upDesc: { fontWeight: '600', color: C.inkSoft, fontSize: 12 },
  owned: { fontWeight: '900', color: C.green },
  reset: { color: C.inkSoft, textDecorationLine: 'underline', fontSize: 12 },
  foot: { textAlign: 'center', color: '#B9A88F', fontSize: 11, marginTop: 8 },
});
