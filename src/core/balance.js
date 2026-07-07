// All tuning constants. Sources: DESIGN-BIBLE §3-§6, combat-classes.md, itemization.md,
// art-tech.md, R1-greenfield.md. Realms indexed 1-5.

export const CATS = ['CIRC', 'COND', 'GRND', 'DIST', 'OCP'];

export const REALMS = {
  1: {
    name: 'Greenfield', cat: 'CIRC', tag: 'surge', palette: 'greenfield',
    entryLevel: 1, exitLevel: 5,
    trashHp: [30, 60], trashHit: [5, 8], eliteHp: 150, eliteHit: 8,
    bossHp: 560, bossHit: [12, 17], // boss buff approved 2026-07-06 (bible §4 was 400 / 10-14)
    rarityWeights: [60, 32, 8, 0],
    trialLen: 3, floors: 2,
    sealBuff: { name: 'Bonded', desc: '+5 max HP, permanently', hp: 5 },
    mixCats: [], mixP: 0,
  },
  2: {
    name: 'Scorch Flats', cat: 'COND', tag: 'heat', palette: 'scorchFlats',
    entryLevel: 6, exitLevel: 10,
    trashHp: [70, 120], trashHit: [9, 14], eliteHp: 320, eliteHit: 14,
    bossHp: 1250, bossHit: [20, 27], // boss buff approved 2026-07-06 (was 900 / 16-22)
    rarityWeights: [45, 40, 14, 1], trialLen: 3, floors: 3,
    sealBuff: { name: 'Service Slack', desc: '+5% move speed, permanently', ms: 0.05 },
    mixCats: ['CIRC'], mixP: 0.2,
  },
  3: {
    name: 'Drowned Works', cat: 'GRND', tag: 'water', palette: 'drownedWorks',
    entryLevel: 11, exitLevel: 15,
    trashHp: [130, 220], trashHit: [15, 22], eliteHp: 600, eliteHit: 22,
    bossHp: 2500, bossHit: [30, 40], // boss buff approved 2026-07-06 (was 1800 / 24-32)
    rarityWeights: [32, 45, 21, 2], trialLen: 4, floors: 3,
    sealBuff: { name: 'Bonding Check', desc: '-15% conducted/chained damage taken', conductedDr: 0.15 },
    mixCats: ['CIRC', 'COND'], mixP: 0.2,
  },
  4: {
    name: 'Frostload Reach', cat: 'DIST', tag: 'cold', palette: 'frostloadReach',
    entryLevel: 16, exitLevel: 20,
    trashHp: [240, 400], trashHit: [23, 32], eliteHp: 1100, eliteHit: 32,
    bossHp: 4500, bossHit: [42, 55], // boss buff approved 2026-07-06 (was 3200 / 34-44)
    rarityWeights: [22, 48, 27, 3], trialLen: 4, floors: 3,
    sealBuff: { name: 'Load-Balanced', desc: '+5% ability cooldown recovery', cdr: 0.05 },
    mixCats: ['CIRC', 'COND', 'GRND'], mixP: 0.2,
  },
  5: {
    name: 'The Arc Caldera', cat: 'OCP', tag: 'arc', palette: 'arcCaldera',
    entryLevel: 21, exitLevel: 25,
    trashHp: [420, 700], trashHit: [33, 45], eliteHp: 1900, eliteHit: 45,
    bossHp: 7700, bossHit: [57, 75], // boss buff approved 2026-07-06 (was 5500 / 46-60)
    rarityWeights: [12, 48, 35, 5], trialLen: 5, floors: 3,
    sealBuff: { name: "Master's Stamp", desc: '+10% Permit Stamps earned', stampMult: 1.10 },
    mixCats: ['CIRC', 'COND', 'GRND', 'DIST'], mixP: 0.4,
  },
};

