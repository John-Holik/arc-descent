// Builds the 3D world from dungeon.js data + realm palette (art-tech.md specs).
// Flat-shaded Lambert, vertex/instance colors, InstancedMesh tiles, zero textures.

import * as THREE from 'three';

const WALL_H = 2.5;

export function makeLights(scene){
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  const c = sun.shadow.camera;
  c.left = -24; c.right = 24; c.top = 24; c.bottom = -24; c.near = 1; c.far = 90;
  scene.add(sun); scene.add(sun.target);
  // neutral default so updateSun works before any palette is applied (hub resume)
  const lights = { hemi, sun, sunOffset: new THREE.Vector3(20, 49, 28) };
  sun.position.copy(lights.sunOffset);
  return lights;
}

export function applyPalette(scene, lights, p){
  scene.fog = new THREE.Fog(p.fog, p.fogNear, p.fogFar);
  scene.background = new THREE.Color(p.fog);
  lights.hemi.color.set(p.hemiSky);
  lights.hemi.groundColor.set(p.hemiGround);
  lights.hemi.intensity = p.hemiIntensity;
  lights.sun.color.set(p.sun);
  lights.sun.intensity = p.sunIntensity;
  const [el, az] = p.sunAngle;
  const elR = el * Math.PI / 180, azR = az * Math.PI / 180;
  lights.sunOffset = new THREE.Vector3(
    Math.cos(elR) * Math.sin(azR) * 60, Math.sin(elR) * 60, Math.cos(elR) * Math.cos(azR) * 60);
  lights.sun.position.copy(lights.sunOffset);
}

// keep the shadow camera centered on the player
export function updateSun(lights, target){
  lights.sun.target.position.set(target.x, 0, target.z);
  lights.sun.position.set(target.x, 0, target.z).add(lights.sunOffset);
}

