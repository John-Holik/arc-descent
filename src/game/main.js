// Arc Descent — boot, game loop, floor/hub lifecycle, question flows, saves, __dbg.

import * as THREE from 'three';
import { mulberry32, rngPick } from '../core/rng.js';
import { REALMS, ENEMIES, PACK_TABLE, BOSS_BY_REALM, HAZARDS, TRIAL_REWARDS, XP, ECON, CERTIFIED_PCT, REALM_PALETTES, CATS } from '../core/balance.js';
import * as C from '../core/combat.js';
import * as L from '../core/loot.js';
import * as Q from '../core/questions.js';
import { makeProfile, makeRunStore, makeSavesStore, charLevelInfo, BANK_KEY } from '../core/profile.js';
import { genFloor } from '../core/dungeon.js';
import { SAMPLE_QUESTIONS } from '../core/sample-questions.js';
import { ML_QUESTIONS } from '../core/ml-questions.js';
import { makeCameraRig, makeControls } from './controls.js';
import * as W from './world.js';
import { PLAYER_BUILDERS, makeEnemyMesh, makeApprentice, makeSpiderBox, makeBarricadeMesh, makeTownsfolk } from './actors.js';
import { makeFx, makeDamageNumbers, makeHealthBar, Snd } from './fx.js';
import { makeHud } from './hud.js';
import { buildManualPages } from './manual.js';

/* ---------- boot ---------- */
const VERSION = 'V1.01';
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(innerWidth, innerHeight);
app.insertBefore(renderer.domElement, document.getElementById('overlay'));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.5, 200);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const lights = W.makeLights(scene);
const rig = makeCameraRig(camera, { pitchDeg: 52, dist: 26 });
renderer.domElement.addEventListener('wheel', e => {
  if ((G.mode === 'play' || G.mode === 'hub') && !G.paused){ rig.zoom(e.deltaY); e.preventDefault(); }
}, { passive: false });
const hud = makeHud(document.getElementById('overlay'));
const fx = makeFx(scene);
const dmgNums = makeDamageNumbers(scene);

