// Field Manual — the journeyman's site handbook. Static tutorial pages for hud.showManual.
// Pure content: imports only from ../core/*. Ability names/cooldowns/keys derive from CLASSES
// so they never drift from the kit; the "how to use it" text is authored per ability id.

import { CLASSES, PLAYER } from '../core/combat.js';

const dim = t => `<span style="color:var(--dim)">${t}</span>`;
const teal = t => `<b style="color:var(--teal)">${t}</b>`;

/* per-ability field notes, keyed by ability id */
const STRATEGY = {
  /* Lineman */
  gaffLunge: 'Dash forward, 140% Tool damage to everything along the path, a beat of untouchability. Your opener and your gap-closer — lead every pack with it.',
  comeAlong: 'Cone pull: up to 5 enemies (not bosses) yanked to your feet for 60% damage and a short stagger. Bunch them up so the swings and the Rod hit everything at once.',
  groundRod: 'Plant it: 250% damage slam, non-elites knocked flat, and a 3 s damage field ticking where you stood. Drop it on the pile Come-Along just made.',
  insulatingBlanket: 'Class-2 rubber over your shoulders: 50% damage reduction for 3 s. Throw it on BEFORE the damage window — a blanket over a burn is just a blanket. Stacks with Rubber Goods, but total bonus reduction caps at 60%.',
  loadBreak: 'Snaps the circuit under load: a 360° pop for 40% damage that shoves everything back 3 u and staggers it. The "I\'m surrounded" button. It does not move bosses — roll instead.',
  /* Tester */
  meggerSurge: 'Piercing beam, 10 u long, 220% damage to everything in the line. Line the trash up and bill them together.',
  leadFan: 'Five probes in a tight fan, 70% each. Point-blank, all five can land in one target — your biggest single number — but standing that close is a choice. Have Quick Disconnect off cooldown first.',
  hipot: 'Overvoltage test on the nearest target in front of you: 400% damage plus a small splash. Save it for elites. If nothing is in probe range it tells you and holds the charge.',
  ampClamp: 'Jaws around one conductor at probe range: 30% damage and a non-boss target locked in place for 2.5 s. The answer to a chaser closing the gap — clamp it, keep shooting.',
  quickDisconnect: 'Yank the leads and bail: an instant 4.5 u hop directly AWAY from your cursor with i-frames, zapping anything you slip through. Point at the danger, not at the exit.',
  /* Foreman */
  apprentices: 'Two crew on site for 15 s, each swinging for 30% of YOUR damage once a second. They chase whatever is closest. Recast on cooldown — an idle foreman still dispatches.',
  barricade: 'A 3-wide wall at the cursor. Blocks walking, not projectiles. Funnel the melee line into the Spider Box\'s zone. (Hard Barricades on the board stretches it from 4 s to 6 s.)',
  spiderBox: 'A turret at the cursor: zaps the nearest enemy within 6 u for 40% damage every half second, for 8 s. This is your real DPS — place it where the fight will be, then keep it covered.',
  stopWork: 'Blow the whistle: every non-boss enemy within 5 u stops work for 1.5 s. No damage, bosses ignore it. For when the plan collapses — reposition, recast, re-form.',
  musterPoint: 'Every active summon — apprentices and Spider Boxes — relocates to your cursor on the spot. No crew out, no cooldown spent. Muster the crew to your feet before a burst window: inside Supervisor range this is a damage buff disguised as utility.',
};

/* one class page: kit table from the def + authored doctrine */
function classPage(clsDef, doctrine, binds, keyLabel){
  const kit = clsDef.abilities.map((ab, i) => {
    const k = keyLabel(binds['a' + (i + 1)] || ab.key);
    return `<p><b style="color:var(--teal)">[${k}] ${ab.name}</b> ${dim('· ' + ab.cd + ' s cooldown')}<br>${STRATEGY[ab.id] || ''}</p>`;
  }).join('');
  return `
    <h3>${clsDef.name}</h3>
    <p>${dim(clsDef.desc)}</p>
    <h3>The kit</h3>
    ${kit}
    <p><b style="color:var(--teal)">Passive — ${clsDef.passive.name}</b><br>${clsDef.passive.desc}</p>
    ${doctrine}`;
}