const tileHash = (x, z) => {
  let h = (x * 374761393 + z * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function buildFloorMeshes(scene, floor, palette, rng){
  const group = new THREE.Group();
  const { w, h, tiles } = floor;
  const ramp = palette.groundRamp.map(c => new THREE.Color(c));
  const at = (x, z) => (x >= 0 && z >= 0 && x < w && z < h) ? tiles[z * w + x] : 0;

  // floor tiles
  const floorCells = [];
  const wallCells = [];
  for (let z = 0; z < h; z++) for (let x = 0; x < w; x++){
    if (at(x, z) === 1) floorCells.push([x, z]);
    else {
      // wall if adjacent (8-way) to floor
      let adj = false;
      for (let dz = -1; dz <= 1 && !adj; dz++) for (let dx = -1; dx <= 1; dx++)
        if (at(x + dx, z + dz) === 1){ adj = true; break; }
      if (adj) wallCells.push([x, z]);
    }
  }

  const mat = new THREE.MeshLambertMaterial({ flatShading: true });
  const floorGeo = new THREE.BoxGeometry(1, 0.2, 1);
  const fim = new THREE.InstancedMesh(floorGeo, mat.clone(), floorCells.length);
  fim.receiveShadow = true;
  const m4 = new THREE.Matrix4();
  floorCells.forEach(([x, z], i) => {
    m4.setPosition(x + 0.5, -0.1, z + 0.5);
    fim.setMatrixAt(i, m4);
    const r = tileHash(x, z);
    fim.setColorAt(i, ramp[Math.min(ramp.length - 1, Math.floor(r * ramp.length))]);
  });
  fim.instanceColor.needsUpdate = true;
  group.add(fim);

  // west-edge walls: no floor anywhere west of them in their row — cutting
  // them reveals nothing, so the cutaway west rule skips them
  const rowMinFloorX = new Array(h).fill(Infinity);
  for (let z = 0; z < h; z++) for (let x = 0; x < w; x++)
    if (tiles[z * w + x] === 1){ rowMinFloorX[z] = x; break; }

  const wallGeo = new THREE.BoxGeometry(1, WALL_H, 1);
  const wim = new THREE.InstancedMesh(wallGeo, mat.clone(), wallCells.length);
  wim.castShadow = true; wim.receiveShadow = true;
  const wallCol = ramp[0].clone().multiplyScalar(0.75);
  const wallByCell = new Map();
  wallCells.forEach(([x, z], i) => {
    m4.setPosition(x + 0.5, WALL_H / 2, z + 0.5);
    wim.setMatrixAt(i, m4);
    wim.setColorAt(i, wallCol);
    wallByCell.set(x + ',' + z, { i, x, z, westEdge: x < rowMinFloorX[z] });
  });
  wim.instanceColor.needsUpdate = true;
  group.add(wim);

  // props: 0-2 per room on inner-edge tiles; those tiles become blocked
  const blocked = new Set();
  const propSpots = [];
  for (const r of floor.rooms){
    const n = Math.floor(rng() * 3);
    for (let i = 0; i < n; i++){
      const px = r.x + 1 + Math.floor(rng() * (r.w - 2));
      const pz = (rng() < 0.5) ? r.y + 1 : r.y + r.h - 2;
      if (Math.abs(px - r.cx) < 2 && Math.abs(pz - r.cy) < 2) continue; // keep centers clear
      propSpots.push([px, pz]);
      blocked.add(px + ',' + pz);
    }
  }
  const propGroup = new THREE.Group();
  const kit = PROP_KITS[floor.realm] || PROP_KITS[1];
  for (const [px, pz] of propSpots){
    const p = kit[Math.floor(rng() * kit.length)](palette);
    p.position.set(px + 0.5, 0, pz + 0.5);
    p.rotation.y = rng() * Math.PI * 2;
    propGroup.add(p);
  }
  group.add(propGroup);
  scene.add(group);
  return { group, blocked, walls: { im: wim, byCell: wallByCell } };
}

// Cutaway: shrink wall tiles that hide actors from the fixed camera (south of
// target, looking north). Cut only when the actor is directly NORTH of the
// wall (its column, wall between actor and camera) or directly WEST of it
// (its row) — except west-edge walls, where cutting reveals nothing.
// InstancedMesh can't fade per instance — scale Y instead.
export function makeWallCutaway(walls){
  const { im, byCell } = walls;
  const CUT = 0.24, SPEED = 7, N_DEPTH = 2.6, W_DEPTH = 2.0, TOL = 0.35;
  const m4 = new THREE.Matrix4();
  const tracked = new Map(); // instance index -> { x, z, s }
  return {
    update(points, dt){
      const want = new Set();
      const mark = c => {
        want.add(c.i);
        if (!tracked.has(c.i)) tracked.set(c.i, { x: c.x, z: c.z, s: 1 });
      };
      for (const p of points){
        // north rule: p.x in [wx-TOL, wx+1+TOL], 0 < wz - p.z <= N_DEPTH
        const nx0 = Math.ceil(p.x - 1 - TOL), nx1 = Math.floor(p.x + TOL);
        const nz0 = Math.floor(p.z) + 1, nz1 = Math.floor(p.z + N_DEPTH);
        for (let z = nz0; z <= nz1; z++) for (let x = nx0; x <= nx1; x++){
          const c = byCell.get(x + ',' + z);
          if (c) mark(c);
        }
        // west rule: p.z in [wz-TOL, wz+1+TOL], 0 < wx - p.x <= W_DEPTH
        const wz0 = Math.ceil(p.z - 1 - TOL), wz1 = Math.floor(p.z + TOL);
        const wx0 = Math.floor(p.x) + 1, wx1 = Math.floor(p.x + W_DEPTH);
        for (let z = wz0; z <= wz1; z++) for (let x = wx0; x <= wx1; x++){
          const c = byCell.get(x + ',' + z);
          if (c && !c.westEdge) mark(c);
        }
      }
      let dirty = false;
      for (const [i, t] of tracked){
        const target = want.has(i) ? CUT : 1;
        let s = t.s + Math.sign(target - t.s) * SPEED * dt;
        if (Math.abs(s - target) < 0.03) s = target;
        if (s !== t.s){
          t.s = s;
          m4.makeScale(1, s, 1);
          m4.setPosition(t.x + 0.5, WALL_H * s / 2, t.z + 0.5);
          im.setMatrixAt(i, m4);
          dirty = true;
        }
        if (s === 1) tracked.delete(i);
      }
      if (dirty) im.instanceMatrix.needsUpdate = true;
    },
  };
}

/* ---- Greenfield prop recipes (art-tech.md) ---- */
const lam = color => new THREE.MeshLambertMaterial({ color, flatShading: true });

function makeCableSpool(){
  // two large flat discs + axle cylinder, on its side — chest-high cover (R1 doc)
  const g = new THREE.Group();
  const wood = lam(0x8a6a42);
  for (const y of [0.08, 0.92]){
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.14, 12), wood.clone());
    disc.position.y = y; disc.castShadow = true; g.add(disc);
  }
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.75, 10), lam(0x6b543c));
  axle.position.y = 0.5; g.add(axle);
  return g;
}
function makeMeterPedestal(palette){
  // box base + smaller box head + sphere dial + conduit stub; dead-black dial (R1 doc)
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.4), lam(0x5f6b63));
  base.position.y = 0.45; base.castShadow = true; g.add(base);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.34), lam(0x4a544d));
  head.position.y = 1.05; g.add(head);
  const dial = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), lam(0x0d0d0d));
  dial.position.set(0, 1.05, 0.2); g.add(dial);
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), lam(new THREE.Color(palette.accent).multiplyScalar(0.5)));
  stub.position.set(0.18, 0.25, 0); g.add(stub);
  return g;
}
function makeUtilityPole(palette){
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 6, 6), lam(0x6b543c));
  pole.position.y = 3; pole.castShadow = true; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), lam(0x584634));
  arm.position.y = 5.4; g.add(arm);
  for (const dx of [-0.6, 0.6]){
    const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.16, 5), lam(palette.accent));
    ins.position.set(dx, 5.55, 0); g.add(ins);
  }
  return g;
}

