// Arc Descent logic tests — node only, no DOM/GPU. Run: node _logic-test.js
import { mulberry32, rngInt, rngPick, rngShuffle, rngWeighted, hashStr, makeValueNoise2D } from './src/core/rng.js';
import * as Q from './src/core/questions.js';
import { makeProfile, makeRunStore, makeSavesStore, makeMemoryStore, levelInfo, rankFor, charLevelInfo, CHAR_LEVEL_MAX, RUN_KEY } from './src/core/profile.js';
import { genFloor, allRoomsReachable } from './src/core/dungeon.js';
import * as L from './src/core/loot.js';
import * as C from './src/core/combat.js';
import { REALMS, ENEMIES, PACK_TABLE, BOSS_BY_REALM, HAZARDS, TRIAL_REWARDS, ECON, CERTIFIED_PCT, REALM_PALETTES } from './src/core/balance.js';
import { SAMPLE_QUESTIONS } from './src/core/sample-questions.js';
import { ML_QUESTIONS } from './src/core/ml-questions.js';

let pass = 0, fail = 0;
const t = (cond, name) => { if (cond) pass++; else { fail++; console.error('FAIL:', name); } };

/* ================= rng ================= */
{
  const a = mulberry32(42), b = mulberry32(42), c = mulberry32(43);
  const sa = [a(), a(), a()], sb = [b(), b(), b()];
  t(sa.every((v, i) => v === sb[i]), 'mulberry32 deterministic');
  t(sa[0] !== c(), 'mulberry32 seed-sensitive');
  const r = mulberry32(7);
  for (let i = 0; i < 200; i++){ const v = rngInt(r, 3, 9); t(v >= 3 && v <= 9, 'rngInt bounds ' + v); }
  const counts = { x: 0, y: 0 };
  for (let i = 0; i < 4000; i++) counts[rngWeighted(r, [['x', 90], ['y', 10]])]++;
  t(counts.x > 3300 && counts.y < 700, 'rngWeighted ~90/10 got ' + counts.x + '/' + counts.y);
  const sh = rngShuffle(r, [1, 2, 3, 4, 5]);
  t(sh.length === 5 && [1, 2, 3, 4, 5].every(v => sh.includes(v)), 'rngShuffle permutation');
  const n = makeValueNoise2D(1);
  for (let i = 0; i < 100; i++){ const v = n(i * 0.37, i * 0.61); t(v >= 0 && v <= 1, 'noise in [0,1]'); }
  t(hashStr('abc') === hashStr('abc') && hashStr('abc') !== hashStr('abd'), 'hashStr');
}

/* ================= questions: parser ================= */
{
  const csv = 'question,choices,answer,why,difficulty,category,skin\n'
    + '"Q1?","A|B|C",A,,easy,CIRC,both\n'
    + '"Q2?","A|B",B,why2,medium,OCP,theory\n'
    + '"","A|B",A,,easy,CIRC,both\n'          // empty question -> skip
    + '"Q4?","A",A,,easy,CIRC,both\n'          // 1 choice -> skip
    + '"Q5?","A|a",A,,easy,CIRC,both\n'        // dup fold -> skip
    + '"Q6?","A|B",C,,easy,CIRC,both\n'        // answer mismatch -> skip
    + '"Q7?","A|B",A,,extreme,CIRC,both\n'     // bad difficulty -> skip
    + '"Q8?","A|B",a,,hard,circ,THEORY\n';     // case-insensitive everything -> ok
  const res = Q.parseQuestionFile('test.csv', csv);
  t(!res.error, 'csv parses');
  t(res.ok.length === 3, 'csv accepts 3, got ' + res.ok.length);
  t(res.skipped.length === 5, 'csv skips 5, got ' + res.skipped.length);
  t(res.ok[2].answer === 'A' && res.ok[2].difficulty === 'hard' && res.ok[2].category === 'CIRC' && res.ok[2].skin === 'theory', 'row normalization');
  const json = JSON.stringify([{ Question: 'JQ?', Choices: ['X', 'Y'], Answer: 'Y', Difficulty: 'hard', Category: 'dist' }]);
  const jr = Q.parseQuestionFile('bank.json', json);
  t(jr.ok.length === 1 && jr.ok[0].category === 'DIST', 'json parse + key folding');
  t(Q.parseQuestionFile('x.json', '{"nope":1}').error, 'json shape error reported');
  t(Q.parseQuestionFile('x.csv', 'nocolumns\nrow').error, 'csv missing question column');
  // quoted commas + escaped quotes
  const tricky = 'question,choices,answer\n"Say ""hi"", ok?","A, yes|B",B\n';
  const tr = Q.parseQuestionFile('t.csv', tricky);
  t(tr.ok.length === 1 && tr.ok[0].question === 'Say "hi", ok?' && tr.ok[0].choices[0] === 'A, yes', 'quoted CSV handling');
}

/* ================= questions: mastery machine ================= */
{
  const store = makeMemoryStore();
  const profile = makeProfile(store); profile.load();
  const q = { question: 'M?', choices: ['A', 'B'], answer: 'A', category: 'CIRC' };
  const k = Q.qKey(q);
  t(Q.qKey({ question: '  m?  ' }) === k, 'qKey normalizes whitespace/case');
  let newly = Q.recordAnswer(profile.data, q, true);
  t(!newly && !profile.data.mastery[k].m, '1 correct not mastered');
  newly = Q.recordAnswer(profile.data, q, true);
  t(newly && profile.data.mastery[k].m, '2-in-a-row masters');
  Q.recordAnswer(profile.data, q, false);
  t(!profile.data.mastery[k].m && profile.data.mastery[k].need === 3, 'miss unmasters + raises need');
  Q.recordAnswer(profile.data, q, false);
  Q.recordAnswer(profile.data, q, false);
  t(profile.data.mastery[k].need === Q.MASTERY_NEED_MAX, 'need caps at 4');
  for (let i = 0; i < 4; i++) Q.recordAnswer(profile.data, q, true);
  t(profile.data.mastery[k].m, 're-masters at raised need');
  t(profile.data.stats.qa === 9 && profile.data.stats.qc === 6, 'stats tally');
  t(profile.data.stats.byCat.CIRC.a === 9, 'per-cat tally');
  // certification
  const qs = [];
  for (let i = 0; i < 10; i++) qs.push({ question: 'C' + i, choices: ['A', 'B'], answer: 'A', category: 'CIRC' });
  for (let i = 0; i < 6; i++){ Q.recordAnswer(profile.data, qs[i], true); Q.recordAnswer(profile.data, qs[i], true); }
  const cm = Q.categoryMastery(profile.data, qs, 'CIRC');
  t(cm.mastered === 6 && cm.pct === 0.6, 'categoryMastery 6/10');
  t(Q.certifiedCats(profile.data, qs, ['CIRC'], CERTIFIED_PCT).CIRC === true, 'certified at 60%');
  t(Q.masteredCount(profile.data, qs) === 6, 'masteredCount');
}

/* ================= questions: pool routing ================= */
{
  const store = makeMemoryStore();
  const profile = makeProfile(store); profile.load();
  const bank = [];
  for (const diff of ['easy', 'medium', 'hard'])
    for (let i = 0; i < 8; i++) bank.push({ question: `${diff}${i}?`, choices: ['A', 'B'], answer: 'A', difficulty: diff, category: i % 2 ? 'CIRC' : 'GEN', skin: 'theory' });
  const rng = mulberry32(5);
  const sess = Q.makeSession();
  const picks = { easy: 0, medium: 0, hard: 0 };
  for (let i = 0; i < 300; i++){ const q = Q.nextQuestion(rng, profile.data, bank, Q.makeSession(), { realm: 1 }); picks[q.difficulty]++; }
  t(picks.easy > 150, 'realm1 routes mostly easy: ' + JSON.stringify(picks));
  const picks5 = { easy: 0, medium: 0, hard: 0 };
  for (let i = 0; i < 300; i++){ const q = Q.nextQuestion(rng, profile.data, bank, Q.makeSession(), { realm: 5 }); picks5[q.difficulty]++; }
  t(picks5.hard > 150, 'realm5 routes mostly hard: ' + JSON.stringify(picks5));
  for (let i = 0; i < 50; i++){
    const q = Q.nextQuestion(rng, profile.data, bank, sess, { realm: 1, cat: 'CIRC' });
    t(q.category === 'CIRC', 'forced cat');
  }
  for (let i = 0; i < 50; i++){
    const q = Q.nextQuestion(rng, profile.data, bank, Q.makeSession(), { realm: 1, diff: 'hard' });
    t(q.difficulty === 'hard', 'forced difficulty');
  }
  // no immediate repeats
  let lastK = null, repeats = 0;
  for (let i = 0; i < 60; i++){
    const q = Q.nextQuestion(rng, profile.data, bank, sess, { realm: 1 });
    const k = Q.qKey(q);
    if (k === lastK) repeats++;
    lastK = k;
  }
  t(repeats === 0, 'recent-window prevents immediate repeats');
  // unmastered preference
  for (const q of bank.slice(0, 20)){ Q.recordAnswer(profile.data, q, true); Q.recordAnswer(profile.data, q, true); }
  let unmPicks = 0;
  for (let i = 0; i < 60; i++){
    const q = Q.nextQuestion(rng, profile.data, bank, Q.makeSession(), { realm: 3 });
    const m = profile.data.mastery[Q.qKey(q)];
    if (!(m && m.m)) unmPicks++;
  }
  t(unmPicks === 60, 'pool prefers unmastered: ' + unmPicks + '/60');
}

