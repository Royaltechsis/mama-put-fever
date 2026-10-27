import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn, BounceIn } from 'react-native-reanimated';
import { GText, GameBtn, Panel, SW, useS } from './stage';
import { SPR } from './assets';
import { LEVELS2, MENU, goalsFor } from './data2';
import { PlateView } from './Service';
import type { ServiceResult } from './Service';
import type { EventResult } from './OwambeEvent';
import { play } from '../fx';
import { LBL, STOCK_INFO, STOCK_OF } from './dests';
import type { StockKey } from './save2';

const naira = (n: number) => `₦${n.toLocaleString('en-US')}`;

function Backdrop({ ankara, children }: { ankara: boolean; children: React.ReactNode }) {
  const S = useS();
  return (
    <View style={{ flex: 1 }}>
      <Image source={SPR.bg[ankara ? 1 : 0]} style={{ position: 'absolute', width: S(SW), height: S(390) }} resizeMode="cover" />
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000A', alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

export function LevelIntro({ idx, ankara, stock, onStart, onBack, onMarket }: { idx: number; ankara: boolean; stock?: Record<StockKey, number>; onStart: () => void; onBack: () => void; onMarket?: () => void }) {
  const S = useS();
  const lv = LEVELS2[idx];
  const need = Array.from(new Set(Object.values(STOCK_OF))) as StockKey[];
  const low = stock ? need.filter((k) => (stock[k] ?? 0) < 12) : [];
  const goals = goalsFor(idx);
  return (
    <Backdrop ankara={ankara}>
      <Animated.View entering={ZoomIn}>
        <Panel w={620} h={340}>
          <View style={{ flex: 1, padding: S(14), alignItems: 'center' }}>
            <GText size={26} color="#FFC93C">Level {idx + 1}: {lv.name}</GText>
            {lv.isNew && <View style={{ backgroundColor: '#D7263D', borderRadius: S(10), paddingHorizontal: S(10), paddingVertical: S(2), marginTop: S(4) }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(12) }}>NEW: {lv.isNew}</Text></View>}
            <Text style={{ fontWeight: '800', color: '#5E3A1A', fontSize: S(12), marginTop: S(6) }}>On the menu today</Text>
            <View style={{ flexDirection: 'row', marginTop: S(4), gap: S(6) }}>
              {lv.menu.map((m) => (
                <View key={m} style={{ alignItems: 'center', backgroundColor: '#FFF', borderRadius: S(10), padding: S(4), borderWidth: S(2), borderColor: '#E9CFA6' }}>
                  {MENU[m].drink ? <Image source={SPR.props[MENU[m].drink!]} style={{ width: S(40), height: S(46) }} resizeMode="contain" /> : <PlateView comps={MENU[m].comps!} w={58} />}
                  <Text style={{ fontSize: S(9), fontWeight: '900', color: '#2B1B12' }}>{MENU[m].name}</Text>
                  <Text style={{ fontSize: S(9), fontWeight: '800', color: '#0B6E4F' }}>{naira(MENU[m].price)}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontWeight: '900', color: '#2B1B12', fontSize: S(13), marginTop: S(8) }}>
              {lv.customers} customers · {lv.duration}s{lv.bulk ? ' · then an Owambe bulk order 🎉' : ''}
            </Text>
            <Text style={{ fontWeight: '900', color: '#2B1B12', fontSize: S(13), marginTop: S(2) }}>⭐ {naira(goals[0])}   ⭐⭐ {naira(goals[1])}   ⭐⭐⭐ {naira(goals[2])}</Text>
            {idx === 0 && <Text style={{ fontSize: S(11), fontWeight: '700', color: '#7B4BC4', marginTop: S(4), textAlign: 'center' }}>{LBL.jollof === 'jollof' ? 'Drag raw chicken onto the grill · drag jollof from the pot onto a plate · add the grilled chicken · drag the plate to the customer. Tapping works too!' : `Cook the ${LBL.jollof}: add ${LBL.blend.toLowerCase()} then ${LBL.rice.toLowerCase()} to the pot · drag it onto a plate · add the rest · drag the plate to the customer. Tapping works too!`}</Text>}
            {stock && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: S(6), gap: S(6) }}>
                {need.map((k) => (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: (stock[k] ?? 0) < 12 ? '#FFD6D6' : '#FFFFFFAA', borderRadius: S(8), paddingHorizontal: S(4) }}>
                    <Image source={STOCK_INFO[k].icon} style={{ width: S(22), height: S(18) }} resizeMode="contain" />
                    <Text style={{ fontSize: S(10), fontWeight: '900', color: (stock[k] ?? 0) < 12 ? '#B00020' : '#2B1B12' }}>{stock[k] ?? 0}</Text>
                  </View>
                ))}
                {low.length > 0 && <Text style={{ fontSize: S(10), fontWeight: '900', color: '#B00020' }}>Low stock! Restock at the market (or the errand boy buys at 2x)</Text>}
              </View>
            )}
            <View style={{ flexDirection: 'row', marginTop: S(10), gap: S(12) }}>
              <GameBtn label="Back" color="grey" w={100} h={44} onPress={onBack} />
              {onMarket && <GameBtn label="🧺 Market" testID="intro-market" color="blue" w={130} h={44} size={15} onPress={onMarket} />}
              <GameBtn label="Start! ▶" testID="start" w={180} h={44} onPress={onStart} />
            </View>
          </View>
        </Panel>
      </Animated.View>
    </Backdrop>
  );
}