/* ---- realm prop kits (art-tech.md, continuity pass) ---- */
function makeMesaStack(){
  const g = new THREE.Group();
  let y = 0;
  for (const [w, h] of [[1.6, 0.5], [1.2, 0.45], [0.8, 0.4]]){
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.9), lam(0xb5824a));
    b.position.y = y + h / 2; b.rotation.y = Math.random() * 0.6; b.castShadow = true;
    g.add(b); y += h;
  }
  return g;
}
function makeScorchedDrum(){
  const g = new THREE.Group();
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.1, 10), lam(0x3a2a1c));
  drum.position.y = 0.55; drum.castShadow = true; g.add(drum);
  for (let i = 0; i < 3; i++){
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.4), lam(0x2a1c12));
    const a = i * Math.PI * 2 / 3;
    fin.position.set(Math.cos(a) * 0.58, 0.55, Math.sin(a) * 0.58);
    fin.rotation.y = -a; g.add(fin);
  }
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), lam(0xff6a1a, 0xff6a1a));
  seam.position.y = 0.9; g.add(seam);
  return g;
}
function makeDryScrub(){
  const g = new THREE.Group();
  for (const r of [0.5, 0.38]){
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, 0.5, 6), lam(0x8a6a42));
    c.scale.y = 0.6; c.position.y = 0.16; c.rotation.y = r * 9; g.add(c);
  }
  return g;
}
function makeConduitRack(){
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++){
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), lam(0x4a7472));
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 0.35 + (i > 1 ? 0.25 : 0), (i % 2) * 0.3 - 0.15);
    g.add(pipe);
  }
  for (const dx of [-0.9, 0.9]){
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.6), lam(0x2c464c));
    saddle.position.set(dx, 0.25, 0); saddle.castShadow = true; g.add(saddle);
  }
  return g;
}
function makeSunkenCabinet(){
  const g = new THREE.Group();
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 0.5), lam(0x2c464c));
  cab.position.y = 0.6; cab.rotation.z = 0.21; cab.castShadow = true; g.add(cab);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 0.06), lam(0x22343a));
  door.position.set(0.55, 0.6, 0.2); door.rotation.y = 0.8; g.add(door);
  return g;
}
function makePilingCluster(){
  const g = new THREE.Group();
  for (const [dx, dz, h] of [[-0.3, 0.1, 1.8], [0.25, -0.2, 2.3], [0.1, 0.35, 1.5]]){
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, h, 8), lam(0x22343a));
    p.position.set(dx, h / 2, dz); p.castShadow = true; g.add(p);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 8), lam(0x2dd4bf));
    band.position.set(dx, h * 0.45, dz); g.add(band);
  }
  return g;
}
function makeSnowPine(){
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.7, 6), lam(0x3a3f45));
  trunk.position.y = 0.35; g.add(trunk);
  [[0.7, 0.9, 0x4c6478], [0.52, 1.55, 0x7e97ab], [0.34, 2.1, 0xe6f0f8]].forEach(([r, y, c]) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, 0.9, 7), lam(c));
    cone.position.y = y; cone.castShadow = true; g.add(cone);
  });
  return g;
}
function makeDriftPadmount(){
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.9), lam(0x2f5d44));
  box.position.y = 0.45; box.castShadow = true; g.add(box);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 1.0), lam(0xe6f0f8));
  lid.position.y = 0.95; g.add(lid);
  return g;
}
function makeBreakerStack(){
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < 3; i++){
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.8 - i * 0.12, 0.55, 0.6 - i * 0.08), lam(0x332b34));
    b.position.y = y + 0.28; b.rotation.y = i * 0.4; b.castShadow = true;
    g.add(b); y += 0.55;
  }
  const scorch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.08), lam(0xff8a4d, 0xff8a4d));
  scorch.position.y = y - 0.2; g.add(scorch);
  return g;
}
function makeEmberVent(){
  const g = new THREE.Group();
  const crater = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 9), lam(0x3a1f16));
  crater.rotation.x = Math.PI; crater.position.y = 0.25; g.add(crater);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 9), lam(0xff8a4d, 0xff8a4d));
  core.position.y = 0.5; g.add(core);
  return g;
}
function makeSlagHeap(){
  const g = new THREE.Group();
  for (const [dx, dz, s] of [[-0.3, 0, 0.5], [0.3, 0.2, 0.4], [0, -0.3, 0.35]]){
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), lam(0x14100e));
    rock.position.set(dx, s * 0.6, dz); rock.scale.y = 0.7; rock.castShadow = true; g.add(rock);
  }
  const ember = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.2), lam(0xc2551e, 0xc2551e));
  ember.position.y = 0.55; g.add(ember);
  return g;
}
const PROP_KITS = {
  1: [() => makeCableSpool(), p => makeMeterPedestal(p), p => makeUtilityPole(p)],
  2: [() => makeMesaStack(), () => makeScorchedDrum(), () => makeDryScrub()],
  3: [() => makeConduitRack(), () => makeSunkenCabinet(), () => makePilingCluster()],
  4: [() => makeSnowPine(), () => makeCableSpool(), () => makeDriftPadmount()],
  5: [() => makeBreakerStack(), () => makeEmberVent(), () => makeSlagHeap()],
};

/* ---- hazard tiles (env mechanics): per-tile translucent quads ---- */
export function buildHazardTiles(scene, hazards, colorByKind){
  const group = new THREE.Group();
  const tileSets = {}; // kind -> Map('x,z' -> {poolId})
  for (const hz of hazards || []){
    const color = colorByKind[hz.kind] || 0xffffff;
    const set = tileSets[hz.kind] || (tileSets[hz.kind] = new Map());
    for (const t of hz.tiles){
      set.set(t.x + ',' + t.z, { poolId: hz.id });
      const q = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: hz.kind === 'brownout' ? 0.30 : 0.38, depthWrite: false, side: THREE.DoubleSide }));
      q.rotation.x = -Math.PI / 2;
      q.position.set(t.x + 0.5, 0.045, t.z + 0.5);
      group.add(q);
    }
  }
  scene.add(group);
  return { group, tileSets };
}

// small pooled quads for dynamic hazard tiles (enemy trails, boss beads)
export function makeDynamicHazards(scene, colorByKind){
  const pool = [];
  const active = []; // {mesh, key, kind, expiry}
  function acquire(color){
    let m = pool.pop();
    if (!m){
      m = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      scene.add(m);
    }
    m.material.color.set(color);
    m.visible = true;
    return m;
  }
  return {
    active,
    add(kind, x, z, dur, now){
      const tx = Math.floor(x), tz = Math.floor(z);
      const key = tx + ',' + tz;
      const existing = active.find(a => a.key === key && a.kind === kind);
      if (existing){ existing.expiry = now + dur; return; }
      if (active.length > 140) return; // cap
      const m = acquire(colorByKind[kind] || 0xffffff);
      m.position.set(tx + 0.5, 0.05, tz + 0.5);
      active.push({ mesh: m, key, kind, expiry: now + dur, x: tx, z: tz });
    },
    has(kind, x, z){
      const key = Math.floor(x) + ',' + Math.floor(z);
      return active.some(a => a.kind === kind && a.key === key);
    },
    update(now){
      for (let i = active.length - 1; i >= 0; i--){
        if (now >= active[i].expiry){
          active[i].mesh.visible = false;
          pool.push(active[i].mesh);
          active.splice(i, 1);
        }
      }
    },
    clear(){
      for (const a of active){ a.mesh.visible = false; pool.push(a.mesh); }
      active.length = 0;
    },
  };
}

