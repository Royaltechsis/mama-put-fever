import React, { Suspense, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Asset } from 'expo-asset';
import {
  AnimationAction, AnimationMixer, Box3, CapsuleGeometry, Color, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Object3D, Quaternion, SkinnedMesh, Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Person, type Look, type PoseOut } from './Person';

/** flip to false to go back to the hand-built people */
export const GLB_PEOPLE = true;

// Quaternius "Universal Base Characters" and "Universal Animation Library" (CC0), re-exported small. See assets/people/LICENSE.txt
const MAN = Asset.fromModule(require('../../../assets/people/man.glb')).uri;
const WOMAN = Asset.fromModule(require('../../../assets/people/woman.glb')).uri;
const ANIMS = Asset.fromModule(require('../../../assets/people/anims.glb')).uri;

const BASE_SKIN = new Color('#B0805E'); // the tan the body texture is painted in
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const UP = new Vector3(0, 1, 0);
const HEIGHT = 1.78; // metres, scaled by look.h

/** puts simple clothes on the bare body: capsules that follow the bones, so they move with the animation */
function dress(root: Object3D, look: Look) {
  root.updateMatrixWorld(true);
  const mat = (c: string) => new MeshStandardMaterial({ color: c, roughness: 0.85 });
  const wp = new Vector3(); const wq = new Vector3();
  const seg = (a: string, b: string, r: number, color: string, grow = 0) => {
    const A = root.getObjectByName(a); const B = root.getObjectByName(b);
    if (!A || !B) return;
    const v = B.position.clone(); const L = v.length();
    A.getWorldPosition(wp); B.getWorldPosition(wq);
    const world = wp.distanceTo(wq);
    if (L < 1e-5 || world < 1e-5) return;
    const k = L / world; // bone-local units per world metre
    const mesh = new Mesh(new CapsuleGeometry(r * k, Math.max(0.001, L + grow * k), 4, 12), mat(color));
    mesh.quaternion.setFromUnitVectors(UP, v.clone().normalize());
    mesh.position.copy(v).multiplyScalar(0.5);
    A.add(mesh);
  };
  const tube = (a: string, b: string, r0: number, r1: number, color: string) => {
    const A = root.getObjectByName(a); const B = root.getObjectByName(b);
    if (!A || !B) return;
    const v = B.position.clone(); const L = v.length();
    A.getWorldPosition(wp); B.getWorldPosition(wq);
    const world = wp.distanceTo(wq);
    if (L < 1e-5 || world < 1e-5) return;
    const k = L / world;
    const mesh = new Mesh(new CylinderGeometry(r1 * k, r0 * k, L, 16), mat(color));
    mesh.quaternion.setFromUnitVectors(UP, v.clone().normalize());
    mesh.position.copy(v).multiplyScalar(0.5);
    A.add(mesh);
  };
  const top = look.top; const bottom = look.bottom;
  const sides = ['l', 'r'];
  // torso: three chest segments and the hips
  tube('pelvis', 'spine_01', look.dress ? 0.21 : 0.18, 0.17, bottom);
  tube('spine_01', 'spine_02', 0.17, 0.175, top);
  tube('spine_02', 'spine_03', 0.175, 0.19, top);
  tube('spine_03', 'neck_01', 0.19, 0.085, top);
  for (const s of sides) {
    seg(`clavicle_${s}`, `upperarm_${s}`, 0.07, top, 0.03);
    seg(`upperarm_${s}`, `lowerarm_${s}`, look.robe ? 0.1 : 0.074, top, 0.02);
    if (look.long || look.robe) seg(`lowerarm_${s}`, `hand_${s}`, look.robe ? 0.085 : 0.058, top, 0.0);
    seg(`thigh_${s}`, `calf_${s}`, look.dress ? 0.15 : 0.122, bottom, 0.02);
    seg(`calf_${s}`, `foot_${s}`, look.dress ? 0.12 : 0.088, bottom, 0.0);
    seg(`foot_${s}`, `ball_${s}`, 0.058, '#241A14', 0.02);
    seg(`ball_${s}`, `ball_leaf_${s}`, 0.05, '#241A14', 0.0);
  }
  if (look.tie) {
    const A = root.getObjectByName('spine_03');
    if (A) {
      const tie = new Mesh(new CapsuleGeometry(0.02, 0.2, 3, 6), mat(look.tie));
      tie.position.set(0, 0.0, 0.2); A.add(tie);
    }
  }
}

function tint(root: Object3D, look: Look) {
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const cloned = mats.map((mm) => (mm as MeshStandardMaterial).clone());
    cloned.forEach((mm) => {
      const n = mm.name || '';
      if (/Superhero/i.test(n)) {
        const want = new Color(look.skin);
        mm.color.setRGB(Math.min(1, (want.r / BASE_SKIN.r) * 0.72), Math.min(1, (want.g / BASE_SKIN.g) * 0.72), Math.min(1, (want.b / BASE_SKIN.b) * 0.72));
      } else if (/Hair/i.test(n)) {
        mm.color.set(look.hair).multiplyScalar(3.2);
      }
    });
    m.material = Array.isArray(m.material) ? cloned : cloned[0];
  });
}

type Built = { root: Group; mixer: AnimationMixer; actions: Record<string, AnimationAction>; scale: number; bones: Record<string, Object3D | undefined> };

