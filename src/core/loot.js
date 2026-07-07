// Loot engine: bases, affixes, rarity rolls, uniques, forge, salvage.
// Tables transcribed from itemization.md. Pure; rng injected.

import { rngInt, rngPick, rngWeighted } from './rng.js';
import { REALMS, ECON } from './balance.js';

export const SLOTS = ['tool', 'hardhat', 'jacket', 'gloves', 'boots', 'meter'];
export const SLOT_NAMES = { tool: 'Tool', hardhat: 'Hard Hat', jacket: 'Jacket', gloves: 'Gloves', boots: 'Boots', meter: 'Meter' };

export const BASES = {
  1: { tool: 'Linesman Pliers', hardhat: 'Class G Hard Hat', jacket: 'Hi-Vis Vest', gloves: 'Leather Work Gloves', boots: 'Steel-Toe Boots', meter: 'Continuity Tester' },
  2: { tool: 'Cable Cutters', hardhat: 'Full-Brim Hard Hat', jacket: 'FR Work Shirt', gloves: 'Wire-Pulling Gloves', boots: 'EH-Rated Boots', meter: 'Clamp Meter' },
  3: { tool: 'Ground Rod Driver', hardhat: 'Class E Hard Hat', jacket: 'Rubber-Lined Slicker', gloves: 'Class 0 Rubber Gloves', boots: 'Dielectric Overboots', meter: 'Earth Ground Tester' },
  4: { tool: 'Hot Stick', hardhat: 'Winter-Liner Hard Hat', jacket: 'Insulated Work Parka', gloves: 'Thermal Line Gloves', boots: 'Insulated Linesman Boots', meter: 'Demand Meter' },
  5: { tool: 'Breaker Bar', hardhat: 'Arc Flash Hood', jacket: 'Arc Flash Suit Jacket', gloves: 'Class 2 Rubbers & Protectors', boots: 'Arc-Rated Work Boots', meter: 'Fault Loop Tester' },
};

// slot implicits by ilvl 1-5, index 0 unused (canon: combat doc scheme, continuity pass 2026-07-06)
export const IMPLICIT_TABLES = {
  damage: [0, 10, 17, 30, 52, 90],   // tool
  armorHat: [0, 3, 6, 11, 19, 30],   // hardhat
  armorJkt: [0, 4, 8, 15, 26, 42],   // jacket (also grants hp)
  hpJkt: [0, 6, 12, 22, 38, 60],
  asPct: [0, 4, 5, 6, 7, 8],         // gloves
  msPct: [0, 3, 4, 5, 6, 7],         // boots
};

// returns [{stat, value}, ...] for a slot; meter is a wildcard (rolls one of the 5 stats)
export function rollImplicits(slot, ilvl, rng){
  const T = IMPLICIT_TABLES;
  if (slot === 'tool') return [{ stat: 'damage', value: T.damage[ilvl] }];
  if (slot === 'hardhat') return [{ stat: 'armor', value: T.armorHat[ilvl] }];
  if (slot === 'jacket') return [{ stat: 'armor', value: T.armorJkt[ilvl] }, { stat: 'hp', value: T.hpJkt[ilvl] }];
  if (slot === 'gloves') return [{ stat: 'asPct', value: T.asPct[ilvl] }];
  if (slot === 'boots') return [{ stat: 'msPct', value: T.msPct[ilvl] }];
  // meter wildcard: any one of the 5 stats at its slot-appropriate value
  const opts = [
    { stat: 'damage', value: T.damage[ilvl] }, { stat: 'armor', value: T.armorHat[ilvl] },
    { stat: 'hp', value: T.hpJkt[ilvl] }, { stat: 'asPct', value: T.asPct[ilvl] }, { stat: 'msPct', value: T.msPct[ilvl] },
  ];
  return [opts[Math.floor(rng() * opts.length)]];
}