export function makePylon(){
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < 4; i++){
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.1 - i * 0.15, 0.8, 1.1 - i * 0.15), lam(0x453844));
    b.position.y = y + 0.4; b.castShadow = true; g.add(b); y += 0.8;
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.4, 8), lam(0xe8dfff, 0xe8dfff));
  cap.position.y = y + 0.2; g.add(cap);
  return g;
}

/* ---- hub: the Workbench (compact single-room floor between realms) ---- */
export function buildWorkbench(){
  const g = new THREE.Group();
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.0), lam(0x6b543c));
  table.position.y = 0.45; table.castShadow = true; g.add(table);
  const vise = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.4, 8), lam(0x475569));
  vise.position.set(-0.7, 1.05, 0); g.add(vise);
  const peg = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.1), lam(0x2c3a4a));
  peg.position.set(0, 1.8, -0.5); g.add(peg);
  for (const [dx, dy] of [[-0.6, 0.2], [0.2, 0.35], [0.7, 0.1]]){
    const toolStrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.04), lam(0x2dd4bf, 0x2dd4bf));
    toolStrip.position.set(dx, 1.8 + dy, -0.43); g.add(toolStrip);
  }
  return g;
}

export function buildRealmGate(accent, locked){
  const g = new THREE.Group();
  // portal pedestal step
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.18, 12), lam(0x2c3a4a));
  ped.position.y = 0.09; ped.receiveShadow = true; g.add(ped);
  for (const dx of [-1.1, 1.1]){
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.0, 0.4), lam(0x3a4756));
    post.position.set(dx, 1.5, 0); post.castShadow = true; g.add(post);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.4, 0.5), lam(0x2c3a4a));
  lintel.position.y = 3.1; g.add(lintel);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.6),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: locked ? 0.08 : 0.4, side: THREE.DoubleSide, depthWrite: false }));
  panel.position.y = 1.5; g.add(panel);
  // swirl ring inside the panel so open portals read as active
  const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 22),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: locked ? 0.06 : 0.6, depthWrite: false }));
  swirl.position.y = 1.5; swirl.position.z = 0.02; g.add(swirl);
  g.userData.panel = panel; g.userData.swirl = swirl;
  return g;
}

/* ---- town props (flat-shaded primitives, prop-kit style) ---- */
function buildShopStall(){
  const g = new THREE.Group();
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.9), lam(0x6b543c));
  counter.position.y = 0.45; counter.castShadow = true; g.add(counter);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.1), lam(0x8a6a42));
  top.position.y = 0.95; g.add(top);
  for (const dx of [-1.25, 1.25]){
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 6), lam(0x584634));
    post.position.set(dx, 1.2, -0.35); g.add(post);
  }
  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.7), lam(0x2dd4bf));
  awning.position.set(0, 2.35, 0.15); awning.rotation.x = 0.26; awning.castShadow = true; g.add(awning);
  // goods on the counter
  for (const [dx, w, c] of [[-0.8, 0.42, 0xf5a623], [0, 0.5, 0x38bdf8], [0.85, 0.34, 0xe2e8f0]]){
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, 0.4), lam(c));
    box.position.set(dx, 1.14, -0.1); box.rotation.y = dx; g.add(box);
  }
  return g;
}
function buildQuestBoard(){
  const g = new THREE.Group();
  for (const dx of [-1.0, 1.0]){
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 6), lam(0x6b543c));
    post.position.set(dx, 1.1, 0); post.castShadow = true; g.add(post);
  }
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 0.08), lam(0x2c3a4a));
  panel.position.y = 1.55; panel.castShadow = true; g.add(panel);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.08, 0.5), lam(0x584634));
  roof.position.y = 2.3; g.add(roof);
  // pinned work-order notes
  for (const [dx, dy, tilt, c] of [[-0.8, 0.15, 0.08, 0xe2e8f0], [-0.15, -0.12, -0.1, 0xfacc15], [0.55, 0.18, 0.05, 0xe2e8f0], [0.35, -0.28, -0.06, 0xd9f2b4]]){
    const note = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.48), lam(c));
    note.position.set(dx, 1.55 + dy, 0.05);
    note.rotation.z = tilt;
    g.add(note);
  }
  return g;
}
function buildStatsKiosk(){
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.5), lam(0x4a5568));
  base.position.y = 0.5; base.castShadow = true; g.add(base);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.4), lam(0x334155));
  head.position.y = 1.3; head.rotation.x = -0.3; g.add(head);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12),
    new THREE.MeshLambertMaterial({ color: 0x0d0d0d, emissive: 0x2dd4bf, emissiveIntensity: 0.55 }));
  dial.rotation.x = Math.PI / 2 - 0.3; dial.position.set(0, 1.36, 0.2); g.add(dial);
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), lam(0x2c3a4a));
  stub.position.set(0.26, 0.25, 0.1); g.add(stub);
  return g;
}
function buildLampPost(){
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.6, 6), lam(0x3a4756));
  pole.position.y = 1.3; pole.castShadow = true; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), lam(0x3a4756));
  arm.position.set(0.22, 2.55, 0); g.add(arm);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22),
    new THREE.MeshLambertMaterial({ color: 0xfff2d0, emissive: 0xffd88a, emissiveIntensity: 0.9 }));
  lamp.position.set(0.45, 2.5, 0); g.add(lamp);
  return g;
}
function buildCrates(){
  const g = new THREE.Group();
  const big = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), lam(0x6b543c));
  big.position.y = 0.35; big.rotation.y = 0.2; big.castShadow = true; g.add(big);
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), lam(0x584634));
  side.position.set(0.78, 0.275, 0.15); side.rotation.y = 0.7; side.castShadow = true; g.add(side);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), lam(0x8a6a42));
  top.position.set(0.05, 0.93, 0.05); top.rotation.y = 0.5; top.castShadow = true; g.add(top);
  return g;
}