const store = {
  get(k){ try { return localStorage.getItem(k); } catch (e){ return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch (e){} },
  del(k){ try { localStorage.removeItem(k); } catch (e){} },
};

/* ---------- key binds (rebindable in Settings) ---------- */
const BINDS_KEY = 'arcdescent.binds.v1';
const DEFAULT_BINDS = { a1: '1', a2: '2', a3: '3', a4: '4', a5: '5', dodge: ' ', interact: 'e' };
function loadBinds(){
  try {
    const d = JSON.parse(store.get(BINDS_KEY));
    if (d) return Object.assign({}, DEFAULT_BINDS, d);
  } catch (e){}
  return { ...DEFAULT_BINDS };
}
const binds = loadBinds();
const KEY_LABELS = { arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→', m3: 'M3', m4: 'M4', m5: 'M5' };
const keyLabel = k => k === ' ' ? 'SPC' : KEY_LABELS[k] || (k.length === 1 ? k.toUpperCase() : k.toUpperCase().slice(0, 5));
const controls = makeControls(renderer.domElement, camera, binds);

function abilityChips(){
  const d = C.PLAYER.dodge;
  return [
    ...cls().abilities.map((a, i) => ({ key: keyLabel(binds['a' + (i + 1)] || a.key), name: a.name, id: a.id, desc: a.desc, cd: a.cd })),
    { key: keyLabel(binds.dodge), name: 'Dodge', id: 'dodge', cd: d.cd,
      desc: `Roll ${d.dist} u in your move direction — ${d.iframes} s untouchable. Roll through hits, not away from the job.` },
  ];
}
async function settingsFlow(){
  const wasPaused = G.paused;
  G.paused = true;
  const audio = {
    vol: profile.data.vol, mute: !!profile.data.mute,
    onChange(){ Snd.volume = audio.vol; Snd.muted = audio.mute; if (!audio.mute) Snd.pickup(); },
  };
  const gfx = {
    preset: GFX_PRESETS[profile.data.gfx] ? profile.data.gfx : 'medium',
    presets: Object.keys(GFX_PRESETS).map(id => ({ id, label: GFX_PRESETS[id].label })),
    onChange(){ applyGraphics(gfx.preset); },
  };
  await hud.showSettings({ binds, keyLabel, defaults: DEFAULT_BINDS, audio, gfx });
  store.set(BINDS_KEY, JSON.stringify(binds));
  profile.data.vol = audio.vol;
  profile.data.mute = audio.mute;
  profile.data.gfx = gfx.preset;
  profile.save();
  Snd.volume = audio.vol;
  Snd.muted = audio.mute;
  G.paused = wasPaused;
  if (G.run && (G.mode === 'play' || G.mode === 'hub')) hud.setAbilities(abilityChips());
}

/* ---------- pause menu (Esc) ---------- */
async function pauseFlow(){
  G.paused = true;
  for (;;){
    const action = await hud.showPause({ bankLabel: bank.active().src });
    if (action === 'bank'){
      const picks = bank.picks();
      const next = picks[(picks.indexOf(bank.pick()) + 1) % picks.length];
      bank.setPick(next);
      const id = saves.activeId();
      if (id != null) saves.setBank(id, next); // keep the save pinned to what it now runs
      refreshStats(); // CERTIFIED tags follow the active bank's mastery
      updateHud();
      hud.toast(`Question bank: ${bank.active().src}`);
      continue;
    }
    if (action === 'settings'){ await settingsFlow(); continue; }
    if (action === 'quit'){
      saveRun();
      clearWorld();
      G.run = null;
      G.player = null;
      G.paused = false;
      menu();
      return;
    }
    break; // resume
  }
  G.paused = false;
}
const profile = makeProfile(store); profile.load();
const bank = Q.makeBank(store, BANK_KEY, SAMPLE_QUESTIONS, {
  ee: { label: 'Electrical Theory', questions: SAMPLE_QUESTIONS },
  mlrag: { label: 'ML + RAG (study track)', questions: ML_QUESTIONS },
}, 'arcdescent.bankpick.v1');
const saves = makeSavesStore(store);
// fold the pre-multi-save single run (arcdescent.run.v1) into slot 1, once
if (!saves.count()){
  const legacyStore = makeRunStore(store);
  const legacy = legacyStore.load();
  if (legacy){
    const clsName = (C.CLASSES[legacy.cls] || C.LINEMAN).name;
    saves.create({ name: clsName, bank: bank.pick(), run: legacy }, Date.now());
    legacyStore.clear();
  }
}
Snd.muted = !!profile.data.mute;
Snd.volume = profile.data.vol;

/* ---------- graphics presets ---------- */
// medium = the game's original settings; low sheds particles + shadows, high/max add both
const GFX_PRESETS = {
  low:    { label: 'Low',    fx: 0.45, shadows: false, shadowRes: 1024, pr: 1 },
  medium: { label: 'Medium', fx: 1,    shadows: true,  shadowRes: 2048, pr: 2 },
  high:   { label: 'High',   fx: 1.6,  shadows: true,  shadowRes: 3072, pr: 2 },
  max:    { label: 'Max',    fx: 2.2,  shadows: true,  shadowRes: 4096, pr: 3 },
};
function applyGraphics(name){
  const g = GFX_PRESETS[name] || GFX_PRESETS.medium;
  fx.quality = g.fx;
  renderer.setPixelRatio(Math.min(devicePixelRatio, g.pr));
  renderer.shadowMap.enabled = g.shadows;
  lights.sun.castShadow = g.shadows;
  if (lights.sun.shadow.map && lights.sun.shadow.mapSize.x !== g.shadowRes){
    lights.sun.shadow.map.dispose();
    lights.sun.shadow.map = null; // re-allocated at the new resolution on next render
  }
  lights.sun.shadow.mapSize.set(g.shadowRes, g.shadowRes);
  // toggling shadows at runtime needs a material recompile
  scene.traverse(o => { if (o.material) o.material.needsUpdate = true; });
}
applyGraphics(profile.data.gfx);

const HAZ_COLORS = { heat: 0xff6a1a, pool: 0x2dd4bf, brownout: 0x334155, ember: 0xff8a4d };
const AMBIENT = {
  1: { rate: 5, area: 22, y: 3, vel: { x: 0.1, y: 0.15, z: 0.05 }, colors: [0xd9f2b4, 0xffffff], life: 6 },
  2: { rate: 8, area: 20, y: 0.5, vel: { x: 0.05, y: 0.4, z: 0 }, colors: [0xffb361], life: 4 },
  3: { rate: 5, area: 18, y: 4, vel: { x: 0, y: -4, z: 0 }, colors: [0x7fd4cf], life: 1.1 },
  4: { rate: 24, area: 24, y: 6, vel: { x: 0.15, y: -0.8, z: 0 }, colors: [0xffffff], life: 8 },
  5: { rate: 12, area: 20, y: 0.3, vel: { x: 0, y: 0.6, z: 0 }, colors: [0xff8a4d, 0xc2551e], life: 3 },
};
const BOSS_INTROS = {
  openMain: 'THE OPEN MAIN — the substation’s disconnect, corrupted open.',
  thermalRunaway: 'THERMAL RUNAWAY — every undersized run in the Flats, coiled into one melting feeder.',
  drownedMain: 'THE DROWNED MAIN — the flooded service main itself. The water is part of the circuit.',
  coincidentPeak: 'THE COINCIDENT PEAK — every load in the Reach, drawing at once.',
  theIncident: 'THE INCIDENT — the accumulated fault energy of the whole Grid.',
};

/* ---------- game state ---------- */
const G = {
  mode: 'menu', paused: false, run: null,
  floor: null, collider: null, floorGroup: null, blocked: null, barricadeBlocked: new Set(),
  entities: [], projectiles: [], pshots: [], zones: [], drops: [], interactables: [], summons: [], barricades: [],
  hazTiles: {}, dyn: null, hazGroup: null,
  player: null, playerActor: null, session: Q.makeSession(),
  bossEnt: null, sealGroup: null, wedges: null, pads: null, mech: null, hubGroup: null,
  npcs: [], hubShop: null, hubBounds: null,
  pendingBlast: null, time: 0,
};
const grng = () => Math.random();

const realmDef = () => REALMS[G.run.realm];
const charLevel = () => charLevelInfo(G.run.charXp).lvl;
const cls = () => C.CLASSES[G.run.cls] || C.LINEMAN;

function masteryByCat(){
  const qs = bank.all(), out = {};
  for (const cat of CATS) out[cat] = Q.categoryMastery(profile.data, qs, cat).pct;
  return out;
}
function sealFx(){
  const s = G.run.seals || {};
  return {
    hp: s[1] ? 5 : 0, ms: s[2] ? 0.05 : 0, condDr: s[3] ? 0.15 : 0,
    cdr: s[4] ? 0.05 : 0, stampMult: s[5] ? 1.10 : 1,
  };
}
function addStamps(n){
  G.run.stamps += Math.round(n * sealFx().stampMult);
}
function computeStats(){
  const lvl = charLevel();
  const mpc = masteryByCat();
  const certTags = new Set();
  for (const r of Object.values(REALMS)) if ((mpc[r.cat] || 0) >= CERTIFIED_PCT) certTags.add(r.tag);
  const items = Object.values(G.run.equipped).filter(Boolean);
  const nodes = C.activeBoardNodes(C.BOARDS[G.run.cls] || C.LINEMAN_BOARD, lvl, mpc);
  const s = C.derivedStats(lvl, items, { certTags, boardNodes: nodes, cls: cls() });
  const sf = sealFx();
  s.maxHp += sf.hp;
  s.moveSpeed *= (1 + sf.ms);
  return s;
}
function refreshStats(){
  const p = G.player;
  const prevMax = p ? p.stats.maxHp : 0;
  const s = computeStats();
  if (p){
    p.stats = s;
    if (s.maxHp > prevMax) p.hp += s.maxHp - prevMax;
    p.hp = Math.min(p.hp, s.maxHp);
  }
  return s;
}

/* ---------- run lifecycle + migration ---------- */
function migrateRun(run){
  run.loc = run.loc || 'floor';
  if (run.cls) return run;
  run.cls = 'lineman';
  run.seals = run.flags && run.flags.sealDone ? { 1: true } : {};
  run.bossDead = { 1: !!(run.flags && run.flags.bossDead) };
  const remap = obj => {
    const out = {};
    for (const k in obj || {}) out[k.includes(':') && k.split(':').length > 2 ? k : '1:' + k] = obj[k];
    return out;
  };
  run.shrinesDone = remap(run.shrinesDone);
  run.chestsDone = remap(run.chestsDone);
  run.lotoDone = remap(run.lotoDone);
  run.trialStamps = run.trialStamps || 0;
  return run;
}
async function newRun(){
  const chosen = await hud.showClassSelect([C.LINEMAN, C.TESTER, C.FOREMAN]);
  G.run = {
    v: 2, seed: (Math.floor(Math.random() * 2 ** 31)) >>> 0, cls: chosen,
    realm: 1, floorIdx: 0, loc: 'floor', charXp: 0, hp: 110,
    stamps: 0, salvage: 0, volts: 0,
    equipped: { tool: null, hardhat: null, jacket: null, gloves: null, boots: null, meter: null },
    backpack: [], uniquesOwned: [], quests: null,
    shrinesDone: {}, lotoDone: {}, chestsDone: {}, trialStamps: 0,
    seals: {}, bossDead: {}, abyss: null,
    flags: { gotTool: false },
  };
  const base = (C.CLASSES[chosen] || C.LINEMAN).name;
  const names = new Set(saves.list().map(s => s.name));
  let name = base;
  for (let i = 2; names.has(name); i++) name = `${base} ${i}`;
  saves.create({ name, bank: bank.pick(), run: G.run }, Date.now());
  startFloor(0);
}
function saveRun(){
  if (!G.run) return;
  G.run.hp = G.player ? G.player.hp : G.run.hp;
  const id = saves.activeId();
  if (id != null) saves.update(id, G.run, Date.now());
  profile.save();
}

/* ---------- dungeon map (Tab overlay) ---------- */
function markSeen(tx, tz){
  const f = G.floor;
  if (!f || !G.seen) return;
  const R = 7;
  for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++){
    if (dx * dx + dz * dz > R * R) continue;
    const x = tx + dx, z = tz + dz;
    if (x >= 0 && z >= 0 && x < f.w && z < f.h) G.seen[z * f.w + x] = 1;
  }
}
const MAP_COLORS = { exit: '#2dd4bf', abyssExit: '#a855f7', hubgate: '#94a3b8', chest: '#facc15', shrine: '#38bdf8', loto: '#f59e0b', seal: '#a78bfa', toolrack: '#e2e8f0' };
function drawMapNow(){
  const f = G.floor;
  if (!f || !G.player) return;
  const seenAt = (x, z) => G.seen && G.seen[Math.floor(z) * f.w + Math.floor(x)];
  const markers = [];
  for (const it of G.interactables){
    const color = MAP_COLORS[it.kind];
    if (color && seenAt(it.x, it.z)) markers.push({ x: it.x, z: it.z, color });
  }
  if (G.bossEnt && seenAt(G.bossEnt.x, G.bossEnt.z)) markers.push({ x: G.bossEnt.x, z: G.bossEnt.z, color: '#e5484d' });
  hud.drawMap({ w: f.w, h: f.h, tiles: f.tiles, seen: G.seen, markers, player: { x: G.player.x, z: G.player.z } });
}

function clearWorld(){
  hud.setInteract(null);
  hud.hideMap();
  hud.setWarp(false);
  G.npcs = []; // actor groups are children of hubGroup — removed with it
  G.hubAnim = null;
  G.seen = null; G.lastSeen = null;
  if (G.floorGroup) scene.remove(G.floorGroup);
  if (G.hubGroup) scene.remove(G.hubGroup);
  if (G.hazGroup) scene.remove(G.hazGroup);
  for (const e of G.entities) scene.remove(e.actor.group);
  for (const d of G.drops) scene.remove(d.group);
  for (const z of G.zones) if (z.decal) scene.remove(z.decal);
  for (const i of G.interactables) if (i.group) scene.remove(i.group);
  for (const s of G.summons) scene.remove(s.actor ? s.actor.group : s.group);
  for (const b of G.barricades) scene.remove(b.mesh);
  for (const pr of [...G.projectiles, ...G.pshots]) if (pr.mesh) scene.remove(pr.mesh);
  if (G.playerActor) scene.remove(G.playerActor.group);
  if (G.wedges){ G.wedges.meshes.forEach(m => scene.remove(m)); G.wedges = null; }
  if (G.pads){ G.pads.forEach(p => scene.remove(p.mesh)); G.pads = null; }
  if (G.mech && G.mech.cleanup) G.mech.cleanup();
  if (G.dyn) G.dyn.clear();
  G.entities = []; G.projectiles = []; G.pshots = []; G.zones = []; G.drops = [];
  G.interactables = []; G.summons = []; G.barricades = [];
  G.barricadeBlocked.clear();
  G.bossEnt = null; G.sealGroup = null; G.mech = null; G.pendingBlast = null;
  G.hubGroup = null; G.hazTiles = {}; G.wallCut = null;
}

function spawnEnemy(id, x, z){
  const def = ENEMIES[id];
  const actor = makeEnemyMesh(def);
  actor.group.position.set(x, 0, z);
  scene.add(actor.group);
  const e = {
    def, id, x, z, hp: def.hp, hpMax: def.hp, state: def.boss ? 'waiting' : 'idle', t: 0,
    actor, hb: makeHealthBar(actor.group, def.boss ? 3.5 : 1.6, def.boss ? 4.6 : (def.look.scale > 1.2 ? 3.2 : 2.2)),
    moving: false, dying: false, shield: 0,
  };
  if (def.boss){ e.bs = C.makeBossState(def); e.home = { x, z }; }
  e.hb.set(1);
  G.entities.push(e);
  return e;
}

function makePlayerActor(){
  const actor = (PLAYER_BUILDERS[G.run.cls] || PLAYER_BUILDERS.lineman)();
  G.playerActor = actor;
  scene.add(actor.group);
  return actor;
}

function startFloor(floorIdx){
  clearWorld();
  const run = G.run;
  run.floorIdx = floorIdx;
  run.loc = 'floor';
  const R = realmDef();
  const isBossFloor = floorIdx === R.floors - 1;
  const frng = mulberry32((run.seed + run.realm * 100000 + floorIdx * 1000) >>> 0);
  const floor = genFloor(frng, {
    realm: run.realm, floorIdx,
    roomCount: floorIdx === 0 ? 9 : 11, shrineCount: 2,
    loto: floorIdx > 0, boss: isBossFloor,
    hazard: HAZARDS[run.realm] || undefined,
  });
  G.floor = floor;
  const palette = REALM_PALETTES[R.palette];
  W.applyPalette(scene, lights, palette);
  const built = W.buildFloorMeshes(scene, floor, palette, frng);
  G.floorGroup = built.group; G.blocked = built.blocked;
  G.wallCut = W.makeWallCutaway(built.walls);
  G.collider = W.makeCollider(floor, built.blocked, G.barricadeBlocked);
  const hz = W.buildHazardTiles(scene, floor.hazards, HAZ_COLORS);
  G.hazGroup = hz.group; G.hazTiles = hz.tileSets;
  G.dyn = G.dyn || W.makeDynamicHazards(scene, HAZ_COLORS);

  const actor = makePlayerActor();
  const stats = computeStats();
  G.player = {
    x: floor.start.x + 0.5, z: floor.start.y + 0.5,
    hp: Math.min(run.hp, stats.maxHp), stats,
    cds: { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, dodge: 0 }, atkCd: 0,
    dodging: null, dashAtk: null, rubberT: 0, blanketT: 0, iframesT: 0,
    overtemp: { stacks: 0, onT: 0, shedT: 0, dmgT: 0 },
    emberT: 0, meggerT: 0, divPulseCd: 0, cat4Cd: 0, level: charLevel(),
  };
  actor.group.position.set(G.player.x, 0.35, G.player.z);
  rig.snap(new THREE.Vector3(G.player.x, 0, G.player.z));
  G.seen = new Uint8Array(floor.w * floor.h);
  G.lastSeen = null;
  markSeen(Math.floor(G.player.x), Math.floor(G.player.z));

  const table = PACK_TABLE[run.realm];
  for (const pack of floor.packs){
    const room = floor.rooms[pack.room];
    if (run.realm === 1 && floorIdx === 0 && !run.flags.gotTool && room.order === 1) continue;
    for (const slot of pack.slots){
      const pool = table[slot.kind] || table.trash;
      spawnEnemy(rngPick(frng, pool), slot.x + 0.5, slot.y + 0.5);
    }
  }

  const accent = palette.accent;
  const key3 = roomId => `${run.realm}:${floorIdx}:${roomId}`;
  for (const room of floor.rooms){
    if (room.type === 'shrine'){
      const key = key3(room.id);
      const g = W.buildShrine(accent);
      g.position.set(room.cx + 0.5, 0, room.cy + 0.5);
      scene.add(g);
      G.interactables.push({ kind: 'shrine', key, group: g, x: room.cx + 0.5, z: room.cy + 0.5, done: !!run.shrinesDone[key] });
      if (run.shrinesDone[key]) g.userData.lens.material.emissiveIntensity = 0.15;
    }
    if (room.type === 'treasure'){
      const key = key3(room.id);
      const g = W.buildChest('#facc15');
      g.position.set(room.cx + 0.5, 0, room.cy + 0.5);
      scene.add(g);
      if (run.chestsDone[key]) W.openChest(g); // looted chests stay visible, clearly opened
      else G.interactables.push({ kind: 'chest', key, group: g, x: room.cx + 0.5, z: room.cy + 0.5 });
    }
    if (room.type === 'exit'){
      const g = W.buildExitPad(accent);
      g.position.set(room.cx + 0.5, 0, room.cy + 0.5);
      scene.add(g);
      G.interactables.push({ kind: 'exit', group: g, x: room.cx + 0.5, z: room.cy + 0.5 });
    }
    if (room.type === 'boss'){
      const boss = spawnEnemy(BOSS_BY_REALM[run.realm], room.cx + 0.5, room.cy + 0.5);
      G.bossEnt = boss;
      if (run.bossDead[run.realm]){
        scene.remove(boss.actor.group);
        G.entities = G.entities.filter(e => e !== boss);
        G.bossEnt = null;
        placeSeal(room, accent);
      }
    }
  }
  if (run.realm === 1 && floorIdx === 0 && !run.flags.gotTool){
    const startRoom = floor.rooms.find(r => r.type === 'start');
    const g = W.buildChest('#e2e8f0');
    g.position.set(startRoom.cx + 2.5, 0, startRoom.cy + 0.5);
    scene.add(g);
    G.interactables.push({ kind: 'toolrack', group: g, x: startRoom.cx + 2.5, z: startRoom.cy + 0.5 });
  }
  if (floorIdx === 0){
    // way back to the Workbench at the realm entrance
    const startRoom = floor.rooms.find(r => r.type === 'start');
    const g = W.buildExitPad(0x94a3b8);
    g.position.set(startRoom.cx - 2.5, 0, startRoom.cy + 0.5);
    scene.add(g);
    G.interactables.push({ kind: 'hubgate', group: g, x: startRoom.cx - 2.5, z: startRoom.cy + 0.5 });
  }
  if (floor.lotoDoor && !run.lotoDone[`${run.realm}:${floorIdx}`]){
    const g = W.buildLotoDoor();
    g.position.set(floor.lotoDoor.x + 0.5, 0, floor.lotoDoor.y + 0.5);
    g.rotation.y = floor.lotoDoor.horiz ? Math.PI / 2 : 0; // stand across the corridor
    scene.add(g);
    const keys = (floor.lotoDoor.tiles || [{ x: floor.lotoDoor.x, y: floor.lotoDoor.y }]).map(t => t.x + ',' + t.y);
    keys.forEach(k => G.blocked.add(k));
    G.interactables.push({ kind: 'loto', group: g, x: floor.lotoDoor.x + 0.5, z: floor.lotoDoor.y + 0.5, tiles: keys });
  }

  hud.setLocation(R.name, ` — Floor ${floorIdx + 1}${isBossFloor ? ' · ' + ENEMIES[BOSS_BY_REALM[run.realm]].name : ''}`);
  if (floorIdx === 0) hud.banner(R.name, { sub: `Realm ${run.realm} — re-energize the Substation Seal`, color: 'rgba(45,212,191,0.4)' });
  hud.setAbilities(abilityChips());
  hud.setWarp(true, warpToTown);
  fx.setAmbient(AMBIENT[run.realm]);
  G.mode = 'play';
  updateHud();
  saveRun();
}

function placeSeal(room, accent){
  const g = W.buildSeal(accent);
  g.position.set(room.cx + 0.5, 0, room.cy + 0.5);
  scene.add(g);
  G.sealGroup = g;
  if (G.run.seals[G.run.realm]){
    W.energizeSeal(g);
    // stamped seals carry you home — boss floors have no exit pad
    G.interactables.push({ kind: 'hubgate', group: g, x: room.cx + 0.5, z: room.cy + 0.5 });
  } else G.interactables.push({ kind: 'seal', group: g, x: room.cx + 0.5, z: room.cy + 0.5 });
}

/* ---------- town hub ---------- */
// design guard: the shop and quest board pay/charge VOLTS ONLY — Stamps, Salvage
// and question answers are the learning economy and are never bought or sold.
function maxRealm(){
  let m = 1;
  for (let r = 2; r <= 5; r++) if (G.run.seals[r - 1]) m = r;
  return m;
}
const QUEST_DEFS = {
  kills: r => ({ need: 15, volts: 60 * r }),
  chests: r => ({ need: 3, volts: 50 * r }),
  answers: r => ({ need: 8, volts: 55 * r }),
};
function makeQuest(){
  const r = maxRealm();
  const type = ['kills', 'chests', 'answers'][Math.floor(grng() * 3)];
  const d = QUEST_DEFS[type](r);
  return { type, need: d.need, done: 0, claimed: false, reward: { volts: d.volts } };
}
function ensureQuests(){
  if (!G.run.quests) G.run.quests = [makeQuest(), makeQuest(), makeQuest()]; // older saves: default in
  else G.run.quests = G.run.quests.map(q => q.claimed ? makeQuest() : q);
}
function bumpQuest(type, n = 1){
  if (!G.run || !G.run.quests) return;
  for (const q of G.run.quests){
    if (q.type !== type || q.claimed || q.done >= q.need) continue;
    q.done = Math.min(q.need, q.done + n);
    if (q.done >= q.need) hud.toast('Work order complete — claim it at the town board.');
  }
}
function rollShopStock(){
  const r = maxRealm();
  const stock = [];
  for (let i = 0; i < 6; i++){
    const rarity = i < 4 ? 'rated' : 'certified';
    const item = L.makeItem(L.SLOTS[Math.floor(grng() * 6)], r, rarity, grng);
    item.identified = true;
    item.affixes.forEach(a => { a.label = L.affixLabel(a); });
    stock.push({ item, price: (rarity === 'rated' ? 30 : 90) * item.ilvl, sold: false });
  }
  return stock;
}
const TOWNSFOLK = [
  { name: 'Marge the Meter Tech', look: { coat: 0x475569, vest: 0xfacc15, hat: 0xe2e8f0 }, lines: [
    'Every meter in town reads zero except mine. Mine reads hope.',
    'Calibrate twice, certify once. The Grid remembers sloppy work.',
    'I can tell which realm you cleared by the ripple on the line. Today it hums a little cleaner.',
  ] },
  { name: 'Sal from Supply', look: { coat: 0x334155, vest: 0xf97316, hat: 0xfacc15 }, lines: [
    'The Shack takes Volts, friend. Stamps are between you and the inspector.',
    'Gloves, boots, meters — all Rare. Magic-grade if the manifest was kind this week.',
    'Prices scale with the realm. So does the quality. Funny how that works.',
  ] },
  { name: 'Dispatcher Ruiz', look: { coat: 0x2f5d44, hat: 0xe2e8f0 }, lines: [
    'Board has work orders if you want paying. This town runs on cleared faults.',
    'Five realms, one feeder. Every Seal you stamp, my switchboard lights up a little.',
    'No overtime down there. Just Volts and whatever you drag back up.',
  ] },
  { name: 'Old Wick', look: { coat: 0x584634, hat: 0x8a6a42, skin: 0xc9a37f }, lines: [
    'Wired this square before the Grid failed. The lamps still hold my splices.',
    'The Arc Caldera? Watched it energize once. Kept my eyes down ever since.',
    'You kids lockout-tagout with one question. We needed the whole book.',
  ] },
];
function enterHub(){
  clearWorld();
  G.mode = 'hub';
  G.run.loc = 'hub';
  // mountain-meadow daylight
  scene.fog = new THREE.Fog(0x9cc0dd, 34, 110);
  scene.background = new THREE.Color(0x9cc0dd);
  lights.hemi.color.set(0xcfe3f2); lights.hemi.groundColor.set(0x44603a); lights.hemi.intensity = 0.95;
  lights.sun.color.set(0xfff4d6); lights.sun.intensity = 1.05;
  if (G.run.abyss) endAbyssRun(); // any stray path into town banks the run
  const hub = W.buildHub(scene, REALM_PALETTES, G.run.seals, loadAbyssRecords());
  G.hubGroup = hub.group;
  G.collider = hub.collider;
  G.interactables = hub.interactables;
  G.hubBounds = hub.bounds;
  G.hubAnim = hub.animate;
  ensureQuests();
  G.hubShop = rollShopStock(); // fresh stock every town visit
  const NPC_SPOTS = [[13, 19.5], [30.5, 19.5], [15, 8.5], [29, 8.5]];
  TOWNSFOLK.forEach((def, i) => {
    const actor = makeTownsfolk(def.look);
    const [x, z] = NPC_SPOTS[i % NPC_SPOTS.length];
    actor.group.position.set(x, actor.group.userData.baseY, z);
    hub.group.add(actor.group); // parented under the hub group — clearWorld sweeps it
    const it = { kind: 'talk', label: def.name, x, z };
    G.interactables.push(it);
    G.npcs.push({ def, actor, it, x, z, tx: null, tz: null, waitT: 1 + i, lineIdx: Math.floor(grng() * def.lines.length) });
  });
  const actor = makePlayerActor();
  if (!G.player){ // resuming straight into the hub — no floor ever built a player
    const stats = computeStats();
    G.player = {
      x: hub.start.x, z: hub.start.z, hp: stats.maxHp, stats,
      cds: { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, dodge: 0 }, atkCd: 0,
      dodging: null, dashAtk: null, rubberT: 0, blanketT: 0, iframesT: 0,
      overtemp: { stacks: 0, onT: 0, shedT: 0, dmgT: 0 },
      emberT: 0, meggerT: 0, divPulseCd: 0, cat4Cd: 0, level: charLevel(),
    };
  }
  refreshStats();
  G.player.x = hub.start.x; G.player.z = hub.start.z;
  G.player.hp = G.player.stats.maxHp; // full heal at the bench
  actor.group.position.set(G.player.x, 0.35, G.player.z);
  rig.snap(new THREE.Vector3(G.player.x, 0, G.player.z));
  hud.setLocation('Terminal Town', ' — beneath the falls');
  hud.setAbilities(abilityChips());
  fx.setAmbient(null);
  updateHud();
  saveRun();
}
function warpToTown(){
  if (G.mode !== 'play' || G.paused) return;
  if (G.run.abyss){
    const res = endAbyssRun();
    hud.toast(`Abyss run banked — Depth ${res.rec.depth}, ${res.rec.kills} kills.`);
  }
  saveRun();
  hud.toast('Warping back to Terminal Town…');
  enterHub();
}

/* ---------- The Abyss: endless mode behind the cave ---------- */
const ABYSS_KEY = 'arcdescent.abyss.v1';
function loadAbyssRecords(){
  try {
    const d = JSON.parse(store.get(ABYSS_KEY));
    if (Array.isArray(d)) return d;
  } catch (e){}
  return [];
}
// close out the current abyss run: record it, keep the top 5 by depth then kills
function endAbyssRun(){
  const a = G.run.abyss;
  if (!a) return null;
  const rec = { depth: a.depth, kills: a.kills, cls: cls().name, ts: Date.now() };
  const all = [...loadAbyssRecords(), rec].sort((x, y) => y.depth - x.depth || y.kills - x.kills);
  const top = all.slice(0, 5);
  store.set(ABYSS_KEY, JSON.stringify(top));
  G.run.abyss = null;
  return { rec, top, isTop: top.includes(rec) };
}
async function abyssDeathFlow(){
  profile.data.stats.deaths++;
  profile.save();
  const res = endAbyssRun();
  const rows = res.top.map((r, i) =>
    `${i + 1}. Depth ${r.depth} · ${r.kills} kills · ${r.cls}${r === res.rec ? ' <b style="color:var(--teal)">← this run</b>' : ''}`).join('<br>');
  await hud.dialog({
    title: 'The Abyss takes you',
    sub: `Depth ${res.rec.depth} · ${res.rec.kills} kills`,
    body: `${res.isTop ? '<b style="color:var(--teal)">Carved into the stone outside.</b><br><br>' : ''}
      <span style="color:var(--dim)">Deepest descents:</span><br>${rows}`,
    buttons: ['Back to town'],
  });
  enterHub(); // rebuilds the player at full health and refreshes the record board
}
// depth scaling: roster climbs a realm every 2 depths, then raw multipliers take over
const abyssRealm = d => Math.min(5, Math.ceil(d / 2));
const abyssMult = d => d <= 9 ? 1 + 0.05 * d : 1.45 * Math.pow(1.12, d - 9);
function startAbyssFloor(depth){
  clearWorld();
  const run = G.run;
  run.abyss = { depth, kills: (run.abyss && run.abyss.kills) || 0 };
  run.loc = 'abyss';
  const realm = abyssRealm(depth);
  run.realm = realm;            // question routing + loot ilvl follow the depth
  run.floorIdx = 100 + depth;   // keys (LOTO etc.) can never collide with campaign floors
  const R = REALMS[realm];
  const frng = mulberry32((run.seed + 777000 + depth * 1013) >>> 0);
  const floor = genFloor(frng, {
    realm, floorIdx: depth,
    roomCount: Math.min(16, 8 + Math.floor(depth / 2)), // progressively longer
    shrineCount: 2, loto: depth > 1, boss: false,
    hazard: HAZARDS[realm] || undefined,
  });
  G.floor = floor;
  const palette = REALM_PALETTES[R.palette];
  W.applyPalette(scene, lights, palette);
  const built = W.buildFloorMeshes(scene, floor, palette, frng);
  G.floorGroup = built.group; G.blocked = built.blocked;
  G.wallCut = W.makeWallCutaway(built.walls);
  G.collider = W.makeCollider(floor, built.blocked, G.barricadeBlocked);
  const hz = W.buildHazardTiles(scene, floor.hazards, HAZ_COLORS);
  G.hazGroup = hz.group; G.hazTiles = hz.tileSets;
  G.dyn = G.dyn || W.makeDynamicHazards(scene, HAZ_COLORS);

  const actor = makePlayerActor();
  const stats = computeStats();
  G.player = {
    x: floor.start.x + 0.5, z: floor.start.y + 0.5,
    hp: Math.min(run.hp, stats.maxHp), stats,
    cds: { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, dodge: 0 }, atkCd: 0,
    dodging: null, dashAtk: null, rubberT: 0, blanketT: 0, iframesT: 0,
    overtemp: { stacks: 0, onT: 0, shedT: 0, dmgT: 0 },
    emberT: 0, meggerT: 0, divPulseCd: 0, cat4Cd: 0, level: charLevel(),
  };
  actor.group.position.set(G.player.x, 0.35, G.player.z);
  rig.snap(new THREE.Vector3(G.player.x, 0, G.player.z));
  G.seen = new Uint8Array(floor.w * floor.h);
  G.lastSeen = null;
  markSeen(Math.floor(G.player.x), Math.floor(G.player.z));

  // progressively harder: full HP scaling, softened hit scaling on a def clone
  const m = abyssMult(depth);
  const table = PACK_TABLE[realm];
  for (const pack of floor.packs) for (const slot of pack.slots){
    const e = spawnEnemy(rngPick(frng, table[slot.kind] || table.trash), slot.x + 0.5, slot.y + 0.5);
    e.hp = e.hpMax = Math.round(e.hpMax * m);
    if (m > 1){
      const hm = 1 + (m - 1) * 0.6;
      const def = { ...e.def };
      def.hit = Array.isArray(def.hit) ? def.hit.map(v => Math.round(v * hm)) : Math.round(def.hit * hm);
      e.def = def;
    }
    e.hb.set(1);
  }

  const accent = palette.accent;
  const key3 = roomId => `a${depth}:${roomId}`;
  for (const room of floor.rooms){
    if (room.type === 'shrine'){
      const key = key3(room.id);
      const g = W.buildShrine(accent);
      g.position.set(room.cx + 0.5, 0, room.cy + 0.5);
      scene.add(g);
      G.interactables.push({ kind: 'shrine', key, group: g, x: room.cx + 0.5, z: room.cy + 0.5, done: !!run.shrinesDone[key] });
      if (run.shrinesDone[key]) g.userData.lens.material.emissiveIntensity = 0.15;
    }
    if (room.type === 'treasure'){
      const key = key3(room.id);
      const g = W.buildChest('#facc15');
      g.position.set(room.cx + 0.5, 0, room.cy + 0.5);
      scene.add(g);
      if (run.chestsDone[key]) W.openChest(g);
      else G.interactables.push({ kind: 'chest', key, group: g, x: room.cx + 0.5, z: room.cy + 0.5 });
    }
    if (room.type === 'exit'){
      const g = W.buildExitPad(0xa855f7);
      g.position.set(room.cx + 0.5, 0, room.cy + 0.5);
      scene.add(g);
      G.interactables.push({ kind: 'abyssExit', group: g, x: room.cx + 0.5, z: room.cy + 0.5 });
    }
  }
  if (floor.lotoDoor && !run.lotoDone[`${run.realm}:${run.floorIdx}`]){
    const g = W.buildLotoDoor();
    g.position.set(floor.lotoDoor.x + 0.5, 0, floor.lotoDoor.y + 0.5);
    g.rotation.y = floor.lotoDoor.horiz ? Math.PI / 2 : 0;
    scene.add(g);
    const keys = floor.lotoDoor.tiles.map(t => t.x + ',' + t.y);
    keys.forEach(k => G.blocked.add(k));
    G.interactables.push({ kind: 'loto', group: g, x: floor.lotoDoor.x + 0.5, z: floor.lotoDoor.y + 0.5, tiles: keys });
  }

  hud.setLocation('The Abyss', ` — Depth ${depth}`);
  hud.banner(`Depth ${depth}`, {
    sub: depth === 1 ? 'The Abyss — no Safety Briefings down here' : `enemies ×${m.toFixed(2)}`,
    color: 'rgba(168,85,247,0.5)',
  });
  hud.setAbilities(abilityChips());
  hud.setWarp(true, warpToTown);
  fx.setAmbient(AMBIENT[realm]);
  G.mode = 'play';
  updateHud();
  saveRun();
}

/* ---------- questions plumbing ---------- */
async function ask(opts = {}, ui = {}){
  G.paused = true;
  const R = realmDef();
  const q = Q.nextQuestion(grng, profile.data, bank.all(), G.session, {
    realm: G.run.realm, realmCat: R.cat, mixCats: R.mixCats.length ? R.mixCats : undefined, mixP: R.mixP, ...opts,
  });
  const correct = await hud.askQuestion(q, ui);
  const newly = Q.recordAnswer(profile.data, q, correct);
  if (correct){
    G.session.correct.add(Q.qKey(q));
    bumpQuest('answers');
    profile.addXP(XP.correct + (newly ? XP.master : 0));
    G.run.charXp += XP.charCorrect;
    Snd.correct();
    if (newly) hud.toast(`★ Mastered: ${(q.category || 'GEN').toUpperCase()} question`);
  } else Snd.wrong();
  checkLevelUp();
  profile.save();
  G.paused = false;
  return correct;
}

function checkLevelUp(){
  const now = charLevel();
  if (G.player && now > (G.player.level || 0)){
    if (G.player.level){
      hud.toast(`Level up! Lv ${now}`);
      Snd.levelup();
      fx.fountain(G.playerActor.group.position, 0xfbbf24, 20, 1.0);
      const s = refreshStats();
      G.player.hp = Math.min(s.maxHp, G.player.hp + Math.round(s.maxHp * 0.25));
    }
    G.player.level = now;
  }
}

/* ---------- loot plumbing ---------- */
const RARITY_HEX = { stock: 0xe2e8f0, rated: 0x60a5fa, certified: 0xfacc15, master: 0xf97316 };
function dropItem(item, x, z){
  if (G.collider && !G.collider.walkable(x, z)){
    // never drop into the void — spiral out to the nearest walkable spot
    outer: for (let r = 0.5; r <= 6; r += 0.5)
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8){
        const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r;
        if (G.collider.walkable(nx, nz)){ x = nx; z = nz; break outer; }
      }
  }
  const g = W.makeLootBeam(RARITY_HEX[item.rarity]);
  g.position.set(x, 0, z);
  scene.add(g);
  G.drops.push({ item, x, z, group: g });
}
function rollAndDrop(source, x, z, n = 1){
  for (let i = 0; i < n; i++){
    const owned = new Set(G.run.uniquesOwned);
    const item = L.rollDrop(G.run.realm, source, grng, owned);
    if (item.uniqueId) G.run.uniquesOwned.push(item.uniqueId);
    dropItem(item, x + (i - n / 2) * 0.8, z + 0.5);
  }
  G.run.volts += L.voltDrop(G.run.realm, source === 'chestUpgraded' ? 'chest' : source, grng);
}
function pickupDrops(){
  const p = G.player;
  for (let i = G.drops.length - 1; i >= 0; i--){
    const d = G.drops[i];
    if (C.dist2d(p.x, p.z, d.x, d.z) < 1.2){
      scene.remove(d.group);
      G.drops.splice(i, 1);
      // opt-in auto-scrap: Common/Rare drops break down on pickup (never a tool while you have none)
      if (profile.data.autoScrap && (d.item.rarity === 'stock' || d.item.rarity === 'rated')
          && !(d.item.slot === 'tool' && !G.run.equipped.tool)){
        const sv = L.salvageValue(d.item, p.stats.salvagePct);
        G.run.salvage += sv;
        Snd.pickup();
        hud.pickupItem(d.item, ` <span style="color:var(--dim);font-weight:400">⚒ scrapped +${sv} salvage</span>`);
        updateHud();
        continue;
      }
      G.run.backpack.push(d.item);
      Snd.pickup();
      hud.pickupItem(d.item, d.item.identified === false ? ' <span style="color:var(--dim);font-weight:400">unidentified — press I</span>' : '');
      if (hud.inventoryOpen()) openInventoryFlow(); // live refresh
    }
  }
}

