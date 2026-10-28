import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Abs, GameBtn, GText, Panel, SH, SW, useS } from './stage';

const PW = 380;
const PH = 290;

/** shown over a frozen service round: nothing underneath is touchable until the player resumes */
export default function PauseMenu({ level, timeLeft, coins, sound, music, onResume, onRestart, onQuit, onToggleSound, onToggleMusic }: {
  level: string; timeLeft: number; coins: number; sound: boolean; music: boolean;
  onResume: () => void; onRestart: () => void; onQuit: () => void; onToggleSound: () => void; onToggleMusic: () => void;
}) {
  const S = useS();
  const [askRestart, setAskRestart] = useState(false);
  const [askLeave, setAskLeave] = useState(false);
  return (
    <Animated.View entering={FadeIn.duration(120)} style={[StyleSheet.absoluteFill, { zIndex: 900 }]} testID="pause-menu">
      <Pressable onPress={() => undefined} style={[StyleSheet.absoluteFill, { backgroundColor: '#1E120AB8' }]} />
      <Abs x={(SW - PW) / 2} y={(SH - PH) / 2} w={PW} h={PH}>
        <Animated.View entering={ZoomIn.duration(160)}>
          <Panel w={PW} h={PH}>
            <View style={{ flex: 1, alignItems: 'center', paddingTop: S(10) }}>
              <GText size={26} color="#FFC93C">Paused</GText>
              <Text style={{ color: '#5E3A1A', fontWeight: '800', fontSize: S(12), marginTop: S(1) }}>{level}</Text>
              <View style={{ flexDirection: 'row', gap: S(10), marginTop: S(6) }}>
                <View style={{ backgroundColor: '#FFF6E4', borderRadius: S(10), borderWidth: S(1.5), borderColor: '#E3C9A0', paddingHorizontal: S(10), paddingVertical: S(3) }}>
                  <Text style={{ color: '#3A2416', fontWeight: '900', fontSize: S(13) }}>⏱ {Math.ceil(timeLeft)}s left</Text>
                </View>
                <View style={{ backgroundColor: '#FFF6E4', borderRadius: S(10), borderWidth: S(1.5), borderColor: '#E3C9A0', paddingHorizontal: S(10), paddingVertical: S(3) }}>
                  <Text style={{ color: '#3A2416', fontWeight: '900', fontSize: S(13) }}>₦{coins.toLocaleString('en-US')}</Text>
                </View>
              </View>
              <GameBtn label="▶ Resume" color="green" w={230} h={46} size={19} testID="pause-resume" onPress={onResume} style={{ marginTop: S(10) }} />
              <View style={{ flexDirection: 'row', gap: S(8), marginTop: S(8) }}>
                <GameBtn label={sound ? '🔊 Sounds on' : '🔇 Sounds off'} color={sound ? 'blue' : 'grey'} w={140} h={34} size={12} testID="pause-sound" onPress={onToggleSound} />
                <GameBtn label={music ? '🎵 Music on' : '🎵 Music off'} color={music ? 'blue' : 'grey'} w={140} h={34} size={12} testID="pause-music" onPress={onToggleMusic} />
              </View>
              <View style={{ flexDirection: 'row', gap: S(8), marginTop: S(8) }}>
                <GameBtn label={askRestart ? 'Tap again to restart' : '↻ Restart'} color="orange" w={140} h={36} size={12} testID="pause-restart" onPress={() => (askRestart ? onRestart() : (setAskRestart(true), setAskLeave(false)))} />
                <GameBtn label={askLeave ? 'Tap again to leave' : '🏠 Leave level'} color="red" w={140} h={36} size={12} testID="pause-quit" onPress={() => (askLeave ? onQuit() : (setAskLeave(true), setAskRestart(false)))} />
              </View>
              <Text style={{ color: '#7A4A22', fontWeight: '700', fontSize: S(10), marginTop: S(6) }}>Press Esc to pause or resume. Leaving or restarting loses today's progress.</Text>
            </View>
          </Panel>
        </Animated.View>
      </Abs>
    </Animated.View>
  );
}
