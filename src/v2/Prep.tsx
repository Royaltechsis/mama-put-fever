import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { play, synth } from '../fx';
import { useNow } from '../ui';
import { Abs, GameBtn, GText, Panel, SH, SW, useS } from './stage';

export type PrepResult = { chop: number; stir: number; fry: number; cooler: number; tray: number; pepper: number; skipped?: boolean };

type Veg = { name: string; skin: string; skin2: string; inside: string; seed: string; kind: 'round' | 'pepper' | 'onion' | 'long' };
type Cfg = { veg: Veg[]; pot: string; potRaw: string; potDone: string; grain: string; fry: string; fryRaw: string; fryGold: string; fryBrown: string; pieces: 'slice' | 'chunk'; grill: boolean; potVerb: string };
const TOMATO: Veg = { name: 'tomato', skin: '#E2352B', skin2: '#FF6B4F', inside: '#F25C45', seed: '#FFD46B', kind: 'round' };
const TATASHE: Veg = { name: 'tatashe', skin: '#C81E1E', skin2: '#F04A3A', inside: '#E8433A', seed: '#FFF1C9', kind: 'pepper' };
const ONION: Veg = { name: 'onion', skin: '#9B4A8A', skin2: '#C77BB5', inside: '#F4E4F0', seed: '#D7A8CC', kind: 'onion' };
const RODO: Veg = { name: 'ata rodo', skin: '#E8501F', skin2: '#FF8C3A', inside: '#F2683A', seed: '#FFF1C9', kind: 'pepper' };
const UZIZA: Veg = { name: 'uziza leaves', skin: '#2F8A3A', skin2: '#59B85C', inside: '#7ED07A', seed: '#C9F0B5', kind: 'long' };
const CFG: Record<string, Cfg> = {
  lagos: { veg: [TOMATO, TATASHE, ONION, TOMATO, RODO, ONION], pot: 'Jollof rice', potVerb: 'Stir the jollof', potRaw: '#EFE3C2', potDone: '#D9531E', grain: '#FFF4DC', fry: 'Dodo', fryRaw: '#F4E08A', fryGold: '#E9A43A', fryBrown: '#A9581E', pieces: 'slice', grill: false },
  ibadan: { veg: [RODO, TOMATO, ONION, TATASHE, RODO, ONION], pot: 'Amala', potVerb: 'Turn the amala', potRaw: '#D8CBB8', potDone: '#5E4334', grain: '#8C7461', fry: 'Fried beef', fryRaw: '#D27F78', fryGold: '#9C4B26', fryBrown: '#6A3018', pieces: 'chunk', grill: false },
  ph: { veg: [RODO, ONION, UZIZA, TOMATO, RODO, ONION], pot: 'Pepper soup', potVerb: 'Stir the pepper soup', potRaw: '#E9D9AE', potDone: '#A8461E', grain: '#E8C9A0', fry: 'Bole (roast plantain)', fryRaw: '#F2DB78', fryGold: '#E3A23A', fryBrown: '#8E4A1A', pieces: 'slice', grill: true },
};
const lerp = (a: string, b: string, k: number) => {
  k = Math.max(0, Math.min(1, k));
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)); const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((x, i) => Math.round(x + (pb[i] - x) * k).toString(16).padStart(2, '0')).join('');
};

type Stage = 'intro' | 'chop' | 'stir' | 'fry' | 'done';
const DUR = { chop: 13, stir: 15, fry: 17 };

