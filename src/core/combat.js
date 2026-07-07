// Pure combat logic: derived stats, hit geometry, Lineman kit, License Board,
// enemy AI state machines (intent out, no side effects on the world).
// Specs: combat-classes.md; enemy defs in balance.js.

import { AFFIX_BY_ID } from './loot.js';

/* ---- geometry (XZ plane) ---- */
export const dist2d = (ax, az, bx, bz) => Math.hypot(bx - ax, bz - az);
export const angleTo = (ax, az, bx, bz) => Math.atan2(bz - az, bx - ax);

export function inArc(ox, oz, dirAngle, range, arcDeg, px, pz){
  const d = dist2d(ox, oz, px, pz);
  if (d > range) return false;
  if (d < 0.001) return true;
  let da = Math.atan2(pz - oz, px - ox) - dirAngle;
  while (da > Math.PI) da -= 2 * Math.PI;
  while (da < -Math.PI) da += 2 * Math.PI;
  return Math.abs(da) <= (arcDeg * Math.PI / 180) / 2;
}
export const inCircle = (cx, cz, r, px, pz) => dist2d(cx, cz, px, pz) <= r;
export function inLine(ox, oz, dirAngle, len, width, px, pz){
  const dx = Math.cos(dirAngle), dz = Math.sin(dirAngle);
  const rx = px - ox, rz = pz - oz;
  const along = rx * dx + rz * dz;
  if (along < 0 || along > len) return false;
  return Math.abs(rx * -dz + rz * dx) <= width / 2;
}

/* ---- player foundation ---- */
export const PLAYER = {
  baseMoveSpeed: 5.0, moveSpeedCap: 0.20,
  dodge: { dist: 4.2, dur: 0.35, iframes: 0.30, cd: 1.2 },
  armorK: 200, drCap: 0.6,
};
export const RARITY_MULT = { stock: 1.0, rated: 1.15, certified: 1.30, master: 1.45 };

export const LINEMAN = {
  id: 'lineman', name: 'Lineman', desc: 'Melee bruiser — heavy swings, pulls, and a planted Ground Rod.',
  wdCoeff: 1.0,
  basic: { type: 'melee', range: 1.8, arc: 100, dmgMult: 1.0, atkSpeed: 1.2 },
  abilities: [
    { id: 'gaffLunge', key: '1', name: 'Gaff Lunge', cd: 5, dash: 4, width: 1.2, dmg: 1.4,
      desc: 'Dash 4 u toward your aim, striking everything in the path for 140% damage.' },
    { id: 'comeAlong', key: '2', name: 'Come-Along', cd: 8, arc: 120, range: 5, dmg: 0.6, pull: 3, stagger: 0.5, maxTargets: 5,
      desc: 'Yank up to 5 enemies in a frontal arc toward you — 60% damage and a short stagger.' },
    { id: 'groundRod', key: '3', name: 'Ground Rod', cd: 12, radius: 2.5, dmg: 2.5, tick: 0.2, dur: 3, knockdown: 0.8,
      desc: 'Slam a rod at your feet: 250% damage around you, then a shocking field that ticks for 3 s.' },
    { id: 'insulatingBlanket', key: '4', name: 'Insulating Blanket', cd: 14, dr: 0.5, dur: 3.0,
      desc: 'Wrap up in Class-2 rubber: 50% damage reduction for 3 s. Stand your ground.' },
    { id: 'loadBreak', key: '5', name: 'Load Break', cd: 10, radius: 3, dmg: 0.4, push: 3, stagger: 0.4,
      desc: 'Concussive 360° pop: 40% damage, shoves enemies back and staggers them. Bosses hold fast.' },
  ],
  passive: { id: 'rubberGoods', name: 'Rubber Goods', desc: 'Dodge roll grants 25% damage reduction for 1.5 s after it ends.', dr: 0.25, dur: 1.5 },
};

export const TESTER = {
  id: 'tester', name: 'Tester', desc: 'Ranged burst — probe zaps, beams, and one huge Hipot Discharge.',
  wdCoeff: 0.8,
  basic: { type: 'proj', range: 9, speed: 14, dmgMult: 1.0, atkSpeed: 1.4 },
  abilities: [
    { id: 'meggerSurge', key: '1', name: 'Megger Surge', cd: 6, len: 10, width: 1.2, dmg: 2.2,
      desc: 'Fire a piercing 10 u beam through everything in line — 220% damage.' },
    { id: 'leadFan', key: '2', name: 'Lead Fan', cd: 8, count: 5, arc: 35, range: 8, dmg: 0.7,
      desc: 'Loose a fan of 5 probes in a tight arc, 70% damage each. All five point-blank is the ceiling.' },
    { id: 'hipot', key: '3', name: 'Hipot Discharge', cd: 14, range: 9, dmg: 4.0, splashR: 2, splashDmg: 0.5,
      desc: 'Zap the nearest target ahead for 400% damage, splashing half your damage to its neighbors.' },
    { id: 'ampClamp', key: '4', name: 'Amp Clamp', cd: 12, range: 9, dmg: 0.3, hold: 2.5,
      desc: 'Clamp one enemy at probe range: 30% damage and locks it in place for 2.5 s. Bosses shrug it off.' },
    { id: 'quickDisconnect', key: '5', name: 'Quick Disconnect', cd: 8, dash: 4.5, dmg: 0.3, iframes: 0.25,
      desc: 'Hop 4.5 u AWAY from your cursor with brief invulnerability, zapping anything you slip through.' },
  ],
  passive: { id: 'calibrated', name: 'Calibrated', desc: 'First hit against a full-HP enemy deals +100%.', fullHpBonus: 1.0 },
};