/* ---------- hazard helpers ---------- */
function staticHazAt(kind, x, z){
  const set = G.hazTiles[kind];
  return set ? set.get(Math.floor(x) + ',' + Math.floor(z)) : undefined;
}
function hazAt(kind, x, z){
  return staticHazAt(kind, x, z) !== undefined || (G.dyn && G.dyn.has(kind, x, z));
}
// pool id: static pools have patch ids; dynamic pool tiles all share 'dyn'
function poolAt(x, z){
  const s = staticHazAt('pool', x, z);
  if (s !== undefined) return 'p' + s.poolId;
  if (G.dyn && G.dyn.has('pool', x, z)) return 'dyn';
  return null;
}
function inBrownout(x, z){
  if (hazAt('brownout', x, z)) return true;
  for (const e of G.entities){
    if (e.dying) continue;
    const sp = e.def.special, el = e.def.elite;
    const r = (sp && sp.kind === 'aura') ? sp.radius : (el && el.modifier === 'auraVent') ? el.radius : 0;
    if (r && C.dist2d(e.x, e.z, x, z) <= r) return true;
  }
  return false;
}

/* ---------- interaction flows ---------- */
async function shrineFlow(it){
  if (it.done){ hud.toast('This shrine is already certified.'); return; }
  let correct = 0;
  for (let i = 0; i < 2; i++){
    const ok = await ask({}, { title: 'Junction Shrine', sub: `Question ${i + 1} of 2 — answer both for an upgraded cache` });
    if (ok){ correct++; addStamps(ECON.stamps.shrineCorrect); }
  }
  if (correct === 2 && G.player.stats.stampShrine) addStamps(G.player.stats.stampShrine);
  it.done = true;
  G.run.shrinesDone[it.key] = true;
  G.run.charXp += XP.charShrine;
  checkLevelUp();
  it.group.userData.lens.material.emissiveIntensity = correct === 2 ? 1.4 : 0.15;
  fx.burst(it.group.position, correct === 2 ? 0x4ade80 : 0x8a94a6, 18, 4, 0.6);
  rollAndDrop(correct === 2 ? 'chestUpgraded' : 'chest', it.x, it.z, ECON.shrineChestDrops);
  hud.toast(correct === 2 ? 'Junction certified — upgraded cache!' : `Cache opened (${correct}/2).`);
  profile.data.stats.shrines++;
  saveRun(); updateHud();
}

async function lotoFlow(it){
  const ok = await ask({ diff: 'hard' }, { title: 'Lockout / Tagout', sub: 'One hard question opens the shortcut. The long way is always there.' });
  if (ok){
    addStamps(ECON.stamps.loto);
    G.run.lotoDone[`${G.run.realm}:${G.run.floorIdx}`] = true;
    (it.tiles || []).forEach(k => G.blocked.delete(k));
    scene.remove(it.group);
    G.interactables = G.interactables.filter(x => x !== it);
    Snd.seal();
    hud.toast('Locks off — shortcut open. +2 Stamps');
  } else hud.toast('Tag stays on. Take the long route.');
  saveRun(); updateHud();
}

async function idFlow(item){
  const ok = await ask({}, { title: 'Identification', sub: `What did you find? Answer to calibrate: ${item.base}` });
  L.identify(item, ok, grng);
  if (ok){ addStamps(ECON.stamps.idCorrect); hud.toast('Identified with a bonus calibration. +1 Stamp'); }
  else hud.toast('Identified (no bonus).');
  refreshStats(); saveRun(); updateHud();
}

async function briefingFlow(){
  G.mode = 'modal';
  profile.data.stats.deaths++;
  const ok = await ask({ diff: 'easy', tierUp: false }, { title: 'Safety Briefing', sub: 'Walk it back. What went wrong out there?' });
  const floor = G.floor;
  const s = refreshStats();
  G.player.hp = s.maxHp;
  G.player.overtemp = { stacks: 0, onT: 0, shedT: 0, dmgT: 0 };
  G.playerActor.dead = false; G.playerActor.deadT = 0;
  G.playerActor.group.rotation.x = 0; G.playerActor.group.scale.y = 1;
  G.playerActor.meshes.forEach(m => { m.material.opacity = 1; m.material.transparent = false; });
  if (ok || G.run.floorIdx === 0){
    G.player.x = floor.start.x + 0.5; G.player.z = floor.start.y + 0.5;
    hud.toast('Back on the floor. Nothing lost.');
    G.mode = 'play';
  } else {
    G.run.hp = s.maxHp;
    hud.toast('Back to the realm entrance. Nothing lost.');
    startFloor(0);
  }
  updateHud();
}

async function breakFlow(boss){
  hud.toast('INSPECTION BREAK — answer to strip the shield!');
  Snd.beep(440, 0.09, 'square');
  const B = boss.def.boss;
  const mixOpts = B.breakMixCats ? { mixCats: B.breakMixCats, mixP: B.breakMixP } : {};
  while (boss.bs.phase === 'break' && boss.hp > 0){
    const shieldPct = Math.max(0, Math.round(boss.bs.shield));
    const ok = await ask({ tierUp: true, ...mixOpts }, { title: 'Inspection Break', sub: `Shield integrity ${shieldPct}% — each correct answer strips it fast` });
    if (ok){ addStamps(ECON.stamps.breakCorrect); } else boss.bs.breakMissed = true;
    C.bossBreakAnswer(boss, ok);
    if (boss.bs.shield <= 0){
      const stag = boss.bs.breakCorrect >= 2;
      boss.bs.phase = stag ? 'stagger' : 'p2';
      boss.bs.afterStagger = stag ? 'p2' : null;
      boss.bs.t = 0;
      hud.toast(stag ? 'Shield stripped — it staggers!' : 'Shield down. Phase two.');
      break;
    }
  }
  updateHud();
}

