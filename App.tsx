import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DragProvider } from './src/dnd';
import { setMood, setMusicEnabled, setSoundEnabled } from './src/fx';
import { Stage } from './src/v2/stage';
import Home2 from './src/v2/Home2';
import Service, { type ServiceResult } from './src/v2/Service';
import OwambeEvent, { type EventResult } from './src/v2/OwambeEvent';
import { LevelEnd, LevelIntro } from './src/v2/LevelCards';
import { DECOR, KITCHEN, LEVELS2, goalsFor, stationsFor } from './src/v2/data2';
import { DEFAULT_SAVE2, loadSave2, writeSave2, synced, type Save2, type StockKey } from './src/v2/save2';
import { activateDest, destById, STOCK_INFO, type DestId } from './src/v2/dests';
import WorldMap from './src/v2/WorldMap';
import Market from './src/v2/Market';
import Prep, { type PrepResult } from './src/v2/Prep';
import MyBuka from './src/v2/MyBuka';
import DaySummary from './src/v2/DaySummary';
import { wagesOf } from './src/v2/save2';
import AccountPanel from './src/v2/Account';
import { setupPwa } from './src/v2/pwa';
setupPwa();
import { accountsAvailable, me, putSave, type User } from './src/v2/account';

type Phase =
  | { p: 'map' }
  | { p: 'home' }
  | { p: 'market'; back: 'map' | 'home' }
  | { p: 'intro'; idx: number }
  | { p: 'prep'; idx: number; key: number }
  | { p: 'buka'; back: 'map' | 'home' }
  | { p: 'service'; idx: number; key: number; prep?: PrepResult | null }
  | { p: 'event'; idx: number; service: ServiceResult }
  | { p: 'end'; idx: number; service: ServiceResult; event: EventResult | null; stars: number; total: number; wages: number; day: number; rating: { from: number; to: number }; xp: { from: number; to: number } };

