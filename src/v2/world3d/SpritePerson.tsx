import React, { Suspense, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Asset } from 'expo-asset';
import { DoubleSide, SRGBColorSpace, TextureLoader, type Group, type Mesh, type Texture } from 'three';
import { COS } from './geom';
import { Person, type Look, type PoseOut } from './Person';

/** how a portrait stands in the room: its height in metres and how high its bottom edge sits */
export type Cutout = { h: number; base: number; sitBase?: number };
export const BUST: Cutout = { h: 1.0, base: 0.9, sitBase: 0.7 }; // customer portraits are head and shoulders
export const BODY: Cutout = { h: 1.8, base: 0.05 }; // staff portraits show most of the body

/** the frame strips made by scripts/slice-characters.mjs (keep in sync with it) */
const SHEET = { frames: 8, fw: 192, fh: 256, foot: 252, body: 224 };
// frames in a strip: 0-3 walk to the right, 4 stand, 5 sit (staff: work), 6-7 eat (staff: work, empty)
const F = { walk: 0, stand: 4, sit: 5, eatA: 6, eatB: 7, workA: 5, workB: 6 };
const PERSON_M = 1.7; // a standing figure is this tall

function useTex(src: any) {
  const uri = useMemo(() => Asset.fromModule(src).uri, [src]);
  const tex = useLoader(TextureLoader, uri) as Texture;
  useMemo(() => { tex.colorSpace = SRGBColorSpace; tex.needsUpdate = true; }, [tex]);
  return tex;
}

/** a hand carrying a plate or a cup, on the side the person faces */
function Carried({ plate, cup }: { plate: React.RefObject<Group | null>; cup: React.RefObject<Group | null> }) {
  return (<>
    <group ref={plate} visible={false} position={[0.32, 1.0, 0.25]}>
      <mesh><cylinderGeometry args={[0.2, 0.17, 0.03, 12]} /><meshBasicMaterial color="#F4F1EA" /></mesh>
      <mesh position={[0, 0.04, 0]}><sphereGeometry args={[0.11, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color="#D9531E" /></mesh>
    </group>
    <group ref={cup} visible={false} position={[0.32, 1.05, 0.25]}>
      <mesh><cylinderGeometry args={[0.07, 0.055, 0.2, 10]} /><meshBasicMaterial color="#C0392B" /></mesh>
    </group>
  </>);
}

function Shadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, 0.6, 1]}>
      <circleGeometry args={[0.34, 16]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
    </mesh>
  );
}

/** keeps the last left/right facing; only turns when clearly heading sideways, so stepping into a seat doesn't flip */
function faceOf(p: PoseOut, prev: number) {
  return p.mode === 'walk' && Math.abs(Math.sin(p.rotY)) > 0.3 ? (Math.sin(p.rotY) > 0 ? 1 : -1) : prev;
}

/**
 * A person played from an animated frame strip, like a classic 2D cooking game: walk cycle while moving, sitting and
 * eating frames at the table, work frames for staff. The card always faces the camera and the art faces right, so it
 * is mirrored when walking left.
 */