// 14 affixes; ranges indexed by ilvl 1-5
export const AFFIXES = [
  { id: 'highTorque', name: 'High-Torque', slots: ['tool', 'gloves'], feeds: 'dmgFlat', ranges: [0, [2, 4], [4, 8], [8, 14], [14, 22], [22, 34]] },
  { id: 'heavyGauge', name: 'Heavy-Gauge', slots: ['tool'], feeds: 'dmgPct', ranges: [0, [8, 12], [10, 15], [12, 18], [15, 22], [18, 28]] },
  { id: 'quickRelease', name: 'Quick-Release', slots: ['tool', 'gloves'], feeds: 'asPct', ranges: [0, [5, 8], [6, 10], [8, 12], [10, 14], [12, 18]] },
  { id: 'reinforced', name: 'Reinforced', slots: ['hardhat', 'jacket', 'boots'], feeds: 'armorFlat', ranges: [0, [2, 4], [4, 7], [7, 12], [12, 20], [20, 32]] },
  { id: 'doubleInsulated', name: 'Double-Insulated', slots: ['jacket', 'gloves'], feeds: 'armorPct', ranges: [0, [10, 15], [12, 18], [15, 22], [18, 26], [22, 32]] },
  { id: 'paddedLiner', name: 'Padded Liner', slots: ['hardhat', 'jacket'], feeds: 'hpFlat', ranges: [0, [8, 14], [14, 24], [24, 40], [40, 65], [65, 100]] },
  { id: 'heavyDuty', name: 'Heavy-Duty', slots: ['jacket', 'boots'], feeds: 'hpPct', ranges: [0, [4, 6], [5, 8], [6, 10], [8, 12], [10, 15]] },
  { id: 'slipRated', name: 'Slip-Rated', slots: ['boots'], feeds: 'msPct', ranges: [0, [5, 7], [6, 8], [7, 9], [8, 10], [9, 12]] },
  { id: 'calibrated', name: 'Calibrated', slots: ['meter'], feeds: 'dmgPct', ranges: [0, [5, 8], [6, 10], [8, 12], [10, 15], [12, 18]] },
  { id: 'surgeProtected', name: 'Surge-Protected', slots: ['meter'], feeds: 'hpFlat', ranges: [0, [6, 10], [10, 18], [18, 30], [30, 48], [48, 75]] },
  { id: 'lowImpedance', name: 'Low-Impedance', slots: ['meter'], feeds: 'asPct', ranges: [0, [4, 6], [5, 8], [6, 10], [8, 12], [10, 14]] },
  { id: 'notarized', name: 'Notarized', slots: ['meter'], feeds: 'stampShrine', fixed: 1 },
  { id: 'journeymansTicket', name: "Journeyman's Ticket", slots: ['meter', 'hardhat'], feeds: 'stampTrial', fixed: 1 },
  { id: 'copperScrounger', name: 'Copper Scrounger', slots: ['gloves', 'meter'], feeds: 'salvagePct', ranges: [0, [20, 20], [25, 25], [30, 30], [40, 40], [50, 50]] },
];
export const AFFIX_BY_ID = Object.fromEntries(AFFIXES.map(a => [a.id, a]));

const FEED_LABEL = {
  dmgFlat: v => `+${v} Damage`, dmgPct: v => `+${v}% Damage`, asPct: v => `+${v}% Attack Speed`,
  armorFlat: v => `+${v} Armor`, armorPct: v => `+${v}% Armor`, hpFlat: v => `+${v} Max HP`,
  hpPct: v => `+${v}% Max HP`, msPct: v => `+${v}% Move Speed`,
  stampShrine: () => '+1 Stamp on shrine 2/2', stampTrial: () => '+1 Stamp on Trial pass',
  salvagePct: v => `+${v}% Salvage`,
};
export function affixLabel(a){
  const def = AFFIX_BY_ID[a.id];
  return def ? FEED_LABEL[def.feeds](a.value) : '?';
}

/* ---- Master-Crafted uniques (canon: bible §2b + region docs). Every unique carries a
   fixed affix package (playtest fix 2026-07-06: sig effects alone read as "no stats"). ---- */