export default function App() {
  const [save, setSave] = useState<Save2 | null>(null);
  const [ph, setPh] = useState<Phase>({ p: 'map' });
  const [user, setUser] = useState<User | null>(null);
  const [acctOpen, setAcctOpen] = useState(false);
  useEffect(() => {
    loadSave2().then((s) => {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && /unlockall/.test(window.location.hash)) {
        // tester shortcut: #unlockall opens every playable destination
        s = { ...s, prog: { ...s.prog, ibadan: s.prog.ibadan ?? { unlocked: 0, stars: [], best: [] }, ph: s.prog.ph ?? { unlocked: 0, stars: [], best: [] } }, coins: Math.max(s.coins, 20000) } as Save2;
        (s as any).unlockAll = true;
      }
      activateDest((s.dest as DestId) || 'lagos'); setSave(s); setSoundEnabled(s.sound); setMusicEnabled(s.music);
      if (accountsAvailable()) me().then((r) => { if (r.ok && r.user) setUser(r.user); });
    });
  }, []);
  useEffect(() => { setMood(ph.p === 'service' || ph.p === 'event' ? 'game' : 'menu'); }, [ph.p]);
  if (Platform.OS === 'web' && typeof window !== 'undefined') (window as any).__app = { save, ph };
  const persist = (s: Save2) => { const x = synced(s); setSave(x); writeSave2(x); };

  function enterDest(id: DestId) {
    if (!save) return;
    const s0 = synced(save);
    const p = s0.prog[id] ?? { unlocked: 0, stars: [], best: [] };
    activateDest(id);
    persist({ ...s0, dest: id, unlocked: p.unlocked, stars: p.stars, best: p.best });
    setPh({ p: 'home' });
  }

  function finishLevel(idx: number, service: ServiceResult, event: EventResult | null) {
    if (!save) return;
    const total = service.coins + (event?.naira ?? 0);
    const goals = goalsFor(idx);
    const stars = goals.filter((g) => total >= g).length;
    const s: Save2 = { ...save, stars: [...save.stars], best: [...save.best], stock: service.stock ?? save.stock };
    const wages = wagesOf(save);
    s.coins = Math.max(0, save.coins + total - wages);
    s.day = (save.day ?? 1) + 1;
    // reputation: today's reviews pull the buka's rating toward them (new places swing faster)
    const rv = service.reviews ?? [];
    const oldRating = save.rating ?? 3.5;
    if (rv.length) {
      const w = Math.max(3, Math.min(save.reviews ?? 0, 15));
      s.rating = Math.max(1, Math.min(5, (oldRating * w + rv.reduce((a, r) => a + r.stars, 0)) / (w + rv.length)));
      s.reviews = (save.reviews ?? 0) + rv.length;
    }
    s.xp = (save.xp ?? 0) + (service.xp ?? 0);
    const sl = { ...(save.staffLv ?? {}) };
    Object.keys(service.staff ?? {}).forEach((k) => { sl[k] = { lv: sl[k]?.lv ?? 1, xp: (sl[k]?.xp ?? 0) + (service.staff?.[k] ?? 0) }; });
    s.staffLv = sl;
    s.stars[idx] = Math.max(save.stars[idx] ?? 0, stars);
    s.best[idx] = Math.max(save.best[idx] ?? 0, total);
    if (stars > 0 && idx + 1 > save.unlocked && idx + 1 < LEVELS2.length) s.unlocked = idx + 1;
    for (let i = 0; i < LEVELS2.length; i++) if (s.stars[i] == null) s.stars[i] = 0;
    persist(s);
    if (user) putSave(synced(s)); // keep the account copy in step at the end of each day
    setPh({ p: 'end', idx, service, event, stars, total, wages, day: save.day ?? 1, rating: { from: oldRating, to: s.rating ?? oldRating }, xp: { from: save.xp ?? 0, to: s.xp } });
  }

  const quit = () => {
    setPh({ p: 'home' });
  };
  const buyKitchen = (k: keyof typeof KITCHEN) => { if (!save) return; const lvl = save.kitchen[k] ?? 0; const price = KITCHEN[k].prices[lvl]; if (price != null && save.coins >= price) persist({ ...save, coins: save.coins - price, kitchen: { ...save.kitchen, [k]: lvl + 1 } }); };
  const buyDecor = (d: keyof typeof DECOR) => { if (!save) return; const price = DECOR[d].price; if (!save.decor[d] && save.coins >= price) persist({ ...save, coins: save.coins - price, decor: { ...save.decor, [d]: true } }); };
  const buyStock = (k: StockKey) => { if (!save) return; const it = STOCK_INFO[k]; if (save.coins >= it.price) persist({ ...save, coins: save.coins - it.price, stock: { ...save.stock, [k]: (save.stock[k] ?? 0) + it.pack } }); };
  const toggleSound = () => { if (!save) return; setSoundEnabled(!save.sound); persist({ ...save, sound: !save.sound }); };
  const toggleMusic = () => { if (!save) return; setMusicEnabled(!save.music); persist({ ...save, music: !save.music }); };

  let screen: React.ReactNode = null;
  if (!save) screen = <View style={{ flex: 1, backgroundColor: '#1E120A' }} />;
  else if (ph.p === 'map') {
    screen = <WorldMap save={save} user={user} onAccount={() => setAcctOpen(true)} showNote={!save.acctNote} onDismissNote={() => persist({ ...save, acctNote: true })} onBuka={() => setPh({ p: 'buka', back: 'map' })} onPick={enterDest} onMarket={() => setPh({ p: 'market', back: 'map' })} onToggleSound={toggleSound} onToggleMusic={toggleMusic} />;
  } else if (ph.p === 'market') {
    const back = ph.back;
    screen = <Market save={save} onBuyStock={buyStock} onBuyKitchen={buyKitchen} onBuyDecor={buyDecor} onBack={() => setPh({ p: back })} />;
  } else if (ph.p === 'home') {
    screen = (
      <Home2 save={save} dest={destById(save.dest)} onPlay={(i) => setPh({ p: 'intro', idx: i })}
        onMap={() => setPh({ p: 'map' })} onBuka={() => setPh({ p: 'buka', back: 'home' })} onMarket={() => setPh({ p: 'market', back: 'home' })}
        onBuyKitchen={buyKitchen} onBuyDecor={buyDecor} onToggleSound={toggleSound} onToggleMusic={toggleMusic}
        onReset={() => { if (Platform.OS !== 'web' || window.confirm('Reset all progress (every city)?')) { activateDest('lagos'); persist({ ...DEFAULT_SAVE2 }); setPh({ p: 'map' }); } }} />
    );
  } else if (ph.p === 'intro') {
    screen = <LevelIntro idx={ph.idx} ankara={!!save.decor.ankara} stock={save.stock} onMarket={() => setPh({ p: 'market', back: 'home' })} onBack={() => setPh({ p: 'home' })} onStart={() => setPh({ p: 'prep', idx: ph.idx, key: Date.now() })} />;
  } else if (ph.p === 'prep') {
    const idx = ph.idx;
    screen = <Prep key={ph.key} dest={save.dest} canSkip={!!save.prepSeen} hasFry={stationsFor(LEVELS2[idx]).has('fryerDodo')}
      onDone={(r) => { if (!save.prepSeen) persist({ ...save, prepSeen: true }); setPh({ p: 'service', idx, key: Date.now(), prep: r }); }} />;
  } else if (ph.p === 'buka') {
    const back = ph.back;
    screen = <MyBuka save={save} onSave={persist} onBack={() => setPh({ p: back })} onMarket={() => setPh({ p: 'market', back: 'home' })} />;
  } else if (ph.p === 'service') {
    const idx = ph.idx;
    screen = <Service key={ph.key} levelIdx={idx} save={save} prep={ph.prep} onQuit={quit} onRestart={() => setPh({ p: 'service', idx, key: Date.now(), prep: ph.prep })}
      sound={save.sound} music={save.music} onToggleSound={toggleSound} onToggleMusic={toggleMusic}
      onEnd={(r) => (LEVELS2[idx].bulk ? setPh({ p: 'event', idx, service: r }) : finishLevel(idx, r, null))} />;
  } else if (ph.p === 'event') {
    const { idx, service } = ph;
    screen = <OwambeEvent bulk={LEVELS2[idx].bulk!} bigPot={(save.kitchen.pot ?? 0) >= 1} onDone={(e) => finishLevel(idx, service, e)} />;
  } else if (ph.p === 'end') {
    const { idx } = ph;
    screen = <DaySummary day={ph.day} idx={idx} ankara={!!save.decor.ankara} service={ph.service} event={ph.event} stars={ph.stars} total={ph.total} wages={ph.wages} rating={ph.rating} xp={ph.xp}
      staffCount={Object.values(save.staff ?? {}).filter(Boolean).length}
      onHome={() => setPh({ p: 'home' })} onBuka={() => setPh({ p: 'buka', back: 'home' })} onMarket={() => setPh({ p: 'market', back: 'home' })}
      onRetry={() => setPh({ p: 'intro', idx })} onNext={() => setPh({ p: 'intro', idx: Math.min(idx + 1, LEVELS2.length - 1) })} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar hidden />
        <Stage>
          <DragProvider>
            {screen}
            {acctOpen && save && <AccountPanel save={save} user={user} onClose={() => setAcctOpen(false)} onUser={setUser} onLoadSave={(s) => { activateDest((s.dest as DestId) || 'lagos'); persist(s); }} />}
          </DragProvider>
        </Stage>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