export const FOREMAN = {
  id: 'foreman', name: 'Foreman', desc: 'Summoner — apprentices, barricades, and a zapping Spider Box.',
  wdCoeff: 0.8,
  basic: { type: 'melee', range: 1.8, arc: 100, dmgMult: 1.0, atkSpeed: 1.0 },
  abilities: [
    { id: 'apprentices', key: '1', name: 'Apprentice Dispatch', cd: 12, count: 2, dur: 15, dmg: 0.3, hitRate: 1.0, speed: 4.6,
      desc: 'Dispatch 2 apprentices for 15 s. They chase what is closest and swing for 30% of your damage.' },
    { id: 'barricade', key: '2', name: 'Barricade', cd: 10, width: 3, dur: 4,
      desc: 'Drop a 3-wide wall at the cursor for 4 s. Blocks walking — theirs and yours — but not projectiles.' },
    { id: 'spiderBox', key: '3', name: 'Spider Box', cd: 14, radius: 6, dur: 8, dmg: 0.4, tick: 0.5,
      desc: 'Place a turret for 8 s: zaps the nearest enemy within 6 u for 40% damage every half second.' },
    { id: 'stopWork', key: '4', name: 'Stop Work Order', cd: 14, radius: 5, hold: 1.5,
      desc: 'Blow the whistle: every non-boss enemy within 5 u stops work for 1.5 s. No damage.' },
    { id: 'musterPoint', key: '5', name: 'Muster Point', cd: 8, scatter: 1.2,
      desc: 'Rally every active summon to your cursor on the spot. Free if no crew is out.' },
  ],
  passive: { id: 'siteSupervisor', name: 'Site Supervisor', desc: 'Summons within 4 u deal +15% and inherit your stats.', radius: 4, bonus: 0.15 },
};

export const CLASSES = { lineman: LINEMAN, tester: TESTER, foreman: FOREMAN };

/* ---- License Board (Lineman; combat-classes.md) ---- */
export const LINEMAN_BOARD = [
  { id: 'torqueSpec', name: 'Torque Spec', lvl: 2, fx: { dmgPct: 0.05 } },
  { id: 'steelToes', name: 'Steel Toes', lvl: 4, fx: { hpFlat: 15 } },
  { id: 'quickHands', name: 'Quick Hands', lvl: 6, fx: { asPct: 0.05 } },
  { id: 'bracedStance', name: 'Braced Stance', lvl: 8, fx: { armorFlat: 10 } },
  { id: 'longReach', name: 'Long Reach', lvl: 10, fx: { rangeTo: 2.1, arcTo: 120 } },
  { id: 'doubleCrimp', name: 'Double Crimp', lvl: 12, gate: { cat: 'CIRC', pct: 0.4 }, fx: { doubleCrimp: true } },
  { id: 'workHardened', name: 'Work Hardened', lvl: 14, fx: { hpFlat: 20 } },
  { id: 'freshEdge', name: 'Fresh Edge', lvl: 16, fx: { dmgPct: 0.08 } },
  { id: 'journeymanCard', name: 'Journeyman Card', lvl: 18, gate: { cat: 'GRND', pct: 0.5 }, fx: { dmgPct: 0.06, asPct: 0.06 } },
  { id: 'hardHatRated', name: 'Hard Hat Rated', lvl: 20, fx: { armorFlat: 15 } },
  { id: 'overtime', name: 'Overtime', lvl: 22, fx: { asPct: 0.08 } },
  { id: 'arcRatedSuit', name: 'Arc-Rated Suit', lvl: 24, gate: { cat: 'OCP', pct: 0.6 }, fx: { cheatDeath: 60 } },
];

