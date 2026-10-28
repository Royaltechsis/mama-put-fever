import React, { useLayoutEffect } from 'react';
import { View } from 'react-native';
import { Canvas, useThree } from '@react-three/fiber';
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

/** web: react-three-fiber draws into a DOM canvas that fills this box */
export function GLCanvas({ width, height, zoom, paused, children }: { width: number; height: number; zoom: number; paused: boolean; children: React.ReactNode }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height }}>
      <Canvas orthographic frameloop={paused ? 'never' : 'always'} dpr={[1, 2]} camera={{ zoom, near: 0.1, far: 120 }} gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%' }}>
        <CameraRig zoom={zoom} />
        {children}
      </Canvas>
    </View>
  );
}