/* ---- per-realm environmental hazards (bible §2b) ---- */
export const HAZARDS = {
  1: null,
  2: { kind: 'heat', patches: 4, size: [6, 12], // Heat Soak: Overtemp stacks, 2 dmg/s per stack, max 3
       stackAfter: 1.5, shedPerSec: 1, dmgPerStack: 2, maxStacks: 3, color: 0xff6a1a },
  3: { kind: 'pool', patches: 5, size: [8, 16], color: 0x2dd4bf },      // Live Pools: symmetric conduction
  4: { kind: 'brownout', patches: 4, size: [8, 14], cdFactor: 0.5, color: 0x334155 }, // cooldowns recover at 50%
  5: { kind: 'ember', patches: 5, size: [4, 9], dps: 18, color: 0xff8a4d },           // standing hazard strips
};

/* ---- enemy rosters (region docs; stats inside bible §4 bounds) ---- */
export const ENEMIES = {
  deadShort: {
    id: 'deadShort', name: 'Dead Short', realm: 1, archetype: 'chaser',
    hp: 35, hit: 5, speed: 3.6, windup: 0.7, aggroR: 8, strikeR: 1.5, xp: 20, // teaching realm: slow, long tells
    look: { shape: 'chaser', color: 0xc8722a, scale: 1.0 },
  },
  strippedSplice: {
    id: 'strippedSplice', name: 'Stripped Splice', realm: 1, archetype: 'spitter',
    hp: 30, hit: 6, speed: 3.0, aggroR: 10, band: [5, 8], projSpeed: 8, projRange: 12, aim: 0.8, xp: 20,
    look: { shape: 'spitter', color: 0xd9c14a, scale: 1.0 },
  },
  branchTap: {
    id: 'branchTap', name: 'Branch Tap', realm: 1, archetype: 'special',
    hp: 40, hit: 5, speed: 3.4, aggroR: 8, strikeR: 1.5, xp: 24,
    special: { base: 'chaser', kind: 'splitAt50', spawnId: 'subTap', count: 2 },
    look: { shape: 'special', color: 0x6f8a4f, scale: 1.0 },
  },
  subTap: {
    id: 'subTap', name: 'Sub-Tap', realm: 1, archetype: 'chaser',
    hp: 20, hit: 5, speed: 3.8, aggroR: 10, strikeR: 1.3, xp: 6,
    look: { shape: 'chaser', color: 0x6f8a4f, scale: 0.55 },
  },
  boltedFault: {
    id: 'boltedFault', name: 'Bolted Short', realm: 1, archetype: 'elite', // "Bolted Fault" is R5's trash chaser (bible §2b collision rule)
    hp: 150, hit: 8, speed: 4.2, aggroR: 12, strikeR: 1.6, xp: 80,
    elite: { base: 'chaser', modifier: 'charge' }, // telegraphed line charge, wall self-stun 2 s
    look: { shape: 'chaser', color: 0x8a2f23, scale: 1.7, crown: true },
  },
  openMain: {
    id: 'openMain', name: 'The Open Main', realm: 1, archetype: 'boss',
    hp: 560, speed: 3.5, xp: 200, // boss buff approved 2026-07-06
    look: { shape: 'boss-openmain', color: 0x5c6b5e, scale: 1.0 },
    boss: {
      p1: [
        { name: 'Lever Sweep', telegraph: 0.5, shape: 'arc', arc: 120, range: 2.6, dmg: 13, cd: 2.0 },
        { name: 'Lever Slam', telegraph: 0.9, shape: 'zone', radius: 2.2, dmg: 17, cd: 3.0 },
        { name: 'Spark Lob', telegraph: 0.6, shape: 'lob', radius: 1.8, dmg: 12, cd: 2.4 },
      ],
      p2: [
        { name: 'Fast Sweep', telegraph: 0.4, shape: 'arc', arc: 120, range: 2.6, dmg: 13, cd: 1.6 },
        { name: 'Arc Lash', telegraph: 0.7, shape: 'line', len: 9, width: 1.4, dmg: 15, cd: 2.2 },
        { name: 'Spark Lob', telegraph: 0.5, shape: 'lob', radius: 1.8, dmg: 14, cd: 2.0 },
      ],
      openEvery: 25, padLatch: 6, staggerSec: 4, staggerVuln: 0.25,
      addsAt: 0.35, addsId: 'strippedSplice', addsCount: 2,
      wedges: { count: 6, active: 2, dmgTick: 8, rotSec: 14 }, // P2 energized floor
    },
  },

  /* ---- Realm 2 — Scorch Flats (R2-scorch-flats.md) ---- */
  hotLeg: {
    id: 'hotLeg', name: 'Hot Leg', realm: 2, archetype: 'chaser',
    hp: 80, hit: 10, speed: 5.2, windup: 0.35, recover: 0.4, aggroR: 12, strikeR: 1.5, xp: 34, // outruns a base-speed player
    look: { shape: 'chaser', color: 0xff6a1a, scale: 0.9 },
  },
  slagSplice: {
    id: 'slagSplice', name: 'Slag Splice', realm: 2, archetype: 'spitter',
    hp: 95, hit: 12, speed: 2.8, aggroR: 11, band: [5, 8], projSpeed: 9, projRange: 12, aim: 0.45, spitCd: 0.9, xp: 36,
    proj: { zone: { radius: 0.9, hazard: 'heat', dur: 4 } }, // molten bead leaves a Heat Soak tile
    look: { shape: 'spitter', color: 0xc46a2b, scale: 1.0 },
  },
  sheathCreeper: {
    id: 'sheathCreeper', name: 'Sheath Creeper', realm: 2, archetype: 'special',
    hp: 110, hit: 11, speed: 3.6, aggroR: 10, band: [4, 7], projSpeed: 7, projRange: 10, xp: 40,
    special: { base: 'spitter', kind: 'trail', hazard: 'heat', every: 0.6, dur: 4 },
    look: { shape: 'creeper', color: 0x8a8578, accent: 0xff6a1a, scale: 1.0 },
  },
  overampFeeder: {
    id: 'overampFeeder', name: 'Overamp Feeder', realm: 2, archetype: 'elite',
    hp: 320, hit: 14, speed: 4.4, aggroR: 12, strikeR: 1.6, xp: 130,
    elite: { base: 'chaser', modifier: 'chainedLunge', lunges: 4, trailHazard: 'heat', staggerSec: 2 },
    look: { shape: 'chaser', color: 0xffb361, scale: 1.7, crown: true },
  },
  thermalRunaway: {
    id: 'thermalRunaway', name: 'Thermal Runaway', realm: 2, archetype: 'boss',
    hp: 1250, speed: 3.2, xp: 400, // boss buff approved 2026-07-06
    look: { shape: 'boss-thermal', color: 0xc46a2b, scale: 1.0 },
    boss: {
      p1: [
        { name: 'Cable Whip', telegraph: 0.6, shape: 'arc', arc: 120, range: 3.0, dmg: 22, cd: 2.2 },
        { name: 'Molten Bead Volley', telegraph: 0.6, shape: 'lob3', radius: 1.6, dmg: 20, cd: 3.0, hazard: 'heat', hazardDur: 3 },
      ],
      p2: [
        { name: 'Whip Spin', telegraph: 0.5, shape: 'radial', radius: 3.2, dmg: 25, cd: 1.8 },
        { name: 'Molten Bead Volley', telegraph: 0.5, shape: 'lob3', radius: 1.6, dmg: 23, cd: 2.4, hazard: 'heat', hazardDur: 3 },
      ],
      spawnEvery: { p2: { id: 'hotLeg', count: 2, every: 25 } },
      mech: 'thermal', // Load Step outer ring (P1) + rolling load lanes (P2) — main.js arena script
      loadStepEvery: 20, loadStepDur: 6, laneEvery: 12, laneDmgTick: 6,
    },
  },

  /* ---- Realm 3 — Drowned Works (R3-drowned-works.md) ---- */
  strayCurrent: {
    id: 'strayCurrent', name: 'Stray Current', realm: 3, archetype: 'chaser',
    hp: 130, hit: 15, speed: 3.4, windup: 0.7, recover: 0.8, aggroR: 8, strikeR: 1.5, xp: 55, // waterlogged: slow, heavy
    look: { shape: 'chaser', color: 0x6ff7e8, scale: 0.9 },
  },
  sumpSprayer: {
    id: 'sumpSprayer', name: 'Sump Sprayer', realm: 3, archetype: 'spitter',
    hp: 170, hit: 18, speed: 2.2, aggroR: 11, band: [5, 9], projSpeed: 6, projRange: 13, aim: 0.9, spitCd: 1.6, xp: 60,
    proj: { conducts: true }, // glob landing in a pool conducts to everyone in that pool
    look: { shape: 'spitter', color: 0xb06a3c, scale: 1.1 },
  },
  bootlegBond: {
    id: 'bootlegBond', name: 'Bootleg Bond', realm: 3, archetype: 'special',
    hp: 210, hit: 16, speed: 3.4, aggroR: 9, strikeR: 1.5, xp: 70,
    special: { base: 'chaser', kind: 'allyShield', range: 7, maxAllies: 3, shieldPct: 0.35, castTime: 1.2 },
    look: { shape: 'special', color: 0xc47f4f, accent: 0x3fa65b, scale: 1.0 },
  },
  galvanicCreep: {
    id: 'galvanicCreep', name: 'Galvanic Creep', realm: 3, archetype: 'elite',
    hp: 600, hit: 22, speed: 3.6, aggroR: 12, strikeR: 1.6, xp: 220,
    elite: { base: 'chaser', modifier: 'trail', hazard: 'pool', every: 0.5, dur: 8 },
    look: { shape: 'chaser', color: 0x4e8d74, scale: 1.6, crown: true },
  },
  drownedMain: {
    id: 'drownedMain', name: 'The Drowned Main', realm: 3, archetype: 'boss',
    hp: 2500, speed: 0, xp: 800, anchored: true, // boss buff approved 2026-07-06
    look: { shape: 'boss-drowned', color: 0x101418, scale: 1.0 },
    boss: {
      p1: [
        { name: 'Cable-Arm Slam', telegraph: 0.8, shape: 'line', len: 8, width: 1.6, dmg: 40, cd: 2.6, conducts: true, conductDmg: 30 },
      ],
      p2: [
        { name: 'Fast Slam', telegraph: 0.6, shape: 'line', len: 8, width: 1.6, dmg: 40, cd: 2.0, conducts: true, conductDmg: 30 },
        { name: 'Chained Arc', telegraph: 0.9, shape: 'poolArc', dmg: 35, cd: 3.5 }, // hits anyone standing in any pool
      ],
      mech: 'drowned', // pool energize cycles + rising water — main.js arena script
      energizeEvery: 12, energizeWarn: 2, energizeDur: 4, energizeTick: 26,
      spawnEvery: { p1: { id: 'strayCurrent', count: 2, every: 12 } },
      p2PoolGrowth: true,
    },
  },

  /* ---- Realm 4 — Frostload Reach (R4-frostload-reach.md) ---- */
  coldLoadRusher: {
    id: 'coldLoadRusher', name: 'Cold-Load Rusher', realm: 4, archetype: 'chaser',
    hp: 250, hit: 26, speed: 5.0, aggroR: 11, strikeR: 1.5, xp: 95, // the one sprinter in a ranged realm
    look: { shape: 'chaser', color: 0xa8e0ff, scale: 1.0 },
  },
  lineGalloper: {
    id: 'lineGalloper', name: 'Line Galloper', realm: 4, archetype: 'spitter',
    hp: 300, hit: 30, speed: 2.8, aggroR: 14, band: [7, 11], projSpeed: 8, projRange: 15, xp: 105, // long-range artillery
    proj: { zone: { radius: 1.2, delay: 0.6 } }, // lobbed bead lands where the player was
    look: { shape: 'spitter', color: 0x3b3f45, accent: 0xe8f4ff, scale: 1.2 },
  },
  sagNode: {
    id: 'sagNode', name: 'Sag Node', realm: 4, archetype: 'special',
    hp: 400, hit: 23, speed: 2.0, aggroR: 10, strikeR: 1.4, xp: 120,
    special: { base: 'chaser', kind: 'aura', hazard: 'brownout', radius: 5 },
    look: { shape: 'node', color: 0x6b5f52, accent: 0xff9e4a, scale: 1.0 },
  },
  padmountHotbox: {
    id: 'padmountHotbox', name: 'Padmount Hotbox', realm: 4, archetype: 'elite',
    hp: 1100, hit: 32, speed: 2.4, aggroR: 12, strikeR: 1.6, xp: 380,
    elite: { base: 'chaser', modifier: 'auraVent', hazard: 'brownout', radius: 7, ventEvery: 6, ventDmg: 32, ventRadius: 5, ventTelegraph: 1.2 },
    look: { shape: 'node', color: 0x2f5d44, accent: 0xff6a2a, scale: 1.8, crown: true },
  },
  coincidentPeak: {
    id: 'coincidentPeak', name: 'The Coincident Peak', realm: 4, archetype: 'boss',
    hp: 4500, speed: 3.0, xp: 1400, // boss buff approved 2026-07-06
    look: { shape: 'boss-peak', color: 0x5e7a96, scale: 1.0 },
    boss: {
      p1: [
        { name: 'Bus Slam', telegraph: 0.8, shape: 'arc', arc: 110, range: 3.2, dmg: 48, cd: 2.4 },
        { name: 'Load Surge', telegraph: 0.7, shape: 'line', len: 12, width: 1.4, dmg: 42, cd: 2.8 },
      ],
      p2: [
        { name: 'Bus Slam', telegraph: 0.7, shape: 'arc', arc: 110, range: 3.2, dmg: 48, cd: 2.0 },
        { name: 'Demand Spike', telegraph: 0.9, shape: 'charge', dmg: 55, cd: 3.2 },
      ],
      mech: 'peak', // quadrant brownouts + Load Shed windows — main.js arena script
      cycleP1: 12, cycleP2: 8, shedEvery: 20, shedDur: 3,
      spawnEvery: { p1: { id: 'coldLoadRusher', count: 2, every: 12 } },
    },
  },

  /* ---- Realm 5 — The Arc Caldera (R5-arc-caldera.md) ---- */
  boltedFaultR5: {
    id: 'boltedFaultR5', name: 'Bolted Fault', realm: 5, archetype: 'chaser',
    hp: 620, hit: 42, speed: 5.4, windup: 0.35, aggroR: 12, strikeR: 1.6, recover: 1.0, xp: 200, // burst slam, self-stun = lengthened RECOVER
    look: { shape: 'chaser', color: 0xc46a2b, scale: 1.1 },
  },
  flashover: {
    id: 'flashover', name: 'Flashover', realm: 5, archetype: 'spitter',
    hp: 450, hit: 36, speed: 3.2, aggroR: 13, band: [6, 9], projSpeed: 11, projRange: 14, aim: 0.4, spitCd: 0.8, xp: 180,
    proj: { splash: { radius: 1.6, dmg: 18 } }, // bolt jumps once near the impact
    look: { shape: 'spitter', color: 0xb9a7f2, scale: 1.1 },
  },
  seriesArc: {
    id: 'seriesArc', name: 'Series Arc', realm: 5, archetype: 'special',
    hp: 540, hit: 39, speed: 3.4, aggroR: 10, strikeR: 1.5, xp: 210,
    special: { base: 'chaser', kind: 'phaseToggle', onSec: 1.5, offSec: 1.0, auraDps: 16, auraR: 2.2 },
    look: { shape: 'column', color: 0x8a8578, accent: 0xe8dfff, scale: 1.0 },
  },
  threePhaseFault: {
    id: 'threePhaseFault', name: 'Three-Phase Fault', realm: 5, archetype: 'elite',
    hp: 1900, hit: 45, speed: 5.0, aggroR: 13, strikeR: 1.7, xp: 650,
    elite: { base: 'chaser', modifier: 'chainedLunge', lunges: 4, staggerSec: 1.5 },
    look: { shape: 'chaser', color: 0xc46a2b, scale: 1.9, crown: true },
  },
  theIncident: {
    id: 'theIncident', name: 'The Incident', realm: 5, archetype: 'boss',
    hp: 7700, speed: 0, xp: 2500, anchored: true, // boss buff approved 2026-07-06
    look: { shape: 'boss-incident', color: 0xfff6e8, scale: 1.0 },
    boss: {
      p1: [
        { name: 'Pressure Wave', telegraph: 1.0, shape: 'radial', radius: 4.5, dmg: 58, cd: 2.6 },
        { name: 'Plasma Jet', telegraph: 0.8, shape: 'line', len: 11, width: 1.6, dmg: 65, cd: 3.0 },
      ],
      p2: [
        { name: 'Pressure Wave', telegraph: 0.8, shape: 'radial', radius: 4.5, dmg: 60, cd: 2.2 },
        { name: 'Fault Cascade', telegraph: 0.8, shape: 'cascade', dmg: 70, cd: 4.0 }, // ember lines from last re-strike
      ],
      mech: 'incident', // re-strike teleports + pylon-cover Arc Blast — main.js arena script
      restrikeP1: 8, restrikeP2: 5, arcBlastEvery: 14, arcBlastDmg: 72, pylons: 3, // boss buff approved 2026-07-06
      addsMaintain: { id: 'flashover', max: 2 },
      breakMixCats: ['CIRC', 'COND', 'GRND', 'DIST'], breakMixP: 0.4,
      uniqueChance: 0.2, uniqueChancePerfect: 0.4, // final-boss exception (bible §5/§10)
    },
  },
};

