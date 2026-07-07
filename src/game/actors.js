// Primitive-assembled characters + procedural animation (art-tech.md grammar).
// Named parts: root > torso/head/armL/armR/tool. No rigs; sine bob + tween poses.

import * as THREE from 'three';

const lam = (color, emissive = 0x000000) =>
  new THREE.MeshLambertMaterial({ color, flatShading: true, emissive });

function collectMeshes(g){
  const out = [];
  g.traverse(o => { if (o.isMesh) out.push(o); });
  return out;
}

function finish(group, parts){
  const meshes = collectMeshes(group);
  meshes.forEach(m => { m.castShadow = true; m.material = m.material.clone(); });
  // emissive ops (flash/telegraph) only apply to Lambert parts — Basic materials (crowns) have no emissive
  const emissiveMeshes = meshes.filter(m => m.material.emissive);
  const baseEmissive = emissiveMeshes.map(m => m.material.emissive.clone()); // baked glows (eyes, lamps, cores) survive flash resets
  const actor = {
    group, parts, meshes,
    t: 0, cue: 'idle', cueT: 0, dead: false, deadT: 0, flash: 0,
    setCue(c){ if (c !== this.cue){ this.cue = c; this.cueT = 0; } },
    hitFlash(){ this.flash = 0.09; },
    die(){ this.dead = true; this.deadT = 0; },
    update(dt, moving, speed = 1){
      this.t += dt; this.cueT += dt;
      const P = this.parts;
      if (this.dead){
        this.deadT += dt;
        const k = Math.min(1, this.deadT / 0.35);
        group.rotation.x = -Math.PI / 2 * k * k;
        group.scale.y = Math.max(0.12, 1 - 0.9 * k);
        if (this.deadT > 0.35){
          const f = Math.max(0, 1 - (this.deadT - 0.35) / 0.25);
          this.meshes.forEach(m => { m.material.transparent = true; m.material.opacity = f; });
        }
        return this.deadT > 0.6; // done, release
      }
      // hit flash
      if (this.flash > 0){
        this.flash -= dt;
        const k = Math.max(0, this.flash / 0.09);
        emissiveMeshes.forEach(m => m.material.emissive.setScalar(0.9 * k));
      }
      // locomotion bob
      const phase = this.t * speed * 2.2 * Math.PI;
      const bob = moving ? Math.sin(phase) * 0.06 : 0;
      group.position.y = (group.userData.baseY || 0) + bob;
      if (P.torso){
        P.torso.rotation.z = moving ? Math.sin(phase) * 0.05 : 0;
        const br = 1 + Math.sin(this.t * Math.PI) * 0.015; // idle breathe
        P.torso.scale.set(br, br, br);
      }
      if (P.armL && P.armR){
        const swing = moving ? Math.sin(phase) * 0.45 : 0;
        P.armL.rotation.x = swing;
        P.armR.rotation.x = this.cue === 'windup' ? -0.9 : this.cue === 'strike' ? 0.8 - Math.min(1, this.cueT / 0.15) * 1.4 : -swing;
      }
      // windup telegraph glow
      if (this.cue === 'windup'){
        const k = Math.min(1, this.cueT / 0.5);
        emissiveMeshes.forEach(m => m.material.emissive.setRGB(0.55 * k, 0.1 * k, 0.05 * k));
      } else if (this.flash <= 0){
        emissiveMeshes.forEach((m, i) => m.material.emissive.copy(baseEmissive[i]));
      }
      return false;
    },
  };
  group.userData.actor = actor;
  return actor;
}