/* ================= bank + sample questions ================= */
{
  t(SAMPLE_QUESTIONS.length >= 30, 'sample bank >= 30 (' + SAMPLE_QUESTIONS.length + ')');
  const rev = Q.validateRows(SAMPLE_QUESTIONS);
  t(rev.ok.length === SAMPLE_QUESTIONS.length && rev.skipped.length === 0, 'sample bank fully valid');
  const circ = SAMPLE_QUESTIONS.filter(q => q.category === 'CIRC');
  for (const d of ['easy', 'medium', 'hard'])
    t(circ.filter(q => q.difficulty === d).length >= 5, `sample CIRC has >=5 ${d}`);
  t(SAMPLE_QUESTIONS.every(q => q.skin !== 'onboarding'), 'theory-only: no onboarding-only rows bundled');
  const store = makeMemoryStore();
  const bank = Q.makeBank(store, 'test.bank', SAMPLE_QUESTIONS);
  t(bank.active().src === 'bundled sample', 'bank defaults to bundle');
  bank.install([{ question: 'U?', choices: ['A', 'B'], answer: 'A' }], 'up.csv', 1);
  t(bank.active().src === 'bundled sample', 'bank rejects <5 uploads');
  bank.install(SAMPLE_QUESTIONS.slice(0, 6), 'up.csv', 1);
  t(bank.active().src === 'up.csv' && bank.isCustom(), 'bank installs valid upload');
  bank.reset();
  t(!bank.isCustom(), 'bank reset');

  // bundled-bank picker (ML+RAG study track)
  t(ML_QUESTIONS.length >= 150, 'ML bank >= 150 (' + ML_QUESTIONS.length + ')');
  const mrev = Q.validateRows(ML_QUESTIONS);
  t(mrev.ok.length === ML_QUESTIONS.length && mrev.skipped.length === 0, 'ML bank fully valid');
  for (const cat of ['CIRC', 'COND', 'GRND', 'DIST', 'OCP']){
    const inCat = ML_QUESTIONS.filter(q => q.category === cat);
    t(inCat.length >= 24, `ML bank ${cat} >= 24 (${inCat.length})`);
    for (const d of ['easy', 'medium', 'hard'])
      t(inCat.some(q => q.difficulty === d), `ML bank ${cat} has ${d}`);
  }
  const st2 = makeMemoryStore();
  const b2 = Q.makeBank(st2, 'test.bank', SAMPLE_QUESTIONS, {
    ee: { label: 'Electrical Theory', questions: SAMPLE_QUESTIONS },
    mlrag: { label: 'ML + RAG', questions: ML_QUESTIONS },
  }, 'test.pick');
  t(b2.pick() === 'ee' && b2.active().questions === SAMPLE_QUESTIONS, 'picker defaults to first bundle');
  t(b2.picks().join(',') === 'ee,mlrag', 'picks exclude custom when nothing uploaded');
  b2.setPick('mlrag');
  t(b2.active().questions === ML_QUESTIONS && b2.active().src === 'ML + RAG', 'picker switches to ML bank');
  b2.install(SAMPLE_QUESTIONS.slice(0, 6), 'up.csv', 1);
  t(b2.pick() === 'custom' && b2.active().src === 'up.csv', 'upload activates custom');
  t(b2.picks().join(',') === 'ee,mlrag,custom', 'picks include custom after upload');
  b2.setPick('mlrag');
  t(b2.active().questions === ML_QUESTIONS, 'bundled pick overrides installed upload');
  b2.setPick('custom');
  b2.reset();
  t(b2.pick() !== 'custom' && b2.active().questions !== undefined, 'custom pick falls back after reset');
  // per-id bank info (home page save cards)
  t(b2.info('ee').label === 'Electrical Theory' && b2.info('ee').count === SAMPLE_QUESTIONS.length, 'info(ee)');
  t(b2.info('mlrag').count === ML_QUESTIONS.length, 'info(mlrag)');
  t(b2.info('custom') === null, 'info(custom) null after reset');
  b2.install(SAMPLE_QUESTIONS.slice(0, 6), 'up.csv', 1);
  t(b2.info('custom').label === 'up.csv' && b2.info('custom').count === 6, 'info(custom) after upload');
  t(b2.info('nope') === null, 'info(unknown) null');
}

/* ================= profile + leveling ================= */
{
  t(levelInfo(0).lvl === 1 && levelInfo(80).lvl === 2, 'meta level curve start');
  let prev = 0;
  for (let xp = 0; xp <= 20000; xp += 500){ const l = levelInfo(xp).lvl; t(l >= prev, 'meta level monotonic'); prev = l; }
  t(rankFor(1) === 'Helper' && rankFor(6) === 'Journeyman' && rankFor(25) === 'Chief Inspector', 'ranks');
  t(charLevelInfo(0).lvl === 1, 'char level 1 at 0 xp');
  let need = 0;
  for (let l = 1; l < CHAR_LEVEL_MAX; l++) need += Math.round(50 * Math.pow(l, 1.5));
  t(charLevelInfo(need).lvl === 25 && charLevelInfo(need * 10).lvl === 25, 'char level caps at 25');
  const store = makeMemoryStore();
  const p1 = makeProfile(store); p1.load();
  p1.data.xp = 500; p1.data.stats.kills = 7; p1.data.mastery.abc = { s: 1, need: 2, m: false, a: 1, c: 1 };
  p1.save();
  const p2 = makeProfile(store); p2.load();
  t(p2.data.xp === 500 && p2.data.stats.kills === 7 && p2.data.mastery.abc.a === 1, 'profile roundtrip');
  const rs = makeRunStore(store);
  const run = { realm: 1, floorIdx: 1, charXp: 900, equipped: { tool: L.makeItem('tool', 1, 'rated', mulberry32(1)) }, backpack: [], flags: { gotTool: true } };
  rs.save(run);
  const back = rs.load();
  t(back && back.charXp === 900 && back.equipped.tool.slot === 'tool', 'run save roundtrip');
  rs.clear();
  t(rs.load() === null, 'run clear');
}