export const TESTER_BOARD = [
  { id: 'sharpProbes', name: 'Sharp Probes', lvl: 2, fx: { dmgPct: 0.05 } },
  { id: 'insulatedSoles', name: 'Insulated Soles', lvl: 4, fx: { hpFlat: 15 } },
  { id: 'fastSampling', name: 'Fast Sampling', lvl: 6, fx: { asPct: 0.05 } },
  { id: 'fieldCase', name: 'Field Case', lvl: 8, fx: { armorFlat: 10 } },
  { id: 'longLeads', name: 'Long Leads', lvl: 10, fx: { projRangeTo: 10.5 } },
  { id: 'dualTrace', name: 'Dual Trace', lvl: 12, gate: { cat: 'CIRC', pct: 0.4 }, fx: { dualTrace: true } },
  { id: 'ruggedHousing', name: 'Rugged Housing', lvl: 14, fx: { hpFlat: 20 } },
  { id: 'precisionCal', name: 'Precision Cal', lvl: 16, fx: { dmgPct: 0.08 } },
  { id: 'benchVerified', name: 'Bench Verified', lvl: 18, gate: { cat: 'COND', pct: 0.5 }, fx: { dmgPct: 0.06, asPct: 0.06 } },
  { id: 'cat4Rated', name: 'CAT IV Rated', lvl: 20, fx: { armorFlat: 15 } },
  { id: 'highSampleRate', name: 'High Sample Rate', lvl: 22, fx: { asPct: 0.08 } },
  { id: 'transientCapture', name: 'Transient Capture', lvl: 24, gate: { cat: 'OCP', pct: 0.6 }, fx: { transientCapture: true } },
];

export const FOREMAN_BOARD = [
  { id: 'punchList', name: 'Punch List', lvl: 2, fx: { dmgPct: 0.05 } },
  { id: 'brokenInBoots', name: 'Broken-In Boots', lvl: 4, fx: { hpFlat: 15 } },
  { id: 'tightSchedule', name: 'Tight Schedule', lvl: 6, fx: { asPct: 0.05 } },
  { id: 'hiVisVest', name: 'Hi-Vis Vest', lvl: 8, fx: { armorFlat: 10 } },
  { id: 'wideSupervision', name: 'Wide Supervision', lvl: 10, fx: { supervisorRadius: 6 } },
  { id: 'thirdApprentice', name: 'Third Apprentice', lvl: 12, gate: { cat: 'CIRC', pct: 0.4 }, fx: { thirdApprentice: true } },
  { id: 'safetyMargin', name: 'Safety Margin', lvl: 14, fx: { hpFlat: 20 } },
  { id: 'changeOrder', name: 'Change Order', lvl: 16, fx: { dmgPct: 0.08 } },
  { id: 'masterSchedule', name: 'Master Schedule', lvl: 18, gate: { cat: 'DIST', pct: 0.5 }, fx: { dmgPct: 0.06, asPct: 0.06 } },
  { id: 'hardBarricades', name: 'Hard Barricades', lvl: 20, fx: { barricadeDur: 6 } },
  { id: 'overtimeApproved', name: 'Overtime Approved', lvl: 22, fx: { asPct: 0.08 } },
  { id: 'dualFeed', name: 'Dual Feed', lvl: 24, gate: { cat: 'OCP', pct: 0.6 }, fx: { dualFeed: true } },
];

export const BOARDS = { lineman: LINEMAN_BOARD, tester: TESTER_BOARD, foreman: FOREMAN_BOARD };

export function activeBoardNodes(board, level, masteryPctByCat){
  return board.filter(n => level >= n.lvl && (!n.gate || (masteryPctByCat[n.gate.cat] || 0) >= n.gate.pct));
}