export default function Prep({ dest, canSkip, hasFry, onDone }: { dest: string; canSkip: boolean; hasFry: boolean; onDone: (r: PrepResult) => void }) {
  const S = useS();
  const cfg = CFG[dest] ?? CFG.lagos;
  const [stage, setStage] = useState<Stage>('intro');
  const [card, setCard] = useState<null | Stage>(null);
  const stageT0 = useRef(Date.now());
  const now = useNow(50);
  const t = (now - stageT0.current) / 1000;
  const r = useRef({ chops: 0, vegDone: 0, lastChop: 0, knifeAt: 0, stir: 0, burn: 0, burns: 0, heat: 1, ang: 0, lastAng: null as null | number, stirSpeed: 0, lastMove: 0, slices: [] as { c: [number, number]; side: number; start: number; flipAt: number; out: boolean; q: number }[], fryDone: 0, fryScore: 0, res: { chop: 0, stir: 0, fry: 0 }, lastSizzle: 0, lastBubble: 0 });
  const R = r.current;
  if (Platform.OS === 'web' && typeof window !== 'undefined') (window as any).__prep = { stage, card, R, t };

  const go = (s: Stage) => { setCard(s); setTimeout(() => { setCard(null); stageT0.current = Date.now(); setStage(s); if (s === 'fry') startFry(); }, s === 'done' ? 0 : 1400); };
  function startFry() {
    const n = 6; const t0 = Date.now();
    R.slices = Array.from({ length: n }, (_, i) => ({ c: [0, 0], side: 0, start: t0 + i * 650, flipAt: 0, out: false, q: 0 }));
    play('sizzle'); R.lastSizzle = t0;
  }
  function finishStage() {
    if (stage === 'chop') { R.res.chop = Math.min(1, (R.vegDone + (R.chops % 6) / 6) / 3); go('stir'); }
    else if (stage === 'stir') { R.res.stir = Math.max(0, Math.min(1, R.stir) * (1 - 0.3 * R.burns)); go(hasFry ? 'fry' : 'done'); }
    else if (stage === 'fry') { R.res.fry = Math.min(1, R.fryScore / 5); go('done'); }
  }
  // ---- tick ----
  useEffect(() => {
    if (card || stage === 'intro' || stage === 'done') return;
    const dt = 0.05;
    if (stage === 'stir') {
      const stirring = Date.now() - R.lastMove < 250 && R.stirSpeed > 1.2;
      const rate = [0.035, 0.07, 0.105][R.heat];
      R.stir = Math.min(1.05, R.stir + dt * rate * (stirring ? 1 : 0.35));
      const burnUp = R.heat === 2 ? (stirring ? 0.02 : 0.32) : R.heat === 1 ? (stirring ? -0.08 : 0.07) : -0.12;
      R.burn = Math.max(0, R.burn + dt * burnUp);
      if (R.burn >= 1) { R.burns++; R.burn = 0.25; play('burnt'); }
      R.stirSpeed *= 0.9;
      if (R.heat === 2 && Date.now() - R.lastBubble > 700) { R.lastBubble = Date.now(); synth('bubble'); }
      if (R.stir >= 1) finishStage();
    }
    if (stage === 'fry') {
      const nowMs = Date.now();
      R.slices.forEach((s) => {
        if (s.out || nowMs < s.start) return;
        s.c[s.side] += dt * (cfg.grill ? 0.2 : 0.22);
      });
      if (nowMs - R.lastSizzle > 2600) { R.lastSizzle = nowMs; play('sizzle'); }
      if (Math.random() < 0.15) synth('crackle');
      if (R.slices.length && R.slices.every((s) => s.out)) finishStage();
    }
    if (t >= DUR[stage as 'chop']) finishStage();
  }, [now]);

  // ---- chop ----
  const chop = () => {
    if (stage !== 'chop' || card) return;
    const n = Date.now(); if (n - R.lastChop < 90) return;
    R.lastChop = n; R.knifeAt = n; R.chops++;
    synth('chop');
    if (R.chops % 6 === 0) { R.vegDone++; play('plop'); }
  };
  const chopStartY = useRef(0);
  // ---- stir ----
  const potPx = S(250);
  const onStirMove = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const a = Math.atan2(locationY - potPx / 2, locationX - potPx / 2);
    if (R.lastAng != null) {
      let d = a - R.lastAng; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      R.ang += d; R.stirSpeed = Math.min(12, R.stirSpeed * 0.6 + Math.abs(d) * 20 * 0.4 * 3);
      R.lastMove = Date.now();
    }
    R.lastAng = a;
  };
  // ---- fry ----
  const tapSlice = (i: number) => {
    const s = R.slices[i]; if (!s || s.out || Date.now() < s.start) return;
    const c = s.c[s.side];
    const q = c >= 0.62 && c <= 1.08 ? 1 : c > 1.35 ? 0 : 0.5;
    if (s.side === 0) { s.q = q; s.side = 1; s.flipAt = Date.now(); play('pop'); synth('crackle'); }
    else { s.out = true; s.q = (s.q + q) / 2; R.fryDone++; R.fryScore += s.q; play('plop'); }
  };

  const result = (): PrepResult => {
    const { chop: ch, stir: st, fry: fr } = R.res;
    return { chop: ch, stir: st, fry: fr, cooler: Math.round(2 + st * 7 * (0.6 + 0.4 * ch)), tray: hasFry ? Math.round(fr * 8) : 0, pepper: Math.round(ch * 12) };
  };

  // ---------- render ----------
  const tl = stage === 'chop' || stage === 'stir' || stage === 'fry' ? Math.max(0, DUR[stage] - t) : 0;
  return (
    <View style={{ flex: 1, backgroundColor: '#3A2416' }}>
      <Svg width={S(SW)} height={S(SH)} viewBox={`0 0 ${SW} ${SH}`} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#F6D7A0" /><Stop offset="1" stopColor="#E3B16B" /></LinearGradient>
          <LinearGradient id="counter" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#8A5A34" /><Stop offset="1" stopColor="#5C3A20" /></LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={SW} height={SH} fill="url(#wall)" />
        {/* wall tiles */}
        {Array.from({ length: 18 }).map((_, i) => <Line key={'v' + i} x1={i * 50} y1={0} x2={i * 50} y2={120} stroke="#FFFFFF55" strokeWidth={2} />)}
        {Array.from({ length: 3 }).map((_, i) => <Line key={'h' + i} x1={0} y1={i * 40} x2={SW} y2={i * 40} stroke="#FFFFFF55" strokeWidth={2} />)}
        <Rect x={0} y={120} width={SW} height={SH - 120} fill="url(#counter)" />
        <Rect x={0} y={120} width={SW} height={8} fill="#A9744A" />
      </Svg>
      {stage === 'chop' && <ChopView cfg={cfg} R={R} />}
      {stage === 'chop' && !card && (
        <View testID="prep-board" style={{ position: 'absolute', left: S(170), top: S(110), width: S(470), height: S(250) }}
          onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => { chopStartY.current = e.nativeEvent.pageY; chop(); }}
          onResponderMove={(e) => { if (Math.abs(e.nativeEvent.pageY - chopStartY.current) > S(28)) { chopStartY.current = e.nativeEvent.pageY; chop(); } }} />
      )}
      {stage === 'stir' && <StirView cfg={cfg} R={R} now={now} />}
      {stage === 'stir' && !card && (
        <>
          <View testID="prep-pot" style={{ position: 'absolute', left: S(420 - 125), top: S(215 - 125), width: potPx, height: potPx, borderRadius: potPx / 2 }}
            onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => { R.lastAng = null; onStirMove(e); }} onResponderMove={onStirMove} onResponderRelease={() => { R.lastAng = null; }} />
          <Abs x={20} y={150} w={130}>
            <GText size={14}>Heat</GText>
            {(['Low', 'Medium', 'High'] as const).map((h, i) => (
              <GameBtn key={h} label={`${'🔥'.repeat(i + 1)} ${h}`} color={R.heat === i ? 'orange' : 'grey'} w={126} h={34} size={12} testID={`heat-${i}`} onPress={() => { R.heat = i; }} style={{ marginTop: S(5) }} />
            ))}
          </Abs>
          <Abs x={694} y={150} w={130}>
            <GText size={13}>Bottom</GText>
            <View style={{ width: S(120), height: S(14), backgroundColor: '#0006', borderRadius: S(7), overflow: 'hidden', marginTop: S(4) }}>
              <View style={{ width: `${Math.min(1, R.burn) * 100}%`, height: '100%', backgroundColor: R.burn > 0.6 ? '#E8321E' : '#F2A93B' }} />
            </View>
            <GText size={11} color={R.burn > 0.6 ? '#FFB3A8' : '#FFF'} style={{ marginTop: S(4) }}>{R.burn > 0.6 ? 'E wan burn! Stir!' : R.heat === 2 ? 'High heat: keep stirring' : 'Keep it moving'}</GText>
            {R.burns > 0 && <GText size={11} color="#FFB3A8" style={{ marginTop: S(4) }}>{`Burnt bottom ×${R.burns}`}</GText>}
          </Abs>
        </>
      )}
      {stage === 'fry' && <FryView cfg={cfg} R={R} now={now} onTap={tapSlice} />}

      {/* top bar */}
      {(stage === 'chop' || stage === 'stir' || stage === 'fry') && (
        <Abs x={0} y={6} w={SW} h={60} pointerEvents="box-none">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S(14) }} pointerEvents="box-none">
            <View style={{ backgroundColor: '#2B1B12CC', borderRadius: S(12), paddingHorizontal: S(12), paddingVertical: S(4) }}>
              <GText size={16} color="#FFC93C">{`Morning prep ${stage === 'chop' ? 1 : stage === 'stir' ? 2 : 3}/${hasFry ? 3 : 2}`}</GText>
              <GText size={12}>{stage === 'chop' ? `Tap or swipe the board to chop the ${cfg.veg[R.vegDone % cfg.veg.length].name}` : stage === 'stir' ? `${cfg.potVerb}: drag round and round the pot` : `Tap each piece when it turns golden to flip it, then again to take it out`}</GText>
            </View>
            <View style={{ backgroundColor: '#2B1B12CC', borderRadius: S(12), paddingHorizontal: S(12), paddingVertical: S(4), alignItems: 'center' }}>
              <GText size={20} color={tl < 4 ? '#FF8A7A' : '#FFF'}>{`⏱ ${Math.ceil(tl)}s`}</GText>
              <GText size={11} color="#FFC93C">{stage === 'chop' ? `${R.vegDone} chopped` : stage === 'stir' ? `${Math.round(Math.min(1, R.stir) * 100)}% cooked` : `${R.fryDone}/${R.slices.length} done`}</GText>
            </View>
          </View>
        </Abs>
      )}

      {stage === 'intro' && (
        <View style={{ position: 'absolute', left: 0, top: 0, width: S(SW), height: S(SH), alignItems: 'center', justifyContent: 'center', backgroundColor: '#0005' }}>
          <Panel w={560} h={290}>
            <View style={{ flex: 1, alignItems: 'center', padding: S(14) }}>
              <GText size={26} color="#FFC93C">Morning prep 🔪</GText>
              <GText size={14} style={{ marginTop: S(6), textAlign: 'center' }}>{`Before the buka opens: chop the pepper and onions, ${cfg.potVerb.toLowerCase()}${hasFry ? `, and fry the ${cfg.fry.toLowerCase()}` : ''}.`}</GText>
              <GText size={13} color="#FFE7B3" style={{ marginTop: S(6), textAlign: 'center' }}>Better prep = more food ready when customers rush in.</GText>
              <View style={{ flexDirection: 'row', gap: S(12), marginTop: S(18) }}>
                <GameBtn label="Start cooking ▶" testID="prep-go" w={210} h={50} size={18} onPress={() => go('chop')} />
                {canSkip && <GameBtn label="Skip (helper preps)" color="grey" testID="prep-skip" w={200} h={50} size={14} onPress={() => onDone({ chop: 0.5, stir: 0.5, fry: 0.5, cooler: 4, tray: hasFry ? 3 : 0, pepper: 5, skipped: true })} />}
              </View>
            </View>
          </Panel>
        </View>
      )}

      {card && card !== 'done' && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: S(SW), height: S(SH), alignItems: 'center', justifyContent: 'center', backgroundColor: '#0006' }}>
          <GText size={40} color="#FFC93C">{card === 'chop' ? '1 · CHOP!' : card === 'stir' ? `2 · ${cfg.pot.toUpperCase()}` : `3 · ${cfg.fry.toUpperCase()}`}</GText>
          <GText size={16} style={{ marginTop: S(6) }}>{card === 'chop' ? 'Tap fast on the board' : card === 'stir' ? 'Drag in circles. Watch the heat!' : 'Flip when golden, not brown'}</GText>
        </View>
      )}

      {stage === 'done' && <PrepDone cfg={cfg} res={result()} hasFry={hasFry} onGo={() => onDone(result())} />}
    </View>
  );
}

