import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn, FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Abs, GText, GameBtn, SW, SH, useS } from './stage';
import { DESTS, MAP_BG, type DestId } from './dests';
import { totalStars, type Save2 } from './save2';

function Bob({ children, on }: { children: React.ReactNode; on: boolean }) {
  const y = useSharedValue(0);
  React.useEffect(() => { if (on) y.value = withRepeat(withSequence(withTiming(-5, { duration: 600 }), withTiming(0, { duration: 600 })), -1); }, [on]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={a}>{children}</Animated.View>;
}

export default function WorldMap({ save, onPick, onMarket, onBuka, onToggleSound, onToggleMusic, user, onAccount, showNote, onDismissNote }: { user?: { username: string } | null; onAccount?: () => void; showNote?: boolean; onDismissNote?: () => void; save: Save2; onPick: (d: DestId) => void; onMarket: () => void; onBuka: () => void; onToggleSound: () => void; onToggleMusic: () => void }) {
  const S = useS();
  const stars = totalStars(save);
  const unlockAll = !!(save as any).unlockAll;
  return (
    <View style={{ flex: 1, backgroundColor: '#2A6F97' }}>
      <Image source={MAP_BG} style={{ position: 'absolute', width: S(SW), height: S(SH) }} resizeMode="cover" />
      {/* header */}
      <Abs x={10} y={312} w={230} h={74}>
        <GText size={30} color="#FFC93C" stroke="#7E1020">MAMAPUT</GText>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(10.5), textShadowColor: '#000', textShadowRadius: S(3) }}>Cook your way across Nigeria 🇳🇬</Text>
      </Abs>
      <View style={{ position: 'absolute', right: S(10), bottom: S(10), flexDirection: 'row' }}>
        <View style={{ backgroundColor: '#1F5FB0', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center', marginRight: S(6) }}>
          <Text testID="map-stars" style={{ color: '#FFF', fontWeight: '900', fontSize: S(13) }}>⭐ {stars}</Text>
        </View>
        <View testID="coins" style={{ backgroundColor: '#1F5FB0', borderRadius: S(14), borderWidth: S(2), borderColor: '#FFF', paddingHorizontal: S(10), height: S(28), justifyContent: 'center' }}>
          <Text style={{ color: '#FFC93C', fontWeight: '900', fontSize: S(13) }}>₦{save.coins.toLocaleString('en-US')}</Text>
        </View>
      </View>
      {DESTS.map((d, i) => {
        const open = d.playable && (unlockAll || stars >= d.starsToUnlock);
        const prog = save.prog[d.id];
        const got = prog ? prog.stars.reduce((a, b) => a + (b ?? 0), 0) : 0;
        const max = (d.levels?.length ?? 10) * 3;
        const current = save.dest === d.id;
        return (
          <Animated.View key={d.id} entering={ZoomIn.delay(150 + i * 90)} style={{ position: 'absolute', left: S(d.pin.x - 62), top: S(Math.max(0, d.pin.y - 50)), width: S(124), alignItems: 'center' }}>
            <Pressable testID={`dest-${d.id}`} disabled={!open} onPress={() => onPick(d.id)} style={({ pressed }) => ({ alignItems: 'center', transform: [{ scale: pressed ? 0.93 : 1 }] })}>
              <Bob on={open && (current || got === 0)}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: S(40), height: S(40), borderRadius: S(20), backgroundColor: open ? d.color : '#6E6458', borderWidth: S(3), borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 3 } }}>
                    <Text style={{ fontSize: S(18) }}>{open ? (d.id === 'lagos' ? '🍛' : d.id === 'ibadan' ? '🥣' : '🐟') : '🔒'}</Text>
                  </View>
                  <View style={{ width: 0, height: 0, borderLeftWidth: S(7), borderRightWidth: S(7), borderTopWidth: S(9), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFF', marginTop: S(-2) }} />
                </View>
              </Bob>
              <View style={{ backgroundColor: open ? '#2B1B12E6' : '#2B1B12B0', borderRadius: S(8), paddingHorizontal: S(6), paddingVertical: S(1), marginTop: S(1), alignItems: 'center', borderWidth: current ? S(1.5) : 0, borderColor: '#FFC93C' }}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(11) }}>{d.name}</Text>
                <Text style={{ color: open ? '#FFC93C' : '#FFFFFFAA', fontWeight: '800', fontSize: S(8.5) }}>
                  {!d.playable ? `Coming soon · ⭐${d.starsToUnlock}` : open ? `⭐ ${got}/${max}` : `🔒 needs ⭐${d.starsToUnlock}`}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
      {onAccount && (
        <Abs x={652} y={288} w={186} h={32}>
          <GameBtn label={user ? `👤 ${user.username}` : '👤 Save progress'} testID="acct-btn" color="blue" w={180} h={30} size={12} onPress={onAccount} />
        </Abs>
      )}
      {showNote && onAccount && (
        <Abs x={200} y={54} w={444} h={40}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#2B1B12E6', borderRadius: S(12), paddingHorizontal: S(10), paddingVertical: S(6), borderWidth: S(1), borderColor: '#FFC93C' }}>
            <Text onPress={onAccount} style={{ color: '#FFF', fontSize: S(11), fontWeight: '700', flex: 1 }}>💾 You can create an account anytime, it just keeps your progress safe across devices.</Text>
            <Text testID="acct-note-x" onPress={onDismissNote} style={{ color: '#FFC93C', fontSize: S(14), fontWeight: '900', marginLeft: S(8) }}>✕</Text>
          </View>
        </Abs>
      )}
      <Abs x={182} y={336} w={300} h={50}>
        <View style={{ flexDirection: 'row' }}>
          <GameBtn label="🧺 Go to Market" testID="map-market" color="orange" w={160} h={44} size={14} onPress={onMarket} />
          <GameBtn label="🏠 My Buka" testID="map-buka" color="purple" w={130} h={44} size={14} onPress={onBuka} style={{ marginLeft: S(8) }} />
        </View>
      </Abs>
      <Abs x={640} y={322} w={200} h={20}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Pressable testID="toggle-music" onPress={onToggleMusic} style={{ marginRight: S(12) }}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(11), textShadowColor: '#000', textShadowRadius: S(3) }}>{save.music ? '🎵 Music on' : '🔇 Music off'}</Text></Pressable>
          <Pressable testID="toggle-sfx" onPress={onToggleSound}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: S(11), textShadowColor: '#000', textShadowRadius: S(3) }}>{save.sound ? '🔊 Sounds on' : '🔇 Sounds off'}</Text></Pressable>
        </View>
      </Abs>
      <Animated.View entering={FadeIn.delay(600)} pointerEvents="none" style={{ position: 'absolute', left: S(10), top: S(8), backgroundColor: '#2B1B12CC', borderRadius: S(10), paddingHorizontal: S(8), paddingVertical: S(3), maxWidth: S(150) }}>
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: S(9) }}>Tap a city to cook. Earn ⭐ to unlock the next city.</Text>
      </Animated.View>
    </View>
  );
}
