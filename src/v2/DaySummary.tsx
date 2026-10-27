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
              <View testID="sum-side" style={{ marginLeft: S(12), width: S(200), backgroundColor: '#FFF6E4', borderRadius: S(12), paddingVertical: S(10), paddingHorizontal: S(12), justifyContent: 'center', borderWidth: S(2), borderColor: '#E3C9A0' }}>
                <Text style={{ color: '#3A2416', fontSize: S(18), fontWeight: '900' }}>{`Served ${service.served}/${service.total}`}</Text>
                {service.lost > 0 && <Text style={{ color: '#B3261E', fontSize: S(15), fontWeight: '800', marginTop: S(3) }}>{`${service.lost} walked out`}</Text>}
                {service.bestCombo >= 2 && <Text style={{ color: '#1E7A32', fontSize: S(15), fontWeight: '800', marginTop: S(3) }}>{`Best combo ×${service.bestCombo}`}</Text>}
                <View style={{ height: S(1), backgroundColor: '#E3C9A0', marginVertical: S(6) }} />
                <Text style={{ color: '#5E3A1A', fontSize: S(13), fontWeight: '800' }}>Stars at</Text>
                <Text style={{ color: '#3A2416', fontSize: S(13), fontWeight: '900' }}>{goals.map((g) => naira(g)).join(' / ')}</Text>
                {(service.runner ?? 0) > 0 && <Text style={{ color: '#5E3A1A', fontSize: S(13), fontWeight: '800', marginTop: S(4) }}>{`Errand boy restocks: ${service.runner}`}</Text>}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: S(12), gap: S(8) }}>
              <GameBtn label="🏠 My Buka" color="purple" w={130} h={44} size={14} testID="end-buka" onPress={onBuka} />
              <GameBtn label="🧺 Market" color="blue" w={110} h={44} size={14} testID="end-market" onPress={onMarket} />
              <GameBtn label="↻ Retry" color="orange" w={100} h={44} size={14} testID="end-retry" onPress={onRetry} />
              <GameBtn label={stars > 0 ? 'Next day ▶' : 'Try again ▶'} w={160} h={44} size={16} testID="end-next" onPress={stars > 0 ? onNext : onRetry} />
            </View>
            <Text onPress={onHome} testID="end-home" style={{ color: '#7A4A22', fontSize: S(13), fontWeight: '800', marginTop: S(8), textDecorationLine: 'underline' }}>Back to the city</Text>
          </View>
        </Panel>
      </Animated.View>
    </View>
  );
}