function AnimCard({ sheet, staff, scale, pose }: { sheet: any; staff: boolean; scale: number; pose: () => PoseOut }) {
  const base = useTex(sheet);
  // each person gets their own copy so they can show a different frame from others with the same art
  const tex = useMemo(() => { const t = base.clone(); t.repeat.set(1 / SHEET.frames, 1); t.needsUpdate = true; return t; }, [base]);
  const H = (SHEET.fh / SHEET.body) * PERSON_M * scale;
  const W = (H * SHEET.fw) / SHEET.fh;
  const lift = H / 2 - ((SHEET.fh - SHEET.foot) / SHEET.fh) * H; // puts the feet on the floor
  const root = useRef<Group>(null);
  const card = useRef<Mesh>(null);
  const plate = useRef<Group>(null);
  const cup = useRef<Group>(null);
  const face = useRef(1);
  const frame = useRef(-1);
  useFrame((state) => {
    const g = root.current; const c = card.current;
    if (!g || !c) return;
    const p = pose();
    g.visible = p.visible;
    if (!p.visible) return;
    g.position.set(p.x, 0, p.z);
    face.current = faceOf(p, face.current);
    const t = state.clock.elapsedTime;
    let f: number;
    if (p.mode === 'walk') f = F.walk + (Math.floor(t * 8) % 4);
    else if (staff) f = p.busy ? (Math.floor(t * 3) % 2 ? F.workB : F.workA) : F.stand;
    else if (p.mode === 'sit') f = p.eat ? (Math.floor(t * 2.5) % 2 ? F.eatB : F.eatA) : F.sit;
    else f = F.stand;
    if (f !== frame.current) { frame.current = f; tex.offset.x = f / SHEET.frames; }
    // only the walk frames are drawn side-on; the rest face the viewer and are never mirrored
    c.scale.x = p.mode === 'walk' ? face.current : 1;
    if (plate.current) { plate.current.visible = p.carry === 'plate' || p.carry === 'item'; plate.current.position.x = 0.32 * face.current; }
    if (cup.current) { cup.current.visible = p.carry === 'cup'; cup.current.position.x = 0.32 * face.current; }
  });
  return (
    <group ref={root}>
      <Shadow />
      {/* stands upright (so the chair back stays behind and the table in front) and is stretched by 1/cos(pitch) so it
          shows at full height through the tilted camera */}
      <group scale={[1, 1 / COS, 1]} position={[0, 0, 0.06]}>
        <mesh ref={card} position={[0, lift, 0]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.08} side={DoubleSide} toneMapped={false} />
        </mesh>
      </group>
      <Carried plate={plate} cup={cup} />
    </group>
  );
}

/** stand-in until a character has a frame strip: their single portrait, bobbing as it moves */
function PortraitCard({ src, cut, pose }: { src: any; cut: Cutout; pose: () => PoseOut }) {
  const tex = useTex(src);
  const img = tex.image as { width: number; height: number } | undefined;
  const w = cut.h * (img ? img.width / img.height : 0.8);
  const root = useRef<Group>(null);
  const card = useRef<Group>(null);
  const plate = useRef<Group>(null);
  const cup = useRef<Group>(null);
  const face = useRef(1);
  useFrame((state) => {
    const g = root.current; const c = card.current;
    if (!g || !c) return;
    const p = pose();
    g.visible = p.visible;
    if (!p.visible) return;
    g.position.set(p.x, 0, p.z);
    const walking = p.mode === 'walk';
    face.current = faceOf(p, face.current);
    const t = state.clock.elapsedTime;
    const step = walking ? Math.abs(Math.sin(t * 11)) * 0.07 : p.eat ? Math.abs(Math.sin(t * 6)) * 0.025 : Math.sin(t * 2) * 0.008;
    c.position.y = (p.mode === 'sit' ? cut.sitBase ?? cut.base : cut.base) + step;
    c.scale.x = face.current;
    c.rotation.z = walking ? Math.sin(t * 11) * 0.04 : 0;
    if (plate.current) { plate.current.visible = p.carry === 'plate' || p.carry === 'item'; plate.current.position.x = 0.32 * face.current; }
    if (cup.current) { cup.current.visible = p.carry === 'cup'; cup.current.position.x = 0.32 * face.current; }
  });
  return (
    <group ref={root}>
      <Shadow />
      <group scale={[1, 1 / COS, 1]} position={[0, 0, 0.06]}>
        <group ref={card}>
          <mesh position={[0, cut.h / 2, 0]}>
            <planeGeometry args={[w, cut.h]} />
            <meshBasicMaterial map={tex} transparent alphaTest={0.08} side={DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Carried plate={plate} cup={cup} />
    </group>
  );
}

class Boundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/** a 2D character in the 3D room: animated if it has a frame strip, else its portrait; the hand-built 3D person if the art fails to load */
export function SpritePerson({ sheet, src, cut, staff, look, pose }: { sheet?: any; src: any; cut: Cutout; staff: boolean; look: Look; pose: () => PoseOut }) {
  const fallback = <Person look={look} pose={pose} />;
  return (
    <Boundary fallback={fallback}>
      <Suspense fallback={null}>
        {sheet != null
          ? <AnimCard sheet={sheet} staff={staff} scale={look.h ?? 1} pose={pose} />
          : <PortraitCard src={src} cut={cut} pose={pose} />}
      </Suspense>
    </Boundary>
  );
}
