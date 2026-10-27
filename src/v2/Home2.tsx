import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import { Abs, GText, GameBtn, Panel, SW, useS } from './stage';
import { SPR } from './assets';
import { DECOR, KITCHEN, LEVELS2, goalsFor, type DecorUp, type KitchenUp } from './data2';
import type { Save2 } from './save2';
import type { Dest } from './dests';

const NODE = (i: number) => {
  const row = Math.floor(i / 6);
  const col = row % 2 === 0 ? i % 6 : 5 - (i % 6);
  return { x: 300 + col * 88, y: 92 + row * 120 + (col % 2) * 26 };
};

export default function Home2({ save, dest, onPlay, onMap, onMarket, onBuyKitchen, onBuyDecor, onToggleSound, onToggleMusic, onReset }: {
  save: Save2; dest: Dest; onPlay: (i: number) => void; onMap: () => void; onMarket: () => void; onBuyKitchen: (k: KitchenUp) => void; onBuyDecor: (d: DecorUp) => void; onToggleSound: () => void; onToggleMusic: () => void; onReset: () => void;
}) {
  const S = useS();
  const [shop, setShop] = useState<null | 'kitchen' | 'decor'>(null);
  const totalStars = save.stars.reduce((a, b) => a + (b ?? 0), 0);
  return (
    <View style={{ flex: 1 }}>
      <Image source={SPR.bg[save.decor.ankara ? 1 : 0]} style={{ position: 'absolute', width: S(SW), height: S(390) }} resizeMode="cover" />
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#1A0E0670' }} />
      {/* title */}
      <Abs x={14} y={14} w={270} h={200}>
        <GText size={50} color="#FFC93C" stroke="#7E1020">MAMAPUT</GText>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(14), marginTop: S(2) }}>{dest.place}</Text>
        <Text style={{ color: '#FFE7B0', fontWeight: '800', fontSize: S(11), marginTop: S(1) }}>{dest.name}, {dest.state} 🇳🇬 · {dest.tagline}</Text>
        <View style={{ flexDirection: 'row', marginTop: S(8), alignItems: 'flex-end' }}>
          <Image source={SPR.cust[0]} style={{ width: S(70), height: S(86) }} resizeMode="contain" />
          <Image source={SPR.food.jollof} style={{ width: S(60), height: S(50) }} resizeMode="contain" />
          <Image source={SPR.food.chicken} style={{ width: S(50), height: S(46) }} resizeMode="contain" />
          <Image source={SPR.props.zobo} style={{ width: S(30), height: S(50) }} resizeMode="contain" />
        </View>
      </Abs>
      <Abs x={14} y={224} w={270} h={160}>
        <GameBtn label="▶ PLAY" testID="play" w={240} h={54} size={24} onPress={() => onPlay(Math.min(save.unlocked, LEVELS2.length - 1))} />
        <View style={{ flexDirection: 'row', marginTop: S(8) }}>
          <GameBtn label="🗺 Map" testID="to-map" color="purple" w={116} h={42} size={14} onPress={onMap} />
          <View style={{ width: S(8) }} />
          <GameBtn label="🧺 Market" testID="to-market" color="blue" w={116} h={42} size={14} onPress={onMarket} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: S(6) }}>
          <Pressable testID="toggle-music" onPress={onToggleMusic} style={{ marginRight: S(14) }}><Text style={{ color: '#FFF', fontWeight: '800', fontSize: S(12) }}>{save.music ? '🎵 Music on' : '🔇 Music off'}</Text></Pressable>
          <Pressable testID="toggle-sfx" onPress={onToggleSound}><Text style={{ color: '#FFF', fontWeight: '800', fontSize: S(12) }}>{save.sound ? '🔊 Sounds on' : '🔇 Sounds off'}</Text></Pressable>
        </View>
      </Abs>
      {/* top right coins */}
      <View style={{ position: 'absolute', right: S(10), top: S(10), flexDirection: 'row' }}>
        <View style={{ backgroundColor: '#1F5FB0', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center', marginRight: S(6) }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>⭐ {totalStars}/{LEVELS2.length * 3}</Text>
        </View>
        <View testID="coins" style={{ backgroundColor: '#1F5FB0', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center' }}>
          <Text style={{ color: '#FFC93C', fontWeight: '900', fontSize: S(13) }}>₦{save.coins.toLocaleString('en-US')}</Text>
        </View>
      </View>
      {/* level map */}
      <Abs x={290} y={48} w={548} h={20}><GText size={14}>{`${dest.name} — ${LEVELS2.length} levels · ⭐ unlock new cities`}</GText></Abs>
      {LEVELS2.map((lv, i) => {
        const n = NODE(i);
        const locked = i > save.unlocked;
        const st = save.stars[i] ?? 0;
        return (
          <Animated.View key={i} entering={ZoomIn.delay(i * 30)} style={{ position: 'absolute', left: S(n.x), top: S(n.y) }}>
            <Pressable testID={`level-${i + 1}`} disabled={locked} onPress={() => onPlay(i)} style={({ pressed }) => ({ alignItems: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] })}>
              <View style={{ width: S(56), height: S(56), borderRadius: S(28), backgroundColor: locked ? '#8D7F70' : lv.bulk ? '#7B4BC4' : '#F28C28', borderWidth: S(3), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 3 } }}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(locked ? 18 : 22) }}>{locked ? '🔒' : i + 1}</Text>
              </View>
              <Text style={{ fontSize: S(11), marginTop: S(1) }}>{[0, 1, 2].map((k) => (k < st ? '⭐' : '☆')).join('')}</Text>
              {lv.bulk && <Text style={{ fontSize: S(9), color: '#FFF', fontWeight: '900', backgroundColor: '#7B4BC4', paddingHorizontal: S(4), borderRadius: S(6), overflow: 'hidden' }}>🎉 Owambe</Text>}
            </Pressable>
          </Animated.View>
        );
      })}
      <Pressable onPress={onReset} style={{ position: 'absolute', right: S(10), bottom: S(6) }}><Text style={{ color: '#FFFFFF88', fontSize: S(10) }}>reset progress</Text></Pressable>
      {shop && <Shop kind={shop} save={save} onClose={() => setShop(null)} onBuyKitchen={onBuyKitchen} onBuyDecor={onBuyDecor} />}
    </View>
  );
}

