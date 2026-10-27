import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn, FadeOutUp } from 'react-native-reanimated';
import { Abs, GText, GameBtn, Panel, SW, SH, useS } from './stage';
import { SPR } from './assets';
import { MARKET_BG, STOCK_INFO } from './dests';
import { DECOR, KITCHEN, type DecorUp, type KitchenUp } from './data2';
import type { Save2, StockKey } from './save2';
import { play } from '../fx';

const naira = (n: number) => `₦${n.toLocaleString('en-US')}`;
// stall hot-spots over the market art (stage coords)
const STALLS: { k: StockKey; x: number }[] = [
  { k: 'pepper', x: 18 }, { k: 'grains', x: 180 }, { k: 'protein', x: 342 }, { k: 'produce', x: 504 }, { k: 'drinks', x: 666 },
];

export default function Market({ save, onBuyStock, onBuyKitchen, onBuyDecor, onBack }: { save: Save2; onBuyStock: (k: StockKey) => void; onBuyKitchen: (k: KitchenUp) => void; onBuyDecor: (d: DecorUp) => void; onBack: () => void }) {
  const S = useS();
  const [shop, setShop] = useState<null | 'kitchen' | 'decor'>(null);
  const [flash, setFlash] = useState<{ id: number; x: number; text: string } | null>(null);
  const buy = (k: StockKey, x: number) => {
    const it = STOCK_INFO[k];
    if (save.coins < it.price) { setFlash({ id: Date.now(), x, text: 'Not enough ₦' }); play('bad'); return; }
    onBuyStock(k); play('cash'); setFlash({ id: Date.now(), x, text: `+${it.pack}` });
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#3B2A1E' }}>
      <Image source={MARKET_BG} style={{ position: 'absolute', width: S(SW), height: S(SH) }} resizeMode="cover" />
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: S(58), backgroundColor: '#00000055' }} />
      <Abs x={12} y={6} w={420} h={50}>
        <GText size={28} color="#FFC93C" stroke="#7E1020">OJA · Market</GText>
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: S(10.5) }}>Restock before you cook. Each pot, grill item and drink uses stock.</Text>
      </Abs>
      <View style={{ position: 'absolute', right: S(10), top: S(12), flexDirection: 'row', alignItems: 'center' }}>
        <View testID="coins" style={{ backgroundColor: '#1F5FB0', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center', marginRight: S(8) }}>
          <Text testID="market-coins" style={{ color: '#FFC93C', fontWeight: '900', fontSize: S(13) }}>{naira(save.coins)}</Text>
        </View>
        <GameBtn label="◀ Back" testID="market-back" color="red" w={90} h={34} size={13} onPress={onBack} />
      </View>
      {STALLS.map(({ k, x }, i) => {
        const it = STOCK_INFO[k];
        const n = save.stock[k] ?? 0;
        return (
          <Animated.View key={k} entering={ZoomIn.delay(100 + i * 80)} style={{ position: 'absolute', left: S(x), top: S(150), width: S(158) }}>
            <View style={{ backgroundColor: '#FFF6E2F2', borderRadius: S(14), borderWidth: S(2.5), borderColor: '#A8520E', padding: S(6), alignItems: 'center' }}>
              <Image source={it.icon} style={{ width: S(92), height: S(62) }} resizeMode="contain" />
              <Text style={{ fontSize: S(11), fontWeight: '900', color: '#2B1B12', textAlign: 'center' }} numberOfLines={1}>{it.name}</Text>
              <Text style={{ fontSize: S(8.5), fontWeight: '700', color: '#7A5534' }} numberOfLines={1}>{it.stall}</Text>
              <Text testID={`stock-${k}`} style={{ fontSize: S(12), fontWeight: '900', color: n < 12 ? '#B00020' : '#0B6E4F', marginVertical: S(2) }}>In stock: {n}</Text>
              <GameBtn label={`Buy ${it.pack} · ${naira(it.price)}`} testID={`buy-${k}`} color={save.coins >= it.price ? 'green' : 'grey'} w={140} h={34} size={11.5} onPress={() => buy(k, x)} />
            </View>
          </Animated.View>
        );
      })}
      {flash && (
        <Animated.Text key={flash.id} entering={ZoomIn} exiting={FadeOutUp} style={{ position: 'absolute', left: S(flash.x + 40), top: S(126), fontSize: S(20), fontWeight: '900', color: flash.text.startsWith('+') ? '#FFC93C' : '#FF8A7A', textShadowColor: '#000', textShadowRadius: S(3) }}>{flash.text}</Animated.Text>
      )}
      <View style={{ position: 'absolute', left: S(12), bottom: S(10), flexDirection: 'row', alignItems: 'center' }}>
        <GameBtn label="🔧 Kitchen gear" testID="shop-kitchen" color="blue" w={150} h={40} size={13} onPress={() => setShop('kitchen')} />
        <View style={{ width: S(8) }} />
        <GameBtn label="🪴 Decor" testID="shop-decor" color="purple" w={120} h={40} size={13} onPress={() => setShop('decor')} />
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: S(9.5), marginLeft: S(10), maxWidth: S(330), textShadowColor: '#000', textShadowRadius: S(3) }}>Run out mid-shift and the errand boy dashes to market for you, but he charges double.</Text>
      </View>
      {shop && <Upgrades kind={shop} save={save} onClose={() => setShop(null)} onBuyKitchen={onBuyKitchen} onBuyDecor={onBuyDecor} />}
    </View>
  );
}