// ---------- chopping board ----------
function vegPath(kind: Veg['kind'], cx: number, cy: number, w: number) {
  const h = w * 0.82;
  if (kind === 'pepper') return `M ${cx - w / 2} ${cy} C ${cx - w / 2} ${cy - h / 2}, ${cx + w / 3} ${cy - h / 2}, ${cx + w / 2} ${cy - h / 6} C ${cx + w / 2 + 10} ${cy + h / 3}, ${cx - w / 4} ${cy + h / 2}, ${cx - w / 2} ${cy} Z`;
  if (kind === 'long') return `M ${cx - w / 2} ${cy} Q ${cx} ${cy - h / 2} ${cx + w / 2} ${cy} Q ${cx} ${cy + h / 2} ${cx - w / 2} ${cy} Z`;
  const ry = kind === 'onion' ? h / 2 : h / 2.1;
  return `M ${cx - w / 2} ${cy} A ${w / 2} ${ry} 0 1 1 ${cx + w / 2} ${cy} A ${w / 2} ${ry} 0 1 1 ${cx - w / 2} ${cy} Z`;
}
function ChopView({ cfg, R }: { cfg: Cfg; R: any }) {
  const S = useS();
  const veg = cfg.veg[R.vegDone % cfg.veg.length];
  const cut = R.chops % 6; // strips separated so far
  const cx = 405, cy = 238, w = 170, N = 6, x0 = cx - w / 2, sw = w / N;
  const knifeDown = Date.now() - R.knifeAt < 110;
  const kx = x0 + (N - cut - 1) * sw + sw; // next cut line
  const bowl = Math.min(24, R.vegDone * 6 + (cut > 0 ? 0 : 0));
  const done = cfg.veg.slice(0, R.vegDone);
  return (
    <Svg width={S(SW)} height={S(SH)} viewBox={`0 0 ${SW} ${SH}`} style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        <LinearGradient id="board" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#DDA466" /><Stop offset="1" stopColor="#B57A3F" /></LinearGradient>
        <LinearGradient id="blade" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#F4F7FA" /><Stop offset="0.6" stopColor="#B9C3CC" /><Stop offset="1" stopColor="#8D98A3" /></LinearGradient>
        <RadialGradient id="bowlg" cx="0.5" cy="0.35" r="0.7"><Stop offset="0" stopColor="#FFFFFF" /><Stop offset="1" stopColor="#B9C9D6" /></RadialGradient>
        {Array.from({ length: N }).map((_, k) => <ClipPath key={k} id={`strip${k}`}><Rect x={x0 + k * sw} y={cy - 120} width={sw + 0.5} height={240} /></ClipPath>)}
      </Defs>
      {/* board */}
      <Rect x={190} y={135} width={440} height={210} rx={22} fill="#7A4A22" />
      <Rect x={186} y={128} width={440} height={210} rx={22} fill="url(#board)" />
      {[0, 1, 2, 3, 4, 5].map((i) => <Path key={i} d={`M ${200} ${150 + i * 32} Q ${400} ${140 + i * 32 + (i % 2 ? 10 : -8)} ${612} ${152 + i * 32}`} stroke="#A86E38" strokeWidth={2} fill="none" opacity={0.5} />)}
      <Circle cx={600} cy={150} r={8} fill="#7A4A22" />
      {/* veg strips */}
      {Array.from({ length: N }).map((_, k) => {
        const sep = k >= N - cut; const dx = sep ? (k - (N - cut) + 1) * 12 : 0;
        return (
          <G key={k} clipPath={`url(#strip${k})`} transform={`translate(${dx} 0)`}>
            <Path d={vegPath(veg.kind, cx, cy, w)} fill={veg.skin} />
            {!sep && <Ellipse cx={cx - w * 0.15} cy={cy - w * 0.2} rx={w * 0.14} ry={w * 0.07} fill={veg.skin2} opacity={0.7} />}
            {sep && <Path d={vegPath(veg.kind, cx, cy, w * 0.86)} fill={veg.inside} />}
            {sep && veg.kind === 'onion' && [0.7, 0.5, 0.3].map((q) => <Path key={q} d={vegPath('onion', cx, cy, w * q)} stroke={veg.seed} strokeWidth={3} fill="none" />)}
            {sep && veg.kind !== 'onion' && [-30, -10, 10, 30].map((oy) => <Circle key={oy} cx={x0 + k * sw + sw / 2} cy={cy + oy} r={3.2} fill={veg.seed} />)}
          </G>
        );
      })}
      {veg.kind === 'round' && cut < 6 && <Path d={`M ${cx - 8} ${cy - w * 0.4} l 8 -10 l 8 10 l 10 -4 l -8 10 z`} fill="#3F8A2E" />}
      {veg.kind === 'pepper' && cut < 5 && <Path d={`M ${cx - w / 2 + 2} ${cy - 4} q -14 -6 -18 -20`} stroke="#3F8A2E" strokeWidth={6} fill="none" strokeLinecap="round" />}
      {/* knife */}
      <G transform={`translate(${kx} ${knifeDown ? 70 : 0})`}>
        <Polygon points={`-6,60 6,60 10,175 -2,190 -6,175`} fill="url(#blade)" stroke="#6E7882" strokeWidth={1.5} />
        <Rect x={-9} y={6} width={18} height={56} rx={6} fill="#4A2A16" />
        <Circle cx={0} cy={20} r={2.5} fill="#D9C08A" /><Circle cx={0} cy={44} r={2.5} fill="#D9C08A" />
      </G>
      {/* bowl of chopped veg */}
      <Ellipse cx={720} cy={300} rx={78} ry={30} fill="#00000033" />
      <Path d="M 645 268 Q 720 360 795 268 Z" fill="url(#bowlg)" stroke="#8FA5B5" strokeWidth={2} />
      <Ellipse cx={720} cy={268} rx={75} ry={16} fill="#E9EFF3" stroke="#8FA5B5" strokeWidth={2} />
      {Array.from({ length: bowl }).map((_, i) => {
        const v = done[Math.floor(i / 6)] ?? veg; const a = i * 2.4; const rr = 10 + (i % 6) * 9;
        return <Rect key={i} x={720 + Math.cos(a) * rr * 0.9 - 6} y={266 + Math.sin(a) * rr * 0.22 - 4} width={12} height={8} rx={3} fill={i % 2 ? v.inside : v.skin} transform={`rotate(${(i * 37) % 90} ${720 + Math.cos(a) * rr * 0.9} ${266 + Math.sin(a) * rr * 0.22})`} />;
      })}
    </Svg>
  );
}