/* ---- player: Lineman (hi-vis amber on navy, insulated maul) ---- */
export function makeLineman(){
  const g = new THREE.Group();
  const parts = {};
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.45), lam(0x1e3a5f));
  torso.position.y = 0.85; parts.torso = torso; g.add(torso);
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.4, 0.49), lam(0xfbbf24));
  vest.position.y = 0.05; torso.add(vest);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.32), lam(0xd9b38c));
  head.position.y = 1.42; parts.head = head; g.add(head);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.16, 10), lam(0xfacc15));
  hat.position.y = 0.22; head.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), lam(0xfacc15));
  brim.position.y = 0.13; head.add(brim);
  const mkArm = x => {
    const a = new THREE.Group();
    a.position.set(x, 1.15, 0);
    const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.42, 3, 6), lam(0x1e3a5f));
    seg.position.y = -0.28; a.add(seg);
    g.add(a); return a;
  };
  parts.armL = mkArm(-0.5); parts.armR = mkArm(0.5);
  // insulated maul in right hand
  const tool = new THREE.Group();
  tool.position.set(0, -0.55, 0.1);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 6), lam(0xb45309));
  shaft.rotation.x = Math.PI / 2.4; tool.add(shaft);
  const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.2), lam(0x475569));
  headBox.position.set(0, 0.18, 0.42); tool.add(headBox);
  parts.tool = tool; parts.armR.add(tool);
  g.userData.baseY = 0.35;
  g.position.y = 0.35;
  return finish(g, parts);
}

/* ---- player: Tester (teal on slate, meter pistol with glowing probe) ---- */
export function makeTester(){
  const g = new THREE.Group();
  const parts = {};
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.5, 4, 8), lam(0x0e7490));
  torso.position.y = 0.9; parts.torso = torso; g.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.3), lam(0xd9b38c));
  head.position.y = 1.45; parts.head = head; g.add(head);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.15, 10), lam(0xe2e8f0));
  hat.position.y = 0.21; head.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 10), lam(0xe2e8f0));
  brim.position.y = 0.12; head.add(brim);
  const mkArm = x => {
    const a = new THREE.Group();
    a.position.set(x, 1.18, 0);
    const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.4, 3, 6), lam(0x0e7490));
    seg.position.y = -0.26; a.add(seg);
    g.add(a); return a;
  };
  parts.armL = mkArm(-0.4); parts.armR = mkArm(0.4);
  const tool = new THREE.Group();
  tool.position.set(0, -0.5, 0.12);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.3), lam(0x334155));
  tool.add(body);
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6), lam(0x22d3ee, 0x22d3ee));
  probe.rotation.x = Math.PI / 2; probe.position.z = 0.3; tool.add(probe);
  parts.tool = tool; parts.armR.add(tool);
  g.userData.baseY = 0.35;
  g.position.y = 0.35;
  return finish(g, parts);
}

/* ---- player: Foreman (safety-orange on gray, signal staff + clipboard) ---- */
export function makeForeman(){
  const g = new THREE.Group();
  const parts = {};
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.95, 0.45), lam(0x374151));
  torso.position.y = 0.95; parts.torso = torso; g.add(torso);
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.5, 0.49), lam(0xf97316));
  vest.position.y = 0.1; torso.add(vest);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.32), lam(0xd9b38c));
  head.position.y = 1.62; parts.head = head; g.add(head);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.16, 10), lam(0xe2e8f0));
  hat.position.y = 0.22; head.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), lam(0xe2e8f0));
  brim.position.y = 0.13; head.add(brim);
  const mkArm = x => {
    const a = new THREE.Group();
    a.position.set(x, 1.3, 0);
    const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.42, 3, 6), lam(0x374151));
    seg.position.y = -0.28; a.add(seg);
    g.add(a); return a;
  };
  parts.armL = mkArm(-0.45); parts.armR = mkArm(0.45);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.03), lam(0xd9c14a));
  clip.position.set(0, -0.5, 0.14); parts.armL.add(clip);
  const staff = new THREE.Group();
  staff.position.set(0, -0.55, 0.1);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 6), lam(0x6b543c));
  staff.add(pole);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), lam(0xf97316, 0xf97316));
  orb.position.y = 0.75; staff.add(orb);
  parts.tool = staff; parts.armR.add(staff);
  g.userData.baseY = 0.35;
  g.position.y = 0.35;
  return finish(g, parts);
}

