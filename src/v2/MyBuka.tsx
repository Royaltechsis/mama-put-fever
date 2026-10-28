import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { SPR } from './assets';
import { DECOR, type DecorUp } from './data2';
import { Abs, GameBtn, GText, Panel, SW, SH, useS } from './stage';
import { CHAIRS, DECO4, MAX_SEATS, MAX_STAFF_LV, SEAT_PRICES, STAFF, bukaLevel, chefLevel, chefTitle, ratingLabel, staffLvOf, staffSkill, staffSpeed, staffXpNeed, totalStars, trainCost, wageOf, wagesOf, type Deco4, type Save2, type StaffId } from './save2';
import { play } from '../fx';

type Tab = 'seats' | 'decor' | 'staff';
const naira = (n: number) => `₦${n.toLocaleString('en-US')}`;

export default function MyBuka({ save, onSave, onBack, onMarket }: { save: Save2; onSave: (s: Save2) => void; onBack: () => void; onMarket: () => void }) {
  const S = useS();
  const [tab, setTab] = useState<Tab>('seats');
  const stars = totalStars(save);
  const seats = save.seats ?? 3;
  const buy = (price: number, change: Partial<Save2>) => { if (save.coins < price) { play('bad'); return; } play('cash'); onSave({ ...save, ...change, coins: save.coins - price }); };
  const Card = ({ title, desc, children, icon, testID, h = 196 }: { title: string; desc: string; children?: React.ReactNode; icon: React.ReactNode; testID?: string; h?: number }) => (
    <View testID={testID} style={{ width: S(150), height: S(h), backgroundColor: '#FFF6E4', borderRadius: S(14), borderWidth: S(2), borderColor: '#C9934F', marginRight: S(10), padding: S(8), alignItems: 'center' }}>
      <View style={{ height: S(70), justifyContent: 'center', alignItems: 'center' }}>{icon}</View>
      <Text style={{ fontWeight: '900', color: '#5E3A1A', fontSize: S(13), textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: '#7A5A3A', fontSize: S(10), textAlign: 'center', marginTop: S(2), flex: 1 }}>{desc}</Text>
      {children}
    </View>
  );
  const Owned = () => <Text style={{ fontWeight: '900', color: '#2FA544', fontSize: S(14), marginBottom: S(6) }}>✓ Owned</Text>;
  const emoji = (e: string) => <Text style={{ fontSize: S(40) }}>{e}</Text>;
  return (
    <View style={{ flex: 1 }}>
      <Image source={SPR.bg[save.decor.ankara ? 1 : 0]} style={{ position: 'absolute', left: 0, top: S(-85), width: S(SW), height: S(475), opacity: 0.55 }} resizeMode="cover" />
      <View style={{ position: 'absolute', left: 0, top: 0, width: S(SW), height: S(SH), backgroundColor: '#2B1B1299' }} />
      <Abs x={14} y={8} w={SW - 28} h={50}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <GameBtn label="◀ Back" color="red" w={100} h={40} size={15} testID="buka-back" onPress={onBack} />
          <View style={{ alignItems: 'center' }}>
            <GText size={24} color="#FFC93C">{`My Buka · Level ${bukaLevel(save)}`}</GText>
            <GText size={12}>{`${seats} seats · ${CHAIRS[save.chair ?? 0].name} · staff wages ${naira(wagesOf(save))}/day`}</GText>          </View>
          <View style={{ backgroundColor: '#2B1B12CC', borderRadius: S(12), paddingHorizontal: S(10), paddingVertical: S(5), alignItems: 'flex-end' }}>
            <GText size={17} color="#FFC93C">{naira(save.coins)}</GText>
            <GText size={11}>{`⭐ ${stars}`}</GText>
          </View>
        </View>
      </Abs>
      {/* preview */}
      <Abs x={14} y={66} w={226} h={316}>
        <Panel w={226} h={316}>
          <View style={{ flex: 1, padding: S(8), alignItems: 'center' }}>
            <GText size={14}>Your dining room</GText>
            <GText size={11} color="#FFE9A8" style={{ textAlign: 'center' }}>{`⭐ ${(save.rating ?? 3.5).toFixed(1)} ${ratingLabel(save.rating ?? 3.5)}`}</GText>
            <GText size={11} color="#FFE9A8" style={{ textAlign: 'center' }}>{`${chefTitle(chefLevel(save.xp ?? 0))} · Lv ${chefLevel(save.xp ?? 0)}`}</GText>
            <BukaPreview save={save} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: S(6) }}>
              {(Object.keys(DECO4) as Deco4[]).filter((k) => save.deco?.[k]).map((k) => <Text key={k} style={{ fontSize: S(18) }}>{DECO4[k].icon}</Text>)}
              {save.decor.fans && <Text style={{ fontSize: S(18) }}>🌀</Text>}
              {save.decor.music && <Text style={{ fontSize: S(18) }}>🎶</Text>}
            </View>
            <GameBtn label="🧺 Market" color="blue" w={150} h={36} size={13} onPress={onMarket} testID="buka-market" style={{ marginTop: S(8) }} />
          </View>
        </Panel>
      </Abs>
      {/* tabs */}
      <Abs x={252} y={66} w={580} h={40}>
        <View style={{ flexDirection: 'row' }}>
          {([['seats', '🪑 Seats & chairs'], ['decor', '✨ Decor'], ['staff', '👩🏾‍🍳 Hire help']] as const).map(([k, l]) => (
            <GameBtn key={k} label={l} color={tab === k ? 'orange' : 'grey'} w={180} h={38} size={14} testID={`tab-${k}`} onPress={() => setTab(k)} style={{ marginRight: S(8) }} />
          ))}
        </View>
      </Abs>
      <Abs x={252} y={114} w={584} h={270}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: S(6) }}>
          {tab === 'seats' && (<>
            <Card title={`Add a seat (${seats}/${MAX_SEATS})`} desc="One more customer can sit and order at the same time" icon={<ChairIcon tier={save.chair ?? 0} plus />} testID="card-seat">
              {seats >= MAX_SEATS ? <Text style={{ fontWeight: '900', color: '#2FA544', marginBottom: S(6) }}>Full house!</Text> :
                <GameBtn label={naira(SEAT_PRICES[seats + 1])} disabled={save.coins < SEAT_PRICES[seats + 1]} w={120} h={34} size={13} testID="buy-seat" onPress={() => buy(SEAT_PRICES[seats + 1], { seats: seats + 1 })} />}
            </Card>
            {CHAIRS.map((c, i) => (
              <Card key={i} title={c.name} desc={c.desc} icon={<ChairIcon tier={i} />} testID={`card-chair-${i}`}>
                {(save.chair ?? 0) >= i ? <Owned /> : <GameBtn label={naira(c.price)} disabled={save.coins < c.price} w={120} h={34} size={13} testID={`buy-chair-${i}`} onPress={() => buy(c.price, { chair: i })} />}
              </Card>
            ))}
          </>)}
          {tab === 'decor' && (<>
            {(Object.keys(DECO4) as Deco4[]).map((k) => (
              <Card key={k} title={DECO4[k].name} desc={DECO4[k].desc} icon={emoji(DECO4[k].icon)} testID={`card-deco-${k}`}>
                {save.deco?.[k] ? <Owned /> : <GameBtn label={naira(DECO4[k].price)} disabled={save.coins < DECO4[k].price} w={120} h={34} size={13} testID={`buy-deco-${k}`} onPress={() => buy(DECO4[k].price, { deco: { ...(save.deco ?? {}), [k]: true } })} />}
              </Card>
            ))}
            {(Object.keys(DECOR) as DecorUp[]).map((k) => (
              <Card key={k} title={DECOR[k].name} desc={DECOR[k].desc} icon={emoji(k === 'fans' ? '🌀' : k === 'music' ? '🎶' : '🎨')} testID={`card-decor-${k}`}>
                {save.decor[k] ? <Owned /> : <GameBtn label={naira(DECOR[k].price)} disabled={save.coins < DECOR[k].price} w={120} h={34} size={13} testID={`buy-decor-${k}`} onPress={() => buy(DECOR[k].price, { decor: { ...save.decor, [k]: true } })} />}
              </Card>
            ))}
          </>)}
          {tab === 'staff' && (Object.keys(STAFF) as StaffId[]).map((k) => {
            const s = STAFF[k]; const hired = !!save.staff?.[k]; const locked = stars < s.stars;
            const lvl = staffLvOf(save, k); const xpNow = save.staffLv?.[k]?.xp ?? 0; const need = staffXpNeed(lvl);
            const maxed = lvl >= MAX_STAFF_LV; const ready = xpNow >= need; const cost = trainCost(lvl);
            const stats = `Speed x${staffSpeed(lvl).toFixed(2)} · Skill ${Math.round(staffSkill(lvl) * 100)}%`;
            const train = () => {
              if (maxed || !ready) return;
              buy(cost, { staffLv: { ...(save.staffLv ?? {}), [k]: { lv: lvl + 1, xp: xpNow - need } } });
            };
            return (
              <Card key={k} h={236} title={`${s.name} · Lv ${lvl}`} desc={`${s.job}\nWage ${naira(wageOf(save, k))} a day\n${stats}\n${maxed ? 'Fully trained' : `Experience ${Math.min(xpNow, need)}/${need} tasks`}`} testID={`card-staff-${k}`}
                icon={<View style={{ alignItems: 'center' }}><Image source={SPR.staff[k]} style={{ width: S(60), height: S(76), opacity: locked ? 0.4 : 1 }} resizeMode="contain" /><View style={{ position: 'absolute', bottom: 0, backgroundColor: s.color, borderRadius: S(6), paddingHorizontal: S(4) }}><Text style={{ color: '#FFF', fontSize: S(9), fontWeight: '900' }}>{k.toUpperCase()}</Text></View></View>}>
                {locked ? <Text style={{ fontWeight: '900', color: '#A0522D', marginBottom: S(6) }}>{`🔒 Needs ${s.stars}⭐`}</Text>
                  : hired ? (<>
                    {!maxed && <GameBtn label={ready ? `Train ${naira(cost)}` : 'Needs experience'} color={ready ? 'blue' : 'grey'} disabled={!ready || save.coins < cost} w={128} h={30} size={11} testID={`train-${k}`} onPress={train} style={{ marginBottom: S(4) }} />}
                    <GameBtn label="Let go" color="red" w={110} h={28} size={11} testID={`fire-${k}`} onPress={() => onSave({ ...save, staff: { ...(save.staff ?? {}), [k]: false } })} />
                  </>)
                  : <GameBtn label="Hire" w={110} h={34} size={14} testID={`hire-${k}`} onPress={() => { play('cash'); onSave({ ...save, staff: { ...(save.staff ?? {}), [k]: true } }); }} />}
              </Card>
            );
          })}
        </ScrollView>
        {tab === 'staff' && <GText size={11} style={{ marginTop: S(2) }}>Wages come out of each day's takings. Staff earn experience by working, then you pay to train them: faster legs, steadier hands, higher wage.</GText>}
      </Abs>
    </View>
  );
}