export const UNIQUES = {
  1: [
    {
      id: 'bondingJumper', name: 'Bonding Jumper', slot: 'tool', base: 'Linesman Pliers', sig: 'bondingJumper',
      affixes: [{ id: 'highTorque', value: 4 }, { id: 'heavyGauge', value: 12 }],
      lore: 'Hits arc to 1 nearby enemy for 40% surge. +10% damage per enemy struck by the same swing (max +30%). Dodge-rolling through an enemy tags it for 2 s (+10% damage taken).',
    },
    {
      id: 'theWiggy', name: 'The Wiggy', slot: 'meter', base: 'Continuity Tester', sig: 'wiggy',
      affixes: [{ id: 'calibrated', value: 8 }, { id: 'surgeProtected', value: 10 }],
      lore: 'First hit on a full-HP enemy deals +25% as surge. Enemies that damage you are tested for 3 s (+10% damage taken from you).',
    },
  ],
  2: [
    {
      id: 'ninetyDegColumn', name: 'Ninety-Degree Column', slot: 'jacket', base: 'FR Work Shirt', sig: 'ninetyDeg',
      affixes: [{ id: 'paddedLiner', value: 20 }],
      lore: 'Immune to Overtemp. +15% attack speed while standing on a Heat Soak tile — you run the 90°C column.',
    },
    {
      id: 'longRunCompensator', name: 'Long-Run Compensator', slot: 'meter', base: 'Clamp Meter', sig: 'longRun',
      affixes: [{ id: 'calibrated', value: 10 }, { id: 'lowImpedance', value: 8 }],
      lore: 'Enemies below 30% HP take +25% damage from you. Your hits slow enemies 15% for 2 s — line loss.',
    },
  ],
  3: [
    {
      id: 'class0Rubbers', name: 'Class 0 Rubbers', slot: 'gloves', base: 'Class 0 Rubber Gloves', sig: 'class0',
      affixes: [{ id: 'doubleInsulated', value: 22 }, { id: 'quickRelease', value: 12 }],
      lore: 'Immune to Live Pool conduction. Your attacks that touch a pool conduct at +25% damage.',
    },
    {
      id: 'meggersEye', name: "Megger's Eye", slot: 'meter', base: 'Earth Ground Tester', sig: 'meggersEye',
      affixes: [{ id: 'calibrated', value: 12 }, { id: 'lowImpedance', value: 10 }],
      lore: 'Every 8 s your next hit runs an insulation test: it arcs to every enemy sharing a pool with the target. +10% damage to full-HP enemies.',
    },
  ],
  4: [
    {
      id: 'peakShaver', name: 'Peak Shaver', slot: 'tool', base: 'Hot Stick', sig: 'peakShaver',
      affixes: [{ id: 'heavyGauge', value: 22 }, { id: 'highTorque', value: 22 }],
      lore: 'Brownout zones do not slow your cooldowns. +25% damage to enemies standing in a brownout. Kills may vent a frost pulse.',
    },
    {
      id: 'loadDiversityJacket', name: 'Load-Diversity Jacket', slot: 'jacket', base: 'Insulated Work Parka', sig: 'loadDiversity',
      affixes: [{ id: 'heavyDuty', value: 10 }],
      lore: '−3% damage taken per enemy within 6 u (cap −15%). Struck below 30% HP: shed load — knockback pulse (10 s cooldown).',
    },
  ],
  5: [
    {
      id: 'eightyPercenter', name: 'Eighty Percenter', slot: 'tool', base: 'Breaker Bar', sig: 'eightyPct',
      affixes: [{ id: 'highTorque', value: 34 }, { id: 'quickRelease', value: 18 }],
      lore: '+40% damage vs enemies above 80% HP; first hit on each enemy staggers; −10% vs enemies below 20% HP.',
    },
    {
      id: 'cat4Shell', name: 'CAT-4 Shell', slot: 'jacket', base: 'Arc Flash Suit Jacket', sig: 'cat4',
      affixes: [{ id: 'reinforced', value: 32 }, { id: 'paddedLiner', value: 100 }],
      lore: 'Hits of 40+ damage are reduced 30% and trigger a retaliatory arc pulse. Immune to blast stagger.',
    },
  ],
};

const RARITIES = ['stock', 'rated', 'certified', 'master'];

function rollAffixes(slot, ilvl, n, rng, excludeIds = []){
  const pool = AFFIXES.filter(a => a.slots.includes(slot) && !excludeIds.includes(a.id));
  const out = [];
  const bag = pool.slice();
  while (out.length < n && bag.length){
    const i = Math.floor(rng() * bag.length);
    const a = bag.splice(i, 1)[0];
    out.push({ id: a.id, value: a.fixed !== undefined ? a.fixed : rngInt(rng, a.ranges[ilvl][0], a.ranges[ilvl][1]) });
  }
  return out;
}

// display names for the internal rarity ids (ids are load-bearing in saves/tests — labels only)
export const RARITY_LABEL = { stock: 'Common', rated: 'Rare', certified: 'Magic', master: 'MasterCraft' };

export function makeItem(slot, realm, rarity, rng){
  const ilvl = realm;
  const n = rarity === 'stock' ? 0 : rarity === 'rated' ? 1 : (rng() < 0.6 ? 2 : 3);
  const affixes = rollAffixes(slot, ilvl, n, rng);
  return {
    base: BASES[realm][slot], slot, ilvl, realm, rarity,
    tag: REALMS[realm].tag,
    implicits: rollImplicits(slot, ilvl, rng),
    affixes,
    identified: rarity === 'stock' || rarity === 'rated',
    name: (affixes.length ? AFFIX_BY_ID[affixes[0].id].name + ' ' : '') + BASES[realm][slot],
  };
}

