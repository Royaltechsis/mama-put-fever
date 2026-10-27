import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { haptic } from './fx';

export type Payload =
  | { kind: 'ing'; id: string }
  | { kind: 'station'; idx: number }
  | { kind: 'pkg'; id: string }
  | { kind: 'parcel'; idx: number }
  | { kind: 'src'; id: string }
  | { kind: 'grill'; idx: number }
  | { kind: 'fryer'; idx: number }
  | { kind: 'pot'; id: string }
  | { kind: 'plate'; idx: number }
  | { kind: 'cup'; idx: number };

type ViewRef = React.ComponentRef<typeof View>;
type Rect = { x: number; y: number; w: number; h: number };
type Zone = {
  ref: React.RefObject<ViewRef | null>;
  accepts: (p: Payload) => boolean;
  onDrop: (p: Payload) => void;
  rect?: Rect;
};

type Ctx = {
  register: (id: string, z: Zone) => () => void;
  measureAll: () => void;
  start: (p: Payload, ghost: React.ReactNode, x: number, y: number) => void;
  move: (x: number, y: number) => void;
  end: (x: number, y: number) => void;
  cancel: () => void;
  hover: string | null;
  dragging: Payload | null;
};

const DragCtx = createContext<Ctx | null>(null);
export const useDrag = () => {
  const c = useContext(DragCtx);
  if (!c) throw new Error('DragProvider missing');
  return c;
};

const GHOST = 76;

export function DragProvider({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const zones = useRef(new Map<string, Zone>());
  const rootRef = useRef<ViewRef>(null);
  const root = useRef({ x: 0, y: 0 });
  const [ghost, setGhost] = useState<React.ReactNode>(null);
  const [dragging, setDragging] = useState<Payload | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const payloadRef = useRef<Payload | null>(null);
  const gx = useSharedValue(-500);
  const gy = useSharedValue(-500);
  const gs = useSharedValue(0);

  const measureAll = useCallback(() => {
    rootRef.current?.measureInWindow((x, y) => {
      root.current = { x, y };
    });
    zones.current.forEach((z) => {
      z.ref.current?.measureInWindow((x, y, w, h) => {
        z.rect = { x, y, w, h };
      });
    });
  }, []);

  const register = useCallback((id: string, z: Zone) => {
    zones.current.set(id, z);
    return () => {
      if (zones.current.get(id) === z) zones.current.delete(id);
    };
  }, []);

  const hit = useCallback((x: number, y: number): string | null => {
    const p = payloadRef.current;
    if (!p) return null;
    let best: string | null = null;
    let bestArea = Infinity;
    const slop = 14;
    zones.current.forEach((z, id) => {
      const r = z.rect;
      if (!r || !z.accepts(p)) return;
      if (x >= r.x - slop && x <= r.x + r.w + slop && y >= r.y - slop && y <= r.y + r.h + slop) {
        const a = r.w * r.h;
        if (a < bestArea) {
          bestArea = a;
          best = id;
        }
      }
    });
    return best;
  }, []);

  const start = useCallback((p: Payload, g: React.ReactNode, x: number, y: number) => {
    payloadRef.current = p;
    setGhost(g);
    setDragging(p);
    gx.value = x - root.current.x;
    gy.value = y - root.current.y;
    gs.value = withSpring(1.12, { damping: 14 });
    haptic.pick();
  }, [gx, gy, gs]);

  const move = useCallback((x: number, y: number) => {
    gx.value = x - root.current.x;
    gy.value = y - root.current.y;
    const h = hit(x, y);
    if (h !== hoverRef.current) {
      hoverRef.current = h;
      setHover(h);
    }
  }, [gx, gy, hit]);

  const clear = useCallback(() => {
    payloadRef.current = null;
    hoverRef.current = null;
    setHover(null);
    setDragging(null);
    gs.value = withTiming(0, { duration: 120 });
    setTimeout(() => setGhost(null), 130);
  }, [gs]);

  const end = useCallback((x: number, y: number) => {
    const p = payloadRef.current;
    const id = hit(x, y);
    if (p && id) {
      const z = zones.current.get(id);
      haptic.drop();
      z?.onDrop(p);
    }
    clear();
  }, [hit, clear]);

  const cancel = useCallback(() => {
    if (payloadRef.current) clear();
  }, [clear]);

  const ghostStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: gx.value - GHOST / 2 },
      { translateY: gy.value - GHOST / 2 - 26 },
      { scale: gs.value },
    ],
    opacity: gs.value > 0.05 ? 1 : 0,
  }));

  const value = useMemo<Ctx>(() => ({ register, measureAll, start, move, end, cancel, hover, dragging }),
    [register, measureAll, start, move, end, cancel, hover, dragging]);

  return (
    <DragCtx.Provider value={value}>
      <View ref={rootRef} style={[{ flex: 1 }, style]} collapsable={false} onLayout={measureAll}>
        {children}
        <Animated.View pointerEvents="none" style={[styles.ghost, ghostStyle]}>
          {ghost}
        </Animated.View>
      </View>
    </DragCtx.Provider>
  );
}