export const PLAYER_BUILDERS = { lineman: makeLineman, tester: makeTester, foreman: makeForeman };

/* ---- Foreman summons ---- */
export function makeApprentice(){
  const g = new THREE.Group();
  const parts = {};
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.35, 3, 8), lam(0xf97316));
  body.position.y = 0.5; parts.torso = body; g.add(body);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 8), lam(0xfacc15));
  hat.position.y = 0.92; g.add(hat);
  g.userData.baseY = 0.1;
  g.position.y = 0.1;
  return finish(g, parts);
}
export function makeSpiderBox(){
  const g = new THREE.Group();
  const parts = {};
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), lam(0xfacc15));
  box.position.y = 0.6; parts.torso = box; g.add(box);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 6), lam(0x475569));
  pole.position.y = 0.25; g.add(pole);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), lam(0x22d3ee, 0x22d3ee));
  tip.position.y = 0.85; g.add(tip);
  return finish(g, parts);
}
/* ---- hub townsfolk (palette-swapped civilians, apprentice-grammar) ---- */
export function makeTownsfolk({ coat = 0x475569, vest = null, hat = 0xe2e8f0, skin = 0xd9b38c } = {}){
  const g = new THREE.Group();
  const parts = {};
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.42), lam(coat));
  torso.position.y = 0.85; parts.torso = torso; g.add(torso);
  if (vest){
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.4, 0.46), lam(vest));
    v.position.y = 0.05; torso.add(v);
  }
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.29, 0.3), lam(skin));
  head.position.y = 1.42; parts.head = head; g.add(head);
  const hatM = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.15, 10), lam(hat));
  hatM.position.y = 0.21; head.add(hatM);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 10), lam(hat));
  brim.position.y = 0.12; head.add(brim);
  const mkArm = x => {
    const a = new THREE.Group();
    a.position.set(x, 1.15, 0);
    const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.4, 3, 6), lam(coat));
    seg.position.y = -0.26; a.add(seg);
    g.add(a); return a;
  };
  parts.armL = mkArm(-0.45); parts.armR = mkArm(0.45);
  g.userData.baseY = 0.35;
  g.position.y = 0.35;
  return finish(g, parts);
}

export function makeBarricadeMesh(){
  const g = new THREE.Group();
  for (const dx of [-1, 0, 1]){
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), lam(0xe2e8f0));
    post.position.set(dx, 0.5, 0); g.add(post);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.08), lam(dx === 0 ? 0xf97316 : 0xe2e8f0));
    stripe.position.set(dx, 0.8, 0); g.add(stripe);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/* ---- enemies by shape family (archetype = silhouette) ---- */