/* ================= multi-slot saves (home page) ================= */
{
  const store = makeMemoryStore();
  const sv = makeSavesStore(store);
  t(sv.list().length === 0 && sv.count() === 0 && sv.activeId() === null, 'saves start empty');
  const runA = { cls: 'lineman', realm: 1, floorIdx: 0, charXp: 0, seals: {} };
  const a = sv.create({ name: 'Lineman', bank: 'ee', run: runA }, 100);
  t(a.id === 1 && sv.activeId() === 1, 'create sets active');
  const b = sv.create({ name: 'Tester', bank: 'mlrag', run: { cls: 'tester', realm: 2 } }, 200);
  const c = sv.create({ name: 'Foreman', bank: 'ee', run: { cls: 'foreman', realm: 1 } }, 300);
  t(sv.count() === 3 && sv.activeId() === c.id, 'multiple saves coexist');
  t(sv.list().map(s => s.name).join(',') === 'Foreman,Tester,Lineman', 'list sorts by last played');
  t(sv.update(a.id, { cls: 'lineman', realm: 3, floorIdx: 2 }, 400), 'update ok');
  t(sv.list()[0].id === a.id && sv.get(a.id).run.realm === 3, 'update stamps + persists run');
  t(!sv.update(99, {}, 500), 'update unknown id false');
  t(sv.rename(b.id, '  Study Build  ') && sv.get(b.id).name === 'Study Build', 'rename trims');
  t(!sv.rename(b.id, '   '), 'rename rejects blank');
  t(sv.rename(b.id, 'x'.repeat(60)) && sv.get(b.id).name.length === 40, 'rename caps at 40');
  t(sv.setBank(b.id, 'custom') && sv.get(b.id).bank === 'custom', 'setBank');
  t(sv.setActive(a.id) && sv.activeId() === a.id, 'setActive');
  t(!sv.setActive(99), 'setActive unknown id false');
  t(sv.remove(a.id) && sv.count() === 2 && sv.activeId() === null, 'remove clears active');
  t(!sv.remove(a.id), 'double remove false');
  const d = sv.create({ name: 'Again', bank: 'ee', run: {} }, 600);
  t(d.id === 4, 'ids never reused after delete');
  // roundtrip through a fresh store instance (reload)
  const sv2 = makeSavesStore(store);
  t(sv2.count() === 3 && sv2.get(b.id).name === 'x'.repeat(40) && sv2.get(b.id).bank === 'custom', 'saves roundtrip');
  // unlimited saves
  for (let i = 0; i < 30; i++) sv2.create({ name: 'S' + i, bank: 'ee', run: {} }, 700 + i);
  t(sv2.count() === 33, 'unlimited slots');
  // legacy single-run migration shape (main.js folds RUN_KEY into slot 1)
  const st3 = makeMemoryStore();
  st3.set(RUN_KEY, JSON.stringify({ v: 1, run: { cls: 'tester', realm: 2, floorIdx: 1 } }));
  const rs3 = makeRunStore(st3);
  const sv3 = makeSavesStore(st3);
  const legacy = rs3.load();
  t(!!legacy, 'legacy run readable');
  sv3.create({ name: 'Tester', bank: 'ee', run: legacy }, 900);
  rs3.clear();
  t(sv3.count() === 1 && sv3.get(1).run.realm === 2 && rs3.load() === null, 'legacy run folds into slot 1');
}

/* ================= dungeon ================= */
{
  let shrineTotal = 0;
  for (let seed = 1; seed <= 50; seed++){
    for (const cfg of [
      { realm: 1, floorIdx: 0, roomCount: 9, shrineCount: 2, loto: false, boss: false },
      { realm: 1, floorIdx: 1, roomCount: 11, shrineCount: 2, loto: true, boss: true },
    ]){
      const f = genFloor(mulberry32(seed * 977 + cfg.floorIdx), cfg);
      t(allRoomsReachable(f), `seed ${seed} f${cfg.floorIdx} all rooms reachable`);
      t(f.rooms.filter(r => r.type === 'start').length === 1, 'one start room');
      const shrines = f.rooms.filter(r => r.type === 'shrine').length;
      shrineTotal += shrines;
      t(shrines >= 1 && shrines <= 2, 'shrines 1-2 got ' + shrines);
      if (cfg.boss){
        t(f.bossRoom !== null && f.rooms[f.bossRoom].type === 'boss', 'boss room set');
        t(f.exit === null, 'no exit on boss floor');
      } else {
        t(f.exit !== null, 'exit on non-boss floor');
      }
      if (cfg.loto && f.lotoDoor){
        const at2 = (x, y) => (x >= 0 && y >= 0 && x < f.w && y < f.h) ? f.tiles[y * f.w + x] : 0;
        const d = f.lotoDoor;
        t(d.tiles.length === 3, 'loto door blocks full corridor width');
        for (const tile of d.tiles) t(at2(tile.x, tile.y) === 1, 'loto door tile on carved floor');
        if (d.horiz) t(at2(d.x, d.y - 2) === 0 && at2(d.x, d.y + 2) === 0, 'loto door walled on both sides');
        else t(at2(d.x - 2, d.y) === 0 && at2(d.x + 2, d.y) === 0, 'loto door walled on both sides');
      }
      for (const pk of f.packs){
        const r = f.rooms[pk.room];
        t(['combat', 'elite', 'treasure'].includes(r.type), 'packs only in combat rooms');
        for (const s of pk.slots){
          t(s.x >= r.x && s.x < r.x + r.w && s.y >= r.y && s.y < r.y + r.h, 'spawn inside room');
          t(f.tiles[s.y * f.w + s.x] === 1, 'spawn on floor tile');
        }
      }
      t(f.tiles[Math.floor(f.start.y) * f.w + Math.floor(f.start.x)] === 1, 'start on floor');
      const eliteRooms = f.rooms.filter(r => r.type === 'elite');
      t(eliteRooms.length <= 1, 'at most one elite room');
    }
  }
  t(shrineTotal >= 170, 'shrine placement healthy across seeds: ' + shrineTotal + '/200');
}

/* ================= loot ================= */
{
  const rng = mulberry32(99);
  // distribution per realm
  for (const realm of [1, 2, 3, 4, 5]){
    const W = REALMS[realm].rarityWeights;
    const N = 6000, counts = { stock: 0, rated: 0, certified: 0, master: 0 };
    const ownedAll = new Set(L.UNIQUES[realm].map(u => u.id)); // all owned -> MC downgrades to certified
    for (let i = 0; i < N; i++){
      const it = L.rollDrop(realm, 'trash', rng, ownedAll);
      counts[it.rarity]++;
      t(it.ilvl === realm && it.tag === REALMS[realm].tag, 'ilvl/tag stamped');
    }
    const tol = N * 0.035;
    // all uniques owned -> master rolls downgrade to certified, so certified absorbs W[3]
    const expected = { stock: W[0], rated: W[1], certified: W[2] + W[3] };
    ['stock', 'rated', 'certified'].forEach(r => {
      const expect = N * expected[r] / 100;
      t(Math.abs(counts[r] - expect) < tol + N * 0.01, `realm${realm} ${r} freq ${counts[r]} ≈ ${Math.round(expect)}`);
    });
  }
  // affix legality across many items
  for (let i = 0; i < 2000; i++){
    const slot = L.SLOTS[i % 6];
    const it = L.makeItem(slot, 1 + (i % 5), i % 2 ? 'certified' : 'rated', rng);
    const seen = new Set();
    for (const a of it.affixes){
      const def = L.AFFIX_BY_ID[a.id];
      t(!!def, 'affix exists');
      t(def.slots.includes(slot), `affix ${a.id} legal on ${slot}`);
      t(!seen.has(a.id), 'no duplicate affix'); seen.add(a.id);
      if (def.fixed === undefined){
        const [lo, hi] = def.ranges[it.ilvl];
        t(a.value >= lo && a.value <= hi, `affix value in range: ${a.id}=${a.value} in [${lo},${hi}]`);
      }
    }
    if (it.rarity === 'rated') t(it.affixes.length === 1 && it.identified, 'rated: 1 affix, identified');
    if (it.rarity === 'certified') t(it.affixes.length >= 2 && it.affixes.length <= 3 && !it.identified, 'certified: 2-3 affixes, unidentified');
  }
  // uniques + duplicate protection
  let uniqueSeen = 0, dupDowngrade = 0;
  for (let i = 0; i < 4000; i++){
    const it = L.rollDrop(1, 'boss', rng, new Set());
    if (it.rarity === 'master'){ uniqueSeen++; t(['bondingJumper', 'theWiggy'].includes(it.uniqueId), 'boss MC is an R1 unique'); }
  }
  t(uniqueSeen > 100 && uniqueSeen < 350, 'R1 boss ~5% MC rate: ' + uniqueSeen + '/4000');
  for (let i = 0; i < 4000; i++){
    const it = L.rollDrop(1, 'boss', rng, new Set(['bondingJumper', 'theWiggy']));
    t(it.rarity !== 'master', 'dup protection: never MC when all owned');
    if (it.rarity === 'certified' && it.affixes.length === 3 && !it.identified) dupDowngrade++;
  }
  t(dupDowngrade > 50, 'dup downgrade produces 3-affix certified: ' + dupDowngrade);
  // canon: 5% boss MC floor generalizes to every realm (base weight 1% -> boss 5%)
  let r2Master = 0;
  for (let i = 0; i < 4000; i++){
    const it = L.rollDrop(2, 'boss', rng, new Set());
    if (it.rarity === 'master'){
      r2Master++;
      t(['ninetyDegColumn', 'longRunCompensator'].includes(it.uniqueId), 'realm-2 boss MC is an R2 unique');
    }
  }
  t(r2Master > 110 && r2Master < 330, 'realm-2 boss MC floor ~5%: ' + r2Master + '/4000');
  // chestUpgraded shifts up
  let base = 0, up = 0;
  for (let i = 0; i < 4000; i++){
    if (L.rollDrop(1, 'chest', rng).rarity !== 'stock') base++;
    if (L.rollDrop(1, 'chestUpgraded', rng).rarity !== 'stock') up++;
  }
  t(up > base + 1000, `chestUpgraded shifts rarity: ${up} vs ${base}`);
  // identify keeps higher
  for (let i = 0; i < 300; i++){
    const it = L.makeItem('jacket', 3, 'certified', rng);
    const before = it.affixes.map(a => a.value);
    L.identify(it, true, rng);
    t(it.identified, 'identified');
    it.affixes.forEach((a, j) => t(a.value >= before[j], 'ID bonus never lowers'));
  }
  // salvage + volts
  t(L.salvageValue({ rarity: 'certified', ilvl: 2 }) === 8, 'salvage 4×ilvl certified');
  t(L.salvageValue({ rarity: 'master', ilvl: 1 }, 0.5) === 15, 'salvage with Copper Scrounger');
  for (let i = 0; i < 100; i++){
    const v = L.voltDrop(2, 'trash', rng);
    t(v >= 2 && v <= 6, 'trash volts ×realm');
  }
  t(L.voltDrop(3, 'boss', rng) === 120, 'boss volts 40×realm');
  // forge
  const fr = mulberry32(3);
  const stock = L.makeItem('tool', 1, 'stock', fr);
  t(L.canForge('reinforce', stock) && !L.canForge('certify', stock), 'forge gates on rarity');
  L.forgeApply('reinforce', stock, fr);
  t(stock.rarity === 'rated' && stock.affixes.length === 1, 'reinforce -> rated +1 affix');
  L.forgeApply('certify', stock, fr);
  t(stock.rarity === 'certified' && stock.affixes.length === 2, 'certify -> certified +1 affix');
  const master = L.makeItem('tool', 1, 'stock', fr); master.rarity = 'master';
  t(!L.canForge('reinforce', master), 'uniques never forgeable');
  const cost = L.forgeCost('certify', 3);
  t(cost.stamps === 10 && cost.salvage === 30, 'certify cost scales with realm');
  t(ECON.forge.reinforce(1).stamps === 3, 'reinforce base cost');
}

