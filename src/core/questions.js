// Question bank + mastery engine. Port of circuit-duel's known-good logic
// (arcade-shared schema) into pure ESM. No DOM, no localStorage — a store
// adapter {get,set,del} is injected.

export function qKey(q){
  const s = (q.question || '').toLowerCase().replace(/\s+/g, ' ').trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/* ---- upload parsing & validation (arcade-shared schema) ---- */
export function parseCSV(text){
  const rows = []; let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++){
    const ch = text[i];
    if (inQ){ if (ch === '"'){ if (text[i + 1] === '"'){ cur += '"'; i++; } else inQ = false; } else cur += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === ','){ row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r'){ if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); if (row.some(c => c.trim() !== '')) rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  row.push(cur); if (row.some(c => c.trim() !== '')) rows.push(row);
  return rows;
}

export function validateRows(raw){
  const ok = [], skipped = [];
  const DIFF = ['easy', 'medium', 'hard'], SKIN = ['theory', 'onboarding', 'both'];
  raw.forEach((r, i) => {
    const n = i + 1, fail = reason => skipped.push({ n, reason });
    const question = (r.question || '').toString().trim();
    if (!question) return fail('question is empty');
    let choices = r.choices;
    if (typeof choices === 'string') choices = choices.split('|');
    if (!Array.isArray(choices)) return fail('choices missing');
    choices = choices.map(c => c.toString().trim()).filter(c => c !== '');
    if (choices.length < 2 || choices.length > 6) return fail('needs 2–6 choices');
    const folded = choices.map(c => c.toLowerCase());
    if (new Set(folded).size !== folded.length) return fail('duplicate choice text');
    const answer = (r.answer || '').toString().trim();
    const ai = folded.indexOf(answer.toLowerCase());
    if (ai < 0) return fail("answer doesn't match any choice");
    let difficulty = (r.difficulty || '').toString().trim().toLowerCase();
    if (difficulty && !DIFF.includes(difficulty)) return fail('invalid difficulty "' + difficulty + '"');
    let sk = (r.skin || '').toString().trim().toLowerCase();
    if (sk && !SKIN.includes(sk)) return fail('invalid skin "' + sk + '"');
    ok.push({
      question, choices, answer: choices[ai],
      why: (r.why || '').toString().trim(),
      difficulty: difficulty || 'medium',
      category: (r.category || '').toString().trim().toUpperCase() || 'GEN',
      skin: sk || 'both',
      id: (r.id || '').toString().trim() || undefined,
    });
  });
  return { ok, skipped };
}

export function parseQuestionFile(name, text){
  const isJSON = /\.json$/i.test(name) || text.trim().startsWith('[') || text.trim().startsWith('{');
  try {
    if (isJSON){
      let d = JSON.parse(text);
      if (d && Array.isArray(d.questions)) d = d.questions;
      if (!Array.isArray(d)) return { error: 'JSON must be an array of questions (or {"questions":[…]})' };
      const raw = d.map(o => { const r = {}; for (const k in o) r[k.toLowerCase()] = o[k]; return r; });
      return validateRows(raw);
    }
    const rows = parseCSV(text);
    if (rows.length < 2) return { error: 'CSV needs a header row plus at least one question row' };
    const head = rows[0].map(h => h.trim().toLowerCase());
    if (!head.includes('question')) return { error: 'CSV header must include a "question" column' };
    const raw = rows.slice(1).map(cells => { const r = {}; head.forEach((h, i) => r[h] = cells[i] !== undefined ? cells[i] : ''); return r; });
    return validateRows(raw);
  } catch (e){ return { error: 'File could not be parsed: ' + e.message }; }
}

/* ---- bank (uploaded via localStorage, else a picked bundled bank) ---- */
// Arc Descent is theory-only (bible §10): onboarding-only rows are filtered out.
// bundles (optional): { id: { label, questions } } selectable built-ins; pickKey
// stores the selection ('custom' = the uploaded bank). Without bundles the bank
// behaves exactly as before: uploaded else sampleQuestions.
export function makeBank(store, key, sampleQuestions, bundles, pickKey){
  const uploaded = () => {
    try {
      const d = JSON.parse(store.get(key));
      if (d && Array.isArray(d.questions) && d.questions.length >= 5) return d;
    } catch (e){}
    return null;
  };
  const defaultId = bundles ? Object.keys(bundles)[0] : null;
  return {
    picks(){
      if (!bundles) return [];
      return [...Object.keys(bundles), ...(uploaded() ? ['custom'] : [])];
    },
    pick(){
      if (!bundles) return null;
      const p = store.get(pickKey);
      if (p === 'custom' && uploaded()) return 'custom';
      if (p && bundles[p]) return p;
      return uploaded() ? 'custom' : defaultId;
    },
    setPick(id){ if (pickKey) store.set(pickKey, id); },
    active(){
      const up = uploaded();
      if (bundles){
        const p = this.pick();
        if (p !== 'custom') return { src: bundles[p].label, ts: 0, questions: bundles[p].questions, id: p };
        return { ...up, id: 'custom' };
      }
      return up || { src: 'bundled sample', ts: 0, questions: sampleQuestions };
    },
    all(){
      const qs = this.active().questions;
      const f = qs.filter(q => !q.skin || q.skin === 'both' || q.skin === 'theory');
      return f.length >= 5 ? f : qs;
    },
    info(id){
      if (bundles && bundles[id]) return { label: bundles[id].label, count: bundles[id].questions.length };
      const up = uploaded();
      if (id === 'custom' && up) return { label: up.src, count: up.questions.length };
      return null;
    },
    install(questions, src, ts){
      store.set(key, JSON.stringify({ src, ts: ts || 0, questions }));
      if (pickKey) store.set(pickKey, 'custom'); // uploading activates the upload
    },
    reset(){ store.del(key); },
    isCustom(){ return !!uploaded(); },
  };
}

/* ---- mastery (Quizlet-style; keyed by prompt hash, survives re-uploads) ---- */
export const MASTERY_NEED_MAX = 4;

export function recordAnswer(profileData, q, correct){
  const M = profileData.mastery;
  const k = qKey(q);
  const m = M[k] || (M[k] = { s: 0, need: 2, m: false, a: 0, c: 0 });
  m.a++;
  let newly = false;
  if (correct){ m.c++; m.s++; if (!m.m && m.s >= m.need){ m.m = true; newly = true; } }
  else { m.s = 0; m.m = false; m.need = Math.min(MASTERY_NEED_MAX, m.need + 1); }
  const cat = (q.category || 'GEN').toUpperCase();
  const st = profileData.stats;
  st.qa++; if (correct) st.qc++;
  const bc = st.byCat[cat] || (st.byCat[cat] = { a: 0, c: 0 });
  bc.a++; if (correct) bc.c++;
  return newly;
}

export function masteredCount(profileData, questions){
  let n = 0;
  for (const q of questions){ const m = profileData.mastery[qKey(q)]; if (m && m.m) n++; }
  return n;
}

export function categoryMastery(profileData, questions, cat){
  const inCat = questions.filter(q => (q.category || 'GEN').toUpperCase() === cat);
  if (inCat.length < 3) return { pct: 0, mastered: 0, total: inCat.length };
  let m = 0;
  for (const q of inCat){ const rec = profileData.mastery[qKey(q)]; if (rec && rec.m) m++; }
  return { pct: m / inCat.length, mastered: m, total: inCat.length };
}

// CERTIFIED: >= pct of a realm's category mastered -> that realm's gear tag +10%
export function certifiedCats(profileData, questions, catList, pct){
  const out = {};
  for (const cat of catList) out[cat] = categoryMastery(profileData, questions, cat).pct >= pct;
  return out;
}

/* ---- drawing pool: difficulty routed by realm, prefers unmastered ---- */
// Realm difficulty weights (bible §3 bands). tierUp shifts one step harder
// (bosses / trials / LOTO doors).
const REALM_DIFF_WEIGHTS = {
  1: { easy: 0.70, medium: 0.25, hard: 0.05 },
  2: { easy: 0.40, medium: 0.50, hard: 0.10 },
  3: { easy: 0.15, medium: 0.60, hard: 0.25 },
  4: { easy: 0.05, medium: 0.45, hard: 0.50 },
  5: { easy: 0.02, medium: 0.28, hard: 0.70 },
};
const HARDER = { easy: 'medium', medium: 'hard', hard: 'hard' };

export function makeSession(){ return { correct: new Set(), recent: [] }; }

export function nextQuestion(rng, profileData, questions, sess, opts = {}){
  let cand = questions.filter(q => !sess.correct.has(qKey(q)));
  if (!cand.length){ sess.correct.clear(); cand = questions.slice(); }
  const c2 = cand.filter(q => !sess.recent.includes(qKey(q)));
  if (c2.length) cand = c2;

  // category routing: forced cat, or realm cat with a spaced-repetition mix
  if (opts.cat){
    const f = cand.filter(q => (q.category || 'GEN').toUpperCase() === opts.cat);
    if (f.length) cand = f;
  } else if (opts.realmCat){
    const mixP = opts.mixP || 0;
    const useMix = opts.mixCats && opts.mixCats.length && rng() < mixP;
    const want = useMix ? opts.mixCats : [opts.realmCat];
    const f = cand.filter(q => want.includes((q.category || 'GEN').toUpperCase()));
    if (f.length) cand = f;
  }

  const unm = cand.filter(q => { const m = profileData.mastery[qKey(q)]; return !(m && m.m); });
  if (unm.length) cand = unm;

  const hasTags = questions.some(q => q.difficulty && q.difficulty !== 'medium');
  if (hasTags){
    const w = REALM_DIFF_WEIGHTS[opts.realm || 1] || REALM_DIFF_WEIGHTS[1];
    let target = opts.diff
      || (() => { const r = rng(); return r < w.easy ? 'easy' : r < w.easy + w.medium ? 'medium' : 'hard'; })();
    if (opts.tierUp && !opts.diff) target = HARDER[target];
    const order = target === 'easy' ? ['easy', 'medium', 'hard']
      : target === 'medium' ? ['medium', 'hard', 'easy']
      : ['hard', 'medium', 'easy'];
    for (const p of order){ const f = cand.filter(q => (q.difficulty || 'medium') === p); if (f.length){ cand = f; break; } }
  }

  const q = cand[Math.floor(rng() * cand.length)];
  sess.recent.push(qKey(q)); if (sess.recent.length > 2) sess.recent.shift();
  return q;
}

export const TEMPLATE_CSV = 'question,choices,answer,why,difficulty,category,skin\n'
  + '"A circuit has continuity when…","There is a complete unbroken path|The wire is copper|The breaker is big",There is a complete unbroken path,"No complete path, no current",easy,CIRC,both\n'
  + '"Voltage drop is reduced by…",A larger conductor or shorter run|A bigger breaker|More connections,A larger conductor or shorter run,"Drop grows with length, shrinks with conductor size",medium,COND,theory\n'
  + '"GFCI protection is required…",In damp and wet locations|Only in bedrooms|Only above 240 V,In damp and wet locations,"Anywhere water and people meet the circuit",easy,GRND,both\n'
  + '"Demand factors exist because…","Not all loads run at once|Wire is expensive|Breakers are slow",Not all loads run at once,"Sizing for realistic peak demand, not the sum of every nameplate",medium,DIST,theory\n'
  + '"A 20 A breaker with 25 A of load will…",Trip on overload|Run forever|Boost the voltage,Trip on overload,"Sustained current above rating opens the breaker",easy,OCP,both\n';
