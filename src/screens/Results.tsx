import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, ZoomIn, BounceIn } from 'react-native-reanimated';
import { CUSTOMERS, DISHES, LEVELS } from '../data';
import { AnkaraBand, Customer, Star } from '../art/Scenes';
import { Btn, naira } from '../ui';
import { C, shadow } from '../theme';
import { play } from '../fx';
import { starFor, type Result, type Run } from '../game';

export default function Results({ run, result, onNext, onRetry, onHome, newDish }: {
  run: Run; result: Result; onNext: () => void; onRetry: () => void; onHome: () => void; newDish?: string;
}) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, 480);
  const cust = CUSTOMERS[run.level.orders[run.level.orders.length - 1].customer];
  useEffect(() => { play(result.stars > 0 ? 'cash' : 'bad'); }, []);
  const rows = [
    { k: 'Speed', v: result.speed, icon: '⚡' },
    { k: 'Accuracy', v: result.accuracy, icon: '🎯' },
    { k: 'Quality', v: result.quality, icon: '👩🏾‍🍳' },
  ];
  const last = run.levelIdx >= LEVELS.length - 1;
  return (
    <View style={{ flex: 1, backgroundColor: result.stars > 0 ? C.green : C.red }}>
      <AnkaraBand width={W} height={14} />
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'stretch' }}>
        <Text style={s.head} testID="results-title">{run.failed ? 'Order cancelled!' : result.stars === 3 ? 'Mama Put of the year!' : result.stars > 0 ? 'Order delivered!' : 'Customer not happy…'}</Text>
        {run.failed && <Text style={s.sub}>{run.failReason ?? 'Time ran out before delivery.'}</Text>}
        <View style={s.stars}>
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} entering={BounceIn.delay(250 + i * 250)}>
              <Star on={i < result.stars} size={i === 1 ? 64 : 50} />
            </Animated.View>
          ))}
        </View>
        <Animated.View entering={FadeInDown.delay(200)} style={s.cust}>
          <Customer skin={cust.skin} wrap={cust.wrap} female={cust.female} mood={result.mood} size={70} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.custName}>{cust.name}</Text>
            <Text style={s.quote}>“{result.quote}”</Text>
          </View>
        </Animated.View>
        {!run.failed && (
          <Animated.View entering={FadeInDown.delay(350)} style={s.card}>
            {rows.map((r) => (
              <View key={r.k} style={s.row}>
                <Text style={s.rowLabel}>{r.icon} {r.k}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[0, 1, 2].map((i) => <Star key={i} on={i < starFor(r.v)} size={20} />)}
                </View>
                <Text style={s.rowVal}>{r.v}%</Text>
              </View>
            ))}
            {run.deliveryNote ? <Text style={s.note}>🏍️ {run.deliveryNote}</Text> : null}
          </Animated.View>
        )}
        <Animated.View entering={FadeInDown.delay(500)} style={s.card}>
          <View style={s.money}><Text style={s.moneyLabel}>Food ({run.level.orders.map((o) => `${DISHES[o.dish].short} ×${o.people}`).join(' + ')})</Text><Text style={s.moneyVal}>{naira(result.food)}</Text></View>
          <View style={s.money}><Text style={s.moneyLabel}>Tips</Text><Text style={s.moneyVal}>{naira(result.tip)}</Text></View>
          {result.waste > 0 && <View style={s.money}><Text style={s.moneyLabel}>Wasted packs</Text><Text style={[s.moneyVal, { color: C.red }]}>−{naira(result.waste)}</Text></View>}
          <View style={[s.money, { borderTopWidth: 1, borderTopColor: '#EBD9BC', marginTop: 4, paddingTop: 6 }]}>
            <Text style={[s.moneyLabel, { fontSize: 17 }]}>You earned</Text>
            <Animated.Text entering={ZoomIn.delay(800)} style={s.total} testID="earned">{naira(result.total)}</Animated.Text>
          </View>
        </Animated.View>
        {newDish && <Animated.View entering={ZoomIn.delay(900)} style={s.unlock}><Text style={s.unlockText}>🔓 New dish unlocked: {newDish}!</Text></Animated.View>}
        {result.stars > 0 && !last && <Btn label="Next order ▶" color={C.orange} onPress={onNext} style={{ marginTop: 12 }} testID="next" />}
        {result.stars > 0 && last && <Text style={s.win}>🎉 You finished every level! Replay for 3 stars.</Text>}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Btn label="↻ Retry" color="#00000033" onPress={onRetry} style={{ flex: 1 }} />
          <Btn label="🏠 Home" color="#00000033" onPress={onHome} style={{ flex: 1 }} testID="home" />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: { color: '#FFF', fontWeight: '900', fontSize: 26, textAlign: 'center', marginTop: 6 },
  sub: { color: '#FFFFFFCC', fontWeight: '700', textAlign: 'center', marginTop: 4 },
  stars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 6, marginVertical: 10 },
  cust: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.paper, borderRadius: 20, padding: 12, ...shadow },
  custName: { fontWeight: '900', color: C.orange, fontSize: 12 },
  quote: { fontWeight: '800', color: C.ink, fontSize: 16, marginTop: 2 },
  card: { backgroundColor: C.paper, borderRadius: 20, padding: 12, marginTop: 10, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  rowLabel: { flex: 1, fontWeight: '800', color: C.ink, fontSize: 15 },
  rowVal: { width: 50, textAlign: 'right', fontWeight: '900', color: C.ink },
  note: { marginTop: 6, fontSize: 12, color: C.inkSoft, fontWeight: '700' },
  money: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  moneyLabel: { fontWeight: '800', color: C.inkSoft, flex: 1, marginRight: 8 },
  moneyVal: { fontWeight: '900', color: C.ink, fontSize: 15 },
  total: { fontWeight: '900', color: C.green, fontSize: 26 },
  unlock: { backgroundColor: C.yellow, borderRadius: 16, padding: 12, marginTop: 10, alignItems: 'center' },
  unlockText: { fontWeight: '900', color: C.ink, fontSize: 16 },
  win: { color: C.yellow, fontWeight: '900', textAlign: 'center', marginTop: 12, fontSize: 16 },
});