/* ================= combat: stats ================= */
{
  const rng = mulberry32(11);
  const tool = { slot: 'tool', rarity: 'stock', tag: 'surge', implicits: [{ stat: 'damage', value: 10 }], affixes: [], identified: true };
  let s = C.derivedStats(1, [tool]);
  t(s.damage === 10, 'stock tool 10 dmg (canon curve), got ' + s.damage);
  t(s.maxHp === 110, 'lvl1 maxHp 110');
  t(s.moveSpeed === 5, 'base move speed');
  t(s.atkSpeed === 1.2, 'lineman base AS');
  t(C.PLAYER.dodge.dist === 4.2 && C.PLAYER.dodge.dur === 0.35, 'dodge dash 4.2u (playtest +20%, 2026-07-06), duration kept');
  const ratedTool = { ...tool, rarity: 'rated', affixes: [{ id: 'heavyGauge', value: 10 }] };
  s = C.derivedStats(1, [ratedTool]);
  t(s.damage === Math.round(10 * 1.15 * 1.10), 'rated ×1.15 + 10% affix: ' + s.damage);
  // CERTIFIED tag
  s = C.derivedStats(1, [ratedTool], { certTags: new Set(['surge']) });
  t(s.damage === Math.round(10 * 1.15 * 1.10 * 1.10 + 0.0001) || s.damage === Math.round(10 * 1.15 * 1.10 * 1.10), 'CERTIFIED +10%: ' + s.damage);
  // armor + hp dual implicit (jacket) + dr
  const jacket = { slot: 'jacket', rarity: 'stock', tag: 'surge', implicits: [{ stat: 'armor', value: 4 }, { stat: 'hp', value: 6 }], affixes: [{ id: 'reinforced', value: 4 }], identified: true };
  s = C.derivedStats(5, [jacket]);
  t(s.armor === 8 && Math.abs(s.dr - 8 / 208) < 1e-9, 'armor formula A/(A+200): ' + s.armor);
  t(s.maxHp === 156, 'jacket hp implicit applies: ' + s.maxHp);
  t(C.mitigated(10, s.dr) === Math.max(1, Math.round(10 * (1 - s.dr))), 'mitigation rounding');
  t(C.mitigated(1, 0.99) === 1, 'damage floor 1');
  // gloves AS% / boots MS% implicits
  s = C.derivedStats(1, [
    { slot: 'gloves', rarity: 'stock', tag: 'surge', implicits: [{ stat: 'asPct', value: 4 }], affixes: [], identified: true },
    { slot: 'boots', rarity: 'stock', tag: 'surge', implicits: [{ stat: 'msPct', value: 3 }], affixes: [], identified: true },
  ]);
  t(Math.abs(s.atkSpeed - 1.2 * 1.04) < 1e-9, 'gloves AS% implicit: ' + s.atkSpeed);
  t(Math.abs(s.moveSpeed - 5 * 1.03) < 1e-9, 'boots MS% implicit: ' + s.moveSpeed);
  // meter wildcard rolls exactly one of the 5 stats
  for (let i = 0; i < 100; i++){
    const m = L.makeItem('meter', 1, 'stock', rng);
    t(m.implicits.length === 1 && ['damage', 'armor', 'hp', 'asPct', 'msPct'].includes(m.implicits[0].stat), 'meter wildcard implicit');
  }
  // unidentified affixes contribute nothing (implicits still apply)
  const unid = { slot: 'jacket', rarity: 'certified', tag: 'surge', implicits: [{ stat: 'armor', value: 4 }, { stat: 'hp', value: 6 }], affixes: [{ id: 'paddedLiner', value: 14 }], identified: false };
  s = C.derivedStats(1, [unid]);
  t(s.maxHp === Math.round((110 + 6 * 1.30) * 1), 'unidentified affixes inert, implicits live: ' + s.maxHp);
  // board
  const nodes = C.activeBoardNodes(C.LINEMAN_BOARD, 10, {});
  t(nodes.length === 5, 'board: 5 ungated nodes by lvl 10, got ' + nodes.length);
  const gated = C.activeBoardNodes(C.LINEMAN_BOARD, 12, { CIRC: 0.5 });
  t(gated.some(n => n.id === 'doubleCrimp'), 'gate opens with mastery');
  t(!C.activeBoardNodes(C.LINEMAN_BOARD, 12, { CIRC: 0.3 }).some(n => n.id === 'doubleCrimp'), 'gate blocks without mastery');
  s = C.derivedStats(10, [tool], { boardNodes: C.activeBoardNodes(C.LINEMAN_BOARD, 10, {}) });
  t(s.range === 2.1 && s.arc === 120, 'Long Reach applies');
  // canonical R1 uniques
  t(L.UNIQUES[1].map(u => u.id).sort().join(',') === 'bondingJumper,theWiggy', 'canon uniques Bonding Jumper / The Wiggy');
  t(REALMS[1].tag === 'surge', 'R1 tag canonized to surge');
  t(ENEMIES.boltedFault.name === 'Bolted Short', 'R1 elite renamed Bolted Short');
  // geometry
  t(C.inArc(0, 0, 0, 2, 90, 1.5, 0), 'inArc dead ahead');
  t(!C.inArc(0, 0, 0, 2, 90, -1.5, 0), 'inArc behind excluded');
  t(!C.inArc(0, 0, 0, 2, 90, 0, 1.9), 'inArc 90° side excluded');
  t(C.inArc(0, 0, 0, 2, 200, 0, 1.5), 'wide arc includes side');
  t(C.inLine(0, 0, 0, 5, 1, 3, 0.4) && !C.inLine(0, 0, 0, 5, 1, 3, 0.6), 'inLine width');
  t(C.inCircle(0, 0, 2, 1, 1) && !C.inCircle(0, 0, 2, 2, 2), 'inCircle');
}