// which enemy fills each dungeon pack slot, per realm
export const PACK_TABLE = {
  1: { trash: ['deadShort', 'deadShort', 'strippedSplice'], special: ['branchTap'], elite: ['boltedFault'] },
  2: { trash: ['hotLeg', 'hotLeg', 'slagSplice'], special: ['sheathCreeper'], elite: ['overampFeeder'] },
  3: { trash: ['strayCurrent', 'strayCurrent', 'sumpSprayer'], special: ['bootlegBond'], elite: ['galvanicCreep'] },
  4: { trash: ['coldLoadRusher', 'lineGalloper', 'lineGalloper'], special: ['sagNode'], elite: ['padmountHotbox'] }, // ranged-majority packs (R4 identity)
  5: { trash: ['boltedFaultR5', 'flashover'], special: ['seriesArc'], elite: ['threePhaseFault'] },
};

export const BOSS_BY_REALM = { 1: 'openMain', 2: 'thermalRunaway', 3: 'drownedMain', 4: 'coincidentPeak', 5: 'theIncident' };

/* ---- XP / leveling awards ---- */
export const XP = {
  correct: 8, master: 20, // meta profile XP too (family values)
  // character XP:
  charCorrect: 15,
  charShrine: 40, charTrial: 120, charBoss: 200,
};

