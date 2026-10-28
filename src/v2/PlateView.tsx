import React from 'react';
import { Image, View } from 'react-native';
import { SPR } from './assets';
import type { Comp } from './data2';
import { useS } from './stage';

export function compSprite(c: Comp) {
  return c === 'jollof' ? SPR.food.jollof : c === 'chicken' ? SPR.food.chicken : c === 'egusi' ? SPR.food.egusi : c === 'eba' ? SPR.food.eba : c === 'suya' ? SPR.food.suya : c === 'yaji' ? SPR.props.yaji : c === 'dodo' ? SPR.food.dodo : SPR.food.puffpuff;
}
const COMP_POS: Record<Comp, [number, number, number]> = {
  jollof: [10, 4, 46], egusi: [30, 6, 36], eba: [6, 8, 30], chicken: [36, 2, 34], suya: [14, 6, 46], yaji: [44, 18, 18], dodo: [36, 16, 30], puffpuff: [16, 4, 42],
};

export function PlateView({ comps, w = 78 }: { comps: Comp[]; w?: number }) {
  const S = useS();
  const k = w / 78;
  return (
    <View style={{ width: S(w), height: S(w * 0.66) }}>
      <Image source={SPR.food.plate} style={{ position: 'absolute', width: S(w), height: S(w * 0.66) }} resizeMode="contain" />
      {comps.map((c) => {
        const [x, y, size] = COMP_POS[c];
        return <Image key={c} source={compSprite(c)} style={{ position: 'absolute', left: S(x * k), top: S(y * k), width: S(size * k), height: S(size * k * 0.85) }} resizeMode="contain" />;
      })}
    </View>
  );
}