/* ================= combat: AI machines ================= */
{
  const mkWorld = (px, pz) => ({ px, pz, playerAlive: true, time: 0, los: () => true });
  const mkE = (id, x = 0, z = 0) => ({ def: ENEMIES[id], id, x, z, hp: ENEMIES[id].hp, hpMax: ENEMIES[id].hp, state: 'idle', t: 0 });
  // chaser
  let e = mkE('deadShort');
  let i1 = C.tickEnemy(e, mkWorld(20, 0), 0.1);
  t(e.state === 'idle' && !i1.move, 'chaser idles out of aggro');
  i1 = C.tickEnemy(e, mkWorld(5, 0), 0.1);
  t(e.state === 'chase', 'chaser aggros');
  i1 = C.tickEnemy(e, mkWorld(5, 0), 0.1);
  t(i1.move && i1.move.x > 0.9, 'chaser moves at player');
  C.tickEnemy(e, mkWorld(1, 0), 0.1);
  t(e.state === 'windup', 'chaser winds up in strike range');
  let struck = null;
  for (let i = 0; i < 8; i++){ const it = C.tickEnemy(e, mkWorld(1, 0), 0.1); if (it.action){ struck = it.action; break; } }
  t(struck && struck.type === 'melee' && struck.dmg === 5, 'chaser strikes after 0.7s windup (R1 teaching tell), dmg=trash hit');
  t(e.state === 'recover', 'chaser recovers');
  // flinch
  t(C.applyFlinch(e, 1) && e.state === 'flinch', 'flinch applies');
  t(!C.applyFlinch(e, 1.05), 'flinch ICD blocks');
  // spitter
  e = mkE('strippedSplice');
  C.tickEnemy(e, mkWorld(6, 0), 0.1);
  t(e.state === 'position', 'spitter aggro');
  let it2 = C.tickEnemy(e, mkWorld(3, 0), 0.1);
  t(it2.move && it2.move.x < 0, 'spitter backs away inside band');
  it2 = C.tickEnemy(e, mkWorld(9.5, 0), 0.1);
  t(it2.move && it2.move.x > 0, 'spitter closes when far');
  C.tickEnemy(e, mkWorld(6, 0), 0.1); // enters aim
  t(e.state === 'aim', 'spitter aims in band');
  let fired = null;
  for (let i = 0; i < 10; i++){ const it = C.tickEnemy(e, mkWorld(6, 0), 0.1); if (it.action){ fired = it.action; break; } }
  t(fired && fired.type === 'projectile' && fired.speed === 8, 'spitter fires after aim');
  t(e.state === 'cooldown', 'spitter cooldown');
  // special split
  e = mkE('branchTap');
  e.hp = e.hpMax * 0.4;
  const sp = C.tickEnemy(e, mkWorld(5, 0), 0.1);
  t(sp.action && sp.action.type === 'spawn' && sp.action.id === 'subTap' && sp.action.count === 2 && sp.action.killSelf, 'branch tap splits at <=50%');
  const sp2 = C.tickEnemy(e, mkWorld(5, 0), 0.1);
  t(!sp2.action || sp2.action.type !== 'spawn', 'split fires once');
  // elite charge
  e = mkE('boltedFault');
  e.state = 'chase'; e.chargeCd = 0;
  const ch = C.tickEnemy(e, mkWorld(6, 0), 0.1);
  t(e.state === 'chargeWindup', 'elite windup at range');
  for (let i = 0; i < 10 && e.state === 'chargeWindup'; i++) C.tickEnemy(e, mkWorld(6, 0), 0.1);
  t(e.state === 'charging', 'elite charges');
  const ci = C.tickEnemy(e, mkWorld(6, 0), 0.1);
  t(ci.speedMult > 2 && ci.action && ci.action.type === 'contact', 'charge fast + contact damage');
  e.state = 'wallStun'; e.t = 0;
  C.tickEnemy(e, mkWorld(6, 0), 0.1);
  t(e.state === 'wallStun', 'wall stun holds');
  e.t = 2.1; C.tickEnemy(e, mkWorld(6, 0), 0.05);
  t(e.state === 'chase', 'wall stun ends at 2s');
  // boss framework
  e = mkE('openMain', 0, 0);
  e.bs = C.makeBossState(e.def); e.home = { x: 0, z: 0 };
  let bi = C.tickBoss(e, mkWorld(5, 0), 0.1);
  t(e.bs.phase === 'intro' && bi.untargetable, 'boss intro untargetable');
  e.bs.t = 2.1; C.tickBoss(e, mkWorld(5, 0), 0.05);
  t(e.bs.phase === 'p1', 'boss enters p1');
  // attack cycle: cadence -> windup(telegraph) -> action
  let tele = null, act = null;
  for (let i = 0; i < 100 && !act; i++){
    const it = C.tickBoss(e, mkWorld(2, 0), 0.1);
    if (it.telegraph) tele = it.telegraph;
    if (it.action) act = it.action;
  }
  t(!!tele && !!act, 'boss telegraphs then acts');
  t(act.dmg >= 12 && act.dmg <= 17, 'boss dmg in band: ' + act.dmg); // boss buff approved 2026-07-06
  // break at 50%
  e.hp = e.hpMax * 0.49; e.bs.winding = null;
  let ev = null;
  for (let i = 0; i < 5 && !ev; i++){ const it = C.tickBoss(e, mkWorld(2, 0), 0.1); ev = it.event; }
  t(ev === 'breakStart' && e.bs.phase === 'break' && e.bs.shield === 100, 'inspection break at 50%');
  C.bossBreakAnswer(e, true);
  t(e.bs.shield === 65 && e.bs.breakCorrect === 1, 'correct strips 35');
  C.bossBreakAnswer(e, false);
  t(e.bs.shield === 53, 'wrong chips 12 (pity, never a wall)');
  C.bossBreakAnswer(e, true); C.bossBreakAnswer(e, true);
  t(e.bs.shield <= 0, '3 correct + pity strips shield');
  // shield decay alone also finishes
  const e2 = mkE('openMain'); e2.bs = C.makeBossState(e2.def); e2.bs.phase = 'break'; e2.bs.shield = 100; e2.home = { x: 0, z: 0 };
  let ticks = 0;
  while (e2.bs.phase === 'break' && ticks < 1000){ C.tickBoss(e2, mkWorld(2, 0), 0.1); ticks++; }
  t(ticks < 400, 'shield decays out in <40s: ' + (ticks / 10) + 's');
  // open phase pads
  const e3 = mkE('openMain'); e3.bs = C.makeBossState(e3.def); e3.bs.phase = 'p1'; e3.bs.openTimer = 0.05; e3.home = { x: 0, z: 0 };
  let opened = null;
  for (let i = 0; i < 5 && !opened; i++){ const it = C.tickBoss(e3, mkWorld(2, 0), 0.1); opened = it.event; }
  t(opened === 'openStart' && e3.bs.phase === 'open', 'boss throws open on timer');
  e3.bs.padA = 6; e3.bs.padB = 6;
  const ri = C.tickBoss(e3, mkWorld(2, 0), 0.1);
  t(ri.event === 'reclose' && e3.bs.phase === 'stagger', 'both pads reclose -> stagger');
  for (let i = 0; i < 45; i++) C.tickBoss(e3, mkWorld(2, 0), 0.1);
  t(e3.bs.phase === 'p1' && e3.bs.openTimer > e3.def.boss.openEvery - 1, 'stagger ends, open timer reset');
  // p2 adds
  const e4 = mkE('openMain'); e4.bs = C.makeBossState(e4.def); e4.bs.phase = 'p2'; e4.home = { x: 0, z: 0 };
  e4.hp = e4.hpMax * 0.3;
  let addAct = null;
  for (let i = 0; i < 5 && !addAct; i++){ const it = C.tickBoss(e4, mkWorld(2, 0), 0.1); if (it.action && it.action.type === 'spawn') addAct = it.action; }
  t(addAct && addAct.id === 'strippedSplice' && addAct.count === 2, 'p2 summons adds at 35%');
}

/* ================= tuning bands (combat doc targets) ================= */
{
  // paper DPS with canon implicits: stock tool ilvl1 = 10
  const stats1 = C.derivedStats(1, [{ slot: 'tool', rarity: 'stock', tag: 'surge', implicits: [{ stat: 'damage', value: 10 }], affixes: [], identified: true }]);
  const dpsEntry = stats1.damage * stats1.atkSpeed; // no uplift
  for (const id of ['deadShort', 'strippedSplice']){
    const ttk = ENEMIES[id].hp / dpsEntry;
    t(ttk > 1 && ttk < 6, `trash TTK in band: ${id} ${ttk.toFixed(1)}s`);
  }
  const ratedT = { slot: 'tool', rarity: 'rated', tag: 'surge', implicits: [{ stat: 'damage', value: 10 }], affixes: [{ id: 'heavyGauge', value: 12 }], identified: true };
  const statsX = C.derivedStats(5, [ratedT]);
  const dpsExit = statsX.damage * statsX.atkSpeed * 1.3; // active uplift
  const eliteTtk = ENEMIES.boltedFault.hp / (dpsExit * 0.85);
  t(eliteTtk > 5 && eliteTtk < 20, 'elite TTK in band: ' + eliteTtk.toFixed(1) + 's');
  const bossDpsTime = ENEMIES.openMain.hp / (dpsExit * 0.6);
  t(bossDpsTime > 15 && bossDpsTime < 90, 'boss DPS time plausible: ' + bossDpsTime.toFixed(0) + 's');
  // enemy stats inside bible §4 realm-1 bounds
  const R1 = REALMS[1];
  for (const id of ['deadShort', 'strippedSplice', 'branchTap']){
    const d = ENEMIES[id];
    t(d.hp >= R1.trashHp[0] * 0.65 && d.hp <= R1.trashHp[1], `${id} HP inside band`); // subTap-adjusted floor
    t(d.hit >= R1.trashHit[0] && d.hit <= R1.trashHit[1], `${id} hit inside band`);
  }
  t(ENEMIES.branchTap.hp + 2 * ENEMIES.subTap.hp <= R1.trashHp[1] + 20, 'branch tap total HP near trash ceiling');
  t(ENEMIES.boltedFault.hp === R1.eliteHp, 'elite HP matches bible');
  t(ENEMIES.openMain.hp === R1.bossHp, 'boss HP matches bible');
  for (const a of [...ENEMIES.openMain.boss.p1, ...ENEMIES.openMain.boss.p2])
    t(a.dmg >= R1.bossHit[0] - 1 && a.dmg <= R1.bossHit[1], `boss attack ${a.name} dmg in band`);
}