/* ---- derived stats ---- */
// items: array of loot.js items (equipped). certTags: Set of realm tags at >=60% mastery.
export function derivedStats(level, items, { certTags = new Set(), boardNodes = [], cls = LINEMAN } = {}){
  let dmgFlat = 0, dmgPct = 0, asPct = 0, armorFlat = 0, armorPct = 0, hpFlat = 0, hpPct = 0, msPct = 0;
  let stampShrine = 0, stampTrial = 0, salvagePct = 0;
  let toolDmg = 0;
  const sigs = [];
  for (const it of items){
    if (!it) continue;
    const mult = (RARITY_MULT[it.rarity] || 1) * (certTags.has(it.tag) ? 1.10 : 1);
    for (const imp of (it.implicits || [])){
      const v = imp.value * mult;
      if (imp.stat === 'damage') toolDmg += v;
      else if (imp.stat === 'armor') armorFlat += v;
      else if (imp.stat === 'hp') hpFlat += v;
      else if (imp.stat === 'asPct') asPct += v / 100;
      else if (imp.stat === 'msPct') msPct += v / 100;
    }
    if (it.identified !== false) for (const a of (it.affixes || [])){
      const def = AFFIX_BY_ID[a.id];
      if (!def) continue;
      const v = a.value * (certTags.has(it.tag) ? 1.10 : 1);
      switch (def.feeds){
        case 'dmgFlat': dmgFlat += v; break;
        case 'dmgPct': dmgPct += v / 100; break;
        case 'asPct': asPct += v / 100; break;
        case 'armorFlat': armorFlat += v; break;
        case 'armorPct': armorPct += v / 100; break;
        case 'hpFlat': hpFlat += v; break;
        case 'hpPct': hpPct += v / 100; break;
        case 'msPct': msPct += v / 100; break;
        case 'stampShrine': stampShrine += 1; break;
        case 'stampTrial': stampTrial += 1; break;
        case 'salvagePct': salvagePct += a.value / 100; break;
      }
    }
    if (it.sig) sigs.push(it.sig);
  }
  let rangeTo = null, arcTo = null, projRangeTo = null, doubleCrimp = false, cheatDeath = 0;
  let dualTrace = false, transientCapture = false, thirdApprentice = false, dualFeed = false;
  let supervisorRadius = null, barricadeDur = null;
  for (const n of boardNodes){
    const f = n.fx;
    if (f.dmgPct) dmgPct += f.dmgPct;
    if (f.asPct) asPct += f.asPct;
    if (f.hpFlat) hpFlat += f.hpFlat;
    if (f.armorFlat) armorFlat += f.armorFlat;
    if (f.rangeTo) rangeTo = f.rangeTo;
    if (f.arcTo) arcTo = f.arcTo;
    if (f.projRangeTo) projRangeTo = f.projRangeTo;
    if (f.doubleCrimp) doubleCrimp = true;
    if (f.cheatDeath) cheatDeath = f.cheatDeath;
    if (f.dualTrace) dualTrace = true;
    if (f.transientCapture) transientCapture = true;
    if (f.thirdApprentice) thirdApprentice = true;
    if (f.dualFeed) dualFeed = true;
    if (f.supervisorRadius) supervisorRadius = f.supervisorRadius;
    if (f.barricadeDur) barricadeDur = f.barricadeDur;
  }
  const armor = (armorFlat) * (1 + armorPct);
  const dr = Math.min(PLAYER.drCap, armor / (armor + PLAYER.armorK));
  return {
    damage: Math.max(1, Math.round((toolDmg * cls.wdCoeff + dmgFlat) * (1 + dmgPct))) || 1,
    atkSpeed: cls.basic.atkSpeed * (1 + asPct),
    armor: Math.round(armor), dr,
    maxHp: Math.round((100 + 10 * level + hpFlat) * (1 + hpPct)),
    moveSpeed: PLAYER.baseMoveSpeed * (1 + Math.min(PLAYER.moveSpeedCap, msPct)),
    range: rangeTo || cls.basic.range,
    arc: arcTo || cls.basic.arc || 0,
    projRange: projRangeTo || cls.basic.range,
    stampShrine, stampTrial, salvagePct, doubleCrimp, cheatDeath, sigs,
    dualTrace, transientCapture, thirdApprentice, dualFeed,
    supervisorRadius: supervisorRadius || FOREMAN.passive.radius,
    barricadeDur: barricadeDur || FOREMAN.abilities[1].dur,
  };
}

export const mitigated = (dmg, dr, extra = 0) => Math.max(1, Math.round(dmg * (1 - dr) * (1 - extra)));

/* ---- enemy AI (pure state machines: (e, world, dt) -> intent) ----
   e: {def, x, z, hp, hpMax, state, t, facing, dir, flinchAt, sp:{...}}
   world: {px, pz, playerAlive, time, los(x0,z0,x1,z1)->bool}
   intent: {move:{x,z}|null, action|null, cue} */

const toward = (e, x, z) => {
  const d = dist2d(e.x, e.z, x, z);
  return d < 0.01 ? null : { x: (x - e.x) / d, z: (z - e.z) / d };
};

export function tickChaser(e, w, dt){
  const d = dist2d(e.x, e.z, w.px, w.pz);
  e.t += dt;
  switch (e.state){
    case 'idle':
      if (d <= e.def.aggroR && w.playerAlive){ e.state = 'chase'; e.t = 0; }
      return { move: null, action: null, cue: 'idle' };
    case 'chase':
      if (d <= (e.def.strikeR || 1.5)){ e.state = 'windup'; e.t = 0; return { move: null, action: null, cue: 'windup' }; }
      return { move: toward(e, w.px, w.pz), action: null, cue: 'walk' };
    case 'windup':
      if (e.t >= (e.def.windup ?? 0.5)){
        e.state = 'recover'; e.t = 0;
        return { move: null, action: { type: 'melee', dmg: e.def.hit, arc: 90, range: 1.8, dir: angleTo(e.x, e.z, w.px, w.pz) }, cue: 'strike' };
      }
      return { move: null, action: null, cue: 'windup' };
    case 'recover':
      if (e.t >= (e.def.recover || 0.6)){ e.state = 'chase'; e.t = 0; }
      return { move: null, action: null, cue: 'idle' };
    case 'flinch':
      if (e.t >= 0.15){ e.state = e.prev || 'chase'; e.t = 0; }
      return { move: null, action: null, cue: 'hurt' };
    default: e.state = 'idle'; return { move: null, action: null, cue: 'idle' };
  }
}