async function trialFlow(){
  const R = realmDef();
  const realm = G.run.realm;
  if (G.run.seals[realm]){ hud.toast('This Seal already hums.'); return; }
  const len = R.trialLen;
  const rewards = TRIAL_REWARDS[realm];
  let streak = 0;
  hud.banner('Certification Trial', { sub: 'Permit to energize — hold the streak.', color: 'rgba(245,166,35,0.45)' });
  for (let i = 0; i < len; i++){
    const ok = await ask({ tierUp: true }, { title: 'Certification Trial', sub: `Inspection — streak ${streak}/${len} · misses end the streak, banked rewards stay` });
    if (!ok){ hud.toast(`Streak broken at ${streak}/${len}. Step up and retry — the pool favors what you haven't mastered.`); saveRun(); updateHud(); return; }
    streak++;
    if (G.run.trialStamps < len * ECON.trialStampCapMult){ addStamps(ECON.stamps.trialCorrect); G.run.trialStamps++; }
    const rw = rewards[streak - 1];
    if (rw && !rw.pass){
      if (rw.salvage){ G.run.salvage += rw.salvage; hud.toast(`Stamp lands. +${rw.salvage} Salvage banked.`); }
      if (rw.drop){
        for (let k = 0; k < (rw.n || 1); k++){
          const rarity = rw.drop === 'rated' ? 'rated' : 'certified';
          const slot = rw.drop === 'certifiedMeter' ? 'meter' : L.SLOTS[Math.floor(grng() * 6)];
          const it = L.makeItem(slot, realm, rarity, grng);
          it.identified = rarity === 'rated';
          dropItem(it, G.sealGroup.position.x - 2 + k, G.sealGroup.position.z);
        }
        hud.toast('Cache banked at the Seal.');
      }
    }
  }
  // PASS
  const passRw = rewards[rewards.length - 1];
  addStamps(ECON.stamps.trialPassBonus);
  G.run.charXp += XP.charTrial;
  let cert = null;
  if (passRw.mcChance && grng() < passRw.mcChance){
    for (let i = 0; i < 30 && (!cert || cert.rarity !== 'master'); i++)
      cert = L.rollDrop(realm, 'boss', grng, new Set(G.run.uniquesOwned));
    if (cert.rarity !== 'master') cert = null;
  }
  cert = cert || L.makeItem(L.SLOTS[Math.floor(grng() * 6)], realm, 'certified', grng);
  if (cert.uniqueId) G.run.uniquesOwned.push(cert.uniqueId);
  cert.identified = false;
  dropItem(cert, G.sealGroup.position.x + 2, G.sealGroup.position.z);
  for (let k = 0; k < (passRw.cache || 0); k++)
    dropItem(L.makeItem(L.SLOTS[Math.floor(grng() * 6)], realm, 'certified', grng), G.sealGroup.position.x + 3 + k, G.sealGroup.position.z);
  G.run.seals[realm] = true;
  W.energizeSeal(G.sealGroup);
  G.interactables = G.interactables.filter(x => x.kind !== 'seal');
  G.interactables.push({ kind: 'hubgate', group: G.sealGroup, x: G.sealGroup.position.x, z: G.sealGroup.position.z });
  fx.fountain(G.sealGroup.position, REALM_PALETTES[R.palette].accent, 40, 1.6);
  Snd.seal();
  refreshStats();
  profile.data.stats.trials++; profile.data.stats.seals++;
  profile.addXP(150);
  checkLevelUp(); saveRun(); updateHud();
  hud.banner('Seal Re-Energized', { sub: `${R.name} — ${R.sealBuff.name}`, color: 'rgba(52,199,89,0.45)', dur: 4.5 });
  const nextR = REALMS[realm + 1];
  const choice = await hud.dialog({
    title: `${R.name.toUpperCase()} SEAL RE-ENERGIZED`,
    sub: `${R.sealBuff.name}: ${R.sealBuff.desc}.`,
    body: realm < 5
      ? `Power shoves downstream toward <b>${nextR.name}</b>. The Workbench can forge what you carry, and the next gate is open.`
      : `The Grid hums, end to end. Every Seal is stamped — the descent is complete.<br><br>
         <span style="color:var(--dim)">Mastery, gear, and stamps persist. Keep clearing realms for CERTIFIED gear and the uniques you're missing.</span>`,
    buttons: realm < 5 ? ['Keep exploring', 'To the Workbench'] : ['Walk the grid'],
  });
  if (realm < 5 && choice === 1) enterHub();
}

async function forgeFlow(){
  while (true){
    const items = [...Object.values(G.run.equipped).filter(Boolean), ...G.run.backpack];
    for (const it of items) it.affixes.forEach(a => { a.label = L.affixLabel(a); });
    const OPS = [['reinforce', 'Reinforce'], ['certify', 'Certify'], ['recalibrate', 'Recalibrate'], ['respec', 'Re-spec']];
    const entries = items
      .filter(it => it.identified !== false && OPS.some(([op]) => L.canForge(op, it)))
      .map(it => ({
        item: it,
        ops: OPS.filter(([op]) => L.canForge(op, it)).map(([op, label]) => {
          const cost = L.forgeCost(op, it.ilvl);
          return { op, label, cost, can: G.run.stamps >= cost.stamps && G.run.salvage >= cost.salvage };
        }),
      }));
    const pick = await hud.showForge({ entries, stamps: G.run.stamps, salvage: G.run.salvage });
    if (!pick) return;
    const cost = L.forgeCost(pick.op, pick.item.ilvl);
    const ok = await ask({ realm: pick.item.ilvl }, { title: 'Workbench Forge', sub: `${pick.op} ${pick.item.name} — a question at the item's tier. Miss refunds everything.` });
    if (ok){
      G.run.stamps -= cost.stamps;
      G.run.salvage -= cost.salvage;
      L.forgeApply(pick.op, pick.item, grng);
      pick.item.affixes.forEach(a => { a.label = L.affixLabel(a); });
      Snd.levelup();
      hud.toast(`Forged: ${pick.item.name}`);
      refreshStats();
    } else {
      hud.toast('Miss — the bench refunds you. The steel remembers nothing.');
    }
    saveRun(); updateHud();
  }
}

async function boardFlow(){
  const board = C.BOARDS[G.run.cls];
  const mpc = masteryByCat();
  const lvl = charLevel();
  const active = new Set(C.activeBoardNodes(board, lvl, mpc).map(n => n.id));
  const fxLabel = f => Object.entries(f).map(([k, v]) =>
    k === 'dmgPct' ? `+${Math.round(v * 100)}% dmg` : k === 'asPct' ? `+${Math.round(v * 100)}% AS`
    : k === 'hpFlat' ? `+${v} HP` : k === 'armorFlat' ? `+${v} armor` : k).join(', ');
  await hud.showBoard({
    className: cls().name,
    level: lvl,
    nodes: board.map(n => ({
      name: n.name, lvl: n.lvl, gate: n.gate,
      active: active.has(n.id),
      gateBlocked: n.gate && lvl >= n.lvl && (mpc[n.gate.cat] || 0) < n.gate.pct,
      effect: fxLabel(n.fx),
    })),
  });
}

async function openInventoryFlow(){
  const items = G.run.backpack;
  for (const it of [...items, ...Object.values(G.run.equipped)])
    if (it) it.affixes.forEach(a => { a.label = L.affixLabel(a); });
  hud.openInventory({
    equipped: G.run.equipped, items,
    character: { cls: cls().name, level: charLevel(), stats: G.player.stats },
    onEquip: async (it) => {
      if (it.identified === false){ hud.closeInventory(); await idFlow(it); } // then equip it — that's what the click meant
      const cur = G.run.equipped[it.slot];
      G.run.equipped[it.slot] = it;
      G.run.backpack = G.run.backpack.filter(x => x !== it);
      if (cur) G.run.backpack.push(cur);
      if (it.slot === 'tool') G.run.flags.gotTool = true;
      refreshStats(); saveRun(); updateHud();
      openInventoryFlow();
    },
    onSalvage: (it) => {
      G.run.backpack = G.run.backpack.filter(x => x !== it);
      G.run.salvage += L.salvageValue(it, G.player.stats.salvagePct);
      Snd.pickup(); saveRun(); updateHud();
      openInventoryFlow();
    },
    onSalvageAll: (list) => {
      let total = 0;
      for (const it of list) total += L.salvageValue(it, G.player.stats.salvagePct);
      G.run.backpack = G.run.backpack.filter(x => !list.includes(x));
      G.run.salvage += total;
      hud.toast(`Scrapped ${list.length} item${list.length === 1 ? '' : 's'} → +${total} Salvage`);
      Snd.pickup(); saveRun(); updateHud();
      openInventoryFlow();
    },
    onIdentifyAll: () => { hud.closeInventory(); identifyAllFlow(); },
    autoScrap: {
      on: !!profile.data.autoScrap,
      toggle(){
        profile.data.autoScrap = !profile.data.autoScrap;
        this.on = profile.data.autoScrap;
        profile.save();
      },
    },
    onDiscard: (it) => {
      G.run.backpack = G.run.backpack.filter(x => x !== it);
      saveRun(); updateHud();
      openInventoryFlow();
    },
    salvageValue: (it) => L.salvageValue(it, G.player.stats.salvagePct),
    onClose: () => {},
  });
}

// Identify All: a 5-in-a-row question gauntlet; success calibrates every unidentified backpack item
async function identifyAllFlow(){
  const unid = G.run.backpack.filter(i => i.identified === false);
  if (!unid.length) return;
  G.paused = true;
  const R = realmDef();
  const ok = await hud.showIdentifyGauntlet({
    count: unid.length,
    nextQ: () => Q.nextQuestion(grng, profile.data, bank.all(), G.session, {
      realm: G.run.realm, realmCat: R.cat, mixCats: R.mixCats.length ? R.mixCats : undefined, mixP: R.mixP,
    }),
    onAnswer: (q, correct) => {
      const newly = Q.recordAnswer(profile.data, q, correct);
      if (correct){
        G.session.correct.add(Q.qKey(q));
        bumpQuest('answers');
        profile.addXP(XP.correct + (newly ? XP.master : 0));
        G.run.charXp += XP.charCorrect;
        Snd.correct();
        if (newly) hud.toast(`★ Mastered: ${(q.category || 'GEN').toUpperCase()} question`);
      } else Snd.wrong();
      checkLevelUp();
      profile.save();
    },
  });
  G.paused = false;
  if (ok){
    for (const it of unid) L.identify(it, true, grng);
    addStamps(ECON.stamps.idCorrect);
    hud.toast(`Gauntlet passed — ${unid.length} item${unid.length === 1 ? '' : 's'} calibrated with bonus. +1 Stamp`);
    Snd.seal();
    refreshStats(); saveRun(); updateHud();
    openInventoryFlow();
  }
}

async function shopFlow(){
  // Volts sink: sells identified gear only — never stamps, salvage or answers
  while (true){
    const entries = G.hubShop.map(s => ({ item: s.item, price: s.price, sold: s.sold, can: !s.sold && G.run.volts >= s.price }));
    const pick = await hud.showShop({ entries, volts: G.run.volts });
    if (pick === null || pick === undefined) return;
    const s = G.hubShop[pick];
    if (!s || s.sold || G.run.volts < s.price) continue;
    G.run.volts -= s.price;
    s.sold = true;
    G.run.backpack.push(s.item);
    Snd.pickup();
    hud.pickupItem(s.item);
    saveRun(); updateHud();
  }
}

async function questBoardFlow(){
  while (true){
    const pick = await hud.showQuests({ quests: G.run.quests || [] });
    if (pick === null || pick === undefined) return;
    const q = (G.run.quests || [])[pick];
    if (!q || q.claimed || q.done < q.need) continue;
    q.claimed = true;
    G.run.volts += q.reward.volts; // volts only — same design guard as the shop
    Snd.levelup();
    hud.toast(`Work order paid out: +${q.reward.volts} Volts`);
    saveRun(); updateHud();
  }
}

async function statsFlow(){
  await hud.showStats({
    profileStats: profile.data.stats,
    mastery: masteryByCat(),
    run: {
      cls: cls().name, level: charLevel(), realm: realmDef().name,
      seals: [1, 2, 3, 4, 5].filter(r => G.run.seals[r]).length,
      volts: G.run.volts, stamps: G.run.stamps, salvage: G.run.salvage,
    },
  });
}

async function talkFlow(it){
  const n = G.npcs.find(x => x.it === it);
  if (!n) return;
  n.waitT = Math.max(n.waitT, 4); n.tx = null; // pause and face the player
  n.actor.group.rotation.y = -Math.atan2(G.player.z - n.z, G.player.x - n.x) + Math.PI / 2;
  const line = n.def.lines[n.lineIdx++ % n.def.lines.length];
  await hud.dialog({ title: n.def.name, body: line, buttons: ['Later'] });
}

async function interact(it){
  if (it.kind === 'shrine') return shrineFlow(it);
  if (it.kind === 'loto') return lotoFlow(it);
  if (it.kind === 'seal') return trialFlow();
  if (it.kind === 'forge') return forgeFlow();
  if (it.kind === 'shop') return shopFlow();
  if (it.kind === 'quests') return questBoardFlow();
  if (it.kind === 'stats') return statsFlow();
  if (it.kind === 'talk') return talkFlow(it);
  if (it.kind === 'hubgate'){ enterHub(); return; }
  if (it.kind === 'gate'){
    if (it.locked){ hud.toast('This gate is dark — stamp the previous Seal first.'); return; }
    G.run.realm = it.realm;
    G.run.hp = G.player.stats.maxHp;
    hud.toast(`Descending into ${REALMS[it.realm].name}…`);
    startFloor(0);
    return;
  }
  if (it.kind === 'exit'){
    saveRun();
    hud.toast('Descending…');
    startFloor(G.run.floorIdx + 1);
    return;
  }
  if (it.kind === 'abyss'){
    const go = await hud.dialog({
      title: 'The Abyss',
      sub: 'Endless descent — each depth longer and harder than the last.',
      body: `No Safety Briefings down there: when you drop, the run ends and you wake at the falls.
        Depth reached is carved on the stone outside.<br><br>
        <span style="color:var(--dim)">Loot, XP, Stamps and Volts all keep. Warp out any time to bank the run.</span>`,
      buttons: ['Not yet', 'Descend'],
    });
    if (go !== 1) return;
    G.run.abyss = { depth: 0, kills: 0 };
    G.run.hp = G.player.stats.maxHp;
    startAbyssFloor(1);
    return;
  }
  if (it.kind === 'abyssExit'){
    saveRun();
    hud.toast('Deeper…');
    startAbyssFloor(G.run.abyss.depth + 1);
    return;
  }
  if (it.kind === 'toolrack'){
    const tool = L.makeItem('tool', G.run.realm, 'stock', grng);
    G.run.equipped.tool = tool;
    G.run.flags.gotTool = true;
    scene.remove(it.group);
    G.interactables = G.interactables.filter(x => x !== it);
    refreshStats();
    hud.toast(`${tool.name} — right-click to ${cls().basic.type === 'proj' ? 'fire' : 'swing'}. Clear the fault.`);
    Snd.pickup(); saveRun(); updateHud();
    return;
  }
  if (it.kind === 'chest'){
    G.run.chestsDone[it.key] = true;
    bumpQuest('chests');
    W.openChest(it.group);
    rollAndDrop('chest', it.x, it.z, ECON.floorChestDrops);
    G.interactables = G.interactables.filter(x => x !== it);
    Snd.pickup(); saveRun();
    return;
  }
}

/* ---------- combat: player -> enemy ---------- */
function conductToPool(sourceEnemy, dmg, mult){
  const pid = poolAt(sourceEnemy.x, sourceEnemy.z);
  if (!pid) return;
  for (const o of G.entities){
    if (o === sourceEnemy || o.dying) continue;
    if (poolAt(o.x, o.z) === pid) damageEnemy(o, Math.round(dmg * mult), { noConduct: true });
  }
}

// centralized player-hit pipeline: all sig/passive modifiers live here
function playerHit(e, baseDmg, ctx = {}){
  const s = G.player.stats;
  let dmg = baseDmg;
  let crit = false;
  const fullHp = e.hp === e.hpMax;
  if (G.run.cls === 'tester' && fullHp && !ctx.noPassive){ dmg *= (1 + C.TESTER.passive.fullHpBonus); crit = true; } // Calibrated
  if (s.sigs.includes('wiggy')){
    if (fullHp){ dmg *= 1.25; crit = true; }
    if (e.tested > 0) dmg *= 1.10;
  }
  if (s.sigs.includes('meggersEye') && fullHp) dmg *= 1.10;
  if (e.tagged > 0) dmg *= 1.10;
  if (s.sigs.includes('eightyPct')){
    if (e.hp > e.hpMax * 0.8) dmg *= 1.4;
    else if (e.hp < e.hpMax * 0.2) dmg *= 0.9;
    if (!e.hitOnce){ e.hitOnce = true; e.prev = e.state; e.state = 'flinch'; e.t = 0; }
  }
  if (s.sigs.includes('longRun') && e.hp < e.hpMax * 0.3) dmg *= 1.25;
  if (s.sigs.includes('peakShaver') && inBrownout(e.x, e.z)) dmg *= 1.25;
  dmg = Math.round(dmg);
  damageEnemy(e, dmg, { crit });
  // after-effects
  if (s.sigs.includes('longRun')) e.slowT = 2;
  const pid = poolAt(e.x, e.z);
  if (pid && !ctx.noConduct){
    const cMult = s.sigs.includes('class0') ? 0.75 : 0.5;
    conductToPool(e, dmg, cMult);
    if (s.sigs.includes('meggersEye') && G.player.meggerT <= 0){
      G.player.meggerT = 8;
      conductToPool(e, dmg, 1.0);
      fx.burst(e.actor.group.position, 0x2dd4bf, 14, 5, 0.4);
      hud.toast('Insulation test — the fault arcs through the pool.');
    }
  }
  return dmg;
}