/* ================= greedy-bot boss sim (beatable, no-wall) ================= */
{
  // Simple time-step duel: bot holds RMB (perfect uptime 60%), dodges nothing, eats every
  // 3rd boss attack; proves the fight ends and the player survives with realm-exit gear.
  const tool = { slot: 'tool', rarity: 'rated', tag: 'surge', implicits: [{ stat: 'damage', value: 10 }], affixes: [{ id: 'heavyGauge', value: 12 }], identified: true };
  const jacket = { slot: 'jacket', rarity: 'rated', tag: 'surge', implicits: [{ stat: 'armor', value: 4 }, { stat: 'hp', value: 6 }], affixes: [{ id: 'paddedLiner', value: 12 }], identified: true };
  const s = C.derivedStats(5, [tool, jacket]);
  const boss = { def: ENEMIES.openMain, x: 0, z: 0, hp: ENEMIES.openMain.hp, hpMax: ENEMIES.openMain.hp, state: 'active', t: 0, bs: C.makeBossState(ENEMIES.openMain), home: { x: 0, z: 0 } }; // boss buff approved 2026-07-06

  boss.bs.phase = 'p1';
  let php = s.maxHp, time = 0, hitsTaken = 0, attackN = 0;
  const dt = 0.1;
  while (boss.hp > 0 && php > 0 && time < 300){
    time += dt;
    const it = C.tickBoss(boss, { px: 1.5, pz: 0, playerAlive: true, time, los: () => true }, dt);
    if (it.event === 'breakStart'){
      // bot answers 65%: expected ~4 answers to strip
      let shield = 100;
      while (shield > 0){ const ok = (attackN++ % 3) !== 0; shield -= ok ? 35 : 12; }
      boss.bs.phase = 'p2'; boss.bs.t = 0;
    }
    if (boss.bs.phase === 'open'){ boss.bs.padA = 6; boss.bs.padB = 6; } // bot pads immediately
    if (it.action && it.action.type !== 'spawn'){
      attackN++;
      if (attackN % 3 === 0){ php -= C.mitigated(it.action.dmg, s.dr); hitsTaken++; }
    }
    // bot dps at 60% uptime
    if (boss.bs.phase === 'p1' || boss.bs.phase === 'p2' || boss.bs.phase === 'stagger'){
      const vuln = boss.bs.phase === 'stagger' ? 1.25 : 1;
      boss.hp -= s.damage * s.atkSpeed * 0.6 * vuln * dt;
    }
  }
  t(boss.hp <= 0, `bot kills The Open Main (t=${time.toFixed(0)}s, hp left ${php.toFixed(0)})`);
  t(time > 15 && time < 200, 'boss fight length sane: ' + time.toFixed(0) + 's');
  t(php > 0, 'bot survives eating 1/3 of attacks: ' + php.toFixed(0) + ' hp left');
}

/* ================= economy flow (65% player, realm 1) ================= */
{
  // stamps: 8 shrine Qs + ~3 break + trial(3×2 visits) + 2 ID + 1 LOTO at 65%
  const correct = n => Math.round(n * 0.65);
  const stamps =
    correct(8) * ECON.stamps.shrineCorrect +
    correct(3) * ECON.stamps.breakCorrect +
    Math.min(REALMS[1].trialLen * ECON.trialStampCapMult, correct(6)) * ECON.stamps.trialCorrect + ECON.stamps.trialPassBonus +
    correct(2) * ECON.stamps.idCorrect +
    Math.round(0.5 * ECON.stamps.loto);
  const upgrades = Math.floor(stamps / ECON.forge.certify(1).stamps) +
    Math.floor((stamps % ECON.forge.certify(1).stamps) / ECON.forge.reinforce(1).stamps);
  t(stamps >= 12 && stamps <= 22, 'R1 stamp income ~15: ' + stamps);
  t(upgrades >= 2 && upgrades <= 4, 'R1 affords 2-3 forge upgrades: ' + upgrades);
  t(ECON.stamps.briefing === 0, 'dying never pays');
}

/* ================= palettes + defs sanity ================= */
{
  for (const [key, p] of Object.entries(REALM_PALETTES)){
    for (const f of ['fog', 'fogNear', 'fogFar', 'hemiSky', 'hemiGround', 'hemiIntensity', 'sun', 'sunIntensity', 'sunAngle', 'groundRamp', 'accent'])
      t(p[f] !== undefined, `palette ${key}.${f} present`);
    t(p.groundRamp.length >= 3, `palette ${key} ramp stops`);
  }
  for (const r of Object.values(REALMS))
    t(REALM_PALETTES[r.palette], `realm ${r.name} palette exists`);
  for (const [id, d] of Object.entries(ENEMIES)){
    t(d.hp > 0 && (d.speed > 0 || d.anchored) && d.look, `enemy ${id} def sane`);
    if (!d.boss) t(d.hit > 0, `enemy ${id} has hit dmg`);
  }
  for (const [realm, table] of Object.entries(PACK_TABLE))
    for (const pool of Object.values(table))
      for (const id of pool){
        t(!!ENEMIES[id], `pack table id ${id} exists`);
        t(ENEMIES[id].realm === Number(realm), `pack ${id} belongs to realm ${realm}`);
      }
  t(ENEMIES.openMain.boss.p1.length >= 2 && ENEMIES.openMain.boss.p2.length >= 3, 'boss attack tables filled');
}

/* ================= M3: all realms — stats in bible bands ================= */
{
  for (const [realm, table] of Object.entries(PACK_TABLE)){
    const R = REALMS[realm];
    for (const id of new Set([...table.trash, ...table.special])){
      const d = ENEMIES[id];
      t(d.hp >= R.trashHp[0] * 0.6 && d.hp <= R.trashHp[1] * 1.05, `${id} HP inside realm-${realm} band (${d.hp})`);
      t(d.hit >= R.trashHit[0] && d.hit <= R.trashHit[1], `${id} hit inside realm-${realm} band (${d.hit})`);
    }
    const elite = ENEMIES[table.elite[0]];
    t(elite.hp === R.eliteHp, `realm-${realm} elite HP = bible (${elite.hp})`);
    t(elite.hit === R.eliteHit, `realm-${realm} elite hit = bible elite-hit column (${elite.hit})`);
    const boss = ENEMIES[BOSS_BY_REALM[realm]];
    t(boss.hp === R.bossHp, `realm-${realm} boss HP = bible`);
    for (const a of [...boss.boss.p1, ...boss.boss.p2])
      if (a.dmg) t(a.dmg >= R.bossHit[0] - 1 && a.dmg <= R.bossHit[1] + 1, `realm-${realm} boss ${a.name} dmg in band (${a.dmg})`);
    t(TRIAL_REWARDS[realm].length === R.trialLen, `realm-${realm} trial rewards match streak length`);
    t(TRIAL_REWARDS[realm][R.trialLen - 1].pass === true, `realm-${realm} trial last entry is the pass`);
  }
  t(HAZARDS[2].kind === 'heat' && HAZARDS[3].kind === 'pool' && HAZARDS[4].kind === 'brownout' && HAZARDS[5].kind === 'ember', 'hazard kinds per realm');
  // arc blast dmg + final-boss unique exception present
  t(ENEMIES.theIncident.boss.arcBlastDmg === 72 && ENEMIES.theIncident.boss.uniqueChance === 0.2 && ENEMIES.theIncident.boss.uniqueChancePerfect === 0.4, 'Incident canon numbers'); // boss buff approved 2026-07-06 (arcBlast 58 -> 72)
}