function Upgrades({ kind, save, onClose, onBuyKitchen, onBuyDecor }: { kind: 'kitchen' | 'decor'; save: Save2; onClose: () => void; onBuyKitchen: (k: KitchenUp) => void; onBuyDecor: (d: DecorUp) => void }) {
  const S = useS();
  const icons: Record<KitchenUp, any> = { grill: SPR.appl.grill, pot: SPR.appl.pot, fryer: SPR.appl.fryer, drinks: SPR.appl.dispenser, plates: SPR.food.plate };
  return (
    <Animated.View entering={FadeIn} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000A', alignItems: 'center', justifyContent: 'center' }}>
      <Panel w={700} h={340} color="cream">
        <View style={{ flex: 1, padding: S(12) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GText size={22} color="#FFC93C">{kind === 'kitchen' ? '🔧 Kitchen gear' : '🪴 Decor'}</GText>
            <View style={{ flex: 1 }} />
            <Text style={{ color: '#0B6E4F', fontWeight: '900', fontSize: S(15), marginRight: S(10) }}>{naira(save.coins)}</Text>
            <GameBtn label="✕" color="red" w={40} h={34} size={16} onPress={onClose} testID="shop-close" />
          </View>
          <ScrollView horizontal style={{ marginTop: S(8) }} contentContainerStyle={{ gap: S(8) }}>
            {kind === 'kitchen'
              ? (Object.keys(KITCHEN) as KitchenUp[]).map((k) => {
                  const lvl = save.kitchen[k] ?? 0; const price = KITCHEN[k].prices[lvl];
                  return (
                    <View key={k} style={{ width: S(124), backgroundColor: '#FFF', borderRadius: S(12), padding: S(6), alignItems: 'center', borderWidth: S(2), borderColor: '#E9CFA6' }}>
                      <Image source={icons[k]} style={{ width: S(70), height: S(60) }} resizeMode="contain" />
                      <Text style={{ fontWeight: '900', fontSize: S(12), color: '#2B1B12' }}>{KITCHEN[k].name.replace('Suya grill', 'Grill').replace('Jollof pot', 'Big pot')}</Text>
                      <Text style={{ fontSize: S(10), color: '#5E3A1A', textAlign: 'center', minHeight: S(28) }}>{KITCHEN[k].levels[lvl]}{price != null ? ` → ${KITCHEN[k].levels[lvl + 1]}` : ''}</Text>
                      {price != null ? <GameBtn label={naira(price)} testID={`buy-k-${k}`} color={save.coins >= price ? 'green' : 'grey'} w={104} h={34} size={13} onPress={() => onBuyKitchen(k)} /> : <Text style={{ fontWeight: '900', color: '#0B6E4F', marginTop: S(8) }}>MAX ✓</Text>}
                    </View>
                  );
                })
              : (Object.keys(DECOR) as DecorUp[]).map((d) => (
                  <View key={d} style={{ width: S(200), backgroundColor: '#FFF', borderRadius: S(12), padding: S(8), alignItems: 'center', borderWidth: S(2), borderColor: '#E9CFA6' }}>
                    <Text style={{ fontWeight: '900', fontSize: S(13), color: '#2B1B12' }}>{DECOR[d].name}</Text>
                    <Text style={{ fontSize: S(10.5), color: '#5E3A1A', textAlign: 'center', marginVertical: S(6), minHeight: S(42) }}>{DECOR[d].desc}</Text>
                    {save.decor[d] ? <Text style={{ fontWeight: '900', color: '#0B6E4F' }}>Owned ✓</Text> : <GameBtn label={naira(DECOR[d].price)} testID={`buy-d-${d}`} color={save.coins >= DECOR[d].price ? 'green' : 'grey'} w={120} h={34} size={13} onPress={() => onBuyDecor(d)} />}
                  </View>
                ))}
          </ScrollView>
        </View>
      </Panel>
    </Animated.View>
  );
}