function damageEnemy(e, amount, opts = {}){
  if (e.dying || e.hp <= 0) return;
  const boss = e.def.boss;
  if (e.untarget || (boss && ['intro', 'open', 'break', 'waiting'].includes(e.bs.phase)) || (boss && e.state === 'waiting')){
    dmgNums.spawn(e.actor.group.position, 'IMMUNE', '#8a94a6');
    return;
  }
  let dmg = amount;
  if (boss && e.bs.phase === 'stagger') dmg = Math.round(dmg * (1 + (e.def.boss.staggerVuln || 0.25)));
  if (e.vulnerable) dmg = Math.round(dmg * 1.25);
  if (e.shield > 0){
    const absorbed = Math.min(e.shield, dmg);
    e.shield -= absorbed; dmg -= absorbed;
    dmgNums.spawn(e.actor.group.position, String(absorbed), '#94a3b8');
    if (dmg <= 0){ e.actor.hitFlash(); return; }
  }
  e.hp -= dmg;
  e.hb.set(e.hp / e.hpMax, boss ? '#f97316' : e.shield > 0 ? '#94a3b8' : '#e5484d');
  e.actor.hitFlash();
  C.applyFlinch(e, G.time);
  dmgNums.spawn(e.actor.group.position, String(dmg), opts.crit ? '#facc15' : '#ffffff', opts.crit);
  fx.burst(e.actor.group.position.clone().setY(1), 0xffffff, 6, 4, 0.25);
  Snd.hit();
  if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e){
  e.dying = true;
  e.actor.die();
  e.hb.show(false);
  G.run.charXp += e.def.xp;
  profile.data.stats.kills++;
  bumpQuest('kills');
  if (G.run.abyss && G.run.loc === 'abyss') G.run.abyss.kills++;
  G.run.volts += L.voltDrop(G.run.realm, e.def.boss ? 'boss' : e.def.elite ? 'elite' : 'trash', grng);
  checkLevelUp();
  Snd.kill();
  fx.burst(e.actor.group.position.clone().setY(1), 0xfbbf24, 16, 5, 0.5);
  // Bootleg Bond: pop the shields it granted
  if (e.def.special && e.def.special.kind === 'allyShield'){
    for (const o of G.entities) if (o.shieldFrom === e){ o.shield = 0; o.shieldFrom = null; o.hb.set(o.hp / o.hpMax); }
  }
  // Peak Shaver: frost pulse on kill
  if (G.player.stats.sigs.includes('peakShaver') && grng() < 0.2){
    fx.burst(e.actor.group.position, 0x7dd3fc, 16, 5, 0.5);
    for (const o of G.entities)
      if (!o.dying && o !== e && C.inCircle(e.x, e.z, 2, o.x, o.z)) damageEnemy(o, G.player.stats.damage, { noConduct: true });
  }
  if (e.def.boss){
    onBossDead(e);
  } else if (e.def.elite){
    rollAndDrop('elite', e.x, e.z, 1);
  } else if (grng() < ECON.dropChance.trash){
    rollAndDrop('trash', e.x, e.z, 1);
  }
  updateHud();
}

function onBossDead(boss){
  G.run.bossDead[G.run.realm] = true;
  G.run.salvage += 20 * G.run.realm;
  profile.data.stats.bosses++;
  profile.addXP(200);
  G.run.charXp += XP.charBoss * G.run.realm;
  checkLevelUp();
  const B = boss.def.boss;
  // drops: first Certified-floored; final boss has its logged unique-chance exception
  let first = null;
  if (B.uniqueChance){
    const chance = (!boss.bs.breakMissed && boss.bs.breakCorrect > 0) ? B.uniqueChancePerfect : B.uniqueChance;
    if (grng() < chance){
      first = L.rollDrop(G.run.realm, 'boss', grng, new Set(G.run.uniquesOwned));
      for (let i = 0; i < 30 && first.rarity !== 'master'; i++)
        first = L.rollDrop(G.run.realm, 'boss', grng, new Set(G.run.uniquesOwned));
    }
  }
  for (let i = 0; i < 20 && !first; i++){
    const cand = L.rollDrop(G.run.realm, 'boss', grng, new Set(G.run.uniquesOwned));
    if (cand.rarity === 'certified' || cand.rarity === 'master') first = cand;
  }
  first = first || L.makeItem('tool', G.run.realm, 'certified', grng);
  if (first.uniqueId) G.run.uniquesOwned.push(first.uniqueId);
  dropItem(first, boss.x - 1, boss.z);
  rollAndDrop('boss', boss.x + 1, boss.z, 2);
  if (G.wedges){ G.wedges.meshes.forEach(m => scene.remove(m)); G.wedges = null; }
  if (G.pads){ G.pads.forEach(p => scene.remove(p.mesh)); G.pads = null; }
  if (G.mech && G.mech.cleanup) G.mech.cleanup();
  G.mech = null;
  const room = G.floor.rooms[G.floor.bossRoom];
  placeSeal(room, REALM_PALETTES[realmDef().palette].accent);
  hud.toast(`${boss.def.name} is down. Certify at the Seal to energize ${realmDef().name}.`);
  saveRun();
}

/* ---------- combat: enemy -> player ---------- */
function damagePlayer(raw, opts = {}){
  const p = G.player;
  if (p.iframesT > 0 || G.mode !== 'play') return;
  const s = p.stats;
  let dmg = raw;
  if (opts.conducted){
    if (s.sigs.includes('class0')) return;
    dmg *= (1 - sealFx().condDr);
  }
  if (s.sigs.includes('cat4') && raw >= 40){
    dmg *= 0.7;
    if (p.cat4Cd <= 0){
      p.cat4Cd = 1;
      for (const e of G.entities)
        if (!e.dying && C.inCircle(p.x, p.z, 2, e.x, e.z)) damageEnemy(e, Math.round(s.damage * 0.5), { noConduct: true });
      fx.burst(G.playerActor.group.position, 0xe8dfff, 12, 5, 0.4);
    }
  }
  if (s.sigs.includes('loadDiversity')){
    let n = 0;
    for (const e of G.entities) if (!e.dying && C.dist2d(p.x, p.z, e.x, e.z) <= 6) n++;
    dmg *= (1 - Math.min(0.15, 0.03 * n));
  }
  const extra = Math.min(C.PLAYER.drCap,
    (p.rubberT > 0 ? C.LINEMAN.passive.dr : 0) + (p.blanketT > 0 ? p.blanketDr : 0));
  dmg = C.mitigated(dmg, s.dr, extra);
  p.hp -= dmg;
  dmgNums.spawn(G.playerActor.group.position, String(dmg), '#f87171');
  G.playerActor.hitFlash();
  Snd.hurt();
  if (s.sigs.includes('loadDiversity') && p.hp < s.maxHp * 0.3 && p.divPulseCd <= 0){
    p.divPulseCd = 10;
    for (const e of G.entities){
      if (e.dying || e.def.boss) continue;
      const d = C.dist2d(p.x, p.z, e.x, e.z);
      if (d < 2.5){
        const [nx, nz] = [e.x + (e.x - p.x) / d * 3, e.z + (e.z - p.z) / d * 3];
        if (G.collider.walkable(nx, nz)){ e.x = nx; e.z = nz; }
      }
    }
    fx.burst(G.playerActor.group.position, 0x7dd3fc, 20, 6, 0.5);
    hud.toast('Load shed — cleared the crowd.');
  }
  updateHud();
  if (p.hp <= 0){
    p.hp = 0;
    G.playerActor.die();
    G.mode = 'modal';
    setTimeout(() => G.run.loc === 'abyss' ? abyssDeathFlow() : briefingFlow(), 700);
  }
}

/* ---------- player attacks + abilities ---------- */
function fireProbe(dir, dmgMult){
  const p = G.player, s = p.stats;
  G.pshots.push({
    x: p.x, z: p.z, dir, speed: cls().basic.speed || 14, range: s.projRange,
    dmg: Math.round(s.damage * dmgMult), traveled: 0,
  });
}

function playerStrike(){
  const p = G.player;
  const s = p.stats;
  const heatAS = (s.sigs.includes('ninetyDeg') && hazAt('heat', p.x, p.z)) ? 1.15 : 1;
  p.atkCd = 1 / (s.atkSpeed * heatAS);
  const dir = Math.atan2(controls.state.aim.z, controls.state.aim.x);
  G.playerActor.setCue('strike');
  setTimeout(() => G.playerActor.setCue('idle'), 200);
  if (cls().basic.type === 'proj'){
    if (s.dualTrace){ fireProbe(dir - 0.09, 0.6); fireProbe(dir + 0.09, 0.6); }
    else fireProbe(dir, 1.0);
    Snd.beep(660, 0.04, 'square', 0.06);
    return;
  }
  p.swingCount = (p.swingCount || 0) + 1;
  const fullCircle = s.doubleCrimp && p.swingCount % 3 === 0;
  const struck = [];
  for (const e of G.entities){
    if (e.dying) continue;
    const inRange = fullCircle
      ? C.inCircle(p.x, p.z, s.range + 0.2, e.x, e.z)
      : C.inArc(p.x, p.z, dir, s.range + (e.def.boss ? 1.2 : 0), s.arc, e.x, e.z);
    if (inRange) struck.push(e);
  }
  const swingRamp = s.sigs.includes('bondingJumper') ? Math.min(0.3, 0.1 * Math.max(0, struck.length - 1)) : 0;
  for (const e of struck){
    const base = s.damage * (fullCircle ? 1.2 : 1) * (0.9 + grng() * 0.2) * (1 + swingRamp);
    playerHit(e, base);
  }
  if (s.sigs.includes('bondingJumper') && struck.length){
    const src = struck[0];
    let best = null, bd = 3;
    for (const e of G.entities){
      if (e.dying || struck.includes(e)) continue;
      const d = C.dist2d(src.x, src.z, e.x, e.z);
      if (d < bd){ bd = d; best = e; }
    }
    if (best){
      damageEnemy(best, Math.round(s.damage * 0.4));
      fx.burst(new THREE.Vector3((src.x + best.x) / 2, 1, (src.z + best.z) / 2), 0x4ade80, 8, 5, 0.3);
    }
  }
  if (!struck.length) Snd.beep(180, 0.04, 'sine', 0.05);
}

function addSummon(kind, x, z, cfg){
  const actor = kind === 'apprentice' ? makeApprentice() : makeSpiderBox();
  actor.group.position.set(x, actor.group.userData.baseY || 0, z);
  scene.add(actor.group);
  G.summons.push({ kind, x, z, t: 0, dur: cfg.dur, actor, atkCd: 0, cfg });
}

function castAbility(idx){
  const p = G.player, s = p.stats;
  const ab = cls().abilities[idx];
  const key = 'a' + (idx + 1);
  if (p.cds[key] > 0 || !G.run.flags.gotTool || G.mode !== 'play') return;
  p.cds[key] = ab.cd;
  const dir = Math.atan2(controls.state.aim.z, controls.state.aim.x);
  const cursor = controls.state.cursor || { x: p.x + controls.state.aim.x * 4, z: p.z + controls.state.aim.z * 4 };
  G.playerActor.setCue('strike');

  switch (ab.id){
    /* Lineman */
    case 'gaffLunge':
      p.dashAtk = { t: 0, dur: 0.22, dir, dist: ab.dash, hit: new Set(), dmg: Math.round(s.damage * ab.dmg) };
      p.iframesT = Math.max(p.iframesT, 0.1);
      break;
    case 'comeAlong': {
      let n = 0;
      for (const e of G.entities){
        if (e.dying || n >= ab.maxTargets || e.def.boss) continue;
        if (C.inArc(p.x, p.z, dir, ab.range, ab.arc, e.x, e.z)){
          n++;
          playerHit(e, s.damage * ab.dmg);
          const d = C.dist2d(e.x, e.z, p.x, p.z);
          const pull = Math.min(ab.pull, Math.max(0, d - 1.2));
          const [nx, nz] = [e.x + (p.x - e.x) / d * pull, e.z + (p.z - e.z) / d * pull];
          if (G.collider.walkable(nx, nz)){ e.x = nx; e.z = nz; }
          e.state = 'flinch'; e.t = -ab.stagger;
        }
      }
      fx.burst(G.playerActor.group.position, 0xd9c14a, 10, 5, 0.3);
      break;
    }
    case 'groundRod': {
      for (const e of G.entities){
        if (e.dying) continue;
        if (C.inCircle(p.x, p.z, ab.radius, e.x, e.z)){
          playerHit(e, s.damage * ab.dmg);
          if (!e.def.boss && !e.def.elite){ e.state = 'flinch'; e.t = -ab.knockdown; }
        }
      }
      const field = { x: p.x, z: p.z, radius: ab.radius, dmg: Math.round(s.damage * ab.tick), delay: 0, t: 0, dur: ab.dur, tickT: 0, friendly: true, decal: W.makeDiscDecal(ab.radius, 0x4ade80, 0.22) };
      field.decal.position.set(p.x, 0.05, p.z);
      scene.add(field.decal);
      G.zones.push(field);
      fx.burst(G.playerActor.group.position, 0x4ade80, 22, 6, 0.5, 3);
      break;
    }
    case 'insulatingBlanket':
      p.blanketT = ab.dur;
      p.blanketDr = ab.dr;
      fx.burst(G.playerActor.group.position, 0xf97316, 14, 4, 0.5);
      Snd.beep(220, 0.1, 'sine', 0.08);
      break;
    case 'loadBreak': {
      for (const e of G.entities){
        if (e.dying) continue;
        if (C.inCircle(p.x, p.z, ab.radius, e.x, e.z)){
          playerHit(e, s.damage * ab.dmg);
          const d = C.dist2d(e.x, e.z, p.x, p.z);
          const [nx, nz] = [e.x + (e.x - p.x) / d * ab.push, e.z + (e.z - p.z) / d * ab.push];
          if (G.collider.walkable(nx, nz)){ e.x = nx; e.z = nz; }
          if (!e.def.boss){ e.state = 'flinch'; e.t = -ab.stagger; }
        }
      }
      fx.burst(G.playerActor.group.position, 0xffffff, 24, 7, 0.5);
      Snd.beep(120, 0.1, 'square', 0.12);
      break;
    }
    /* Tester */
    case 'meggerSurge': {
      for (const e of G.entities){
        if (e.dying) continue;
        if (C.inLine(p.x, p.z, dir, ab.len, ab.width, e.x, e.z)) playerHit(e, s.damage * ab.dmg);
      }
      for (let i = 1; i <= 8; i++)
        fx.burst(new THREE.Vector3(p.x + Math.cos(dir) * i * 1.2, 0.9, p.z + Math.sin(dir) * i * 1.2), 0xb9a7f2, 3, 2, 0.25);
      Snd.beep(880, 0.15, 'sawtooth', 0.1, 220);
      break;
    }
    case 'leadFan': {
      for (let i = 0; i < ab.count; i++){
        const a = dir + (i - (ab.count - 1) / 2) * (ab.arc * Math.PI / 180) / (ab.count - 1);
        fireProbe(a, ab.dmg);
      }
      break;
    }
    case 'hipot': {
      let best = null, bd = ab.range;
      for (const e of G.entities){
        if (e.dying) continue;
        const d = C.dist2d(p.x, p.z, e.x, e.z);
        if (d < bd && C.inArc(p.x, p.z, dir, ab.range, 40, e.x, e.z)){ bd = d; best = e; }
      }
      if (best){
        const before = best.hp;
        playerHit(best, s.damage * ab.dmg);
        const killed = best.hp <= 0 && before > 0;
        const splashR = s.transientCapture ? 3 : ab.splashR;
        for (const o of G.entities)
          if (!o.dying && o !== best && C.inCircle(best.x, best.z, splashR, o.x, o.z))
            damageEnemy(o, Math.round(s.damage * ab.splashDmg), { noConduct: true });
        fx.burst(best.actor.group.position, 0x22d3ee, 20, 7, 0.5);
        if (killed && s.transientCapture){ p.cds.a3 = 0; hud.toast('Transient captured — Hipot resets.'); }
      } else hud.toast('No target in probe range.');
      break;
    }
    case 'ampClamp': {
      let best = null, bd = ab.range;
      for (const e of G.entities){
        if (e.dying) continue;
        const d = C.dist2d(p.x, p.z, e.x, e.z);
        if (d < bd && C.inArc(p.x, p.z, dir, ab.range, 40, e.x, e.z)){ bd = d; best = e; }
      }
      if (best){
        playerHit(best, s.damage * ab.dmg);
        if (!best.def.boss){ best.state = 'flinch'; best.t = -ab.hold; }
        for (let i = 1; i <= 4; i++)
          fx.burst(new THREE.Vector3(p.x + (best.x - p.x) * i / 4, 0.9, p.z + (best.z - p.z) * i / 4), 0x22d3ee, 3, 2, 0.25);
        fx.burst(best.actor.group.position, 0x22d3ee, 14, 5, 0.4);
      } else hud.toast('No target in clamp range.');
      break;
    }
    case 'quickDisconnect':
      p.dashAtk = { t: 0, dur: 0.18, dir: dir + Math.PI, dist: ab.dash, hit: new Set(), dmg: Math.round(s.damage * ab.dmg) };
      p.iframesT = Math.max(p.iframesT, ab.iframes);
      fx.wind({ x: p.x, z: p.z }, dir + Math.PI, 6);
      Snd.dodge();
      break;
    /* Foreman */
    case 'apprentices': {
      const count = ab.count + (s.thirdApprentice ? 1 : 0);
      for (let i = 0; i < count; i++)
        addSummon('apprentice', p.x + Math.cos(i * 2.1) * 1.2, p.z + Math.sin(i * 2.1) * 1.2,
          { dur: ab.dur, dmg: ab.dmg, hitRate: ab.hitRate, speed: ab.speed });
      fx.fountain(G.playerActor.group.position, 0xf97316, 10, 0.7);
      break;
    }
    case 'barricade': {
      const bx = cursor.x, bz = cursor.z;
      const perp = dir + Math.PI / 2;
      const mesh = makeBarricadeMesh();
      mesh.position.set(bx, 0, bz);
      mesh.rotation.y = -perp;
      scene.add(mesh);
      const tiles = [];
      for (const o of [-1, 0, 1]){
        const tx = Math.floor(bx + Math.cos(perp) * o), tz = Math.floor(bz + Math.sin(perp) * o);
        const k = tx + ',' + tz;
        if (!G.barricadeBlocked.has(k)){ G.barricadeBlocked.add(k); tiles.push(k); }
      }
      G.barricades.push({ mesh, tiles, expiry: G.time + (s.barricadeDur || ab.dur) });
      Snd.beep(150, 0.08, 'square', 0.1);
      break;
    }
    case 'spiderBox': {
      addSummon('spider', cursor.x, cursor.z, { dur: ab.dur, dmg: ab.dmg, tick: ab.tick, radius: ab.radius });
      if (s.dualFeed) addSummon('spider', cursor.x + 1.4, cursor.z, { dur: ab.dur, dmg: ab.dmg, tick: ab.tick, radius: ab.radius });
      break;
    }
    case 'stopWork': {
      for (const e of G.entities){
        if (e.dying || e.def.boss) continue;
        if (C.inCircle(p.x, p.z, ab.radius, e.x, e.z)){ e.state = 'flinch'; e.t = -ab.hold; }
      }
      fx.fountain(G.playerActor.group.position, 0xf97316, 12, 0.8);
      Snd.beep(1200, 0.06, 'square', 0.1);
      setTimeout(() => Snd.beep(1200, 0.06, 'square', 0.1), 110);
      hud.toast('STOP WORK — all hands hold.');
      break;
    }
    case 'musterPoint': {
      if (!G.summons.length){
        hud.toast('No crew on site.');
        p.cds.a5 = 0;
        break;
      }
      G.summons.forEach((sm, i) => {
        const tx = cursor.x + Math.cos(i * 2.1) * ab.scatter;
        const tz = cursor.z + Math.sin(i * 2.1) * ab.scatter;
        if (!G.collider.walkable(tx, tz)) return; // no safe footing — that one stays put
        fx.fountain(sm.actor.group.position, 0xf97316, 6, 0.5);
        sm.x = tx; sm.z = tz;
        sm.actor.group.position.x = tx;
        sm.actor.group.position.z = tz;
        fx.fountain(sm.actor.group.position, 0xf97316, 6, 0.5);
      });
      break;
    }
  }
}