function GlbPerson({ look, pose, formal }: { look: Look; pose: () => PoseOut; formal: boolean }) {
  const gltf = useLoader(GLTFLoader, look.female ? WOMAN : MAN);
  const anim = useLoader(GLTFLoader, ANIMS);
  const built = useMemo<Built>(() => {
    const root = cloneSkinned(gltf.scene) as Group;
    tint(root, look);
    dress(root, look);
    const box = new Box3().setFromObject(root);
    const h = Math.max(0.5, box.max.y - box.min.y);
    const scale = (HEIGHT * (look.h ?? 1)) / h;
    root.scale.setScalar(scale);
    const mixer = new AnimationMixer(root);
    const actions: Record<string, AnimationAction> = {};
    anim.animations.forEach((c) => { actions[c.name] = mixer.clipAction(c); });
    const bones: Record<string, Object3D | undefined> = {};
    ['upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r'].forEach((n) => { bones[n] = root.getObjectByName(n); });
    root.traverse((o) => { if ((o as SkinnedMesh).isSkinnedMesh) o.frustumCulled = false; });
    return { root, mixer, actions, scale, bones };
  }, [gltf, anim, look]);

  const g = useRef<Group>(null);
  const item = useRef<Group>(null);
  const st = useRef({ ang: 0, cur: '', init: false, kind: null as string | null, phase: Math.random() * 3 });
  const tmpQ = useMemo(() => new Quaternion(), []);

  useFrame((_, dt) => {
    const grp = g.current; if (!grp) return;
    const p = pose();
    grp.visible = p.visible;
    if (!p.visible) return;
    const s = st.current;
    if (!s.init) { s.ang = p.rotY; s.init = true; }
    s.ang += wrapAngle(p.rotY - s.ang) * Math.min(1, dt * 9);
    grp.position.set(p.x, p.mode === 'sit' ? SIT_Y : 0, p.z);
    grp.rotation.y = s.ang + FACE_FIX;
    // pick the clip for the pose and cross-fade into it
    let want = 'Idle_Loop';
    if (p.mode === 'sit') want = p.eat || p.mood === 'happy' ? 'Sitting_Talking_Loop' : 'Sitting_Idle_Loop';
    else if (p.mode === 'walk') want = formal || p.carry ? 'Walk_Formal_Loop' : 'Walk_Loop';
    else if (p.busy) want = 'Interact';
    else if (p.mood === 'wait') want = 'Idle_Talking_Loop';
    const next = built.actions[want];
    if (next && s.cur !== want) {
      const prev = built.actions[s.cur];
      next.reset().setEffectiveWeight(1).fadeIn(0.25).play();
      if (prev) prev.fadeOut(0.25);
      s.cur = want;
    }
    built.mixer.update(dt);
    // carrying: bring both arms forward on top of whatever the clip is doing
    if (p.carry) {
      for (const side of ['l', 'r']) {
        const up = built.bones[`upperarm_${side}`]; const low = built.bones[`lowerarm_${side}`];
        if (up) { tmpQ.setFromAxisAngle(CARRY_AXIS, CARRY_UP * (side === 'l' ? 1 : -1)); up.quaternion.multiply(tmpQ); }
        if (low) { tmpQ.setFromAxisAngle(CARRY_AXIS, CARRY_LOW * (side === 'l' ? 1 : -1)); low.quaternion.multiply(tmpQ); }
      }
    }
    const it = item.current;
    if (it) {
      it.visible = !!p.carry;
      if (p.carry) {
        it.position.set(0, 1.08, 0.38);
        if (s.kind !== p.carry) { s.kind = p.carry; it.children.forEach((c) => { c.visible = c.name === p.carry; }); }
      }
    }
  });

  return (
    <group ref={g}>
      <primitive object={built.root} />
      <group ref={item} visible={false}>
        <group name="plate" visible={false}>
          <mesh><cylinderGeometry args={[0.22, 0.2, 0.03, 16]} /><meshStandardMaterial color="#F4F1EA" roughness={0.6} /></mesh>
          <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#D9531E" roughness={0.8} /></mesh>
        </group>
        <group name="cup" visible={false}>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.055, 0.07, 0.2, 12]} /><meshStandardMaterial color="#C0392B" roughness={0.6} /></mesh>
        </group>
        <group name="item" visible={false}>
          <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.2, 0.14, 0.2]} /><meshStandardMaterial color="#C98A3C" roughness={0.8} /></mesh>
        </group>
      </group>
    </group>
  );
}

// model orientation and pose tuning, found by looking at the result
const FACE_FIX = Math.PI; // extra turn about Y if the model faces the other way
const SIT_Y = 0; // lift or drop a seated model to meet the chair
const CARRY_AXIS = new Vector3(1, 0, 0);
const CARRY_UP = -1.0;
const CARRY_LOW = -1.0;

class Boundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

/** a person: the imported model when it loads, otherwise (while loading, or if it fails) the hand-built one */
export function AnyPerson({ look, pose }: { look: Look; pose: () => PoseOut }) {
  const fallback = <Person look={look} pose={pose} />;
  if (!GLB_PEOPLE) return fallback;
  return (
    <Boundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GlbPerson look={look} pose={pose} formal={!!look.vest} />
      </Suspense>
    </Boundary>
  );
}