export function LevelEnd({ idx, ankara, service, event, stars, total, onNext, onRetry, onHome }: {
  idx: number; ankara: boolean; service: ServiceResult; event: EventResult | null; stars: number; total: number; onNext: () => void; onRetry: () => void; onHome: () => void;
}) {
  const S = useS();
  const goals = goalsFor(idx);
  useEffect(() => { play(stars > 0 ? 'win' : 'fail'); }, []);
  const quote = stars === 3 ? 'Chai! Mamaput, you be correct chef! 🔥' : stars === 2 ? 'Customers dey happy. Small more speed!' : stars === 1 ? 'We manage. Next time, sharp sharp!' : 'Na wa o! Customers waka comot…';
  return (
    <Backdrop ankara={ankara}>
      <Animated.View entering={ZoomIn}>
        <Panel w={600} h={350}>
          <View style={{ flex: 1, padding: S(12), alignItems: 'center' }}>
            <GText size={26} color={stars ? '#FFC93C' : '#FF8A7A'}>{stars ? 'Level complete!' : 'Level failed'}</GText>
            <View testID="results-title" style={{ flexDirection: 'row', marginTop: S(4) }}>
              {[0, 1, 2].map((i) => (
                <Animated.Text key={i} entering={BounceIn.delay(300 + i * 250)} style={{ fontSize: S(i === 1 ? 50 : 40), marginHorizontal: S(4), marginTop: i === 1 ? 0 : S(8), opacity: i < stars ? 1 : 0.25 }}>⭐</Animated.Text>
              ))}
            </View>
            <Text style={{ fontWeight: '800', color: '#5E3A1A', fontSize: S(12), fontStyle: 'italic' }}>"{quote}"</Text>
            <View style={{ flexDirection: 'row', marginTop: S(8), gap: S(10) }}>
              <Stat label="Served" value={`${service.served}/${service.total}`} />
              <Stat label="Walked out" value={`${service.lost}`} />
              <Stat label="Best combo" value={`x${service.bestCombo}`} />
              <Stat label="Service" value={naira(service.coins)} />
              {event && <Stat label="Owambe" value={naira(event.naira)} />}
            </View>
            {event && <Text style={{ fontSize: S(11), fontWeight: '700', color: '#7B4BC4', marginTop: S(4) }}>Owambe: cooking {event.quality}% · packing {event.accuracy}% · {event.note}</Text>}
            <Text testID="earned" style={{ fontSize: S(22), fontWeight: '900', color: '#0B6E4F', marginTop: S(6) }}>Total {naira(total)}</Text>
            <Text style={{ fontSize: S(10), fontWeight: '700', color: '#5E3A1A' }}>Goals: ⭐ {naira(goals[0])} · ⭐⭐ {naira(goals[1])} · ⭐⭐⭐ {naira(goals[2])}</Text>
            <View style={{ flexDirection: 'row', marginTop: S(10), gap: S(10) }}>
              <GameBtn label="Map" color="grey" w={110} h={44} onPress={onHome} testID="home" />
              <GameBtn label="Retry" color="orange" w={120} h={44} onPress={onRetry} testID="retry" />
              {stars > 0 && idx < LEVELS2.length - 1 && <GameBtn label="Next ▶" w={140} h={44} onPress={onNext} testID="next" />}
            </View>
          </View>
        </Panel>
      </Animated.View>
    </Backdrop>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const S = useS();
  return (
    <View style={{ alignItems: 'center', backgroundColor: '#FFF', borderRadius: S(10), paddingHorizontal: S(8), paddingVertical: S(4), borderWidth: S(2), borderColor: '#E9CFA6' }}>
      <Text style={{ fontSize: S(15), fontWeight: '900', color: '#2B1B12' }}>{value}</Text>
      <Text style={{ fontSize: S(9), fontWeight: '800', color: '#5E3A1A' }}>{label}</Text>
    </View>
  );
}