/* ---------- boss arena mechanics (per-boss scripts) ---------- */
function bossArenaSetup(boss){
  const room = G.floor.rooms[G.floor.bossRoom];
  const cx = room.cx + 0.5, cz = room.cy + 0.5;
  const id = boss.def.id;
  const mech = { id, cx, cz, room, state: {}, meshes: [], cleanup(){ this.meshes.forEach(m => scene.remove(m)); } };
  if (id === 'openMain'){
    G.pads = [
      { x: cx - 3, z: cz, t: 0, latched: 0, mesh: W.makeDiscDecal(1.0, 0x4ade80, 0.35) },
      { x: cx + 3, z: cz, t: 0, latched: 0, mesh: W.makeDiscDecal(1.0, 0x4ade80, 0.35) },
    ];
    G.pads.forEach(p => { p.mesh.position.set(p.x, 0.05, p.z); scene.add(p.mesh); });
    const wedgeMeshes = [];
    for (let i = 0; i < 6; i++){
      const m = W.makeSector(6.5, i * Math.PI / 3, (i + 1) * Math.PI / 3, 0xff5533);
      m.position.set(cx, 0.055, cz);
      scene.add(m); wedgeMeshes.push(m);
    }
    G.wedges = { meshes: wedgeMeshes, angle: 0, cx, cz };
  }
  if (id === 'thermalRunaway'){
    mech.state = { loadStepT: boss.def.boss.loadStepEvery, laneT: boss.def.boss.laneEvery };
  }
  if (id === 'drownedMain'){
    // grid of pool patches around the anchored boss
    const patches = [];
    for (let i = 0; i < 5; i++){
      const a = i * Math.PI * 2 / 5;
      const px = Math.floor(cx + Math.cos(a) * 3.6), pz = Math.floor(cz + Math.sin(a) * 3.6);
      const tiles = [];
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++){
        if (G.collider.walkable(px + dx + 0.5, pz + dz + 0.5)){
          G.dyn.add('pool', px + dx, pz + dz, 9999, G.time);
          tiles.push({ x: px + dx, z: pz + dz });
        }
      }
      patches.push({ tiles, live: false, warn: 0 });
    }
    mech.state = { patches, energizeT: boss.def.boss.energizeEvery, liveT: 0, liveSet: [], grew: false, tickT: 0 };
  }
  if (id === 'coincidentPeak'){
    const quads = [];
    for (let i = 0; i < 4; i++){
      const m = W.makeSector(7, i * Math.PI / 2, (i + 1) * Math.PI / 2, 0x334155);
      m.position.set(cx, 0.05, cz);
      scene.add(m); quads.push(m); mech.meshes.push(m);
    }
    mech.state = { quads, hot: [0], cycleT: boss.def.boss.cycleP1, shedT: boss.def.boss.shedEvery, shed: 0 };
  }
  if (id === 'theIncident'){
    const pylons = [];
    for (let i = 0; i < boss.def.boss.pylons; i++){
      const a = i * Math.PI * 2 / 3 + 0.5;
      const px = cx + Math.cos(a) * 4.2, pz = cz + Math.sin(a) * 4.2;
      const mesh = W.makePylon();
      mesh.position.set(px, 0, pz);
      scene.add(mesh); mech.meshes.push(mesh);
      pylons.push({ x: px, z: pz, alive: true, mesh });
    }
    // ember channel ring at the arena edge
    for (let i = 0; i < 26; i++){
      const a = i * Math.PI * 2 / 26;
      G.dyn.add('ember', Math.floor(cx + Math.cos(a) * 6.2), Math.floor(cz + Math.sin(a) * 6.2), 9999, G.time);
    }
    mech.state = { pylons, addT: 4 };
    boss.arenaPoints = pylons;
  }
  G.mech = mech;
}

function bossArenaUpdate(boss, dt){
  const p = G.player, B = boss.def.boss, m = G.mech;
  if (!m) return;
  const st = m.state;
  const phase = boss.bs.phase;

  if (m.id === 'openMain'){
    if (phase === 'open' && G.pads){
      for (const pad of G.pads){
        const on = C.dist2d(p.x, p.z, pad.x, pad.z) < 1.0;
        if (on) pad.t += dt; else pad.t = Math.max(0, pad.t - dt * 2);
        if (pad.t > 0.8 && pad.latched <= 0){ pad.latched = B.padLatch; Snd.beep(520, 0.1, 'square'); }
        pad.latched = Math.max(0, pad.latched - dt);
        pad.mesh.material.opacity = pad.latched > 0 ? 0.85 : on ? 0.55 : 0.35;
      }
      boss.bs.padA = G.pads[0].latched > 0 ? B.padLatch : 0;
      boss.bs.padB = G.pads[1].latched > 0 ? B.padLatch : 0;
    }
    if (G.wedges){
      const active = phase === 'p2';
      G.wedges.angle += dt * (2 * Math.PI / B.wedges.rotSec);
      for (let i = 0; i < 6; i++){
        const w = G.wedges.meshes[i];
        const isHot = active && ((i + Math.floor(G.wedges.angle / (Math.PI / 3))) % 3 === 0);
        w.material.opacity = isHot ? 0.35 + 0.15 * Math.sin(G.time * 6) : 0.0;
        w.rotation.z = G.wedges.angle;
      }
      if (active){
        const dx = p.x - G.wedges.cx, dz = p.z - G.wedges.cz;
        const r = Math.hypot(dx, dz);
        if (r < 6.5){
          let a = Math.atan2(dz, dx) - G.wedges.angle;
          while (a < 0) a += Math.PI * 2;
          if (Math.floor((a % (Math.PI * 2)) / (Math.PI / 3)) % 3 === 0){
            st.wedgeTick = (st.wedgeTick || 0) + dt;
            if (st.wedgeTick > 1){ st.wedgeTick = 0; damagePlayer(B.wedges.dmgTick); }
          }
        }
      }
    }
  }

  if (m.id === 'thermalRunaway' && (phase === 'p1' || phase === 'p2')){
    if (phase === 'p1'){
      st.loadStepT -= dt;
      if (st.loadStepT < 2 && !st.warned){ st.warned = true; hud.toast('The outer ring glows — LOAD STEP incoming!'); }
      if (st.loadStepT <= 0){
        st.loadStepT = B.loadStepEvery; st.warned = false;
        for (let i = 0; i < 30; i++){
          const a = i * Math.PI * 2 / 30;
          G.dyn.add('heat', Math.floor(m.cx + Math.cos(a) * 5.5), Math.floor(m.cz + Math.sin(a) * 5.5), B.loadStepDur, G.time);
        }
      }
    } else {
      st.laneT -= dt;
      if (st.laneT <= 0){
        st.laneT = B.laneEvery;
        const vertical = grng() < 0.5;
        const off = Math.floor(grng() * 3) - 1;
        for (let i = -6; i <= 6; i++){
          for (const lane of [-2 + off, 2 + off]){
            const tx = vertical ? m.cx + lane : m.cx + i;
            const tz = vertical ? m.cz + i : m.cz + lane;
            G.dyn.add('heat', Math.floor(tx), Math.floor(tz), 4, G.time);
          }
        }
        hud.toast('Rolling load lanes — find the gap!');
      }
    }
  }

  if (m.id === 'drownedMain' && (phase === 'p1' || phase === 'p2')){
    if (phase === 'p2' && !st.grew){
      st.grew = true;
      for (const patch of st.patches){
        const extra = [];
        for (const t of patch.tiles) for (const [dx, dz] of [[1, 0], [0, 1]]){
          if (G.collider.walkable(t.x + dx + 0.5, t.z + dz + 0.5)){
            G.dyn.add('pool', t.x + dx, t.z + dz, 9999, G.time);
            extra.push({ x: t.x + dx, z: t.z + dz });
          }
        }
        patch.tiles.push(...extra);
      }
      hud.toast('The water is rising — the islands are shrinking.');
    }
    st.energizeT -= dt;
    if (st.energizeT <= 0){
      st.energizeT = B.energizeEvery;
      st.liveSet = st.patches.filter(() => grng() < 0.4);
      st.liveT = B.energizeDur + B.energizeWarn;
      hud.toast('The pools hum — they go LIVE in 2 seconds!');
    }
    if (st.liveT > 0){
      st.liveT -= dt;
      if (st.liveT < B.energizeDur){
        st.tickT = (st.tickT || 0) + dt;
        if (st.tickT > 1){
          st.tickT = 0;
          const pid = poolAt(p.x, p.z);
          if (pid) damagePlayer(B.energizeTick, { conducted: true });
        }
      }
    }
  }

  if (m.id === 'coincidentPeak' && (phase === 'p1' || phase === 'p2')){
    st.cycleT -= dt;
    if (st.cycleT <= 0){
      st.cycleT = phase === 'p1' ? B.cycleP1 : B.cycleP2;
      const n = phase === 'p1' ? 1 : 2;
      st.hot = [];
      while (st.hot.length < n){
        const q = Math.floor(grng() * 4);
        if (!st.hot.includes(q)) st.hot.push(q);
      }
    }
    if (phase === 'p2'){
      st.shedT -= dt;
      if (st.shedT <= 0){ st.shedT = B.shedEvery; st.shed = B.shedDur; hud.toast('LOAD SHED — hit it now!'); }
      if (st.shed > 0){ st.shed -= dt; boss.vulnerable = true; } else boss.vulnerable = false;
    }
    const shedActive = st.shed > 0;
    st.quads.forEach((q, i) => {
      const hot = !shedActive && st.hot.includes(i);
      q.material.opacity = hot ? 0.30 + 0.08 * Math.sin(G.time * 4) : 0;
      q.userData.hot = hot;
    });
    // player brownout from hot quadrant
    const dx = p.x - m.cx, dz = p.z - m.cz;
    let a = Math.atan2(dz, dx);
    while (a < 0) a += Math.PI * 2;
    const quad = Math.floor(a / (Math.PI / 2)) % 4;
    st.playerBrowned = !shedActive && st.hot.includes(quad) && Math.hypot(dx, dz) < 7;
  }

  if (m.id === 'theIncident'){
    st.addT -= dt;
    if (st.addT <= 0){
      st.addT = 4;
      const alive = G.entities.filter(e => !e.dying && e.id === B.addsMaintain.id).length;
      if (alive < B.addsMaintain.max && (phase === 'p1' || phase === 'p2'))
        spawnEnemy(B.addsMaintain.id, m.cx + (grng() - 0.5) * 6, m.cz + (grng() - 0.5) * 6);
    }
    if (G.pendingBlast){
      G.pendingBlast.t -= dt;
      if (G.pendingBlast.t <= 0){
        const blast = G.pendingBlast; G.pendingBlast = null;
        // safe if sheltering behind a live pylon (near it, farther from the boss than it)
        let shelter = null;
        for (const py of st.pylons){
          if (!py.alive) continue;
          const nearPy = C.dist2d(p.x, p.z, py.x, py.z) < 2.2;
          const behind = C.dist2d(boss.x, boss.z, p.x, p.z) > C.dist2d(boss.x, boss.z, py.x, py.z);
          if (nearPy && behind){ shelter = py; break; }
        }
        fx.burst(boss.actor.group.position, 0xe8dfff, 40, 9, 0.8, 4);
        Snd.beep(60, 0.5, 'sawtooth', 0.16, 200);
        if (shelter){
          shelter.alive = false;
          scene.remove(shelter.mesh);
          fx.burst(new THREE.Vector3(shelter.x, 1, shelter.z), 0x453844, 20, 6, 0.6);
          hud.toast('The pylon takes the blast — and crumbles.');
        } else {
          damagePlayer(B.arcBlastDmg);
          hud.toast('ARC BLAST — nothing between you and it.');
        }
      }
    }
  }
}