/* ---- question economy (itemization.md Stamp table + bible §6) ---- */
export const ECON = {
  stamps: { shrineCorrect: 1, trialCorrect: 1, trialPassBonus: 2, breakCorrect: 1, idCorrect: 1, loto: 2, briefing: 0 },
  trialStampCapMult: 2, // cap = 2 × streak length per realm visit
  forge: {
    reinforce: r => ({ stamps: 3 + (r - 1), salvage: 4 * r }),
    certify: r => ({ stamps: 6 + 2 * (r - 1), salvage: 10 * r }),
    recalibrate: r => ({ stamps: 2, salvage: 3 * r }),
    respec: r => ({ stamps: 4 + (r - 1), salvage: 6 * r }),
  },
  salvageYield: { stock: 1, rated: 2, certified: 4, master: 10 }, // × ilvl
  volts: { trash: [1, 3], elite: 10, boss: 40, chest: [5, 10] },  // × realm
  dropChance: { trash: 0.18 }, bossDrops: 3, shrineChestDrops: 2, floorChestDrops: 1,
};

export const CERTIFIED_PCT = 0.6;
export const CERTIFIED_BONUS = 1.10;

// Certification Trial banked rewards per streak milestone (region docs, normalized to §6 stamp rates).
// Entries indexed by streak reached (1-based); the final entry is the pass. Stamps accrue per ECON separately.
export const TRIAL_REWARDS = {
  1: [{ salvage: 15 }, { drop: 'rated', n: 2 }, { pass: true }],
  2: [{ salvage: 20 }, { drop: 'rated', n: 1 }, { pass: true }],
  3: [{ salvage: 30 }, { drop: 'rated', n: 1 }, { drop: 'certified', n: 1 }, { pass: true, cache: 2 }],
  4: [{ salvage: 40 }, { drop: 'rated', n: 1 }, { drop: 'certified', n: 1 }, { pass: true }],
  5: [{ salvage: 50 }, { salvage: 100 }, { drop: 'certified', n: 1 }, { drop: 'certifiedMeter', n: 1 }, { pass: true, mcChance: 0.2 }],
};