export function makeEnemyMesh(def){
  const look = def.look;
  const g = new THREE.Group();
  const parts = {};
  const c = look.color;

  if (look.shape === 'chaser'){
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.7), lam(c));
    torso.position.y = 0.45; torso.rotation.x = 0.26; parts.torso = torso; g.add(torso);
    for (const dx of [-0.5, 0.5]){
      const stub = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.18), lam(c));
      stub.position.set(dx, 0.4, 0.25); g.add(stub);
      if (dx < 0) parts.armL = stub; else parts.armR = stub;
    }
    // prong cones at front (Dead Short read)
    for (const dx of [-0.2, 0.2]){
      const prong = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 5), lam(0x1c1917));
      prong.rotation.x = Math.PI / 2; prong.position.set(dx, 0.4, 0.5); g.add(prong);
    }
  } else if (look.shape === 'spitter'){
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.3, 7), lam(c));
    body.position.y = 0.65; parts.torso = body; g.add(body);
    const headC = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 7), lam(c));
    headC.position.y = 1.55; headC.rotation.x = -0.35; parts.head = headC; g.add(headC);
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10), lam(0x111111, 0xffe082));
    eye.rotation.x = Math.PI / 2; eye.position.set(0, 1.45, 0.26); g.add(eye);
    // tape bands
    for (const y of [0.4, 0.8]){
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.62), lam(0x1c1917));
      band.position.y = y; g.add(band);
    }
  } else if (look.shape === 'special'){
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), lam(c));
    core.position.y = 0.55; parts.torso = core; g.add(core);
    for (const dx of [-0.55, 0.55]){
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 5), lam(c));
      stem.rotation.z = Math.PI / 2; stem.position.set(dx * 0.7, 0.65, 0); g.add(stem);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 7, 5), lam(c));
      orb.position.set(dx, 0.65, 0); g.add(orb);
    }
  } else if (look.shape === 'boss-openmain'){
    // tall cabinet + two knife-blade lever arms + cone shoulders + OPEN lamp
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.0), lam(c));
    cab.position.y = 1.6; parts.torso = cab; g.add(cab);
    for (const dx of [-0.6, 0.6]){
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 8), lam(0x9aa5a0));
      sh.position.set(dx * 1.5, 3.0, 0); g.add(sh);
    }
    const mkLever = x => {
      const a = new THREE.Group();
      a.position.set(x, 2.6, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.7, 0.5), lam(0x7c8a84));
      blade.position.y = -0.85; a.add(blade);
      g.add(a); return a;
    };
    parts.armL = mkLever(-1.05); parts.armR = mkLever(1.05);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), lam(0x330000, 0xff2020));
    lamp.position.set(0, 3.2, 0.45); parts.lamp = lamp; g.add(lamp);
    parts.head = lamp;
  }

  else if (look.shape === 'creeper'){
    // segmented cable chain dragging an ember glow (R2 Sheath Creeper)
    for (let i = 0; i < 5; i++){
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), lam(c));
      seg.position.set(0, 0.3, i * 0.42 - 0.84);
      if (i === 0) parts.torso = seg;
      g.add(seg);
      if (i < 4){
        const glow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.1), lam(look.accent || 0xff6a1a, look.accent || 0xff6a1a));
        glow.position.set(0, 0.3, i * 0.42 - 0.63); g.add(glow);
      }
    }
  } else if (look.shape === 'node'){
    // wide flat base + dome + capacitor cans (R4 Sag Node / Padmount)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.35, 10), lam(c));
    base.position.y = 0.2; parts.torso = base; g.add(base);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 7), lam(c));
    dome.scale.y = 0.55; dome.position.y = 0.5; g.add(dome);
    for (let i = 0; i < 5; i++){
      const can = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.14), lam(0x1c1917, look.accent || 0xff9e4a));
      const a = i * Math.PI * 2 / 5;
      can.position.set(Math.cos(a) * 0.62, 0.42, Math.sin(a) * 0.62);
      g.add(can);
    }
  } else if (look.shape === 'column'){
    // stacked boxes with air gaps, flickers when energized (R5 Series Arc)
    for (let i = 0; i < 4; i++){
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.5 - i * 0.06, 0.32, 0.5 - i * 0.06), lam(c));
      seg.position.y = 0.25 + i * 0.48;
      if (i === 0) parts.torso = seg;
      g.add(seg);
    }
  } else if (look.shape === 'boss-thermal'){
    // melting cable coil around a white-hot core (R2 Thermal Runaway)
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), lam(0xfff2d0, 0xffb361));
    core.position.y = 1.5; parts.torso = core; g.add(core);
    for (let i = 0; i < 4; i++){
      const coil = new THREE.Mesh(new THREE.TorusGeometry(1.0 + i * 0.12, 0.22, 8, 14), lam(c));
      coil.position.y = 0.5 + i * 0.5;
      coil.rotation.x = Math.PI / 2 + (i % 2 ? 0.18 : -0.14);
      g.add(coil);
    }
    const mkWhip = x => {
      const a = new THREE.Group();
      a.position.set(x, 2.1, 0);
      for (let i = 0; i < 3; i++){
        const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14 - i * 0.03, 0.5, 3, 6), lam(c));
        seg.position.y = -0.35 - i * 0.55; a.add(seg);
      }
      g.add(a); return a;
    };
    parts.armL = mkWhip(-1.1); parts.armR = mkWhip(1.1);
    for (let i = 0; i < 3; i++){
      const slag = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), lam(0x1c1210));
      const a = i * 2.1;
      slag.position.set(Math.cos(a) * 1.1, 0.2, Math.sin(a) * 1.1);
      g.add(slag);
    }
  } else if (look.shape === 'boss-drowned'){
    // half-submerged switchgear cabinet, bushings, capsule-chain arms (R3 The Drowned Main)
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.4), lam(c));
    cab.position.y = 1.1; parts.torso = cab; g.add(cab);
    for (const dx of [-0.7, 0, 0.7]){
      const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.9, 8), lam(0x2c3a4a, 0x6ff7e8));
      bush.position.set(dx, 2.6, 0); g.add(bush);
      if (dx === 0) parts.head = bush;
    }
    const mkArm = x => {
      const a = new THREE.Group();
      a.position.set(x, 1.9, 0);
      for (let i = 0; i < 3; i++){
        const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.45, 3, 6), lam(0x1c2833));
        seg.position.y = -0.35 - i * 0.5; a.add(seg);
      }
      g.add(a); return a;
    };
    parts.armL = mkArm(-1.5); parts.armR = mkArm(1.5);
  } else if (look.shape === 'boss-peak'){
    // central column + triple-cone crown + orbiting transformer boxes (R4 The Coincident Peak)
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 2.6, 10), lam(c));
    col.position.y = 1.3; parts.torso = col; g.add(col);
    for (let i = 0; i < 3; i++){
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3 - i * 0.06, 0.6, 8), lam(0xe8f4ff));
      cone.position.y = 2.8 + i * 0.45; g.add(cone);
      if (i === 0) parts.head = cone;
    }
    for (let i = 0; i < 4; i++){
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), lam(0x2f5d44, 0xff8c3b));
      const a = i * Math.PI / 2;
      box.position.set(Math.cos(a) * 1.6, 0.9 + (i % 2) * 0.7, Math.sin(a) * 1.6);
      g.add(box);
      if (i === 0) parts.armL = box;
      if (i === 1) parts.armR = box;
    }
  } else if (look.shape === 'boss-incident'){
    // emissive core + violet corona + orbiting scorched debris (R5 The Incident)
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 10), lam(0xfff6e8, 0xfff6e8));
    core.position.y = 2.2; parts.torso = core; g.add(core);
    const corona = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xa98bff, transparent: true, opacity: 0.7 }));
    corona.position.y = 2.2; corona.rotation.x = Math.PI / 3; g.add(corona);
    for (let i = 0; i < 5; i++){
      const deb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), lam(0x2b1a20));
      const a = i * Math.PI * 2 / 5;
      deb.position.set(Math.cos(a) * 1.7, 1.6 + (i % 2) * 1.1, Math.sin(a) * 1.7);
      g.add(deb);
      if (i === 0) parts.armL = deb;
      if (i === 1) parts.armR = deb;
    }
    for (let i = 0; i < 3; i++){
      const jet = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 7), lam(0x8a2c14, 0xff8a4d));
      const a = i * Math.PI * 2 / 3;
      jet.position.set(Math.cos(a) * 0.9, 0.5, Math.sin(a) * 0.9);
      jet.rotation.z = Math.PI; g.add(jet);
    }
  }

  if (look.crown){
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 18),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 }));
    crown.rotation.x = -Math.PI / 2;
    crown.position.y = (look.shape === 'spitter' ? 2.0 : 1.1);
    g.add(crown);
  }
  g.scale.setScalar(look.scale || 1);
  return finish(g, parts);
}