function bossEvent(boss, intent){
  const B = boss.def.boss, m = G.mech;
  if (intent.event === 'breakStart'){ if (!m) bossArenaSetup(boss); breakFlow(boss); }
  if (intent.event === 'openStart') hud.toast('It throws itself OPEN — stand on both contactor pads to re-close the circuit!');
  if (intent.event === 'reclose'){ hud.toast('Circuit re-closed — it staggers!'); fx.burst(boss.actor.group.position, 0x4ade80, 24, 6, 0.6); }
  if (intent.event === 'restrike' && m && m.state.pylons){
    const pts = m.state.pylons.filter(py => py.alive);
    const pt = pts.length ? rngPick(grng, pts) : { x: m.cx, z: m.cz };
    fx.burst(boss.actor.group.position, 0xe8dfff, 24, 7, 0.5);
    boss.x = pt.x + (grng() - 0.5); boss.z = pt.z + (grng() - 0.5);
    boss.bs.lastStrike = { x: boss.x, z: boss.z };
    boss.actor.group.position.set(boss.x, 0, boss.z);
    fx.burst(boss.actor.group.position, 0xe8dfff, 24, 7, 0.5);
    Snd.beep(1200, 0.12, 'sine', 0.1, 300);
  }
  if (intent.event === 'arcBlast'){
    hud.toast('THE INCIDENT CHANNELS — get behind a pylon!');
    Snd.beep(110, 0.3, 'sawtooth', 0.14);
    G.pendingBlast = { t: 1.4 };
  }
}

/* ---------- enemy action resolution ---------- */
function resolveEnemyAction(e, act){
  const p = G.player;
  if (act.type === 'melee'){
    if (p.iframesT <= 0 && C.inArc(e.x, e.z, act.dir, act.range, act.arc, p.x, p.z)){
      damagePlayer(act.dmg);
      if (p.stats.sigs.includes('wiggy')) e.tested = 3;
      // Live Pools: a melee hit from inside your pool conducts (flavor tick, small)
    }
  } else if (act.type === 'projectile'){
    G.projectiles.push({
      x: e.x, z: e.z, dir: act.dir, speed: act.speed, range: act.range, dmg: act.dmg, traveled: 0,
      src: e, meta: e.def.proj || null,
    });
  } else if (act.type === 'zone'){
    spawnZone(act);
  } else if (act.type === 'multiZone'){
    for (const z of act.zones) spawnZone(z);
  } else if (act.type === 'lineHit'){
    let hit = false;
    if (p.iframesT <= 0 && C.inLine(e.x, e.z, act.dir, act.len, act.width, p.x, p.z)){ damagePlayer(act.dmg); hit = true; }
    if (act.conducts && !hit && p.iframesT <= 0){
      // slam landed in water: conducts to any pool-stander
      const lineTouchesPool = [2, 4, 6].some(i => poolAt(e.x + Math.cos(act.dir) * i, e.z + Math.sin(act.dir) * i));
      if (lineTouchesPool && poolAt(p.x, p.z)) damagePlayer(act.conductDmg, { conducted: true });
    }
    fx.burst(e.actor.group.position, 0xff5533, 16, 7, 0.4);
  } else if (act.type === 'poolArc'){
    fx.burst(e.actor.group.position, 0x6ff7e8, 26, 8, 0.6);
    if (p.iframesT <= 0 && poolAt(p.x, p.z)) damagePlayer(act.dmg, { conducted: true });
  } else if (act.type === 'cascade'){
    const from = e.bs.lastStrike || { x: e.x, z: e.z };
    for (let r = 0; r < 3; r++){
      const a = grng() * Math.PI * 2;
      for (let i = 1; i <= 7; i++){
        const tx = from.x + Math.cos(a) * i, tz = from.z + Math.sin(a) * i;
        G.dyn.add('ember', Math.floor(tx), Math.floor(tz), 6, G.time);
        G.zones.push({ x: tx, z: tz, radius: 0.8, dmg: act.dmg, delay: 0.8, t: 0, decal: W.makeRingDecal(0.8, 0xff5533) });
        G.zones[G.zones.length - 1].decal.position.set(tx, 0.06, tz);
        scene.add(G.zones[G.zones.length - 1].decal);
      }
    }
  } else if (act.type === 'contact'){
    if (p.iframesT <= 0 && C.dist2d(e.x, e.z, p.x, p.z) < 1.0){
      damagePlayer(act.dmg);
      if (p.stats.sigs.includes('wiggy')) e.tested = 3;
    }
  } else if (act.type === 'spawn'){
    for (let i = 0; i < act.count; i++)
      spawnEnemy(act.id, e.x + Math.cos(i * 2.4) * 1.2, e.z + Math.sin(i * 2.4) * 1.2);
    if (act.killSelf){ e.hp = 0; e.dying = true; e.actor.die(); e.hb.show(false); G.run.charXp += e.def.xp; checkLevelUp(); fx.burst(e.actor.group.position, 0x6f8a4f, 18, 5, 0.5); }
  } else if (act.type === 'hazard'){
    G.dyn.add(act.hazard, act.x, act.z, act.dur, G.time);
  } else if (act.type === 'allyShield'){
    let n = 0;
    for (const o of G.entities){
      if (n >= act.maxAllies) break;
      if (o === e || o.dying || o.def.boss || o.shield > 0) continue;
      if (C.dist2d(e.x, e.z, o.x, o.z) <= act.range){
        o.shield = Math.round(e.hpMax * act.shieldPct);
        o.shieldFrom = e;
        o.hb.set(o.hp / o.hpMax, '#94a3b8');
        fx.burst(o.actor.group.position, 0x94a3b8, 8, 3, 0.4);
        n++;
      }
    }
    if (n) hud.toast('Bootleg Bond — false bonds shield its allies. Kill the Bond!');
  }
}

function spawnZone(act){
  const zone = { x: act.x, z: act.z, radius: act.radius, dmg: act.dmg, delay: act.delay, t: 0,
    hazard: act.hazard, hazardDur: act.hazardDur, decal: W.makeRingDecal(act.radius, 0xff5533) };
  zone.decal.position.set(act.x, 0.06, act.z);
  scene.add(zone.decal);
  G.zones.push(zone);
}

/* ---------- main loop ---------- */
let last = performance.now();
let wasBlocked = false;
function frame(now){
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const blocked = G.paused || (G.mode !== 'play' && G.mode !== 'hub');
  if (wasBlocked && !blocked) controls.reset(); // keys released behind a modal must not stick
  wasBlocked = blocked;
  if (!blocked) sim(dt);
  fx.update(dt, G.player ? G.playerActor.group.position : null);
  dmgNums.update(dt);
  if (G.dyn) G.dyn.update(G.time);
  renderer.render(scene, camera);
}

