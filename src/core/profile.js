// Profile (meta progression + mastery home) and run save. Store injected.

export const PROFILE_KEY = 'arcdescent.profile.v1';
export const RUN_KEY = 'arcdescent.run.v1';
export const BANK_KEY = 'arcdescent.questions.v1';
export const SAVES_KEY = 'arcdescent.saves.v1';

export function makeMemoryStore(){
  const mem = {};
  return {
    get(k){ return k in mem ? mem[k] : null; },
    set(k, v){ mem[k] = String(v); },
    del(k){ delete mem[k]; },
  };
}

/* ---- meta ranks (arcade-shared curve, family names) ---- */
export const RANKS = [
  { lvl: 1, name: 'Helper' }, { lvl: 3, name: 'Apprentice' }, { lvl: 6, name: 'Journeyman' },
  { lvl: 10, name: 'Foreman' }, { lvl: 15, name: 'Master Electrician' }, { lvl: 20, name: 'Chief Inspector' },
];
export function levelInfo(xp){
  let lvl = 1, need = 80, rem = xp;
  while (rem >= need){ rem -= need; lvl++; need = Math.round(80 * Math.pow(lvl, 1.25)); }
  return { lvl, into: rem, need };
}
export function rankFor(lvl){
  let r = RANKS[0].name;
  for (const x of RANKS) if (lvl >= x.lvl) r = x.name;
  return r;
}

/* ---- character level (in-run, 1..25, 5 per realm — bible §4) ---- */
export const CHAR_LEVEL_MAX = 25;
export function charLevelNeed(lvl){ return Math.round(50 * Math.pow(lvl, 1.5)); }
export function charLevelInfo(charXp){
  let lvl = 1, rem = charXp;
  while (lvl < CHAR_LEVEL_MAX && rem >= charLevelNeed(lvl)){ rem -= charLevelNeed(lvl); lvl++; }
  return { lvl, into: rem, need: lvl >= CHAR_LEVEL_MAX ? Infinity : charLevelNeed(lvl) };
}

/* ---- profile ---- */
export function makeProfile(store){
  return {
    data: null,
    fresh(){
      return {
        v: 1, xp: 0, mute: false, vol: 1, gfx: 'medium', autoScrap: false,
        stats: { kills: 0, deaths: 0, shrines: 0, trials: 0, seals: 0, bosses: 0, qa: 0, qc: 0, byCat: {} },
        mastery: {},
      };
    },
    load(){
      let d = null;
      try { d = JSON.parse(store.get(PROFILE_KEY)); } catch (e){}
      this.data = Object.assign(this.fresh(), d || {});
      this.data.stats = Object.assign(this.fresh().stats, (d && d.stats) || {});
      this.data.mastery = (d && d.mastery) || {};
      return this.data;
    },
    save(){ store.set(PROFILE_KEY, JSON.stringify(this.data)); },
    level(){ return levelInfo(this.data.xp).lvl; },
    rank(){ return rankFor(this.level()); },
    addXP(n){ const b = this.level(); this.data.xp += n; return this.level() > b; },
  };
}

/* ---- run save (the campaign: character, gear, realm progress) ---- */
export function makeRunStore(store){
  return {
    save(run){ store.set(RUN_KEY, JSON.stringify({ v: 1, run })); },
    load(){
      try {
        const d = JSON.parse(store.get(RUN_KEY));
        if (d && d.v === 1 && d.run) return d.run;
      } catch (e){}
      return null;
    },
    clear(){ store.del(RUN_KEY); },
  };
}

/* ---- multi-slot saves (unlimited named saved games, each pinned to a bank) ---- */
export function makeSavesStore(store){
  const read = () => {
    try {
      const d = JSON.parse(store.get(SAVES_KEY));
      if (d && d.v === 1 && Array.isArray(d.slots)) return d;
    } catch (e){}
    return { v: 1, nextId: 1, active: null, slots: [] };
  };
  const write = d => store.set(SAVES_KEY, JSON.stringify(d));
  return {
    list(){ return read().slots.slice().sort((a, b) => b.updated - a.updated); },
    get(id){ return read().slots.find(s => s.id === id) || null; },
    count(){ return read().slots.length; },
    create({ name, bank, run }, now = 0){
      const d = read();
      const slot = { id: d.nextId++, name, bank, created: now, updated: now, run };
      d.slots.push(slot);
      d.active = slot.id;
      write(d);
      return slot;
    },
    update(id, run, now = 0){
      const d = read();
      const s = d.slots.find(x => x.id === id);
      if (!s) return false;
      s.run = run; s.updated = now;
      write(d);
      return true;
    },
    rename(id, name){
      const d = read();
      const s = d.slots.find(x => x.id === id);
      if (!s || !name || !name.trim()) return false;
      s.name = name.trim().slice(0, 40);
      write(d);
      return true;
    },
    setBank(id, bank){
      const d = read();
      const s = d.slots.find(x => x.id === id);
      if (!s) return false;
      s.bank = bank;
      write(d);
      return true;
    },
    remove(id){
      const d = read();
      const n = d.slots.length;
      d.slots = d.slots.filter(s => s.id !== id);
      if (d.active === id) d.active = null;
      write(d);
      return d.slots.length < n;
    },
    setActive(id){
      const d = read();
      if (!d.slots.some(s => s.id === id)) return false;
      d.active = id;
      write(d);
      return true;
    },
    activeId(){ return read().active; },
  };
}