function Shop({ kind, save, onClose, onBuyKitchen, onBuyDecor }: { kind: 'kitchen' | 'decor'; save: Save2; onClose: () => void; onBuyKitchen: (k: KitchenUp) => void; onBuyDecor: (d: DecorUp) => void }) {
  const S = useS();
  const icons: Record<KitchenUp, any> = { grill: SPR.appl.grill, pot: SPR.appl.pot, fryer: SPR.appl.fryer, drinks: SPR.appl.dispenser, plates: SPR.food.plate };
  return (
    <Animated.View entering={FadeIn} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000A', alignItems: 'center', justifyContent: 'center' }}>
      <Panel w={700} h={350} color="cream">
        <View style={{ flex: 1, padding: S(12) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GText size={22} color="#FFC93C">{kind === 'kitchen' ? '🔧 Kitchen upgrades' : '🪴 Decor upgrades'}</GText>
            <View style={{ flex: 1 }} />
            <Text style={{ color: '#0B6E4F', fontWeight: '900', fontSize: S(15), marginRight: S(10) }}>₦{save.coins.toLocaleString('en-US')}</Text>
            <GameBtn label="✕" color="red" w={40} h={36} size={16} onPress={onClose} testID="shop-close" />
          </View>
          <ScrollView horizontal style={{ marginTop: S(8) }} contentContainerStyle={{ gap: S(8) }}>
            {kind === 'kitchen' && (Object.keys(KITCHEN) as KitchenUp[]).map((k) => {
              const u = KITCHEN[k]; const lvl = save.kitchen[k] ?? 0; const max = lvl >= u.prices.length; const price = u.prices[lvl];
              return (
                <View key={k} style={{ width: S(124), backgroundColor: '#FFF', borderRadius: S(14), padding: S(6), alignItems: 'center', borderWidth: S(2), borderColor: '#E9CFA6' }}>
                  <Image source={icons[k]} style={{ width: S(100), height: S(80) }} resizeMode="contain" />
                  <Text style={{ fontWeight: '900', fontSize: S(13), color: '#2B1B12' }}>{u.name}</Text>
                  <Text style={{ fontSize: S(10), fontWeight: '800', color: '#0B6E4F' }}>Now: {u.levels[lvl]}</Text>
                  <Text style={{ fontSize: S(10), fontWeight: '700', color: '#5E3A1A', minHeight: S(26) }}>{max ? 'Fully upgraded' : `Next: ${u.levels[lvl + 1]}`}</Text>
                  <Text style={{ fontSize: S(11), marginBottom: S(3) }}>{u.levels.map((_, i) => (i <= lvl ? '🟧' : '⬜')).join('')}</Text>
                  {!max && <GameBtn label={`₦${price.toLocaleString('en-US')}`} disabled={save.coins < price} w={110} h={36} size={13} testID={`buy-${k}`} onPress={() => onBuyKitchen(k)} />}
                </View>
              );
            })}
            {kind === 'decor' && (Object.keys(DECOR) as DecorUp[]).map((d) => {
              const u = DECOR[d]; const owned = !!save.decor[d];
              return (
                <View key={d} style={{ width: S(200), backgroundColor: '#FFF', borderRadius: S(14), padding: S(8), alignItems: 'center', borderWidth: S(2), borderColor: owned ? '#2FA544' : '#E9CFA6' }}>
                  <Text style={{ fontSize: S(40) }}>{d === 'ankara' ? '🎨' : d === 'fans' ? '🌀' : '🔊'}</Text>
                  <Text style={{ fontWeight: '900', fontSize: S(14), color: '#2B1B12' }}>{u.name}</Text>
                  <Text style={{ fontSize: S(11), fontWeight: '700', color: '#5E3A1A', textAlign: 'center', minHeight: S(44), marginTop: S(4) }}>{u.desc}</Text>
                  {owned ? <Text style={{ color: '#2FA544', fontWeight: '900', fontSize: S(14), marginTop: S(6) }}>✓ Owned</Text>
                    : <GameBtn label={`₦${u.price.toLocaleString('en-US')}`} disabled={save.coins < u.price} w={140} h={38} size={14} testID={`buy-${d}`} onPress={() => onBuyDecor(d)} style={{ marginTop: S(6) }} />}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Panel>
    </Animated.View>
  );
}