function makeUnique(u, realm, rng){
  return {
    base: u.base, slot: u.slot, ilvl: realm, realm, rarity: 'master',
    tag: REALMS[realm].tag,
    implicits: rollImplicits(u.slot, realm, rng),
    affixes: u.affixes.map(a => ({ ...a })),
    identified: false, sig: u.sig, name: u.name, lore: u.lore, uniqueId: u.id,
  };
}

// source: 'trash' | 'elite' | 'boss' | 'chest' | 'chestUpgraded'
// ownedUniques: Set of uniqueId already owned/dropped
export function rollDrop(realm, source, rng, ownedUniques = new Set()){
  const R = REALMS[realm];
  let weights = R.rarityWeights.slice();
  if (source === 'boss'){
    // canon (bible §5): flat 5% boss Master-Crafted floor, taken out of Stock
    const add = Math.max(0, 5 - weights[3]);
    weights[3] += add; weights[0] = Math.max(0, weights[0] - add);
  }
  let ri = rngWeighted(rng, weights.map((w, i) => [i, w]));
  if (source === 'chestUpgraded'){
    const maxTier = weights[3] > 0 ? 3 : 2;
    ri = Math.min(ri + 1, maxTier);
  }
  const slot = SLOTS[Math.floor(rng() * 6)];
  if (ri === 3){
    const cand = (UNIQUES[realm] || []).filter(u => !ownedUniques.has(u.id));
    if (cand.length) return makeUnique(rngPick(rng, cand), realm, rng);
    const it = makeItem(slot, realm, 'certified', rng);
    while (it.affixes.length < 3){
      const extra = rollAffixes(slot, realm, 1, rng, it.affixes.map(a => a.id));
      if (!extra.length) break;
      it.affixes.push(extra[0]);
    }
    it.identified = false;
    return it;
  }
  return makeItem(slot, realm, RARITIES[ri], rng);
}

// Identification (bible §6.4): via question -> bonus reroll one affix, keep higher
export function identify(item, viaQuestion, rng){
  item.identified = true;
  if (viaQuestion && item.affixes.length){
    const a = item.affixes[Math.floor(rng() * item.affixes.length)];
    const def = AFFIX_BY_ID[a.id];
    if (def && def.fixed === undefined)
      a.value = Math.max(a.value, rngInt(rng, def.ranges[item.ilvl][0], def.ranges[item.ilvl][1]));
  }
  return item;
}

export function salvageValue(item, salvagePct = 0){
  return Math.max(1, Math.round(ECON.salvageYield[item.rarity] * item.ilvl * (1 + salvagePct)));
}

export function voltDrop(realm, source, rng){
  const v = ECON.volts[source];
  if (Array.isArray(v)) return rngInt(rng, v[0], v[1]) * realm;
  return (v || 0) * realm;
}

/* ---- Workbench Forge (costs from ECON; question gating handled by game) ---- */
export function forgeCost(op, realm){ return ECON.forge[op](realm); }

export function forgeApply(op, item, rng){
  if (op === 'reinforce' && item.rarity === 'stock'){
    item.rarity = 'rated';
    item.affixes = rollAffixes(item.slot, item.ilvl, 1, rng);
  } else if (op === 'certify' && item.rarity === 'rated'){
    item.rarity = 'certified';
    const extra = rollAffixes(item.slot, item.ilvl, 1, rng, item.affixes.map(a => a.id));
    if (extra.length) item.affixes.push(extra[0]);
  } else if (op === 'recalibrate' && item.affixes.length){
    const a = item.affixes[Math.floor(rng() * item.affixes.length)];
    const def = AFFIX_BY_ID[a.id];
    if (def && def.fixed === undefined) a.value = rngInt(rng, def.ranges[item.ilvl][0], def.ranges[item.ilvl][1]);
  } else if (op === 'respec'){
    item.affixes = rollAffixes(item.slot, item.ilvl, item.affixes.length, rng);
  } else {
    return null;
  }
  if (!item.sig) item.name = (item.affixes.length ? AFFIX_BY_ID[item.affixes[0].id].name + ' ' : '') + item.base;
  return item;
}

export function canForge(op, item){
  if (!item || item.rarity === 'master') return false;
  if (op === 'reinforce') return item.rarity === 'stock';
  if (op === 'certify') return item.rarity === 'rated';
  if (op === 'recalibrate' || op === 'respec') return item.affixes.length > 0;
  return false;
}