export function Draggable({ payload, ghost, children, enabled = true, style, testID, onTap }: {
  payload: Payload;
  ghost?: React.ReactNode;
  children: React.ReactNode;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onTap?: () => void;
}) {
  const ctx = useDrag();
  const ref = useRef<ViewRef>(null);
  const calib = useRef({ dx: 0, dy: 0 });
  const latest = useRef({ payload, ghost, children, ctx, onTap, enabled });
  latest.current = { payload, ghost, children, ctx, onTap, enabled };
  const active = useRef(false);
  const began = useRef(0);
  const dragged = useRef(false);

  const pan = usePanGesture({
    runOnJS: true,
    enabled: enabled || !!onTap,
    minDistance: 3,
    onBegin: (e) => {
      began.current = Date.now();
      dragged.current = false;
      const { ctx } = latest.current;
      ctx.measureAll();
      calib.current = { dx: 0, dy: 0 };
      ref.current?.measureInWindow((x, y) => {
        calib.current = { dx: x + e.x - e.absoluteX, dy: y + e.y - e.absoluteY };
      });
    },
    onActivate: (e) => {
      const { payload, ghost, children, ctx } = latest.current;
      dragged.current = true;
      if (!latest.current.enabled) return;
      active.current = true;
      ctx.start(payload, ghost ?? children, e.absoluteX + calib.current.dx, e.absoluteY + calib.current.dy);
    },
    onUpdate: (e) => {
      if (!active.current) return;
      latest.current.ctx.move(e.absoluteX + calib.current.dx, e.absoluteY + calib.current.dy);
    },
    onDeactivate: (e) => {
      if (!active.current) return;
      active.current = false;
      latest.current.ctx.end(e.absoluteX + calib.current.dx, e.absoluteY + calib.current.dy);
    },
    onFinalize: () => {
      if (active.current) {
        active.current = false;
        latest.current.ctx.cancel();
      } else if (!dragged.current && latest.current.onTap && Date.now() - began.current < 450) {
        latest.current.onTap();
      }
    },
  });

  const isDragging = ctx.dragging && JSON.stringify(ctx.dragging) === JSON.stringify(payload);

  return (
    <GestureDetector gesture={pan}>
      <View ref={ref} collapsable={false} style={[style, isDragging && { opacity: 0.45 }]} testID={testID}>
        {children}
      </View>
    </GestureDetector>
  );
}

export function DropZone({ id, accepts, onDrop, children, style, hoverStyle, testID }: {
  id: string;
  accepts: (p: Payload) => boolean;
  onDrop: (p: Payload) => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const ctx = useDrag();
  const ref = useRef<ViewRef>(null);
  const handlers = useRef({ accepts, onDrop });
  handlers.current = { accepts, onDrop };
  useEffect(() => {
    return ctx.register(id, {
      ref,
      accepts: (p) => handlers.current.accepts(p),
      onDrop: (p) => handlers.current.onDrop(p),
    });
  }, [id, ctx.register]);
  const canTake = ctx.dragging ? accepts(ctx.dragging) : false;
  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={ctx.measureAll}
      testID={testID}
      style={[style, canTake && styles.canTake, ctx.hover === id && (hoverStyle ?? styles.hover)]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ghost: { position: 'absolute', left: 0, top: 0, width: GHOST, height: GHOST, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  canTake: { borderColor: '#FFC93C' },
  hover: { borderColor: '#0B6E4F', backgroundColor: 'rgba(11,110,79,0.12)', transform: [{ scale: 1.03 }] },
});
