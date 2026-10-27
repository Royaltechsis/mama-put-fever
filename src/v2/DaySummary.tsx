import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { play } from '../fx';
import { SPR } from './assets';
import { goalsFor } from './data2';
import type { ServiceResult } from './Service';
import type { EventResult } from './OwambeEvent';
import { GameBtn, GText, Panel, SW, SH, useS } from './stage';

const naira = (n: number) => `${n < 0 ? '−' : ''}₦${Math.abs(n).toLocaleString('en-US')}`;

export default function DaySummary({ day, idx, ankara, service, event, stars, total, wages, staffCount, onNext, onRetry, onBuka, onMarket, onHome }: {
  day: number; idx: number; ankara: boolean; service: ServiceResult; event: EventResult | null; stars: number; total: number; wages: number; staffCount: number;
  onNext: () => void; onRetry: () => void; onBuka: () => void; onMarket: () => void; onHome: () => void;
}) {
  const S = useS();
  useEffect(() => { play(stars > 0 ? 'win' : 'fail'); }, []);
  const tips = service.tips ?? 0;
  const sales = service.coins - tips;
  const owambe = event?.naira ?? 0;
  const profit = total - wages;
  const goals = goalsFor(idx);
  const Row = ({ l, v, c = '#5E3A1A', b }: { l: string; v: string; c?: string; b?: boolean }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: S(300), paddingVertical: S(3), borderBottomWidth: b ? 0 : S(1), borderColor: '#E3C9A0' }}>
      <Text style={{ color: '#5E3A1A', fontSize: S(b ? 16 : 14), fontWeight: b ? '900' : '700' }}>{l}</Text>
      <Text style={{ color: c, fontSize: S(b ? 18 : 14), fontWeight: '900' }}>{v}</Text>
    </View>
  );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={SPR.bg[ankara ? 1 : 0]} style={{ position: 'absolute', left: 0, top: S(-85), width: S(SW), height: S(475) }} resizeMode="cover" />
      <View style={{ position: 'absolute', left: 0, top: 0, width: S(SW), height: S(SH), backgroundColor: '#1E120ACC' }} />
      <Animated.View entering={ZoomIn}>
        <Panel w={640} h={360}>
          <View style={{ flex: 1, padding: S(12), alignItems: 'center' }}>
            <GText size={24} color="#FFC93C">{`Day ${day} done · closing time 🌙`}</GText>
            <GText size={28} color="#FFC93C" style={{ marginTop: S(2) }}>{'★'.repeat(stars) + '☆'.repeat(3 - stars)}</GText>
            <View style={{ flexDirection: 'row', marginTop: S(4) }}>
              <View style={{ backgroundColor: '#FFF6E4', borderRadius: S(12), padding: S(10), alignItems: 'center' }}>
                <Row l="Food sales" v={naira(sales)} />
                <Row l="Tips" v={naira(tips)} c="#2FA544" />
                {owambe > 0 && <Row l="Owambe order" v={naira(owambe)} c="#2FA544" />}
                <Row l={`Wages (${staffCount} staff)`} v={naira(-wages)} c="#D7263D" />
                <Row l="Profit today" v={naira(profit)} c={profit >= 0 ? '#2FA544' : '#D7263D'} b />
              </View>
              <View style={{ marginLeft: S(12), width: S(200), justifyContent: 'center' }}>
                <GText size={14}>{`Served ${service.served}/${service.total}`}</GText>
                {service.lost > 0 && <GText size={13} color="#FFB3A8">{`${service.lost} walked out`}</GText>}
                {service.bestCombo >= 2 && <GText size={13} color="#BFF5B0">{`Best combo ×${service.bestCombo}`}</GText>}
                <GText size={11} style={{ marginTop: S(6) }}>{`Stars at ${goals.map((g) => naira(g)).join(' / ')}`}</GText>
                {(service.runner ?? 0) > 0 && <GText size={11} color="#FFE7B3">{`Errand boy restocks: ${service.runner}`}</GText>}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: S(12), gap: S(8) }}>
              <GameBtn label="🏠 My Buka" color="purple" w={130} h={44} size={14} testID="end-buka" onPress={onBuka} />
              <GameBtn label="🧺 Market" color="blue" w={110} h={44} size={14} testID="end-market" onPress={onMarket} />
              <GameBtn label="↻ Retry" color="orange" w={100} h={44} size={14} testID="end-retry" onPress={onRetry} />
              <GameBtn label={stars > 0 ? 'Next day ▶' : 'Try again ▶'} w={160} h={44} size={16} testID="end-next" onPress={stars > 0 ? onNext : onRetry} />
            </View>
            <Text onPress={onHome} testID="end-home" style={{ color: '#FFE7B3', fontSize: S(11), marginTop: S(6), textDecorationLine: 'underline' }}>Back to the city</Text>
          </View>
        </Panel>
      </Animated.View>
    </View>
  );
}