/* ---- per-realm palettes (art-tech.md, verbatim) ---- */
export const REALM_PALETTES = {
  greenfield: { // overcast-morning overworld (continuity pass: region brief won)
    fog: 0xb7c9ad, fogNear: 30, fogFar: 95,
    hemiSky: 0xcfe3d2, hemiGround: 0x45523c, hemiIntensity: 0.85,
    sun: 0xf5f2df, sunIntensity: 1.1, sunAngle: [55, 35],
    groundRamp: [0x2f3a2a, 0x4a5a38, 0x66794a, 0x8b9a62],
    accent: 0x4ade80,
  },
  scorchFlats: {
    fog: 0xd9a066, fogNear: 35, fogFar: 110,
    hemiSky: 0xffd9a0, hemiGround: 0x8a5a33, hemiIntensity: 0.8,
    sun: 0xffb361, sunIntensity: 1.3, sunAngle: [38, 60],
    groundRamp: [0x9c6b3a, 0xb5824a, 0xcf9d5e, 0xe5bd7d],
    accent: 0xfbbf24,
  },
  drownedWorks: {
    fog: 0x1e3a40, fogNear: 14, fogFar: 55,
    hemiSky: 0x5e8a96, hemiGround: 0x16282e, hemiIntensity: 0.6,
    sun: 0x9fd4d0, sunIntensity: 0.55, sunAngle: [65, 20],
    groundRamp: [0x22343a, 0x2c464c, 0x395a5e, 0x4a7472],
    accent: 0x2dd4bf,
  },
  frostloadReach: { // winter-dusk snowfield, tightest sightlines of realms 1-4 (continuity pass)
    fog: 0x8fa6bc, fogNear: 14, fogFar: 50,
    hemiSky: 0xdce9f5, hemiGround: 0x8fa5bd, hemiIntensity: 0.9,
    sun: 0xeaf4ff, sunIntensity: 0.9, sunAngle: [25, 45],
    groundRamp: [0x2e4356, 0x4c6478, 0x7e97ab, 0xd8e4ee],
    accent: 0x7dd3fc,
  },
  arcCaldera: { // ember-dark basalt, heaviest fog in the game (continuity pass)
    fog: 0x2b0d08, fogNear: 18, fogFar: 70,
    hemiSky: 0x2b1a20, hemiGround: 0x8a2c14, hemiIntensity: 0.5,
    sun: 0xff8a4d, sunIntensity: 0.7, sunAngle: [30, 200],
    groundRamp: [0x14100e, 0x3a1f16, 0x6e3419, 0xc2551e],
    accent: 0xe8dfff,
  },
};