export function buildManualPages({ binds, keyLabel }){
  const k = a => keyLabel(binds[a] || { dodge: ' ', interact: 'e' }[a] || a);
  const kDodge = k('dodge'), kInt = k('interact');
  const iframes = PLAYER.dodge.iframes, dodgeCd = PLAYER.dodge.cd;

  const pages = [];

  /* ---- 1. First Day on Site ---- */
  pages.push({ id: 'first-day', title: 'First Day on Site', html: `
    <h3>First Day on Site</h3>
    <p>${dim('Property of the journeyman. Read before energizing anything.')}</p>
    <h3>Moving and working</h3>
    <ul>
      <li><b>Move</b> with <b>[WASD]</b> or left-click the ground. Keys override the click.</li>
      <li><b>Aim</b> with the mouse. Hold <b>right-click</b> to work the Tool — swing or fire, depending on your trade. Nothing swings until you pull your first Tool from the Job Box in the first room.</li>
      <li><b>Abilities</b> on <b>[${k('a1')}] [${k('a2')}] [${k('a3')}] [${k('a4')}] [${k('a5')}]</b>. They need the Tool too.</li>
      <li><b>Dodge roll</b> on <b>[${kDodge}]</b> — it goes where you're moving (where you're aiming if you stand still). The roll is your rubber gloves: ${iframes} s untouchable, back every ${dodgeCd} s. Roll <i>through</i> hits, not away from the job.</li>
    </ul>
    <h3>Reading the floor</h3>
    <ul>
      <li>Every big hit is announced: ${teal('windup flashes')}, ${teal('aim lines')}, ${teal('ground decals')}. Move first, swing second.</li>
      <li>Walls between you and the camera cut away on their own. Scroll wheel zooms.</li>
      <li><b>[Tab]</b> — floor map. <b>[${kInt}]</b> — interact (the bottom-center prompt names whatever is in reach). <b>[I]</b> — inventory. <b>[B]</b> — License Board. <b>[H]</b> — warp to town. <b>[Esc]</b> — settings and pause.</li>
      <li>Rebind abilities, dodge, and interact in Settings — side mouse buttons (M3/M4/M5) bind too. Movement, I, Tab, and Esc stay fixed.</li>
    </ul>
    <h3>Health</h3>
    <ul>
      <li>No regeneration in combat, and HP carries between floors — descend hurt, arrive hurt.</li>
      <li>Full workup when you enter ${teal('Terminal Town')} and when you step through a realm gate. Leveling up patches 25% on the spot.</li>
      <li>Dropping isn't a firing: it's a ${teal('Safety Briefing')}. One easy question — walk it back and you're returned to the floor, nothing lost. Miss it and you restart from the realm entrance, still nothing lost. ${dim('(The Abyss is the exception — see that page.)')}</li>
    </ul>` });

  /* ---- 2. Questions, Mastery & Certification ---- */
  pages.push({ id: 'questions', title: 'Questions & Certification', html: `
    <h3>Questions, Mastery &amp; Certification</h3>
    <p>Questions are the paycheck. ${teal('Junction Shrines')} (two questions, both right = upgraded cache), ${teal('LOTO doors')} (one hard question opens the shortcut, +2 Stamps), identification, Forge work, Inspection Breaks, and Certification Trials all pay ${teal('Permit Stamps')} for correct answers.</p>
    <h3>Mastery</h3>
    <ul>
      <li>Each question is mastered by streak: answer it right twice in a row and it's yours. A miss resets the streak and raises the bar (up to four in a row).</li>
      <li>The pool prefers what you haven't mastered and won't repeat itself back-to-back. It's supposed to feel like studying, because it is.</li>
      <li>Five categories: ${teal('CIRC · COND · GRND · DIST · OCP')} — one per realm, and deeper realms mix earlier categories back in (about 1 in 5; the Caldera mixes 2 in 5).</li>
      <li>Difficulty routes by realm — Greenfield asks mostly easy, the Caldera mostly hard. Bosses, Trials, and LOTO doors ask one step harder still.</li>
    </ul>
    <h3>CERTIFIED gear</h3>
    <p>Master <b>60%</b> of a realm's category and every piece of that realm's gear you wear reads ${teal('CERTIFIED')}: <b>+10% to every stat it grants</b>. Learning is a gear slot.</p>
    <h3>Certification Trials</h3>
    <ul>
      <li>At each realm's Substation Seal: a streak of 3–5 questions (longer in deeper realms), asked a tier up.</li>
      <li>A miss ends the streak — but every milestone reward already banked (Salvage, gear caches) stays. Retry freely; Stamp payouts from retries are capped, so it can't be farmed.</li>
      <li>Pass: the Seal energizes, a certified cache drops, and you keep the Seal's <b>permanent buff</b> for the rest of the descent.</li>
    </ul>
    <h3>Boss Inspection Break</h3>
    <p>At half health every boss shields and calls an inspection. Each correct answer strips <b>35</b> integrity (a miss still chips <b>12</b>), and the shield drains slowly on its own — a question can never wall you. Answer <b>2+ correct</b> and the boss staggers, taking bonus damage. Every correct answer pays a Stamp.</p>` });

  /* ---- 3. Loot & the Forge ---- */
  pages.push({ id: 'loot-forge', title: 'Loot & the Forge', html: `
    <h3>Loot &amp; the Forge</h3>
    <h3>Six slots, five stats</h3>
    <ul>
      <li>${teal('Tool')} — Damage. Your entire kit scales off it; this is the slot that matters.</li>
      <li>${teal('Hard Hat')} — Armor. ${teal('Jacket')} — Armor + Max HP. ${teal('Gloves')} — Attack Speed. ${teal('Boots')} — Move Speed. ${teal('Meter')} — wildcard, rolls any one of the five.</li>
      <li>Those implicits are guaranteed. The whole stat sheet is five stats — Damage, Attack Speed, Armor, Max HP, Move Speed — plus a few utility affixes (bonus Stamps, +Salvage).</li>
    </ul>
    <h3>Rarity</h3>
    <p>${teal('Common')} → ${teal('Rare')} → ${teal('Magic')} → ${teal('MasterCraft')}. Higher rarity means a bigger implicit and more affixes. MasterCraft pieces are uniques — one copy each, signature effects. Trash drops sometimes, elites always, bosses drop a pile with a guaranteed Magic-or-better on top.</p>
    <h3>Identification</h3>
    <p>Magic and MasterCraft gear drops unidentified — stats hidden. Click it in the inventory <b>[I]</b>: one question identifies it and equips it. Answer right and the bench rerolls one affix, keeping the higher value, plus a Stamp. Even a miss identifies — you just skip the bonus. <b>Identify all</b> (backpack toolbar) is the Calibration Gauntlet: five correct in a row calibrates everything on the bench at once, with the bonus.</p>
    <h3>The Forge</h3>
    <ul>
      <li>${teal('Reinforce')} — Common → Rare (adds an affix).</li>
      <li>${teal('Certify')} — Rare → Magic (adds another).</li>
      <li>${teal('Recalibrate')} — rerolls one affix's value.</li>
      <li>${teal('Re-spec')} — rerolls all affixes fresh.</li>
    </ul>
    <p>Every op costs Stamps + Salvage (scaling with the item's tier) and one question <i>at the item's tier</i>. Miss the question and the bench refunds everything. MasterCraft gear can't be forged — it left the factory finished.</p>
    <h3>Salvage</h3>
    <p>Outclassed gear is Salvage — break it down from the inventory, never hoard it (scrap a whole category with the ⚒ all button, or turn on auto-scrap for Common/Rare pickups). Salvage feeds the Forge, and Tool upgrades drive almost all of your damage growth.</p>` });

  /* ---- 4. Terminal Town & Progression ---- */
  pages.push({ id: 'town', title: 'Terminal Town', html: `
    <h3>Terminal Town &amp; Progression</h3>
    <p>The town under the falls heals you to full every time you walk in. <b>[H]</b> warps home from any floor.</p>
    <h3>Services</h3>
    <ul>
      <li>${teal('Forge')} — west. Stamps + Salvage + one question per op.</li>
      <li>${teal('Realm portals')} — north. Five gates; each unlocks when the previous realm's Seal is stamped.</li>
      <li>${teal('Supply Shack')} — east. Gear for ${teal('Volts')} only (never Stamps, never answers). Fresh stock every visit; prices and quality scale with your progress.</li>
      <li>${teal('Work-order board')} — southeast. Three standing orders — kills, chests, answers — paying Volts.</li>
      <li>${teal('Stats kiosk')} — southwest. Mastery per category, run totals, lifetime record.</li>
    </ul>
    <h3>Three currencies, no overlap</h3>
    <p>${teal('Stamps')} come from questions and feed the Forge. ${teal('Salvage')} comes from broken-down gear and feeds the Forge. ${teal('Volts')} come from kills, chests, and work orders and feed the Shack. Nothing converts.</p>
    <h3>Seals</h3>
    <p>Each stamped Seal is a permanent buff: ${dim('Bonded (+5 max HP) · Service Slack (+5% move speed) · Bonding Check (−15% conducted damage) · Load-Balanced (+5% cooldown recovery) · Master\'s Stamp (+10% Stamps earned)')}.</p>
    <h3>License Board [B]</h3>
    <p>Nodes activate on their own as you level — no points to spend. The strongest nodes gate behind <b>category mastery %</b>, so the study you do at shrines literally unlocks build power. Levels run 1–25; XP comes from kills, correct answers, shrines, Trials, and bosses.</p>
    <h3>Saves</h3>
    <p>Unlimited descents from the home page, each pinned to its own question bank. Mastery is per-question and shared across saves — it's real learning progress, and it survives everything, including deleted saves.</p>` });

  /* ---- 5. The Abyss ---- */
  pages.push({ id: 'abyss', title: 'The Abyss', html: `
    <h3>The Abyss</h3>
    <p>Behind the cave mouth northeast of town. An endless descent for finished characters.</p>
    <ul>
      <li>Floors grow longer with depth, and the roster climbs a realm every two depths. Enemy strength scales without limit — past depth 9 it compounds hard.</li>
      <li>No bosses down there. Just more site, more faults, less mercy.</li>
      <li>Questions and loot follow the depth's realm — deeper is harder and better.</li>
      <li><b>No healing between depths.</b> HP rides down with you.</li>
    </ul>
    <h3>Death is final. The run, not you.</h3>
    <ul>
      <li>No Safety Briefings: when you drop, the run ends and you wake at the falls. Everything you looted — gear, XP, Stamps, Volts — keeps either way.</li>
      <li>Warp out with <b>[H]</b> any time to bank the run yourself. Greed is the only real enemy in the Abyss.</li>
      <li>The stone board outside the cave carves the five deepest descents — depth first, kills as the tiebreak.</li>
    </ul>
    <p>${dim('Bring a full kit, stamped Seals, and a category or two mastered. The Abyss assumes a finished character and does not check twice.')}</p>` });

  /* ---- 6–8. Class pages ---- */
  pages.push({ id: 'lineman', title: 'Lineman', html: classPage(CLASSES.lineman, `
    <h3>Doctrine</h3>
    <ul>
      <li><b>Core loop:</b> Lunge in → Come-Along to bunch them → basic arc swings → Ground Rod on the pile.</li>
      <li><b>Defensive layering:</b> three different answers — Blanket <i>before</i> the damage window, roll <i>through</i> hits for Rubber Goods, Load Break when surrounded. Don't burn them together; bonus reduction caps at 60%.</li>
      <li><b>Boss play:</b> Blanket eats the phase mechanics you can't dodge. Load Break won't move a boss — that one you roll.</li>
    </ul>
    <h3>Board benders</h3>
    <ul>
      <li>${teal('Double Crimp')} ${dim('(Lv 12, CIRC 40%)')} — every 3rd swing goes full-circle at 120% damage. Come-Along feeds it a crowd.</li>
      <li>${teal('Journeyman Card')} ${dim('(Lv 18, GRND 50%)')} — +6% damage and +6% attack speed, forever.</li>
    </ul>`, binds, keyLabel) });

  pages.push({ id: 'tester', title: 'Tester', html: classPage(CLASSES.tester, `
    <h3>Doctrine</h3>
    <ul>
      <li><b>Core loop:</b> open every fresh target with your biggest hit — Calibrated doubles the first touch on full health. Megger the lines of trash; save Hipot for elites.</li>
      <li><b>Range discipline:</b> Amp Clamp the chaser that gets close. When clamping isn't enough, Quick Disconnect — it hops AWAY from your cursor, so point at the threat.</li>
      <li><b>Point-blank Lead Fan</b> is your ceiling — all five probes into one target — but standing that close is a choice. Have Disconnect off cooldown before you make it.</li>
    </ul>
    <h3>Board benders</h3>
    <ul>
      <li>${teal('Dual Trace')} ${dim('(Lv 12, CIRC 40%)')} — the basic shot splits into two probes at 60% each: more total damage, two chances to land.</li>
      <li>${teal('Transient Capture')} ${dim('(Lv 24, OCP 60%)')} — Hipot kills reset its cooldown and widen the splash. A chain-executioner in packs.</li>
    </ul>`, binds, keyLabel) });

  pages.push({ id: 'foreman', title: 'Foreman', html: classPage(CLASSES.foreman, `
    <h3>Doctrine</h3>
    <ul>
      <li><b>Core loop:</b> Dispatch + Spider Box, then fight INSIDE Supervisor range — the crew is your DPS, your swings are supervision. They swing with your stats, so Tool upgrades feed the whole site.</li>
      <li><b>Site control:</b> Barricade funnels melee into the Spider Box's zone. Muster Point re-aims the whole site when the fight moves. Stop Work Order when the plan collapses.</li>
      <li><b>Muster into Supervisor range</b> before a burst window — rallying the crew to your feet is +15% to everything they do.</li>
    </ul>
    <h3>Board benders</h3>
    <ul>
      <li>${teal('Third Apprentice')} ${dim('(Lv 12, CIRC 40%)')} — a third pair of hands on every Dispatch.</li>
      <li>${teal('Dual Feed')} ${dim('(Lv 24, OCP 60%)')} — every Spider Box cast places two. Muster Point scales with every extra body it moves.</li>
    </ul>`, binds, keyLabel) });

  return pages;
}