/* ---- fantasy town dressing ---- */
function makeMountain(r, h, { snow = false } = {}){
  const g = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), lam(0x4d7a3b));
  grass.position.y = h / 2; g.add(grass);
  const peak = new THREE.Mesh(new THREE.ConeGeometry(r * 0.45, h * 0.55, 7), lam(0x6b7280));
  peak.position.y = h * 0.72; peak.rotation.y = 0.4; g.add(peak);
  if (snow){
    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.2, h * 0.22, 7), lam(0xe8eef5));
    cap.position.y = h * 0.92; g.add(cap);
  }
  return g;
}
function makeGrassTuft(){
  const g = new THREE.Group();
  for (const [dx, dz, s] of [[0, 0, 0.24], [0.2, 0.1, 0.17], [-0.16, 0.14, 0.15]]){
    const b = new THREE.Mesh(new THREE.ConeGeometry(s, s * 3.2, 4), lam(0x5f9143));
    b.position.set(dx, s * 1.5, dz); b.rotation.y = dx * 9; g.add(b);
  }
  return g;
}
function makeBoulder(s){
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), lam(0x788292));
  b.position.y = s * 0.55; b.scale.y = 0.7; b.castShadow = true;
  return b;
}
function makePath(x0, z0, x1, z1, w = 1.3){
  const len = Math.hypot(x1 - x0, z1 - z0);
  const p = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, w), lam(0xb3a071));
  p.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2);
  p.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  p.receiveShadow = true;
  return p;
}
function makeGlowTextSprite(text, { size = 58, w = 512, h = 128, scale = 6.4 } = {}){
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.font = `bold ${size}px Segoe UI, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 26;
  ctx.fillStyle = '#e9d5ff';
  ctx.fillText(text, w / 2, h / 2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f5edff';
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  spr.scale.set(scale, scale * h / w, 1);
  return spr;
}
// floating top-5 board (billboard sprite, Roblox-leaderboard style)
function makeRecordsSprite(records){
  const canvas = document.createElement('canvas');
  canvas.width = 420; canvas.height = 330;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(18, 10, 34, 0.82)';
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.9)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(6, 6, 408, 318, 18);
  ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 34px Segoe UI, sans-serif';
  ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 14;
  ctx.fillStyle = '#e9d5ff';
  ctx.fillText('DEEPEST DESCENTS', 210, 46);
  ctx.shadowBlur = 0;
  ctx.font = '26px Segoe UI, sans-serif';
  if (!records.length){
    ctx.fillStyle = '#8a94a6';
    ctx.fillText('no one has returned yet', 210, 165);
  }
  records.slice(0, 5).forEach((r, i) => {
    const y = 100 + i * 46;
    ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? '#f5d76a' : '#dce3ec';
    ctx.fillText(`${i + 1}.  Depth ${r.depth}`, 36, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#a7b1c2';
    ctx.fillText(`${r.kills} kills · ${r.cls}`, 388, y);
  });
  const tex = new THREE.CanvasTexture(canvas);
  // depthTest off: it's a UI billboard — the mountain ring must never clip it
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
  spr.renderOrder = 5;
  spr.scale.set(5.2, 5.2 * 330 / 420, 1);
  return spr;
}
// the Abyss gate: dark mouth in a rock knoll, glowing purple crystals
function buildCave(){
  const g = new THREE.Group();
  const knoll = new THREE.Mesh(new THREE.ConeGeometry(4.6, 7.5, 8), lam(0x5b6470));
  knoll.position.y = 3.4; g.add(knoll);
  const mossy = new THREE.Mesh(new THREE.ConeGeometry(4.9, 2.4, 8), lam(0x4d7a3b));
  mossy.position.y = 0.9; g.add(mossy);
  const mouth = new THREE.Group();
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1.5, 16),
    new THREE.MeshBasicMaterial({ color: 0x0a0612 }));
  hole.scale.y = 1.25; hole.position.y = 1.7; mouth.add(hole);
  for (const dx of [-1.5, 1.5]){
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.2, 0.7), lam(0x474f5c));
    jamb.position.set(dx, 1.6, -0.1); jamb.rotation.y = 0.4 * Math.sign(dx); mouth.add(jamb);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.9), lam(0x3f4753));
  lintel.position.y = 3.3; lintel.rotation.z = 0.06; mouth.add(lintel);
  const crystals = [];
  for (const [dx, dz, s, tilt] of [[-2.2, 0.6, 0.9, -0.5], [-1.6, 1.2, 0.55, -0.25], [2.1, 0.7, 1.05, 0.45],
    [1.5, 1.3, 0.6, 0.2], [-0.7, 0.35, 0.5, -0.12], [0.8, 0.3, 0.42, 0.3], [0, -0.4, 0.7, 0]]){
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.35 * s, 1.5 * s, 5),
      new THREE.MeshLambertMaterial({ color: 0x7c3aed, emissive: 0xa855f7, emissiveIntensity: 1.0 }));
    c.position.set(dx, 0.5 * s, dz); c.rotation.z = tilt; c.rotation.y = dx * 3;
    mouth.add(c); crystals.push(c);
  }
  const glow = new THREE.PointLight(0xb266ff, 2.4, 15, 1.6);
  glow.position.set(0, 1.8, 1.0);
  mouth.add(glow);
  const swirl = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 6, 24),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  swirl.position.set(0, 1.7, 0.06); mouth.add(swirl);
  const sign = makeGlowTextSprite('THE ABYSS');
  sign.position.set(0, 4.9, 0.8);
  mouth.add(sign);
  mouth.position.z = 3.9; // at the knoll's rim
  g.add(mouth);
  g.userData = { crystals, sign, glow, swirl, signBaseY: 4.9 };
  return g;
}
// central crag with a waterfall face falling into the town pool
function buildWaterfallCrag(){
  const g = new THREE.Group();
  for (const [dx, dz, r, h] of [[0, 0, 2.3, 6.2], [-1.4, 0.5, 1.4, 3.6], [1.5, 0.4, 1.2, 3.0]]){
    const rock = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), lam(0x66707e));
    rock.position.set(dx, h / 2, dz); rock.rotation.y = dx; g.add(rock);
  }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.2, 6), lam(0x4d7a3b));
  cap.position.y = 6.4; g.add(cap);
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 5.6),
    new THREE.MeshBasicMaterial({ color: 0x9ed4f2, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
  fall.position.set(0, 2.9, 2.05); g.add(fall);
  const fall2 = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 5.6),
    new THREE.MeshBasicMaterial({ color: 0xd9f0fb, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
  fall2.position.set(0.2, 2.9, 2.1); g.add(fall2);
  const droplets = [];
  for (let i = 0; i < 7; i++){
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
    d.position.set(-0.6 + (i % 4) * 0.4, 5, 2.15);
    g.add(d); droplets.push(d);
  }
  const splash = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.75, 20),
    new THREE.MeshBasicMaterial({ color: 0xdff3fd, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
  splash.rotation.x = -Math.PI / 2; splash.position.set(0, 0.12, 2.3); g.add(splash);
  g.userData = { fall, droplets, splash };
  return g;
}

export function buildHub(scene, palettes, seals, abyssRecords = []){
  // Terminal Town, fantasy cut: grass meadow ringed by green mountains, dirt
  // paths, central crag waterfall + pool, the Abyss gate in the NE.
  // POIs: forge west, portal row north, shop east, quest board SE, stats SW.
  const group = new THREE.Group();
  const W = 44, H = 26;
  const POOL = { x: 22, z: 14.5, r: 4.4 };
  const CAVE = { x: 40.5, z: 3.2, r: 4.4 };

  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(W + 14, 0.4, H + 12), lam(0x4f7a38));
  floorMesh.position.set(W / 2, -0.2, H / 2);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);
  for (const [x, z, r, c] of [[10, 8, 4, 0x557f3c], [33, 20, 5, 0x476f33], [15, 20, 3.5, 0x5a8440], [30, 7, 3, 0x557f3c]]){
    const patch = new THREE.Mesh(new THREE.CircleGeometry(r, 18), new THREE.MeshLambertMaterial({ color: c }));
    patch.rotation.x = -Math.PI / 2; patch.position.set(x, 0.012, z);
    group.add(patch);
  }

  // pool + crag + falls: the town centerpiece
  const poolDeep = new THREE.Mesh(new THREE.CircleGeometry(POOL.r, 26), lam(0x1d4e6e));
  poolDeep.rotation.x = -Math.PI / 2; poolDeep.position.set(POOL.x, 0.02, POOL.z); group.add(poolDeep);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(POOL.r, 26),
    new THREE.MeshBasicMaterial({ color: 0x3f8fc4, transparent: true, opacity: 0.55, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(POOL.x, 0.09, POOL.z); group.add(pool);
  const shore = new THREE.Mesh(new THREE.RingGeometry(POOL.r, POOL.r + 0.55, 26),
    new THREE.MeshLambertMaterial({ color: 0xb3a071 }));
  shore.rotation.x = -Math.PI / 2; shore.position.set(POOL.x, 0.025, POOL.z); group.add(shore);
  const crag = buildWaterfallCrag();
  crag.position.set(POOL.x, 0, POOL.z - 2.2);
  group.add(crag);
  const ripples = [];
  for (let i = 0; i < 3; i++){
    const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 22),
      new THREE.MeshBasicMaterial({ color: 0xcfeafa, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }));
    r.rotation.x = -Math.PI / 2; r.position.set(POOL.x, 0.1, POOL.z + 0.2);
    group.add(r); ripples.push(r);
  }

  // dirt paths: ring around the pool + spokes out to every POI
  const ringR = POOL.r + 1.6;
  for (let i = 0; i < 16; i++){
    const a0 = i / 16 * Math.PI * 2, a1 = (i + 1) / 16 * Math.PI * 2;
    group.add(makePath(POOL.x + Math.cos(a0) * ringR, POOL.z + Math.sin(a0) * ringR,
      POOL.x + Math.cos(a1) * ringR, POOL.z + Math.sin(a1) * ringR, 1.2));
  }
  for (const [x, z] of [[6, 14.5], [38, 14.5], [33.5, 21.5], [10, 21.5], [22, 24], [12, 3.6], [22, 3.6], [32, 3.6], [37.5, 6]]){
    const d = Math.hypot(x - POOL.x, z - POOL.z) || 1;
    group.add(makePath(POOL.x + (x - POOL.x) / d * ringR, POOL.z + (z - POOL.z) / d * ringR, x, z, 1.15));
  }

  const interactables = [];
  const forge = buildWorkbench();
  forge.position.set(5.5, 0, 14.5);
  forge.rotation.y = Math.PI / 2;
  group.add(forge);
  interactables.push({ kind: 'forge', x: 5.5, z: 14.5, group: forge });
  const realmKeys = ['greenfield', 'scorchFlats', 'drownedWorks', 'frostloadReach', 'arcCaldera'];
  for (let r = 1; r <= 5; r++){
    const locked = r > 1 && !seals[r - 1];
    const gate = buildRealmGate(palettes[realmKeys[r - 1]].accent, locked);
    gate.position.set(12 + (r - 1) * 5, 0, 2.4);
    group.add(gate);
    interactables.push({ kind: 'gate', realm: r, locked, x: 12 + (r - 1) * 5, z: 3.6, group: gate });
  }
  const shop = buildShopStall();
  shop.position.set(38.5, 0, 14.5);
  shop.rotation.y = -Math.PI / 2;
  group.add(shop);
  interactables.push({ kind: 'shop', x: 37, z: 14.5, group: shop });
  // south-edge props keep their faces on +z — the camera sits south, looking north
  const board = buildQuestBoard();
  board.position.set(33.5, 0, H - 3.5);
  group.add(board);
  interactables.push({ kind: 'quests', x: 33.5, z: H - 4.6, group: board });
  const kiosk = buildStatsKiosk();
  kiosk.position.set(10, 0, H - 3.5);
  group.add(kiosk);
  interactables.push({ kind: 'stats', x: 10, z: H - 4.6, group: kiosk });
  for (const [x, z, ry] of [[16, 8.5, 0], [28, 8.5, Math.PI], [15.5, 20, 0.5], [28.5, 20, -0.5]]){
    const lamp = buildLampPost();
    lamp.position.set(x, 0, z); lamp.rotation.y = ry;
    group.add(lamp);
  }
  for (const [x, z] of [[36, 10.5], [7.5, 9]]){
    const c = buildCrates();
    c.position.set(x, 0, z);
    group.add(c);
  }

  // the Abyss gate: endless-mode entrance + floating record board
  const cave = buildCave();
  cave.position.set(CAVE.x, 0, CAVE.z);
  cave.rotation.y = Math.atan2(POOL.x - CAVE.x, POOL.z - CAVE.z); // mouth toward the square
  group.add(cave);
  // records board floats to the RIGHT of the cave (screen right = +x; camera sits south),
  // placed in world coords so the cave's mouth rotation can't swing it around
  const recordsBoard = makeRecordsSprite(abyssRecords || []);
  recordsBoard.position.set(CAVE.x + 4.2, 3.4, CAVE.z + 5.4);
  group.add(recordsBoard);
  cave.userData.board = recordsBoard;
  cave.userData.boardBaseY = 3.4;
  {
    const d = Math.hypot(POOL.x - CAVE.x, POOL.z - CAVE.z);
    const ax = CAVE.x + (POOL.x - CAVE.x) / d * (CAVE.r + 0.7);
    const az = CAVE.z + (POOL.z - CAVE.z) / d * (CAVE.r + 0.7);
    interactables.push({ kind: 'abyss', x: ax, z: az, group: cave });
  }

  // mountain ring: tall north/east/west, low grassy hills at the south corners
  // so the camera (south, looking north) never gets blocked
  const mtn = (x, z, r, h, o) => { const m = makeMountain(r, h, o); m.position.set(x, 0, z); group.add(m); };
  for (let i = 0; i < 8; i++) mtn(-2 + i * 7, -4.5 - (i % 3), 4 + (i % 3) * 1.4, 8 + ((i * 5) % 7), { snow: i % 3 === 1 });
  for (let i = 0; i < 4; i++) mtn(W + 4.5, 2 + i * 7.5, 3.6 + (i % 2), 7 + (i * 3) % 6, { snow: i === 2 });
  for (let i = 0; i < 4; i++) mtn(-4.5, 2 + i * 7.5, 3.6 + ((i + 1) % 2), 7 + (i * 4) % 6, {});
  mtn(-3, H + 3.5, 4.5, 2.4, {}); mtn(W + 3, H + 3.5, 4.5, 2.2, {}); // south hills, kept low
  for (const [x, z] of [[8, 5.5], [19, 7], [26, 21], [36, 19.5], [12.5, 17], [31, 5.5], [17, 22.5], [7, 18.5]]){
    const t = makeGrassTuft(); t.position.set(x, 0, z); group.add(t);
  }
  const b1 = makeBoulder(0.8); b1.position.set(35.5, 0.44, 21.5); group.add(b1);
  const b2 = makeBoulder(0.55); b2.position.set(8.5, 0.3, 5); group.add(b2);

  scene.add(group);

  const cd = crag.userData, cv = cave.userData;
  let t = 0;
  const animate = (dt) => {
    t += dt;
    cd.fall.material.opacity = 0.55 + 0.08 * Math.sin(t * 7);
    cd.droplets.forEach((d, i) => {
      const ph = (t * 0.75 + i / 7) % 1;
      d.position.y = 5.4 - ph * 5.1;
      d.material.opacity = 0.75 * (1 - ph * 0.5);
    });
    cd.splash.material.opacity = 0.35 + 0.25 * Math.sin(t * 9);
    ripples.forEach((r, i) => {
      const ph = (t * 0.4 + i / 3) % 1;
      r.scale.setScalar(0.5 + ph * 2.6);
      r.material.opacity = 0.45 * (1 - ph);
    });
    cv.crystals.forEach((c, i) => { c.material.emissiveIntensity = 0.85 + 0.4 * Math.sin(t * 2.1 + i * 1.7); });
    cv.glow.intensity = 2.2 + 0.5 * Math.sin(t * 2.6);
    cv.sign.position.y = cv.signBaseY + 0.18 * Math.sin(t * 1.4);
    cv.board.position.y = cv.boardBaseY + 0.14 * Math.sin(t * 1.1 + 1.9);
    cv.swirl.rotation.z = t * 0.8;
    cv.swirl.material.opacity = 0.4 + 0.2 * Math.sin(t * 3);
  };

  const collider = {
    solid: (x, z) => x < 1 || z < 1 || x > W - 1 || z > H - 1
      || Math.hypot(x - POOL.x, z - POOL.z) < POOL.r + 0.2
      || Math.hypot(x - CAVE.x, z - CAVE.z) < CAVE.r,
    walkable(x, z){ return !this.solid(x, z); },
    move(px, pz, dx, dz){
      const nx = Math.max(1, Math.min(W - 1, px + dx));
      const nz = Math.max(1, Math.min(H - 1, pz + dz));
      if (this.walkable(nx, nz)) return [nx, nz, false];
      if (this.walkable(nx, pz)) return [nx, pz, true];
      if (this.walkable(px, nz)) return [px, nz, true];
      return [px, pz, true];
    },
    los: () => true,
  };
  return { group, interactables, collider, animate, start: { x: W / 2, z: H - 4.5 }, bounds: { w: W, h: H } };
}

/* ---- interactables ---- */
export function buildShrine(accent){
  const g = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1, 8), lam(0x4a5568));
  ped.position.y = 0.5; ped.castShadow = true; g.add(ped);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), lam(0x334155));
  head.position.y = 1.25; g.add(head);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12),
    new THREE.MeshLambertMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.9 }));
  lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.25, 0.28); g.add(lens);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 6, 24),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.5 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; g.add(ring);
  g.userData.lens = lens; g.userData.ring = ring;
  return g;
}

export function buildChest(latchColor){
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.6), lam(0x37506b));
  body.position.y = 0.3; body.castShadow = true; g.add(body);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1, 0.18, 0.6), lam(0x2b3f56));
  lid.geometry.translate(0, 0.09, -0.3);
  lid.position.set(0, 0.6, 0.3); g.add(lid);
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.05),
    new THREE.MeshLambertMaterial({ color: latchColor, emissive: latchColor, emissiveIntensity: 0.8 }));
  latch.position.set(0, 0.45, 0.31); g.add(latch);
  // beacon so lootable chests read as lootable (props don't glow)
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: latchColor, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
  beacon.position.y = 1.9; g.add(beacon);
  g.userData.lid = lid; g.userData.latch = latch; g.userData.body = body; g.userData.beacon = beacon;
  return g;
}

// looted state: lid swung open, glow dead, wood gone dark — readable at a glance
export function openChest(g){
  const u = g.userData;
  if (u.opened) return;
  u.opened = true;
  if (u.lid) u.lid.rotation.x = -1.9;
  if (u.beacon){ g.remove(u.beacon); u.beacon = null; }
  if (u.latch){ u.latch.material.emissiveIntensity = 0; u.latch.material.color.set(0x334155); }
  if (u.body) u.body.material.color.multiplyScalar(0.55);
  if (u.lid) u.lid.material.color.multiplyScalar(0.55);
}

export function buildSeal(accent){
  const g = new THREE.Group();
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 0.3, 24), lam(0x3a4756));
  dais.position.y = 0.15; dais.receiveShadow = true; g.add(dais);
  const rings = [];
  [1.4, 2.0, 2.6].forEach((r, i) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 6, 32),
      new THREE.MeshLambertMaterial({ color: 0x223041, emissive: 0x000000 }));
    t.rotation.x = -Math.PI / 2; t.position.y = 0.32 + i * 0.02;
    g.add(t); rings.push(t);
  });
  const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.6), lam(0x2c3a4a));
  pylon.position.y = 1.2; pylon.castShadow = true; g.add(pylon);
  g.userData.rings = rings; g.userData.accent = accent;
  return g;
}
export function energizeSeal(seal){
  for (const t of seal.userData.rings){
    t.material.emissive.set(seal.userData.accent);
    t.material.emissiveIntensity = 1.0;
    t.material.color.set(seal.userData.accent);
  }
}

export function buildLotoDoor(){
  const g = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 0.3), lam(0x53616f));
  panel.position.y = 1.1; panel.castShadow = true; g.add(panel);
  const hasp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.1), lam(0xdc2626));
  hasp.position.set(0, 1.1, 0.2); g.add(hasp);
  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.04),
    new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5 }));
  tag.position.set(0.28, 0.95, 0.2); g.add(tag);
  g.userData.panel = panel;
  return g;
}

export function buildExitPad(accent){
  const g = new THREE.Group();
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.12, 16),
    new THREE.MeshLambertMaterial({ color: 0x2c3a4a, emissive: accent, emissiveIntensity: 0.35 }));
  pad.position.y = 0.06; g.add(pad);
  return g;
}

export function makeRingDecal(radius, color){
  const m = new THREE.Mesh(new THREE.RingGeometry(radius * 0.82, radius, 28),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.06;
  return m;
}
export function makeDiscDecal(radius, color, opacity = 0.3){
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 28),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.05;
  return m;
}
export function makeSector(radius, angle0, angle1, color){
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, angle0, angle1, false);
  shape.lineTo(0, 0);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.055;
  return m;
}

export function makeLootBeam(color){
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4, 8, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  beam.position.y = 2; g.add(beam);
  const base = new THREE.Mesh(new THREE.CircleGeometry(0.4, 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, depthWrite: false }));
  base.rotation.x = -Math.PI / 2; base.position.y = 0.06; g.add(base);
  g.userData.beam = beam;
  return g;
}

/* ---- collision + LOS over the tile grid ---- */
// extraBlocked (optional live Set): blocks walking only — not projectiles/LOS (Foreman Barricades)
export function makeCollider(floor, blocked, extraBlocked){
  const { w, h, tiles } = floor;
  const solid = (x, z) => {
    const tx = Math.floor(x), tz = Math.floor(z);
    if (tx < 0 || tz < 0 || tx >= w || tz >= h) return true;
    if (tiles[tz * w + tx] !== 1) return true;
    return blocked.has(tx + ',' + tz);
  };
  const softSolid = (x, z) => solid(x, z) || (extraBlocked && extraBlocked.has(Math.floor(x) + ',' + Math.floor(z)));
  const R = 0.35;
  return {
    solid,
    walkable(x, z){
      return !softSolid(x - R, z - R) && !softSolid(x + R, z - R) && !softSolid(x - R, z + R) && !softSolid(x + R, z + R);
    },
    // slide move: try full, then axis-separated
    move(px, pz, dx, dz){
      if (this.walkable(px + dx, pz + dz)) return [px + dx, pz + dz, false];
      if (this.walkable(px + dx, pz)) return [px + dx, pz, true];
      if (this.walkable(px, pz + dz)) return [px, pz + dz, true];
      return [px, pz, true];
    },
    los(x0, z0, x1, z1){
      const steps = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 2);
      for (let i = 1; i < steps; i++){
        const t = i / steps;
        if (solid(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t)) return false;
      }
      return true;
    },
  };
}
