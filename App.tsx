import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DragProvider } from './src/dnd';
import { setSoundEnabled } from './src/fx';
import { Stage } from './src/v2/stage';
import Home2 from './src/v2/Home2';
import Service, { type ServiceResult } from './src/v2/Service';
import OwambeEvent, { type EventResult } from './src/v2/OwambeEvent';
import { LevelEnd, LevelIntro } from './src/v2/LevelCards';
import { DECOR, KITCHEN, LEVELS2, goalsFor } from './src/v2/data2';
import { DEFAULT_SAVE2, loadSave2, writeSave2, type Save2 } from './src/v2/save2';

type Phase =
  | { p: 'home' }
  | { p: 'intro'; idx: number }
  | { p: 'service'; idx: number; key: number }
  | { p: 'event'; idx: number; service: ServiceResult }
  | { p: 'end'; idx: number; service: ServiceResult; event: EventResult | null; stars: number; total: number };

export default function App() {
  const [save, setSave] = useState<Save2 | null>(null);
  const [ph, setPh] = useState<Phase>({ p: 'home' });
  useEffect(() => { loadSave2().then((s) => { setSave(s); setSoundEnabled(s.sound); }); }, []);
  const persist = (s: Save2) => { setSave(s); writeSave2(s); };

  function finishLevel(idx: number, service: ServiceResult, event: EventResult | null) {
    if (!save) return;
    const total = service.coins + (event?.naira ?? 0);
    const goals = goalsFor(idx);
    const stars = goals.filter((g) => total >= g).length;
    const s: Save2 = { ...save, stars: [...save.stars], best: [...save.best] };
    s.coins = save.coins + total;
    s.stars[idx] = Math.max(save.stars[idx] ?? 0, stars);
    s.best[idx] = Math.max(save.best[idx] ?? 0, total);
    if (stars > 0 && idx + 1 > save.unlocked && idx + 1 < LEVELS2.length) s.unlocked = idx + 1;
    for (let i = 0; i < LEVELS2.length; i++) if (s.stars[i] == null) s.stars[i] = 0;
    persist(s);
    setPh({ p: 'end', idx, service, event, stars, total });
  }

  const quit = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.confirm('Leave this level?')) return;
    setPh({ p: 'home' });
  };

  let screen: React.ReactNode = null;
  if (!save) screen = <View style={{ flex: 1, backgroundColor: '#1E120A' }} />;
  else if (ph.p === 'home') {
    screen = (
      <Home2 save={save} onPlay={(i) => setPh({ p: 'intro', idx: i })}
        onBuyKitchen={(k) => { const lvl = save.kitchen[k] ?? 0; const price = KITCHEN[k].prices[lvl]; if (price != null && save.coins >= price) persist({ ...save, coins: save.coins - price, kitchen: { ...save.kitchen, [k]: lvl + 1 } }); }}
        onBuyDecor={(d) => { const price = DECOR[d].price; if (!save.decor[d] && save.coins >= price) persist({ ...save, coins: save.coins - price, decor: { ...save.decor, [d]: true } }); }}
        onToggleSound={() => { setSoundEnabled(!save.sound); persist({ ...save, sound: !save.sound }); }}
        onReset={() => { if (Platform.OS !== 'web' || window.confirm('Reset all progress?')) persist({ ...DEFAULT_SAVE2 }); }} />
    );
  } else if (ph.p === 'intro') {
    screen = <LevelIntro idx={ph.idx} ankara={!!save.decor.ankara} onBack={() => setPh({ p: 'home' })} onStart={() => setPh({ p: 'service', idx: ph.idx, key: Date.now() })} />;
  } else if (ph.p === 'service') {
    const idx = ph.idx;
    screen = <Service key={ph.key} levelIdx={idx} save={save} onQuit={quit}
      onEnd={(r) => (LEVELS2[idx].bulk ? setPh({ p: 'event', idx, service: r }) : finishLevel(idx, r, null))} />;
  } else if (ph.p === 'event') {
    const { idx, service } = ph;
    screen = <OwambeEvent bulk={LEVELS2[idx].bulk!} bigPot={(save.kitchen.pot ?? 0) >= 1} onDone={(e) => finishLevel(idx, service, e)} />;
  } else if (ph.p === 'end') {
    const { idx } = ph;
    screen = <LevelEnd idx={idx} ankara={!!save.decor.ankara} service={ph.service} event={ph.event} stars={ph.stars} total={ph.total}
      onHome={() => setPh({ p: 'home' })} onRetry={() => setPh({ p: 'intro', idx })} onNext={() => setPh({ p: 'intro', idx: Math.min(idx + 1, LEVELS2.length - 1) })} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar hidden />
        <Stage>
          <DragProvider>{screen}</DragProvider>
        </Stage>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
