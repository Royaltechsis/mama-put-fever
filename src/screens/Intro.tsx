import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { CONTAINER_INFO, CUSTOMERS, DISHES, INGREDIENTS, SIDE_INFO, containerNeeded, orderPrompt, stepQty, type SideId } from '../data';
import { IngredientIcon } from '../art/Icons';
import { AnkaraBand, Customer, FoodPortion } from '../art/Scenes';
import { Btn, naira } from '../ui';
import { C, shadow } from '../theme';
import type { Run } from '../game';

export default function Intro({ run, bigPot, onStart, onBack }: { run: Run; bigPot: boolean; onStart: () => void; onBack: () => void }) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, 480);
  const lv = run.level;
  const pay = lv.orders.reduce((a, o) => a + o.people * DISHES[o.dish].price, 0);
  return (
    <View style={{ flex: 1, backgroundColor: C.green }}>
      <AnkaraBand width={W} height={14} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
        <Animated.View entering={ZoomIn.springify()} style={s.badge}>
          <Text style={s.badgeText}>📣 NEW ORDER · LEVEL {run.levelIdx + 1}</Text>
        </Animated.View>
        {lv.orders.length > 1 && <Text style={s.two}>⚡ Two orders at once! Same clock.</Text>}
        {lv.orders.map((o, i) => {
          const c = CUSTOMERS[o.customer];
          const sides = Object.keys(o.sides) as SideId[];
          const need = containerNeeded(o);
          return (
            <Animated.View key={i} entering={FadeInDown.delay(120 + i * 120)} style={s.card} testID="order-card">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Customer skin={c.skin} wrap={c.wrap} female={c.female} size={64} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.tag}>{lv.tag.toUpperCase()} · {c.name}</Text>
                  <Text style={s.prompt}>{orderPrompt(lv, o)}</Text>
                </View>
                <FoodPortion dish={o.dish} size={54} />
              </View>
              <View style={s.recipe}>
                {DISHES[o.dish].stations.map((st, k) => (
                  <View key={k} style={s.recipeRow}>
                    <Text style={s.recipeLabel}>{st.label}:</Text>
                    {st.steps.map((x, j) => (
                      <View key={j} style={s.ing}>
                        <IngredientIcon id={x.ing} size={22} />
                        <Text style={s.ingQty}>×{stepQty(x, o.people, bigPot)}</Text>
                      </View>
                    ))}
                    {(st.finish ?? []).length > 0 && <Text style={s.then}>→ then</Text>}
                    {(st.finish ?? []).map((f, j) => <IngredientIcon key={'f' + j} id={f} size={22} />)}
                    <Text style={s.action}>{st.action === 'stir' ? '🥄 stir' : st.action === 'flip' ? '🔄 flip' : '✊ turn'}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.line}>📦 Pack in {need} {need === 1 ? CONTAINER_INFO[o.container].name : CONTAINER_INFO[o.container].plural}{o.container === 'cooler' ? ' (10 portions each)' : ''}</Text>
              {sides.length > 0 && <Text style={s.line}>➕ {sides.map((k) => `${o.sides[k]} ${SIDE_INFO[k].plural}`).join(', ')}</Text>}
            </Animated.View>
          );
        })}
        <Animated.View entering={FadeInDown.delay(300)} style={s.meta}>
          <View style={s.metaBox}><Text style={s.metaBig}>⏱ {lv.time}s</Text><Text style={s.metaSmall}>to deliver</Text></View>
          <View style={s.metaBox}><Text style={s.metaBig}>{naira(pay)}</Text><Text style={s.metaSmall}>+ tips if fast</Text></View>
        </Animated.View>
        {run.levelIdx === 0 && (
          <View style={s.how}>
            <Text style={s.howTitle}>How to play</Text>
            <Text style={s.howLine}>1. COOK — drag ingredients into the pot in recipe order, stir, don't let it burn</Text>
            <Text style={s.howLine}>2. PACKAGE — drag the right number of packs + sides into the bag</Text>
            <Text style={s.howLine}>3. DELIVER — load the okada, pick a route, beat the traffic light</Text>
          </View>
        )}
        <Btn label="Start cooking 🔥" color={C.orange} onPress={onStart} style={{ marginTop: 14 }} testID="start" />
        <Btn label="Back" color="#FFFFFF22" onPress={onBack} style={{ marginTop: 10 }} small />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { alignSelf: 'center', backgroundColor: C.yellow, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginBottom: 10, ...shadow },
  badgeText: { fontWeight: '900', color: C.ink, letterSpacing: 0.5 },
  two: { color: C.yellow, fontWeight: '900', textAlign: 'center', marginBottom: 8, fontSize: 15 },
  card: { backgroundColor: C.paper, borderRadius: 20, padding: 14, marginBottom: 10, ...shadow },
  tag: { fontSize: 11, fontWeight: '900', color: C.orange, letterSpacing: 0.4 },
  prompt: { fontSize: 22, fontWeight: '900', color: C.ink, marginTop: 2 },
  recipe: { marginTop: 10, backgroundColor: '#F6EBD8', borderRadius: 12, padding: 8 },
  recipeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 3, marginVertical: 2 },
  recipeLabel: { fontWeight: '900', fontSize: 12, color: C.ink, marginRight: 2 },
  ing: { flexDirection: 'row', alignItems: 'center' },
  ingQty: { fontSize: 11, fontWeight: '900', color: C.ink },
  then: { fontSize: 11, color: C.inkSoft, fontWeight: '800' },
  action: { fontSize: 11, color: C.purple, fontWeight: '900', marginLeft: 4 },
  line: { marginTop: 8, fontWeight: '800', color: C.ink, fontSize: 14 },
  meta: { flexDirection: 'row', gap: 10 },
  metaBox: { flex: 1, backgroundColor: '#FFFFFF1A', borderRadius: 16, padding: 12, alignItems: 'center' },
  metaBig: { color: '#FFF', fontWeight: '900', fontSize: 22 },
  metaSmall: { color: '#FFFFFFBB', fontWeight: '700', fontSize: 12 },
  how: { marginTop: 12, backgroundColor: '#00000022', borderRadius: 16, padding: 12 },
  howTitle: { color: C.yellow, fontWeight: '900', marginBottom: 4 },
  howLine: { color: '#FFF', fontWeight: '700', fontSize: 13, marginVertical: 2 },
});