export function tickSpitter(e, w, dt){
  const d = dist2d(e.x, e.z, w.px, w.pz);
  e.t += dt;
  switch (e.state){
    case 'idle':
      if (d <= e.def.aggroR && w.playerAlive){ e.state = 'position'; e.t = 0; }
      return { move: null, action: null, cue: 'idle' };
    case 'position': {
      const [lo, hi] = e.def.band;
      const los = w.los(e.x, e.z, w.px, w.pz);
      if (!los) return { move: toward(e, w.px, w.pz), action: null, cue: 'walk' };
      if (d < lo){ const m = toward(e, w.px, w.pz); return { move: m && { x: -m.x, z: -m.z }, action: null, cue: 'walk' }; }
      if (d > hi) return { move: toward(e, w.px, w.pz), action: null, cue: 'walk' };
      e.state = 'aim'; e.t = 0; e.aimX = w.px; e.aimZ = w.pz;
      return { move: null, action: null, cue: 'windup' };
    }
    case 'aim':
      e.aimX = w.px; e.aimZ = w.pz; // track until lock at fire
      if (e.t >= (e.def.aim ?? 0.6)){
        e.state = 'cooldown'; e.t = 0;
        return {
          move: null, cue: 'strike',
          action: { type: 'projectile', dmg: e.def.hit, dir: angleTo(e.x, e.z, e.aimX, e.aimZ), speed: e.def.projSpeed, range: e.def.projRange },
        };
      }
      return { move: null, action: null, cue: 'windup' };
    case 'cooldown': {
      if (e.t >= (e.def.spitCd ?? 1.2)){ e.state = 'position'; e.t = 0; }
      const m = toward(e, w.px, w.pz);
      const side = e.strafeSide || (e.strafeSide = (e.x + e.z) % 2 < 1 ? 1 : -1);
      return { move: m && { x: -m.z * side, z: m.x * side }, action: null, cue: 'walk' };
    }
    case 'flinch':
      if (e.t >= 0.15){ e.state = e.prev || 'position'; e.t = 0; }
      return { move: null, action: null, cue: 'hurt' };
    default: e.state = 'idle'; return { move: null, action: null, cue: 'idle' };
  }
}

// special: base machine + one hook per region doc
export function tickSpecial(e, w, dt){
  const sp = e.def.special;

  if (sp.kind === 'splitAt50'){ // R1 Branch Tap
    if (!e.split && e.hp <= e.hpMax * 0.5){
      e.split = true;
      return { move: null, action: { type: 'spawn', id: sp.spawnId, count: sp.count, killSelf: true }, cue: 'special' };
    }
    return tickChaser(e, w, dt);
  }

  if (sp.kind === 'trail'){ // R2 Sheath Creeper: spitter base, drips hazard tiles while in band
    const intent = tickSpitter(e, w, dt);
    if (e.state !== 'idle'){
      e.trailT = (e.trailT || 0) + dt;
      if (e.trailT >= sp.every){
        e.trailT = 0;
        intent.action = intent.action || { type: 'hazard', hazard: sp.hazard, x: e.x, z: e.z, dur: sp.dur };
      }
    }
    return intent;
  }

  if (sp.kind === 'allyShield'){ // R3 Bootleg Bond: tether-shield nearby allies once
    if (!e.shieldCast && w.allies && w.allies.length){
      const near = w.allies.filter(a => a !== e && !a.shield && dist2d(e.x, e.z, a.x, a.z) <= sp.range);
      if (near.length){
        if (e.state !== 'shieldWindup'){ e.prev = e.state; e.state = 'shieldWindup'; e.t = 0; }
        e.t += dt;
        if (e.t >= sp.castTime){
          e.shieldCast = true; e.state = 'chase'; e.t = 0;
          return { move: null, action: { type: 'allyShield', range: sp.range, maxAllies: sp.maxAllies, shieldPct: sp.shieldPct }, cue: 'special' };
        }
        return { move: null, action: null, cue: 'windup' };
      }
    }
    return tickChaser(e, w, dt);
  }

  if (sp.kind === 'aura'){ // R4 Sag Node: plain slow chaser; the aura is a world rule keyed on proximity
    return tickChaser(e, w, dt);
  }

  if (sp.kind === 'phaseToggle'){ // R5 Series Arc: energized/de-energized cycle
    e.phaseT = (e.phaseT || 0) + dt;
    const cycle = sp.onSec + sp.offSec;
    const energized = (e.phaseT % cycle) < sp.onSec;
    e.energized = energized;
    const intent = tickChaser(e, w, dt);
    intent.untargetable = !energized;
    if (!energized) intent.cue = 'special';
    return intent;
  }

  return tickChaser(e, w, dt);
}

