import React, { useLayoutEffect } from 'react';
import { View } from 'react-native';
import { Canvas, useThree } from '@react-three/fiber/native';
import { COS, SIN, TARGET } from './geom';

const DIST = 30;
function CameraRig({ zoom }: { zoom: number }) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.zoom = zoom;
    camera.position.set(TARGET.x, TARGET.y + DIST * SIN, TARGET.z + DIST * COS);
    camera.lookAt(TARGET.x, TARGET.y, TARGET.z);
    camera.updateProjectionMatrix();
  }, [camera, zoom]);
  return null;
}

/** native: react-three-fiber draws through expo-gl (not yet tried on a device) */
export function GLCanvas({ width, height, zoom, paused, children }: { width: number; height: number; zoom: number; paused: boolean; children: React.ReactNode }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height }}>
      <Canvas orthographic frameloop={paused ? 'never' : 'always'} camera={{ zoom, near: 0.1, far: 120 }} style={{ width, height }}>
        <CameraRig zoom={zoom} />
        {children}
      </Canvas>
    </View>
  );
}