/* ================= M3: hazard patch generation ================= */
{
  for (let seed = 1; seed <= 20; seed++){
    const f = genFloor(mulberry32(seed * 31), { realm: 2, floorIdx: 0, roomCount: 10, shrineCount: 2, loto: false, boss: false, hazard: HAZARDS[2] });
    t(Array.isArray(f.hazards), 'hazards array present');
    for (const hz of f.hazards){
      t(hz.kind === 'heat' && hz.tiles.length >= 3, `hazard patch has >=3 tiles (${hz.tiles.length})`);
      for (const tile of hz.tiles)
        t(f.tiles[tile.z * f.w + tile.x] === 1, 'hazard tile is a floor tile');
    }
    t(f.hazards.length >= 1, 'at least one hazard patch placed');
  }
}

/* ================= M2: Tester + Foreman classes ================= */
{
  const tool10 = { slot: 'tool', rarity: 'stock', tag: 'surge', implicits: [{ stat: 'damage', value: 10 }], affixes: [], identified: true };
  let s = C.derivedStats(1, [tool10], { cls: C.TESTER });
  t(s.damage === 8, 'Tester WD coeff 0.8: ' + s.damage);
  t(s.atkSpeed === 1.4, 'Tester base AS 1.4');
  t(s.projRange === 9, 'Tester proj range 9');
  s = C.derivedStats(10, [tool10], { cls: C.TESTER, boardNodes: C.activeBoardNodes(C.TESTER_BOARD, 10, {}) });
  t(s.projRange === 10.5, 'Long Leads extends proj range');
  s = C.derivedStats(1, [tool10], { cls: C.FOREMAN });
  t(s.damage === 8 && s.atkSpeed === 1.0, 'Foreman coeff 0.8, AS 1.0');
  t(s.supervisorRadius === 4, 'Site Supervisor default radius');
  s = C.derivedStats(10, [tool10], { cls: C.FOREMAN, boardNodes: C.activeBoardNodes(C.FOREMAN_BOARD, 10, {}) });
  t(s.supervisorRadius === 6, 'Wide Supervision radius 6');
  for (const board of [C.TESTER_BOARD, C.FOREMAN_BOARD]){
    t(board.length === 12, 'board has 12 nodes');
    t(board.filter(n => n.gate).length === 3, 'board has 3 gated nodes');
    t(C.activeBoardNodes(board, 25, { CIRC: 1, COND: 1, GRND: 1, DIST: 1, OCP: 1 }).length === 12, 'all nodes at max');
  }
  t(C.CLASSES.tester.abilities.length === 5 && C.CLASSES.foreman.abilities.length === 5, 'class kits complete');
}

/* ================= 5-ability kits (slot 4/5 pass, 2026-07-07) ================= */
{
  const allIds = [];
  for (const [cid, cls] of Object.entries(C.CLASSES)){
    t(cls.abilities.length === 5, cid + ' has exactly 5 abilities, got ' + cls.abilities.length);
    cls.abilities.forEach((ab, i) => {
      t(ab.key === String(i + 1), `${cid} ability ${i} keyed '${i + 1}', got '${ab.key}'`);
      t(ab.cd > 0, `${cid} ${ab.id} cd > 0`);
      t(typeof ab.desc === 'string' && ab.desc.length > 20, `${cid} ${ab.id} has a tooltip desc`);
      allIds.push(ab.id);
    });
  }
  t(new Set(allIds).size === allIds.length, 'ability ids unique across all classes');
  t(C.LINEMAN.abilities[3].id === 'insulatingBlanket' && C.LINEMAN.abilities[4].id === 'loadBreak', 'Lineman slots 4/5: Insulating Blanket + Load Break');
  t(C.TESTER.abilities[3].id === 'ampClamp' && C.TESTER.abilities[4].id === 'quickDisconnect', 'Tester slots 4/5: Amp Clamp + Quick Disconnect');
  t(C.FOREMAN.abilities[3].id === 'stopWork' && C.FOREMAN.abilities[4].id === 'musterPoint', 'Foreman slots 4/5: Stop Work Order + Muster Point');
}

/* ================= M3: new AI machines ================= */
{
  const mkWorld = (px, pz, allies) => ({ px, pz, playerAlive: true, time: 0, los: () => true, allies: allies || [] });
  const mkE = (id, x = 0, z = 0) => ({ def: ENEMIES[id], id, x, z, hp: ENEMIES[id].hp, hpMax: ENEMIES[id].hp, state: 'idle', t: 0 });

  // Sheath Creeper: spitter base + heat trail
  let e = mkE('sheathCreeper');
  let sawHazard = false;
  for (let i = 0; i < 40; i++){
    const it = C.tickEnemy(e, mkWorld(5.5, 0), 0.1);
    if (it.action && it.action.type === 'hazard'){ sawHazard = true; t(it.action.hazard === 'heat', 'creeper drops heat'); break; }
  }
  t(sawHazard, 'Sheath Creeper drips a heat trail');

  // Bootleg Bond: shields nearby allies once
  e = mkE('bootlegBond');
  const ally = mkE('strayCurrent', 2, 0);
  let shieldAct = null;
  for (let i = 0; i < 20 && !shieldAct; i++){
    const it = C.tickEnemy(e, mkWorld(8, 0, [e, ally]), 0.1);
    if (it.action && it.action.type === 'allyShield') shieldAct = it.action;
  }
  t(shieldAct && shieldAct.shieldPct === 0.35 && shieldAct.maxAllies === 3, 'Bootleg Bond casts ally shields'); // R3 tanky-realm pass 2026-07-06
  let again = null;
  for (let i = 0; i < 20 && !again; i++){
    const it = C.tickEnemy(e, mkWorld(8, 0, [e, ally]), 0.1);
    if (it.action && it.action.type === 'allyShield') again = it.action;
  }
  t(!again, 'Bootleg Bond shields only once');

  // Series Arc: phase toggle cycles targetability
  e = mkE('seriesArc');
  const states = new Set();
  for (let i = 0; i < 45; i++){
    const it = C.tickEnemy(e, mkWorld(5, 0), 0.1);
    states.add(!!it.untargetable);
  }
  t(states.has(true) && states.has(false), 'Series Arc cycles energized/de-energized');

  // Overamp Feeder: 3 chained lunges then vulnerable stagger
  e = mkE('overampFeeder');
  e.state = 'chase'; e.lungeCd = 0;
  C.tickEnemy(e, mkWorld(6, 0), 0.1);
  t(e.state === 'clWindup', 'chained-lunge elite winds up');
  let lunges = 0, staggered = false;
  for (let i = 0; i < 200 && !staggered; i++){
    const it = C.tickEnemy(e, mkWorld(6, 0), 0.1);
    if (e.state === 'clLunge' && it.action && it.action.type === 'contact' && it.speedMult > 2) lunges++;
    if (e.state === 'clStagger'){ staggered = true; t(e.vulnerable === true, 'stagger is vulnerable'); }
  }
  t(staggered && lunges > 0, `chained lunges then stagger (${lunges} lunge ticks)`);
  for (let i = 0; i < 25; i++) C.tickEnemy(e, mkWorld(6, 0), 0.1);
  t(e.state !== 'clStagger' && e.vulnerable === false, 'stagger ends, vulnerability clears');

  // Galvanic Creep: trail elite drops pool tiles
  e = mkE('galvanicCreep');
  e.state = 'chase';
  let creepHaz = false;
  for (let i = 0; i < 30 && !creepHaz; i++){
    const it = C.tickEnemy(e, mkWorld(8, 0), 0.1);
    if (it.action && it.action.type === 'hazard' && it.action.hazard === 'pool') creepHaz = true;
  }
  t(creepHaz, 'Galvanic Creep drips pool tiles');

  // Padmount Hotbox: telegraphed vent zone
  e = mkE('padmountHotbox');
  e.state = 'chase'; e.ventCd = 0;
  let vent = null;
  for (let i = 0; i < 30 && !vent; i++){
    const it = C.tickEnemy(e, mkWorld(4, 0), 0.1);
    if (it.action && it.action.type === 'zone') vent = it.action;
  }
  t(vent && vent.dmg === 32 && vent.radius === 5, 'Padmount vents a 32-dmg heat ring'); // R4 aura pass 2026-07-06 (ventRadius 4 -> 5)

  // R5 Bolted Fault: lengthened recover (slam self-stun)
  e = mkE('boltedFaultR5');
  e.state = 'recover'; e.t = 0.7;
  C.tickEnemy(e, mkWorld(1, 0), 0.05);
  t(e.state === 'recover', 'R5 Bolted Fault recover lasts 1.0s (still recovering at 0.75)');
}