export function ChairIcon({ tier, plus }: { tier: number; plus?: boolean }) {
  const S = useS();
  const c = [['#E23B2E', '#B32418'], ['#9A6232', '#6E4220'], ['#C8283A', '#5A341A']][tier];
  return (
    <Svg width={S(64)} height={S(64)} viewBox="0 0 64 64">
      <Rect x={14} y={4} width={36} height={30} rx={tier === 1 ? 3 : 10} fill={c[0]} />
      <Rect x={10} y={32} width={44} height={8} rx={3} fill={c[1]} />
      <Rect x={13} y={38} width={6} height={24} rx={2} fill={c[1]} /><Rect x={45} y={38} width={6} height={24} rx={2} fill={c[1]} />
      {plus && <><Circle cx={52} cy={12} r={10} fill="#2FA544" /><Path d="M 52 6 v 12 M 46 12 h 12" stroke="#FFF" strokeWidth={3} /></>}
    </Svg>
  );
}

function BukaPreview({ save }: { save: Save2 }) {
  const S = useS();
  const seats = save.seats ?? 3;
  const c = [['#E23B2E', '#B32418'], ['#9A6232', '#6E4220'], ['#C8283A', '#5A341A']][save.chair ?? 0];
  return (
    <Svg width={S(206)} height={S(170)} viewBox="0 0 206 170" style={{ marginTop: S(4) }}>
      <Rect x={0} y={0} width={206} height={170} rx={12} fill="#F3D9A8" />
      {save.deco?.canopy && <Path d="M 0 0 L 206 0 L 196 26 L 10 26 Z" fill="#2FA544" />}
      {save.deco?.canopy && [0, 1, 2, 3, 4, 5].map((i) => <Path key={i} d={`M ${10 + i * 31} 26 q 15 12 31 0`} fill={i % 2 ? '#FFF' : '#2FA544'} />)}
      {save.deco?.tv && <><Rect x={140} y={34} width={52} height={32} rx={3} fill="#222" /><Rect x={144} y={38} width={44} height={24} fill="#3B8F3B" /><Circle cx={166} cy={50} r={3} fill="#FFF" /></>}
      {save.deco?.gen && <><Rect x={8} y={130} width={36} height={26} rx={4} fill="#E8A21E" /><Rect x={12} y={136} width={14} height={8} fill="#333" /></>}
      {save.decor.fans && <><Circle cx={100} cy={40} r={14} fill="#DDD" /><Path d="M 100 40 l 12 -6 M 100 40 l -12 -6 M 100 40 l 0 13" stroke="#888" strokeWidth={4} /></>}
      <Rect x={10} y={96} width={186} height={18} rx={4} fill="#8A5A34" />
      {Array.from({ length: seats }).map((_, i) => {
        const x = 18 + i * (170 / seats);
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={70} width={24} height={26} rx={save.chair === 1 ? 2 : 7} fill={c[0]} />
            <Rect x={x + 2} y={114} width={4} height={18} fill={c[1]} /><Rect x={x + 18} y={114} width={4} height={18} fill={c[1]} />
          </React.Fragment>
        );
      })}
      {(['cook', 'waiter', 'cleaner'] as StaffId[]).filter((k) => save.staff?.[k]).map((k, i) => (
        <React.Fragment key={k}>
          <Circle cx={60 + i * 44} cy={146} r={8} fill="#6B3E26" />
          <Rect x={52 + i * 44} y={152} width={16} height={14} rx={4} fill={STAFF[k].color} />
        </React.Fragment>
      ))}
    </Svg>
  );
}