// elite 'chainedLunge' modifier (R2 Overamp Feeder, R5 Three-Phase Fault):
// N linked lunges with mini-windups, optional hazard trail, then a vulnerable self-stagger
export function tickEliteChainedLunge(e, w, dt){
  const mod = e.def.elite;
  e.t += dt;
  if (e.state === 'clWindup'){
    if (e.t >= 0.5){
      e.state = 'clLunge'; e.t = 0;
      e.lungeDir = angleTo(e.x, e.z, w.px, w.pz);
    }
    return { move: null, action: null, cue: 'windup' };
  }
  if (e.state === 'clLunge'){
    if (e.t >= 0.45){
      e.lungeIdx = (e.lungeIdx || 0) + 1;
      if (e.lungeIdx >= mod.lunges){
        e.lungeIdx = 0; e.state = 'clStagger'; e.t = 0; e.vulnerable = true;
        return { move: null, action: null, cue: 'hurt' };
      }
      e.state = 'clWindup'; e.t = 0.25; // shorter mini-windup between lunges
      return { move: null, action: null, cue: 'windup' };
    }
    const intent = {
      move: { x: Math.cos(e.lungeDir), z: Math.sin(e.lungeDir) }, speedMult: 2.4,
      action: { type: 'contact', dmg: e.def.hit, knockback: 2 }, cue: 'special',
    };
    if (mod.trailHazard){
      e.trailT = (e.trailT || 0) + dt;
      if (e.trailT >= 0.15){ e.trailT = 0; intent.action2 = { type: 'hazard', hazard: mod.trailHazard, x: e.x, z: e.z, dur: 3 }; }
    }
    return intent;
  }
  if (e.state === 'clStagger'){
    if (e.t >= mod.staggerSec){ e.state = 'chase'; e.t = 0; e.vulnerable = false; e.lungeCd = 7; }
    return { move: null, action: null, cue: 'hurt' };
  }
  e.lungeCd = (e.lungeCd ?? 3) - dt;
  const d = dist2d(e.x, e.z, w.px, w.pz);
  if (e.lungeCd <= 0 && d > 2.5 && d < 12 && w.los(e.x, e.z, w.px, w.pz)){
    e.state = 'clWindup'; e.t = 0;
    return { move: null, action: null, cue: 'windup' };
  }
  return tickChaser(e, w, dt);
}

// elite 'trail' modifier (R3 Galvanic Creep): chaser that drips hazard tiles
export function tickEliteTrail(e, w, dt){
  const mod = e.def.elite;
  const intent = tickChaser(e, w, dt);
  if (e.state === 'chase'){
    e.trailT = (e.trailT || 0) + dt;
    if (e.trailT >= mod.every){
      e.trailT = 0;
      intent.action = intent.action || { type: 'hazard', hazard: mod.hazard, x: e.x, z: e.z, dur: mod.dur };
    }
  }
  return intent;
}

// elite 'auraVent' modifier (R4 Padmount Hotbox): big brownout aura + telegraphed heat ring
export function tickEliteAuraVent(e, w, dt){
  const mod = e.def.elite;
  e.t += dt;
  if (e.state === 'ventWindup'){
    if (e.t >= mod.ventTelegraph){
      e.state = 'chase'; e.t = 0; e.ventCd = mod.ventEvery;
      return { move: null, action: { type: 'zone', x: e.x, z: e.z, radius: mod.ventRadius, dmg: mod.ventDmg, delay: 0 }, cue: 'strike' };
    }
    return { move: null, action: null, cue: 'windup' };
  }
  e.ventCd = (e.ventCd ?? mod.ventEvery) - dt;
  const d = dist2d(e.x, e.z, w.px, w.pz);
  if (e.ventCd <= 0 && d < mod.ventRadius + 3){
    e.state = 'ventWindup'; e.t = 0;
    return { move: null, action: null, cue: 'windup' };
  }
  return tickChaser(e, w, dt);
}

// elite 'charge' modifier (R1 Bolted Short): telegraphed straight-line charge
export function tickEliteCharge(e, w, dt){
  e.t += dt;
  if (e.state === 'chargeWindup'){
    if (e.t >= 0.7){
      e.state = 'charging'; e.t = 0;
      e.chargeDir = angleTo(e.x, e.z, w.px, w.pz);
      return { move: null, action: null, cue: 'special' };
    }
    return { move: null, action: null, cue: 'windup' };
  }
  if (e.state === 'charging'){
    if (e.t >= 1.0){ e.state = 'chase'; e.t = 0; e.chargeCd = 6; }
    return {
      move: { x: Math.cos(e.chargeDir), z: Math.sin(e.chargeDir) }, speedMult: 2.6,
      action: { type: 'contact', dmg: e.def.hit, knockback: 3 }, cue: 'special', // canon: elite hit IS §4's elite value, no ×1.25
    };
  }
  if (e.state === 'wallStun'){
    if (e.t >= 2.0){ e.state = 'chase'; e.t = 0; }
    return { move: null, action: null, cue: 'hurt' };
  }
  e.chargeCd = (e.chargeCd ?? 4) - dt;
  const d = dist2d(e.x, e.z, w.px, w.pz);
  if (e.chargeCd <= 0 && d > 3 && d < 11 && w.los(e.x, e.z, w.px, w.pz)){
    e.state = 'chargeWindup'; e.t = 0;
    return { move: null, action: null, cue: 'windup' };
  }
  return tickChaser(e, w, dt);
}