/* ================= M3: new boss frameworks ================= */
{
  const mkWorld = (px, pz) => ({ px, pz, playerAlive: true, time: 0, los: () => true });
  const mkBoss = id => {
    const e = { def: ENEMIES[id], id, x: 0, z: 0, hp: ENEMIES[id].hp, hpMax: ENEMIES[id].hp, state: 'active', t: 0, bs: C.makeBossState(ENEMIES[id]), home: { x: 0, z: 0 } };
    e.bs.phase = 'p1';
    return e;
  };
  for (const id of ['thermalRunaway', 'drownedMain', 'coincidentPeak', 'theIncident']){
    const e = mkBoss(id);
    // attacks cycle: telegraph then action
    let act = null, tele = null;
    for (let i = 0; i < 120 && !act; i++){
      const it = C.tickBoss(e, mkWorld(3, 0), 0.1);
      if (it.telegraph) tele = it.telegraph;
      if (it.action && it.action.type !== 'spawn') act = it.action;
    }
    t(!!tele && !!act, `${id} telegraphs then acts (${act && act.type})`);
    // break at 50%
    e.hp = e.hpMax * 0.49; e.bs.winding = null;
    let ev = null;
    for (let i = 0; i < 8 && !ev; i++){ const it = C.tickBoss(e, mkWorld(3, 0), 0.1); ev = it.event; }
    t(ev === 'breakStart' && e.bs.shield === 100, `${id} inspection break at 50%`);
  }
  // anchored bosses never emit move intents in p1
  const anchored = mkBoss('drownedMain');
  let moved = false;
  for (let i = 0; i < 60; i++){
    const it = C.tickBoss(anchored, mkWorld(9, 0), 0.1);
    if (it.move) moved = true;
  }
  t(!moved, 'anchored boss never walks');
  // Incident: restrike + arcBlast events fire
  const inc = mkBoss('theIncident');
  let restrikes = 0;
  for (let i = 0; i < 200; i++){
    const it = C.tickBoss(inc, mkWorld(3, 0), 0.1);
    if (it.event === 'restrike') restrikes++;
  }
  t(restrikes >= 2, 'Incident re-strikes on cadence: ' + restrikes);
  inc.bs.phase = 'p2'; inc.bs.blastT = 0.05; inc.bs.winding = null; inc.bs.restrikeT = 99; inc.bs.atkCd = 99;
  let blast = null;
  for (let i = 0; i < 5 && !blast; i++){ const it = C.tickBoss(inc, mkWorld(3, 0), 0.1); if (it.event === 'arcBlast') blast = true; }
  t(blast, 'Incident arc blast event fires in p2');
  // thermal spawns hot legs in p2
  const th = mkBoss('thermalRunaway');
  th.bs.phase = 'p2'; th.bs.spawnT = 0.05; th.bs.atkCd = 99;
  let spawnAct = null;
  for (let i = 0; i < 5 && !spawnAct; i++){ const it = C.tickBoss(th, mkWorld(3, 0), 0.1); if (it.action && it.action.type === 'spawn') spawnAct = it.action; }
  t(spawnAct && spawnAct.id === 'hotLeg' && spawnAct.count === 2, 'Thermal Runaway spawns Hot Legs in p2');
  // lob3 emits three zones with heat hazard
  const th2 = mkBoss('thermalRunaway');
  th2.bs.atkCd = 0; th2.bs.atkIdx = 1; // Molten Bead Volley
  let mz = null;
  for (let i = 0; i < 30 && !mz; i++){
    const it = C.tickBoss(th2, mkWorld(3, 0), 0.1);
    if (it.action && it.action.type === 'multiZone') mz = it.action;
  }
  t(mz && mz.zones.length === 3 && mz.zones[0].hazard === 'heat', 'Molten Bead Volley = 3 heat-leaving zones');
}

/* ================= M3: boss DPS-time sanity (all realms) ================= */
{
  // realm-exit rated tool per realm, 60% uptime + break overhead — inside 15-120s
  for (const realm of [1, 2, 3, 4, 5]){
    const toolVal = L.IMPLICIT_TABLES.damage[realm];
    const tool = { slot: 'tool', rarity: 'rated', tag: REALMS[realm].tag, implicits: [{ stat: 'damage', value: toolVal }], affixes: [{ id: 'heavyGauge', value: 12 }], identified: true };
    const s = C.derivedStats(REALMS[realm].exitLevel, [tool]);
    const dps = s.damage * s.atkSpeed * 1.3; // active uplift
    const bossT = REALMS[realm].bossHp / (dps * 0.6);
    t(bossT > 12 && bossT < 120, `realm-${realm} boss DPS time sane: ${bossT.toFixed(0)}s`);
    const eliteT = REALMS[realm].eliteHp / (dps * 0.85);
    t(eliteT > 4 && eliteT < 22, `realm-${realm} elite TTK sane: ${eliteT.toFixed(1)}s`);
  }
}

/* ================= M3: realm 2-5 uniques ================= */
{
  const allU = [1, 2, 3, 4, 5].flatMap(r => L.UNIQUES[r].map(u => ({ ...u, realm: r })));
  t(allU.length === 10, 'ten uniques across five realms');
  for (const u of allU){
    t(L.SLOTS.includes(u.slot), `${u.id} slot valid`);
    t(!!u.sig && !!u.lore, `${u.id} has sig + lore`);
    for (const a of u.affixes) t(!!L.AFFIX_BY_ID[a.id], `${u.id} affix ${a.id} exists`);
  }
  // realm-3 boss can drop its uniques
  const rng2 = mulberry32(77);
  let sawR3 = false;
  for (let i = 0; i < 3000 && !sawR3; i++){
    const it = L.rollDrop(3, 'boss', rng2, new Set());
    if (it.rarity === 'master'){ t(['class0Rubbers', 'meggersEye'].includes(it.uniqueId), 'R3 MC is an R3 unique'); sawR3 = true; }
  }
  t(sawR3, 'R3 boss floor produces uniques');
}

/* ================= MasterCraft fixed affix packages (playtest fix 2026-07-06) ================= */
{
  // regression: dropped uniques must carry value-bearing affixes that label and move derived stats after ID
  const rng = mulberry32(123);
  const STAT_KEYS = ['damage', 'atkSpeed', 'armor', 'maxHp', 'moveSpeed', 'salvagePct'];
  for (const realm of [1, 2, 3, 4, 5]){
    for (const u of L.UNIQUES[realm]){
      const owned = new Set(L.UNIQUES[realm].map(x => x.id).filter(id => id !== u.id));
      let it = null;
      for (let i = 0; i < 20000 && !it; i++){
        const d = L.rollDrop(realm, 'boss', rng, owned);
        if (d.rarity === 'master') it = d;
      }
      t(!!it && it.uniqueId === u.id, `${u.id} drops via rollDrop`);
      t(it.identified === false, `${u.id} drops unidentified`);
      t(it.affixes.length >= 1, `${u.id} carries a fixed affix package (${it.affixes.length})`);
      for (const a of it.affixes){
        const def = L.AFFIX_BY_ID[a.id];
        t(!!def && def.slots.includes(u.slot), `${u.id} affix ${a.id} slot-legal`);
        const label = L.affixLabel(a);
        t(typeof label === 'string' && label.length > 0 && label !== '?', `${u.id} affix ${a.id} labels: "${label}"`);
        if (def.fixed === undefined){
          t(typeof a.value === 'number' && a.value > 0, `${u.id} affix ${a.id} has a value (${a.value})`);
          const [lo, hi] = def.ranges[realm];
          t(a.value >= lo && a.value <= hi, `${u.id} affix ${a.id}=${a.value} within ilvl-${realm} range [${lo},${hi}]`);
        }
      }
      const before = C.derivedStats(10, [it]);       // unidentified: affixes inert
      L.identify(it, true, rng);
      t(it.identified === true, `${u.id} identifies`);
      const after = C.derivedStats(10, [it]);
      t(STAT_KEYS.some(k => after[k] !== before[k]), `${u.id} affixes contribute nonzero derived stats after ID`);
      for (const a of it.affixes) t(L.affixLabel(a) !== '?', `${u.id} affix ${a.id} still labels after ID`);
    }
  }
}

console.log(`\nArc Descent logic tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