// ---------- the pot ----------
function StirView({ cfg, R, now }: { cfg: Cfg; R: any; now: number }) {
  const S = useS();
  const cx = 420, cy = 215;
  const k = Math.min(1, R.stir);
  const fill = R.burns > 0 && R.burn > 0.7 ? lerp(lerp(cfg.potRaw, cfg.potDone, k), '#3B2412', 0.35) : lerp(cfg.potRaw, cfg.potDone, k);
  const rot = (R.ang * 180) / Math.PI;
  const flames = [5, 9, 14][R.heat];
  const tt = now / 1000;
  return (
    <Svg width={S(SW)} height={S(SH)} viewBox={`0 0 ${SW} ${SH}`} style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        <RadialGradient id="rim" cx="0.5" cy="0.45" r="0.55"><Stop offset="0.82" stopColor="#3C3C40" /><Stop offset="0.92" stopColor="#8A8A90" /><Stop offset="1" stopColor="#2A2A2E" /></RadialGradient>
        <RadialGradient id="food" cx="0.45" cy="0.4" r="0.6"><Stop offset="0" stopColor={lerp(fill, '#FFFFFF', 0.18)} /><Stop offset="1" stopColor={lerp(fill, '#000000', 0.15)} /></RadialGradient>
        <RadialGradient id="flame" cx="0.5" cy="0.8" r="0.8"><Stop offset="0" stopColor="#FFF2A8" /><Stop offset="0.5" stopColor="#FF9A2E" /><Stop offset="1" stopColor="#E8321E" stopOpacity={0} /></RadialGradient>
      </Defs>
      {/* stove ring + flames */}
      <Circle cx={cx} cy={cy + 6} r={150} fill="#1E1E22" />
      {Array.from({ length: flames * 2 }).map((_, i) => {
        const a = (i / (flames * 2)) * Math.PI * 2; const fl = 14 + 8 * Math.sin(tt * 9 + i * 1.7) + R.heat * 6;
        const x = cx + Math.cos(a) * 132, y = cy + 6 + Math.sin(a) * 132;
        return <Ellipse key={i} cx={x + Math.cos(a) * fl / 2} cy={y + Math.sin(a) * fl / 2} rx={fl / 2 + 3} ry={7} fill="url(#flame)" transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} />;
      })}
      <Circle cx={cx} cy={cy} r={128} fill="url(#rim)" />
      <Circle cx={cx} cy={cy} r={108} fill="url(#food)" />
      {/* grains / bits rotate with the stirring */}
      <G transform={`rotate(${rot} ${cx} ${cy})`}>
        {Array.from({ length: 70 }).map((_, i) => {
          const rr = 12 + ((i * 53) % 92); const a = i * 2.39;
          return <Ellipse key={i} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} rx={cfg.pot === 'Amala' ? 6 : 3.4} ry={cfg.pot === 'Amala' ? 4 : 1.6} fill={lerp(cfg.grain, fill, 0.35 + k * 0.4)} transform={`rotate(${(i * 47) % 180} ${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr})`} opacity={0.85} />;
        })}
        {/* raw tomato-pepper streaks fade as it cooks */}
        {[0, 1, 2, 3].map((i) => <Path key={i} d={`M ${cx + Math.cos(i * 1.6) * 20} ${cy + Math.sin(i * 1.6) * 20} q ${40} ${-30 + i * 12} ${70} ${10}`} stroke="#E0301E" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.75 * (1 - k)} />)}
        {/* wooden spoon */}
        <Line x1={cx + 18} y1={cy} x2={cx + 150} y2={cy - 30} stroke="#8B5A2B" strokeWidth={10} strokeLinecap="round" />
        <Ellipse cx={cx + 26} cy={cy - 2} rx={22} ry={13} fill="#A8743F" stroke="#6E4520" strokeWidth={2} />
      </G>
      {/* oil sheen + bubbles */}
      <Ellipse cx={cx - 35} cy={cy - 45} rx={40} ry={12} fill="#FFFFFF" opacity={0.12 + 0.1 * Math.sin(tt * 3)} />
      {R.heat > 0 && Array.from({ length: 4 + R.heat * 4 }).map((_, i) => {
        const ph = (tt * (0.8 + R.heat * 0.5) + i * 0.37) % 1; const a = i * 1.9 + Math.floor(tt + i) ; const rr = 20 + ((i * 31) % 70);
        return <Circle key={i} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={2 + ph * 5} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.6 * (1 - ph)} />;
      })}
      {/* steam rises as it cooks */}
      {Array.from({ length: 7 }).map((_, i) => {
        const ph = (tt * 0.45 + i / 7) % 1; const x = cx - 70 + i * 23 + Math.sin(tt * 2 + i) * 10;
        return <Ellipse key={'s' + i} cx={x} cy={cy - 40 - ph * 150} rx={14 + ph * 22} ry={9 + ph * 12} fill="#FFFFFF" opacity={(0.1 + 0.4 * k) * (1 - ph)} />;
      })}
      {R.burn > 0.6 && <Ellipse cx={cx + 60} cy={cy - 90} rx={40} ry={18} fill="#444" opacity={0.4 * R.burn} />}
    </Svg>
  );
}