function sim(dt){
  G.time += dt;
  const p = G.player;
  controls.update({ x: p.x, z: p.z });
  const pressed = controls.consumePressed();

  if (pressed.inventory){ if (hud.inventoryOpen()) hud.closeInventory(); else openInventoryFlow(); }
  if (pressed.esc){
    if (hud.inventoryOpen()) hud.closeInventory();
    else if (hud.mapOpen()) hud.hideMap();
    else pauseFlow();
  }
  if (pressed.map && G.mode === 'play'){
    if (hud.mapOpen()) hud.hideMap();
    else { hud.showMap(); drawMapNow(); G.mapT = 0; }
  }

  // cooldowns (brownout halves recovery; Peak Shaver ignores; seal 4 adds recovery)
  const browned = G.mode === 'play' && G.run.realm >= 4 &&
    (inBrownout(p.x, p.z) || (G.mech && G.mech.state.playerBrowned)) && !p.stats.sigs.includes('peakShaver');
  const cdRate = (browned ? (HAZARDS[4] ? HAZARDS[4].cdFactor : 0.5) : 1) * (1 + sealFx().cdr);
  for (const k of ['a1', 'a2', 'a3', 'a4', 'a5', 'dodge']) p.cds[k] = Math.max(0, p.cds[k] - dt * cdRate);
  p.atkCd = Math.max(0, p.atkCd - dt);
  p.iframesT = Math.max(0, p.iframesT - dt);
  p.rubberT = Math.max(0, p.rubberT - dt);
  p.blanketT = Math.max(0, (p.blanketT || 0) - dt);
  p.meggerT = Math.max(0, (p.meggerT || 0) - dt);
  p.divPulseCd = Math.max(0, (p.divPulseCd || 0) - dt);
  p.cat4Cd = Math.max(0, (p.cat4Cd || 0) - dt);
  hud.setCooldowns([p.cds.a1, p.cds.a2, p.cds.a3, p.cds.a4, p.cds.a5, p.cds.dodge]);

  if (pressed.dodge && p.cds.dodge <= 0 && !p.dodging){
    const m = controls.state.move.lengthSq() > 0 ? controls.state.move : controls.state.aim;
    p.dodging = { t: 0, dur: C.PLAYER.dodge.dur, dir: Math.atan2(m.z, m.x) };
    p.cds.dodge = C.PLAYER.dodge.cd;
    p.iframesT = C.PLAYER.dodge.iframes;
    Snd.dodge();
  }
  if (pressed.a1) castAbility(0);
  if (pressed.a2) castAbility(1);
  if (pressed.a3) castAbility(2);
  if (pressed.a4) castAbility(3);
  if (pressed.a5) castAbility(4);

  // movement
  let moving = false;
  if (p.dashAtk){
    const d = p.dashAtk;
    d.t += dt;
    const step = (d.dist / d.dur) * dt;
    const [rx, rz] = G.collider.move(p.x, p.z, Math.cos(d.dir) * step, Math.sin(d.dir) * step);
    p.x = rx; p.z = rz; moving = true;
    for (const e of G.entities){
      if (e.dying || d.hit.has(e)) continue;
      if (C.dist2d(p.x, p.z, e.x, e.z) < 1.1){ d.hit.add(e); playerHit(e, d.dmg, { noPassive: true }); }
    }
    if (d.t >= d.dur) p.dashAtk = null;
  } else if (p.dodging){
    const d = p.dodging;
    d.t += dt;
    const step = (C.PLAYER.dodge.dist / d.dur) * dt;
    const [rx, rz] = G.collider.move(p.x, p.z, Math.cos(d.dir) * step, Math.sin(d.dir) * step);
    p.x = rx; p.z = rz; moving = true;
    fx.wind({ x: p.x, z: p.z }, d.dir, 3);
    if (p.stats.sigs.includes('bondingJumper'))
      for (const e of G.entities)
        if (!e.dying && C.dist2d(p.x, p.z, e.x, e.z) < 1.0 && !(e.tagged > 0)){ e.tagged = 2; fx.burst(e.actor.group.position, 0x4ade80, 5, 3, 0.25); }
    if (d.t >= d.dur){ p.dodging = null; if (G.run.cls === 'lineman') p.rubberT = C.LINEMAN.passive.dur; }
  } else {
    const mv = controls.state.move;
    if (mv.lengthSq() > 0){
      const step = p.stats.moveSpeed * dt;
      const [rx, rz] = G.collider.move(p.x, p.z, mv.x * step, mv.z * step);
      p.x = rx; p.z = rz; moving = true;
    }
  }
  if (controls.state.rmbHeld && p.atkCd <= 0 && !p.dodging && G.run.flags.gotTool && G.mode === 'play') playerStrike();

  const face = moving && !controls.state.rmbHeld ? controls.state.move : controls.state.aim;
  if (face.lengthSq() > 0) G.playerActor.group.rotation.y = -Math.atan2(face.z, face.x) + Math.PI / 2;
  G.playerActor.group.position.x = p.x;
  G.playerActor.group.position.z = p.z;
  G.playerActor.update(dt, moving, p.stats.moveSpeed / 5);

  // exploration for the map overlay
  if (G.seen){
    const tx = Math.floor(p.x), tz = Math.floor(p.z);
    const key = tx + ',' + tz;
    if (G.lastSeen !== key){ G.lastSeen = key; markSeen(tx, tz); }
    if (hud.mapOpen()){
      G.mapT = (G.mapT || 0) + dt;
      if (G.mapT >= 0.25){ G.mapT = 0; drawMapNow(); }
    }
  }

  // interact + prompt
  {
    let best = null, bd = 1.8;
    for (const it of G.interactables){
      const d = C.dist2d(p.x, p.z, it.x, it.z);
      if (d < bd){ bd = d; best = it; }
    }
    if (pressed.interact && best) interact(best);
    if (best){
      const names = {
        shrine: 'Junction Shrine', loto: 'LOTO Door — 1 hard question', seal: 'Certification Trial',
        exit: 'Descend', toolrack: 'Tool rack', chest: 'Open the Job Box',
        forge: 'Workbench Forge', gate: best.locked ? 'Portal is dark — stamp the previous Seal' : `Portal to ${best.realm ? REALMS[best.realm].name : ''}`,
        hubgate: 'Return to Terminal Town',
        shop: 'Supply Shack', quests: 'Work Orders', stats: 'Service Record',
        abyss: 'The Abyss — endless descent', abyssExit: 'Descend deeper',
      };
      hud.setInteract(best.label || names[best.kind] || 'Interact', (best.kind === 'gate' && best.locked) ? null : keyLabel(binds.interact));
    } else hud.setInteract(null);
  }

  if (G.mode === 'hub'){
    if (G.hubAnim) G.hubAnim(dt); // waterfall, ripples, crystal pulse, sign bob
    // ambient townsfolk: slow target-point wander with idle pauses, kept out of
    // the pool and the cave rock by the hub collider
    const B = G.hubBounds || { w: 44, h: 26 };
    for (const n of G.npcs){
      let mv = false;
      if (n.waitT > 0) n.waitT -= dt;
      else if (n.tx === null){
        const tx = 4 + grng() * (B.w - 8), tz = 5.5 + grng() * (B.h - 9.5);
        if (G.collider.walkable(tx, tz)){ n.tx = tx; n.tz = tz; }
      } else {
        const dx = n.tx - n.x, dz = n.tz - n.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.25){ n.tx = null; n.waitT = 2 + grng() * 4; }
        else {
          const step = 1.1 * dt;
          const [nx, nz, blockedStep] = G.collider.move(n.x, n.z, dx / d * step, dz / d * step);
          if (blockedStep){ n.tx = null; n.waitT = 1.5 + grng() * 2; } // shore or rock: pick elsewhere
          n.x = nx; n.z = nz;
          n.actor.group.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;
          mv = true;
        }
      }
      n.actor.group.position.x = n.x;
      n.actor.group.position.z = n.z;
      n.actor.update(dt, mv, 0.9);
      n.it.x = n.x; n.it.z = n.z; // keep the talk prompt on the walker
    }
    rig.update(new THREE.Vector3(p.x, 0, p.z), dt);
    W.updateSun(lights, new THREE.Vector3(p.x, 0, p.z));
    return;
  }

  /* --- environmental hazards on the player --- */
  const realm = G.run.realm;
  if (realm === 2 || hazAt('heat', p.x, p.z) || G.dyn.active.some(a => a.kind === 'heat')){
    const ot = p.overtemp;
    const onHeat = hazAt('heat', p.x, p.z);
    if (onHeat && !p.stats.sigs.includes('ninetyDeg')){
      ot.onT += dt;
      if (ot.onT >= 1.5){ ot.onT = 0; ot.stacks = Math.min(HAZARDS[2].maxStacks, ot.stacks + 1); if (ot.stacks === 1) hud.toast('OVERTEMP — keep the current moving!'); }
    } else if (!onHeat && ot.stacks > 0){
      ot.shedT += dt;
      if (ot.shedT >= 1){ ot.shedT = 0; ot.stacks--; }
    }
    if (ot.stacks > 0){
      ot.dmgT += dt;
      if (ot.dmgT >= 0.5){ ot.dmgT = 0; damagePlayer(HAZARDS[2].dmgPerStack * ot.stacks * 0.5 + 0.5); }
    }
  }
  if (hazAt('ember', p.x, p.z)){
    p.emberT += dt;
    if (p.emberT >= 0.5){ p.emberT = 0; damagePlayer(HAZARDS[5].dps * 0.5); }
  } else p.emberT = 0;

  /* --- enemies --- */
  const world = {
    px: p.x, pz: p.z, playerAlive: p.hp > 0, time: G.time,
    los: (a, b, c2, d2) => G.collider.los(a, b, c2, d2),
    allies: G.entities.filter(e => !e.dying),
  };
  for (const e of G.entities){
    if (e.dying){
      if (e.actor.update(dt, false)) { scene.remove(e.actor.group); e.gone = true; }
      continue;
    }
    if (e.tagged > 0) e.tagged -= dt;
    if (e.tested > 0) e.tested -= dt;
    if (e.slowT > 0) e.slowT -= dt;
    if (e.def.boss){
      if (e.state === 'waiting'){
        if (C.dist2d(p.x, p.z, e.x, e.z) < 11){
          e.state = 'active';
          bossArenaSetup(e);
          hud.banner(e.def.name, { sub: BOSS_INTROS[e.def.id] || '', color: 'rgba(229,72,77,0.5)', dur: 4.5 });
          Snd.beep(110, 0.4, 'sawtooth', 0.15);
        } else continue;
      }
      bossArenaUpdate(e, dt);
      C.bossPostStagger(e);
    }
    const intent = C.tickEnemy(e, world, dt);
    e.untarget = !!intent.untargetable && !e.def.boss;
    if (intent.event) bossEvent(e, intent);
    // Series Arc: translucency + crackle aura while energized
    if (e.def.special && e.def.special.kind === 'phaseToggle'){
      const op = e.energized ? 1 : 0.3;
      e.actor.meshes.forEach(mm => { mm.material.transparent = true; mm.material.opacity = op; });
      if (e.energized && C.dist2d(e.x, e.z, p.x, p.z) < e.def.special.auraR){
        e.crackleT = (e.crackleT || 0) + dt;
        if (e.crackleT > 0.5){ e.crackleT = 0; damagePlayer(e.def.special.auraDps * 0.5); }
      }
    }
    e.moving = false;
    if (intent.move){
      const slow = e.slowT > 0 ? 0.85 : 1;
      const sp = e.def.speed * (intent.speedMult || 1) * slow;
      const [rx, rz, blockedMove] = G.collider.move(e.x, e.z, intent.move.x * sp * dt, intent.move.z * sp * dt);
      e.x = rx; e.z = rz; e.moving = true;
      if (blockedMove && e.state === 'charging'){ e.state = 'wallStun'; e.t = 0; fx.burst(e.actor.group.position, 0x8a2f23, 14, 5, 0.4); }
      e.actor.group.rotation.y = -Math.atan2(intent.move.z, intent.move.x) + Math.PI / 2;
    }
    if (intent.action) resolveEnemyAction(e, intent.action);
    if (intent.action2) resolveEnemyAction(e, intent.action2);
    e.actor.group.position.x = e.x;
    e.actor.group.position.z = e.z;
    e.actor.setCue(intent.cue);
    e.actor.update(dt, e.moving, e.def.speed / 4);
  }
  G.entities = G.entities.filter(e => !e.gone);

  /* --- summons --- */
  for (let i = G.summons.length - 1; i >= 0; i--){
    const su = G.summons[i];
    su.t += dt;
    if (su.t >= su.dur){
      fx.burst(su.actor.group.position, 0xf97316, 8, 3, 0.3);
      scene.remove(su.actor.group);
      G.summons.splice(i, 1);
      continue;
    }
    su.atkCd = Math.max(0, su.atkCd - dt);
    const supBonus = C.dist2d(su.x, su.z, p.x, p.z) <= p.stats.supervisorRadius ? (1 + C.FOREMAN.passive.bonus) : 1;
    if (su.kind === 'apprentice'){
      let target = null, bd = 14;
      for (const e of G.entities){
        if (e.dying || e.untarget) continue;
        const d = C.dist2d(su.x, su.z, e.x, e.z);
        if (d < bd){ bd = d; target = e; }
      }
      let mv = false;
      if (target){
        if (bd > 1.3){
          const step = su.cfg.speed * dt;
          const [nx, nz] = G.collider.move(su.x, su.z, (target.x - su.x) / bd * step, (target.z - su.z) / bd * step);
          su.x = nx; su.z = nz; mv = true;
        } else if (su.atkCd <= 0){
          su.atkCd = 1 / su.cfg.hitRate;
          damageEnemy(target, Math.round(p.stats.damage * su.cfg.dmg * supBonus), { noConduct: true });
          su.actor.setCue('strike');
        }
      } else if (C.dist2d(su.x, su.z, p.x, p.z) > 3){
        const d = C.dist2d(su.x, su.z, p.x, p.z);
        const step = su.cfg.speed * dt;
        const [nx, nz] = G.collider.move(su.x, su.z, (p.x - su.x) / d * step, (p.z - su.z) / d * step);
        su.x = nx; su.z = nz; mv = true;
      }
      su.actor.group.position.x = su.x;
      su.actor.group.position.z = su.z;
      su.actor.update(dt, mv, 1);
    } else { // spider box
      if (su.atkCd <= 0){
        let target = null, bd = su.cfg.radius;
        for (const e of G.entities){
          if (e.dying || e.untarget) continue;
          const d = C.dist2d(su.x, su.z, e.x, e.z);
          if (d < bd){ bd = d; target = e; }
        }
        if (target){
          su.atkCd = su.cfg.tick;
          damageEnemy(target, Math.round(p.stats.damage * su.cfg.dmg * supBonus), { noConduct: true });
          fx.burst(target.actor.group.position.clone().setY(0.9), 0x22d3ee, 4, 3, 0.2);
        }
      }
      su.actor.update(dt, false, 1);
    }
  }

  /* --- barricades --- */
  for (let i = G.barricades.length - 1; i >= 0; i--){
    const b = G.barricades[i];
    if (G.time >= b.expiry){
      b.tiles.forEach(k => G.barricadeBlocked.delete(k));
      scene.remove(b.mesh);
      G.barricades.splice(i, 1);
    }
  }

  /* --- enemy projectiles --- */
  for (let i = G.projectiles.length - 1; i >= 0; i--){
    const pr = G.projectiles[i];
    const step = pr.speed * dt;
    pr.x += Math.cos(pr.dir) * step; pr.z += Math.sin(pr.dir) * step;
    pr.traveled += step;
    if (!pr.mesh){
      pr.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffe082 }));
      scene.add(pr.mesh);
    }
    pr.mesh.position.set(pr.x, 0.9, pr.z);
    let dead = pr.traveled >= pr.range || G.collider.solid(pr.x, pr.z);
    let hitPlayer = false;
    if (!dead && p.iframesT <= 0 && C.dist2d(pr.x, pr.z, p.x, p.z) < 0.5){
      damagePlayer(pr.dmg);
      if (p.stats.sigs.includes('wiggy') && pr.src && !pr.src.dying) pr.src.tested = 3;
      dead = true; hitPlayer = true;
    }
    if (dead){
      const meta = pr.meta;
      if (meta){
        if (meta.zone){
          if (meta.zone.hazard) G.dyn.add(meta.zone.hazard, pr.x, pr.z, meta.zone.dur, G.time);
          else spawnZone({ x: pr.x, z: pr.z, radius: meta.zone.radius, dmg: pr.dmg, delay: meta.zone.delay || 0 });
        }
        if (meta.splash && !hitPlayer && p.iframesT <= 0 && C.dist2d(pr.x, pr.z, p.x, p.z) < meta.splash.radius)
          damagePlayer(meta.splash.dmg);
        if (meta.conducts && !hitPlayer && p.iframesT <= 0){
          const landPool = poolAt(pr.x, pr.z);
          if (landPool && landPool === poolAt(p.x, p.z)) damagePlayer(pr.dmg, { conducted: true });
        }
      }
      scene.remove(pr.mesh); G.projectiles.splice(i, 1);
    }
  }

  /* --- player shots --- */
  for (let i = G.pshots.length - 1; i >= 0; i--){
    const pr = G.pshots[i];
    const step = pr.speed * dt;
    pr.x += Math.cos(pr.dir) * step; pr.z += Math.sin(pr.dir) * step;
    pr.traveled += step;
    if (!pr.mesh){
      pr.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
      scene.add(pr.mesh);
    }
    pr.mesh.position.set(pr.x, 0.9, pr.z);
    let dead = pr.traveled >= pr.range || G.collider.solid(pr.x, pr.z);
    if (!dead){
      for (const e of G.entities){
        if (e.dying || e.untarget) continue;
        if (C.dist2d(pr.x, pr.z, e.x, e.z) < 0.7 + (e.def.boss ? 1.2 : 0)){
          playerHit(e, pr.dmg);
          dead = true;
          break;
        }
      }
    }
    if (dead){ scene.remove(pr.mesh); G.pshots.splice(i, 1); }
  }

  /* --- zones --- */
  for (let i = G.zones.length - 1; i >= 0; i--){
    const z = G.zones[i];
    z.t += dt;
    if (z.friendly){
      z.tickT += dt;
      if (z.tickT >= 1){
        z.tickT = 0;
        for (const e of G.entities) if (!e.dying && !e.untarget && C.inCircle(z.x, z.z, z.radius, e.x, e.z)) damageEnemy(e, z.dmg);
      }
      if (z.t >= z.dur){ scene.remove(z.decal); G.zones.splice(i, 1); }
      continue;
    }
    z.decal.material.opacity = 0.4 + 0.3 * Math.sin(z.t * 10);
    if (z.t >= Math.max(0.25, z.delay)){
      if (p.iframesT <= 0 && C.inCircle(z.x, z.z, z.radius, p.x, p.z)) damagePlayer(z.dmg);
      if (z.hazard) G.dyn.add(z.hazard, z.x, z.z, z.hazardDur || 3, G.time);
      fx.burst(new THREE.Vector3(z.x, 0.4, z.z), 0xff5533, 14, 5, 0.4);
      scene.remove(z.decal); G.zones.splice(i, 1);
    }
  }

  pickupDrops();
  for (const d of G.drops) d.group.userData.beam.material.opacity = 0.3 + 0.2 * Math.sin(G.time * 7);
  for (const it of G.interactables)
    if (it.group && it.group.userData.beacon)
      it.group.userData.beacon.material.opacity = 0.2 + 0.12 * Math.sin(G.time * 3 + it.x);

  if (G.wallCut){
    // only actors near the player can be on screen — skip far-off occluder work
    const near = o => Math.abs(o.x - p.x) < 19 && Math.abs(o.z - p.z) < 14;
    G.wallCut.update([p,
      ...G.entities.filter(e => !e.dying && near(e)),
      ...G.summons.filter(near), ...G.drops.filter(near)], dt);
  }

  const target = new THREE.Vector3(p.x, 0, p.z);
  rig.update(target, dt);
  W.updateSun(lights, target);
  updateHud();
}

function updateHud(){
  const p = G.player;
  if (!p) return;
  hud.setHealth(p.hp, p.stats.maxHp);
  const li = charLevelInfo(G.run.charXp);
  hud.setXP(li.need === Infinity ? 1 : li.into / li.need, li.lvl,
    li.need === Infinity ? 'MAX LEVEL' : `${li.into} / ${li.need} XP`);
  hud.setCurrency(G.run.stamps, G.run.salvage, G.run.volts);
}

/* ---------- home page ---------- */
function locLabel(run){
  if (run.loc === 'hub') return 'Terminal Town';
  if (run.loc === 'abyss') return `The Abyss · Depth ${(run.abyss && run.abyss.depth) || 1}`;
  const R = REALMS[run.realm];
  return `${R ? R.name : 'Realm ' + run.realm} · Floor ${(run.floorIdx || 0) + 1}`;
}
function whenLabel(ts){
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' '
    + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
async function menu(){
  G.mode = 'menu';
  const b = bank.active();
  const mastered = Q.masteredCount(profile.data, bank.all());
  const cards = saves.list().map(s => {
    const run = migrateRun(s.run); // local parse copy — persisted only on next saveRun
    const bi = bank.info(s.bank) || bank.info(bank.pick());
    return {
      id: s.id, name: s.name,
      cls: (C.CLASSES[run.cls] || C.LINEMAN).name,
      lvl: charLevelInfo(run.charXp || 0).lvl,
      seals: `${Object.keys(run.seals || {}).length}/5`,
      loc: locLabel(run),
      bank: bi ? `${bi.label} · ${bi.count}q` : 'Custom Upload',
      when: whenLabel(s.updated),
    };
  });
  const res = await hud.showHome({
    saves: cards,
    bankLabel: b.src,
    bankInfo: `New games start on: ${b.src} (${b.questions.length} questions) · Mastered ★ ${mastered}/${bank.all().length}`,
    stats: `Rank: ${profile.rank()} · Kills ${profile.data.stats.kills} · Seals ${profile.data.stats.seals} · ${VERSION}`,
  });
  const { action, id } = res;
  if (action === 'bank'){
    const picks = bank.picks();
    bank.setPick(picks[(picks.indexOf(bank.pick()) + 1) % picks.length]);
    return menu();
  }
  if (action === 'upload'){
    const up = await hud.showUpload({ onParse: Q.parseQuestionFile, templateCsv: Q.TEMPLATE_CSV });
    if (up) { bank.install(up.questions, up.src, Date.now()); hud.toast(`Installed ${up.questions.length} questions from ${up.src}`); }
    return menu();
  }
  if (action === 'settings'){
    await settingsFlow();
    return menu();
  }
  if (action === 'manual'){
    await hud.showManual(buildManualPages({ binds, keyLabel }));
    return menu();
  }
  if (action === 'rename'){
    saves.rename(id, res.name);
    return menu();
  }
  if (action === 'slotbank'){
    const s = saves.get(id);
    if (s){
      const picks = bank.picks();
      saves.setBank(id, picks[(picks.indexOf(s.bank) + 1) % picks.length]);
    }
    return menu();
  }
  if (action === 'delete'){
    const s = saves.get(id);
    if (s){
      const pick = await hud.dialog({
        title: 'Delete save', sub: s.name,
        body: 'This descent is gone for good. Question mastery is shared across saves and stays.',
        buttons: ['Delete', 'Keep'],
      });
      if (pick === 0) saves.remove(id);
    }
    return menu();
  }
  if (action === 'resume'){
    const s = saves.get(id);
    if (!s) return menu();
    saves.setActive(id);
    if (s.bank) bank.setPick(s.bank);
    G.run = migrateRun(s.run);
    if (G.run.loc === 'hub') enterHub();
    else if (G.run.loc === 'abyss' && G.run.abyss) startAbyssFloor(G.run.abyss.depth || 1);
    else startFloor(G.run.floorIdx || 0);
    return;
  }
  newRun();
}

/* ---------- keyboard: License Board ---------- */
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'b' && G.run && (G.mode === 'play' || G.mode === 'hub') && !G.paused) boardFlow();
});

/* ---------- keyboard: warp to town ---------- */
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'h' && G.run && G.mode === 'play' && !G.paused && !hud.inventoryOpen()) warpToTown();
});

/* ---------- debug hook ---------- */
window.__dbg = {
  G, profile, bank, saves, Snd, fx, renderer, lights, applyGraphics, scene, camera, THREE,
  teleportFloor: i => startFloor(i),
  setRealm: (r, floor = 0) => { G.run.realm = r; startFloor(floor); },
  hub: () => enterHub(),
  spawn: id => {
    for (let r = 2; r < 8; r += 0.5) for (let a = 0; a < Math.PI * 2; a += Math.PI / 6){
      const x = G.player.x + Math.cos(a) * r, z = G.player.z + Math.sin(a) * r;
      if (G.collider.walkable(x, z)) return spawnEnemy(id, x, z);
    }
    return spawnEnemy(id, G.player.x + 2, G.player.z);
  },
  grant: (rarity = 'certified') => { const it = L.makeItem('tool', G.run.realm, rarity, grng); it.identified = true; G.run.backpack.push(it); refreshStats(); },
  drop: (rarity = 'rated') => { const it = L.makeItem(L.SLOTS[Math.floor(grng() * 6)], G.run.realm, rarity, grng); it.identified = true; dropItem(it, G.player.x + 1, G.player.z); },
  equipTool: (rarity = 'rated') => {
    const it = L.makeItem('tool', G.run.realm, rarity, grng); it.identified = true;
    G.run.equipped.tool = it; G.run.flags.gotTool = true; refreshStats(); return it.name;
  },
  refresh: () => refreshStats(),
  god: () => { G.player.stats.dr = 0.95; G.player.hp = G.player.stats.maxHp = 9999; },
  forceQuestion: () => ask({}, { title: 'Debug Question' }),
  killBoss: () => { const b = G.entities.find(e => e.def.boss); if (b){ b.bs.phase = 'p2'; damageEnemy(b, 99999); } },
  sealAll: () => { for (let r = 1; r <= 5; r++) G.run.seals[r] = true; saveRun(); },
  state: () => ({ mode: G.mode, cls: G.run?.cls, realm: G.run?.realm, floor: G.run?.floorIdx, hp: G.player?.hp, level: charLevel(), stamps: G.run?.stamps, seals: G.run?.seals }),
};

menu();
requestAnimationFrame(frame);
