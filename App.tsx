import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DragProvider } from './src/dnd';
import { DISHES, LEVELS, UPGRADES, type UpgradeId } from './src/data';
import { DEFAULT_SAVE, loadSave, writeSave, type Save } from './src/storage';
import { computeResult, newRun, timeLeft, type Run, type Result } from './src/game';
import { setSoundEnabled } from './src/fx';
import { useNow } from './src/ui';
import { C } from './src/theme';
import Home from './src/screens/Home';
import Intro from './src/screens/Intro';
import Cook from './src/screens/Cook';
import Pack from './src/screens/Pack';
import Deliver from './src/screens/Deliver';
import Results from './src/screens/Results';

export default function App() {
  const [save, setSave] = useState<Save | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<{ r: Result; newDish?: string } | null>(null);

  useEffect(() => { loadSave().then((s) => { setSave(s); setSoundEnabled(s.sound); }); }, []);

  const persist = (s: Save) => { setSave(s); writeSave(s); };

  const live = !!run && (run.phase === 'cook' || run.phase === 'pack' || run.phase === 'deliver') && !run.frozenAt;
  const now = useNow(250, live);
  useEffect(() => {
    if (run && live && timeLeft(run, now) <= 0) finish({ ...run, failed: true, failReason: run.phase === 'cook' ? 'The food was still on the fire when time ran out.' : run.phase === 'pack' ? 'Time ran out while packing.' : 'The okada never left the buka.' });
  }, [now]);

  function finish(r: Run) {
    if (!save) return;
    const res = computeResult(r);
    let newDish: string | undefined;
    const s: Save = { ...save, stars: [...save.stars] };
    s.coins = save.coins + res.total;
    s.stars[r.levelIdx] = Math.max(save.stars[r.levelIdx] ?? 0, res.stars);
    if (res.stars > 0 && r.levelIdx + 1 > save.unlocked && r.levelIdx + 1 < LEVELS.length) {
      s.unlocked = r.levelIdx + 1;
      const d = Object.values(DISHES).find((x) => x.unlockLevel === r.levelIdx + 1);
      if (d) newDish = d.name;
    }
    for (let i = 0; i < LEVELS.length; i++) if (s.stars[i] == null) s.stars[i] = 0;
    persist(s);
    setResult({ r: res, newDish });
    setRun({ ...r, phase: 'results' });
  }

  const quit = () => { setRun(null); setResult(null); };
  const confirmQuit = () => {
    if (Platform.OS === 'web') { if (typeof window !== 'undefined' && window.confirm('Quit this order?')) quit(); return; }
    Alert.alert('Quit this order?', 'The customer will be disappointed.', [{ text: 'Keep cooking' }, { text: 'Quit', style: 'destructive', onPress: quit }]);
  };

  let screen: React.ReactNode = null;
  if (!save) screen = <View style={{ flex: 1, backgroundColor: C.cream }} />;
  else if (!run) {
    screen = (
      <Home
        save={save}
        onPlay={(i) => setRun(newRun(i))}
        onBuy={(u: UpgradeId) => { if (save.coins >= UPGRADES[u].price) persist({ ...save, coins: save.coins - UPGRADES[u].price, upgrades: { ...save.upgrades, [u]: true } }); }}
        onToggleSound={() => { setSoundEnabled(!save.sound); persist({ ...save, sound: !save.sound }); }}
        onReset={() => persist({ ...DEFAULT_SAVE })}
      />
    );
  } else if (run.phase === 'intro') {
    screen = <Intro run={run} bigPot={!!save.upgrades.bigpot} onBack={quit} onStart={() => setRun({ ...run, phase: 'cook', deadline: Date.now() + run.level.time * 1000 })} />;
  } else if (run.phase === 'cook') {
    screen = <Cook key={`c${run.levelIdx}${run.deadline}`} run={run} coins={save.coins} gas={!!save.upgrades.stove} bigPot={!!save.upgrades.bigpot} onQuit={confirmQuit}
      onDone={(q) => setRun((r) => (r && r.phase === 'cook' ? { ...r, phase: 'pack', cookQuality: q } : r))} />;
  } else if (run.phase === 'pack') {
    screen = <Pack run={run} coins={save.coins} onQuit={confirmQuit} onDone={(p) => setRun((r) => (r && r.phase === 'pack' ? { ...r, phase: 'deliver', packs: p } : r))} />;
  } else if (run.phase === 'deliver') {
    screen = <Deliver run={run} coins={save.coins} onQuit={confirmQuit}
      onRide={() => setRun((r) => (r ? { ...r, frozenAt: Date.now() } : r))}
      onDone={(secs, note) => {
        const left = timeLeft(run, Date.now()) - secs;
        finish({ ...run, timeLeftAtDelivery: Math.max(0, left), deliveryNote: left < 0 ? `${note} Arrived late!` : note });
      }} />;
  } else if (run.phase === 'results' && result) {
    screen = <Results run={run} result={result.r} newDish={result.newDish}
      onNext={() => { setResult(null); setRun(newRun(Math.min(run.levelIdx + 1, LEVELS.length - 1))); }}
      onRetry={() => { setResult(null); setRun(newRun(run.levelIdx)); }}
      onHome={quit} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.outer}>
          <SafeAreaView style={styles.frame} edges={['top', 'bottom']}>
            <DragProvider>{screen}</DragProvider>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#3B2A1E', alignItems: 'center' },
  frame: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: C.greenDark, overflow: 'hidden' },
});