// ---------- frying pan / grill ----------
const SLICE_POS = [[330, 170], [430, 160], [520, 205], [470, 275], [360, 268], [290, 222]];
function FryView({ cfg, R, now, onTap }: { cfg: Cfg; R: any; now: number; onTap: (i: number) => void }) {
  const S = useS();
  const cx = 410, cy = 220, tt = now / 1000;
  const col = (c: number) => (c < 0.62 ? lerp(cfg.fryRaw, cfg.fryGold, c / 0.62 * 0.7) : c <= 1.08 ? cfg.fryGold : c <= 1.35 ? lerp(cfg.fryGold, cfg.fryBrown, (c - 1.08) / 0.27) : lerp(cfg.fryBrown, '#2A1A10', Math.min(1, (c - 1.35) / 0.3)));
  const tray = R.slices.filter((s: any) => s.out);
  return (
    <>
      <Svg width={S(SW)} height={S(SH)} viewBox={`0 0 ${SW} ${SH}`} style={{ position: 'absolute' }} pointerEvents="none">
        <Defs>
          <RadialGradient id="pan" cx="0.5" cy="0.45" r="0.55"><Stop offset="0.86" stopColor="#2B2B2F" /><Stop offset="0.95" stopColor="#6B6B72" /><Stop offset="1" stopColor="#1B1B1E" /></RadialGradient>
          <RadialGradient id="oil" cx="0.4" cy="0.35" r="0.7"><Stop offset="0" stopColor="#F9D45C" stopOpacity={0.55} /><Stop offset="1" stopColor="#B97A12" stopOpacity={0.5} /></RadialGradient>
        </Defs>
        {cfg.grill ? (
          <>
            <Rect x={cx - 190} y={cy - 120} width={380} height={240} rx={18} fill="#2A2A2E" />
            <Rect x={cx - 175} y={cy - 105} width={350} height={210} rx={10} fill="#3A1A0A" />
            {Array.from({ length: 18 }).map((_, i) => <Circle key={i} cx={cx - 160 + (i * 61) % 320} cy={cy - 90 + (i * 37) % 180} r={10 + (i % 3) * 4} fill={i % 2 ? '#FF7A1E' : '#C83A0E'} opacity={0.5 + 0.4 * Math.sin(tt * 4 + i)} />)}
            {Array.from({ length: 9 }).map((_, i) => <Line key={'g' + i} x1={cx - 175} y1={cy - 100 + i * 25} x2={cx + 175} y2={cy - 100 + i * 25} stroke="#777" strokeWidth={4} />)}
          </>
        ) : (
          <>
            <Rect x={cx + 150} y={cy - 14} width={190} height={28} rx={14} fill="#1B1B1E" />
            <Circle cx={cx} cy={cy} r={170} fill="url(#pan)" />
            <Circle cx={cx} cy={cy} r={148} fill="url(#oil)" />
            {Array.from({ length: 5 }).map((_, i) => <Ellipse key={i} cx={cx - 80 + i * 40 + Math.sin(tt * 1.3 + i) * 18} cy={cy - 60 + Math.cos(tt * 1.1 + i * 2) * 50} rx={26} ry={6} fill="#FFF6C8" opacity={0.18 + 0.14 * Math.sin(tt * 5 + i * 1.3)} />)}
          </>
        )}
        {R.slices.map((s: any, i: number) => {
          if (s.out) return null;
          const [x, y] = SLICE_POS[i];
          const started = Date.now() >= s.start;
          const c = s.c[s.side];
          const flipping = Date.now() - s.flipAt < 220;
          const gold = c >= 0.62 && c <= 1.08;
          const fy = flipping ? 0.25 : 1;
          return (
            <G key={i} opacity={started ? 1 : 0.0}>
              {started && !cfg.grill && Array.from({ length: 6 }).map((_, b) => { const ph = (tt * 2 + b / 6 + i * 0.3) % 1; const a = b * 1.05; return <Circle key={b} cx={x + Math.cos(a) * (34 + ph * 8)} cy={y + Math.sin(a) * (22 + ph * 6)} r={1.5 + ph * 2.5} fill="none" stroke="#FFF8D0" strokeWidth={1.2} opacity={0.8 * (1 - ph)} />; })}
              {gold && <Ellipse cx={x} cy={y} rx={46} ry={32} fill="#FFE27A" opacity={0.35 + 0.25 * Math.sin(tt * 8)} />}
              <G transform={`rotate(${-25 + i * 13} ${x} ${y})`}>
                {cfg.pieces === 'slice' ? (
                  <>
                    <Ellipse cx={x} cy={y} rx={38} ry={22 * fy} fill={lerp(col(c), '#5A3010', 0.25)} />
                    <Ellipse cx={x} cy={y - 1} rx={34} ry={19 * fy} fill={col(c)} />
                    <Ellipse cx={x - 8} cy={y - 6} rx={14} ry={5} fill="#FFFFFF" opacity={0.25} />
                    {cfg.grill && c > 0.5 && [0, 1, 2].map((m) => <Line key={m} x1={x - 24 + m * 18} y1={y - 16} x2={x - 30 + m * 18} y2={y + 16} stroke="#3A1A0A" strokeWidth={3} opacity={Math.min(0.8, c - 0.4)} />)}
                  </>
                ) : (
                  <>
                    <Rect x={x - 28} y={y - 20 * fy} width={56} height={40 * fy} rx={14 * fy} fill={lerp(col(c), '#3A1A0A', 0.3)} />
                    <Rect x={x - 25} y={y - 18 * fy} width={50} height={34 * fy} rx={12 * fy} fill={col(c)} />
                    <Path d={`M ${x - 15} ${y - 8} q 12 8 28 0`} stroke="#FFFFFF" strokeWidth={2} opacity={0.3} fill="none" />
                  </>
                )}
              </G>
              {c > 1.35 && <Ellipse cx={x + 6} cy={y - 34 - ((tt * 30) % 20)} rx={14} ry={8} fill="#555" opacity={0.45} />}
              {s.side === 1 && <Circle cx={x + 30} cy={y - 22} r={8} fill="#2FA544" />}
            </G>
          );
        })}
        {/* tray */}
        <Rect x={690} y={250} width={140} height={90} rx={12} fill="#C9CED3" stroke="#8C949B" strokeWidth={3} />
        {tray.map((s: any, k: number) => <Ellipse key={k} cx={715 + (k % 3) * 45} cy={278 + Math.floor(k / 3) * 34} rx={20} ry={12} fill={s.q >= 0.75 ? cfg.fryGold : s.q >= 0.4 ? cfg.fryBrown : '#2A1A10'} />)}
      </Svg>
      {R.slices.map((s: any, i: number) => {
        if (s.out) return null;
        const [x, y] = SLICE_POS[i];
        return <Pressable key={i} testID={`slice-${i}`} onPress={() => onTap(i)} style={{ position: 'absolute', left: S(x - 44), top: S(y - 32), width: S(88), height: S(64), borderRadius: S(32) }} />;
      })}
    </>
  );
}

