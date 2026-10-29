import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

/** Web only: a corner button that puts the game full screen, plus a one-time pro tip pointing at it.
 *  Phones lose a lot of height to the browser bar, and the stage scales to whatever height it gets. */
const DONE_KEY = 'mp_fullscreen_done';
const TIP_MS = 9000;
const PRO_TIP = 'Pro tip: tap ⛶ for full screen. Bigger food, easier drags!';
const IOS_TIP = 'iPhone browsers can’t go full screen. Tap Share › Add to Home Screen, then open Mamaput from there.';
const BLOCKED_TIP = 'Full screen was blocked here. Try Add to Home Screen from your browser menu.';

type FsEl = { requestFullscreen?: (o?: FullscreenOptions) => Promise<void>; webkitRequestFullscreen?: () => void };
type WebkitDoc = { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };

const fsElement = (): Element | null => document.fullscreenElement ?? (document as Document & WebkitDoc).webkitFullscreenElement ?? null;

function remembered(): boolean {
  try { return localStorage.getItem(DONE_KEY) === '1'; } catch { return false; }
}
function remember() {
  try { localStorage.setItem(DONE_KEY, '1'); } catch { /* private window: the tip just shows again */ }
}
/** landscape lock only works once the page is full screen; the phone's own rotation still works if it fails */
function lockLandscape() {
  try { screen.orientation?.lock('landscape').catch(() => {}); } catch { /* not supported here */ }
}

export function FullscreenControl({ k }: { k: number }) {
  if (Platform.OS !== 'web') return null;
  return <WebFullscreen k={k} />;
}

function WebFullscreen({ k }: { k: number }) {
  const [on, setOn] = useState(false);
  const [bubble, setBubble] = useState<string | null>(() => (remembered() ? null : PRO_TIP));

  useEffect(() => {
    const sync = () => {
      const inFs = !!fsElement();
      setOn(inFs);
      if (inFs) { remember(); setBubble(null); }
    };
    sync();
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), TIP_MS);
    return () => clearTimeout(t);
  }, [bubble]);

  const press = () => {
    if (fsElement()) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    const el = document.documentElement as unknown as FsEl;
    if (el.requestFullscreen) {
      el.requestFullscreen({ navigationUI: 'hide' }).then(lockLandscape).catch(() => setBubble(BLOCKED_TIP));
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      setBubble(IOS_TIP);
    }
  };

  const size = 38 * k;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 950 }}>
      {bubble && (
        <Pressable onPress={() => setBubble(null)} accessibilityRole="alert" style={{ position: 'absolute', right: size + 14 * k, bottom: 8 * k, maxWidth: 240 * k }}>
          <View style={{ backgroundColor: '#FFC93C', borderRadius: 12 * k, borderWidth: 2 * k, borderColor: '#A8520E', paddingHorizontal: 10 * k, paddingVertical: 6 * k }}>
            <Text style={{ color: '#2B1B12', fontWeight: '800', fontSize: 13 * k }}>{bubble}</Text>
          </View>
        </Pressable>
      )}
      <Pressable onPress={press} testID="fullscreen" accessibilityRole="button" accessibilityLabel={on ? 'Exit full screen' : 'Full screen'}
        style={({ pressed }) => ({ position: 'absolute', right: 6 * k, bottom: 6 * k, width: size, height: size, borderRadius: 10 * k, backgroundColor: '#2B1B12D0', borderWidth: 2 * k, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.94 : 1 }] })}>
        <Text style={{ color: '#FFF', fontSize: 20 * k, fontWeight: '900' }}>{on ? '⤡' : '⛶'}</Text>
      </Pressable>
    </View>
  );
}