/* ---- boss framework (The Open Main uses this; region tables in balance.js) ---- */
export function makeBossState(def){
  return {
    phase: 'intro', t: 0, atkIdx: 0, atkCd: 1.5, openTimer: def.boss.openEvery,
    shield: 0, breakCorrect: 0, addsDone: false, padA: 0, padB: 0, wedgeAngle: 0,
  };
}

export function tickBoss(e, w, dt){
  const B = e.def.boss, s = e.bs;
  s.t += dt;
  const d = dist2d(e.x, e.z, w.px, w.pz);
  const cadence = e.hp <= e.hpMax * 0.5 ? 1.6 : 2.0;

  switch (s.phase){
    case 'intro':
      if (s.t >= 2){ s.phase = 'p1'; s.t = 0; }
      return { move: null, action: null, cue: 'idle', untargetable: true };
    case 'p1':
    case 'p2': {
      if (s.phase === 'p1' && e.hp <= e.hpMax * 0.5){
        s.phase = 'break'; s.t = 0; s.shield = 100; s.breakCorrect = 0;
        return { move: null, action: null, cue: 'special', event: 'breakStart' };
      }
      if (s.phase === 'p2' && B.addsAt && !s.addsDone && e.hp <= e.hpMax * B.addsAt){
        s.addsDone = true;
        return { move: null, action: { type: 'spawn', id: B.addsId, count: B.addsCount }, cue: 'special' };
      }
      if (s.phase === 'p1' && B.openEvery){ // The Open Main: throw-open cycle
        s.openTimer -= dt;
        if (s.openTimer <= 0){ s.phase = 'open'; s.t = 0; s.padA = 0; s.padB = 0; return { move: null, action: null, cue: 'special', event: 'openStart' }; }
      }
      // per-phase periodic spawns
      const spawnCfg = B.spawnEvery && B.spawnEvery[s.phase];
      if (spawnCfg){
        s.spawnT = (s.spawnT ?? spawnCfg.every) - dt;
        if (s.spawnT <= 0){
          s.spawnT = spawnCfg.every;
          return { move: null, action: { type: 'spawn', id: spawnCfg.id, count: spawnCfg.count }, cue: 'special' };
        }
      }
      // re-strike teleports (The Incident)
      const restrikeEvery = s.phase === 'p1' ? B.restrikeP1 : B.restrikeP2;
      if (restrikeEvery){
        s.restrikeT = (s.restrikeT ?? restrikeEvery) - dt;
        if (s.restrikeT <= 0){
          s.restrikeT = restrikeEvery;
          return { move: null, action: null, cue: 'special', event: 'restrike' };
        }
      }
      // Arc Blast (The Incident, P2 only): pylon-cover full-arena blast
      if (s.phase === 'p2' && B.arcBlastEvery){
        s.blastT = (s.blastT ?? B.arcBlastEvery) - dt;
        if (s.blastT <= 0){
          s.blastT = B.arcBlastEvery;
          return { move: null, action: null, cue: 'special', event: 'arcBlast' };
        }
      }
      if (s.winding){
        if (s.t >= s.winding.telegraph){
          const a = s.winding; s.winding = null; s.atkCd = a.cd;
          const dir = angleTo(e.x, e.z, w.px, w.pz);
          let action = null;
          if (a.shape === 'arc') action = { type: 'melee', dmg: a.dmg, arc: a.arc, range: a.range, dir };
          else if (a.shape === 'zone') action = { type: 'zone', x: e.x + Math.cos(dir) * 2, z: e.z + Math.sin(dir) * 2, radius: a.radius, dmg: a.dmg, delay: 0 };
          else if (a.shape === 'lob') action = { type: 'zone', x: w.px, z: w.pz, radius: a.radius, dmg: a.dmg, delay: 0.7 };
          else if (a.shape === 'lob3') action = { type: 'multiZone', zones: [0, 1, 2].map(i => ({
            x: w.px + (i ? Math.cos(i * 2.1) * 1.8 : 0), z: w.pz + (i ? Math.sin(i * 2.1) * 1.8 : 0),
            radius: a.radius, dmg: a.dmg, delay: 0.7 + i * 0.15, hazard: a.hazard, hazardDur: a.hazardDur,
          })) };
          else if (a.shape === 'radial') action = { type: 'zone', x: e.x, z: e.z, radius: a.radius, dmg: a.dmg, delay: 0 };
          else if (a.shape === 'line') action = { type: 'lineHit', dmg: a.dmg, len: a.len, width: a.width, dir, conducts: a.conducts, conductDmg: a.conductDmg };
          else if (a.shape === 'charge') action = { type: 'lineHit', dmg: a.dmg, len: 12, width: 1.8, dir };
          else if (a.shape === 'poolArc') action = { type: 'poolArc', dmg: a.dmg };
          else if (a.shape === 'cascade') action = { type: 'cascade', dmg: a.dmg };
          return { move: null, action, cue: 'strike' };
        }
        return { move: null, action: null, cue: 'windup' };
      }
      s.atkCd -= dt;
      if (s.atkCd <= 0 && d < 14){
        const table = s.phase === 'p1' ? B.p1 : B.p2;
        const a = table[s.atkIdx % table.length]; s.atkIdx++;
        if (a.shape === 'arc' && d > a.range + 1.5 && !e.def.anchored){
          return { move: toward(e, w.px, w.pz), action: null, cue: 'walk' };
        }
        s.winding = a; s.t = 0;
        return { move: null, action: null, cue: 'windup', telegraph: a };
      }
      if (e.def.anchored) return { move: null, action: null, cue: 'idle' };
      const speedMult = s.phase === 'p2' ? 4.0 / e.def.speed : 1;
      return { move: d > 2.2 ? toward(e, w.px, w.pz) : null, speedMult, action: null, cue: d > 2.2 ? 'walk' : 'idle' };
    }
    case 'open': {
      // returns to dais (game moves it via move intent), untargetable until both pads latched
      const home = e.home || { x: e.x, z: e.z };
      const atHome = dist2d(e.x, e.z, home.x, home.z) < 0.5;
      if (s.padA >= B.padLatch && s.padB >= B.padLatch){
        s.phase = 'stagger'; s.t = 0;
        return { move: null, action: null, cue: 'hurt', untargetable: false, event: 'reclose' };
      }
      return { move: atHome ? null : toward(e, home.x, home.z), action: null, cue: atHome ? 'idle' : 'walk', untargetable: true };
    }
    case 'stagger':
      if (s.t >= B.staggerSec){ s.phase = 'p1'; s.t = 0; s.openTimer = B.openEvery; }
      return { move: null, action: null, cue: 'hurt', vulnerable: B.staggerVuln };
    case 'break':
      s.shield -= 3 * dt;
      if (s.shield <= 0){
        const stag = s.breakCorrect >= 2;
        s.phase = 'p2'; s.t = 0;
        if (stag){ s.phase = 'stagger'; s.afterStagger = 'p2'; }
        return { move: null, action: null, cue: 'hurt', event: 'breakEnd', staggered: stag };
      }
      return { move: null, action: null, cue: 'idle', untargetable: true };
    default:
      return { move: null, action: null, cue: 'idle' };
  }
}
// note: stagger after break flows to p2 via afterStagger
export function bossPostStagger(e){
  const s = e.bs;
  if (s.phase === 'p1' && s.afterStagger === 'p2'){ s.phase = 'p2'; s.afterStagger = null; }
}
export function bossBreakAnswer(e, correct){
  const s = e.bs;
  if (s.phase !== 'break') return;
  if (correct){ s.shield -= 35; s.breakCorrect++; }
  else s.shield -= 12; // pity chip — the loop pauses during questions, so decay alone can't run; never a wall
}

export function tickEnemy(e, w, dt){
  const def = e.def;
  if (def.boss) return tickBoss(e, w, dt);
  if (def.elite){
    if (def.elite.modifier === 'charge') return tickEliteCharge(e, w, dt);
    if (def.elite.modifier === 'chainedLunge') return tickEliteChainedLunge(e, w, dt);
    if (def.elite.modifier === 'trail') return tickEliteTrail(e, w, dt);
    if (def.elite.modifier === 'auraVent') return tickEliteAuraVent(e, w, dt);
  }
  if (def.special) return tickSpecial(e, w, dt);
  if (def.archetype === 'spitter') return tickSpitter(e, w, dt);
  return tickChaser(e, w, dt);
}

// flinch on hit (max 1 per 2 s), not for elites/bosses
export function applyFlinch(e, now){
  if (e.def.boss || e.def.elite) return false;
  if (e.state === 'flinch') return false;
  if (now - (e.flinchAt || -99) < 2) return false;
  e.flinchAt = now; e.prev = e.state === 'windup' ? 'chase' : e.state;
  e.state = 'flinch'; e.t = 0;
  return true;
}