function PrepDone({ cfg, res, hasFry, onGo }: { cfg: Cfg; res: PrepResult; hasFry: boolean; onGo: () => void }) {
  const S = useS();
  useEffect(() => { play('win'); }, []);
  const stars = (q: number) => '★'.repeat(q >= 0.85 ? 3 : q >= 0.55 ? 2 : q > 0.15 ? 1 : 0).padEnd(3, '☆');
  const Row = ({ label, q, gives }: { label: string; q: number; gives: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: S(470), marginTop: S(8), backgroundColor: '#00000022', borderRadius: S(10), paddingHorizontal: S(10), paddingVertical: S(6) }}>
      <GText size={15}>{label}</GText>
      <GText size={16} color="#FFC93C">{stars(q)}</GText>
      <GText size={13} color="#BFF5B0" style={{ width: S(200), textAlign: 'right' }}>{gives}</GText>
    </View>
  );
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: S(SW), height: S(SH), alignItems: 'center', justifyContent: 'center', backgroundColor: '#0006' }}>
      <Panel w={560} h={300}>
        <View style={{ flex: 1, alignItems: 'center', padding: S(12) }}>
          <GText size={24} color="#FFC93C">Prep done! Food is ready 🍲</GText>
          <Row label="Chopping" q={res.chop} gives={`+${res.pepper} pepper mix`} />
          <Row label={cfg.pot} q={res.stir} gives={`${res.cooler} portions in the cooler`} />
          {hasFry && <Row label={cfg.fry} q={res.fry} gives={`${res.tray} on the tray`} />}
          <GameBtn label="Open the buka ▶" testID="prep-open" w={240} h={50} size={20} onPress={onGo} style={{ marginTop: S(14) }} />
        </View>
      </Panel>
    </View>
  );
}
