// DOM overlay: HUD, question modal, dialogs, inventory, menu, upload.
// All text-heavy UI lives here; the canvas only renders the world.

import { RARITY_LABEL } from '../core/loot.js';

const CSS = `
#overlay { --ink:#dce3ec; --dim:#8a94a6; --panel:rgba(13,18,28,0.92); --line:rgba(120,150,190,0.25);
  --teal:#2dd4bf; --green:#34c759; --amber:#f5a623; --red:#e5484d; --sky:#38bdf8; }
.ad-hud { position:absolute; left:0; right:0; bottom:0; padding:10px 14px; display:flex; align-items:flex-end;
  justify-content:space-between; gap:14px; pointer-events:none; font-size:13px; }
.ad-hud > * { pointer-events:auto; }
.ad-bars { width:320px; }
.ad-bar { position:relative; height:22px; background:rgba(0,0,0,0.55); border:1px solid var(--line); border-radius:9px;
  overflow:hidden; margin-bottom:5px; }
.ad-bar > i { display:block; height:100%; background:var(--red); transition:width 120ms; }
.ad-bar .val { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:12px;
  font-weight:600; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.85); pointer-events:none; }
.ad-bar.xp { height:14px; } .ad-bar.xp > i { background:var(--teal); }
.ad-bar.xp .val { font-size:10px; font-weight:400; }
.ad-stats { color:var(--dim); display:flex; gap:12px; margin-top:2px; }
.ad-stats b { color:var(--ink); font-weight:600; }
.ad-abils { display:flex; gap:8px; align-items:flex-end; }
.ad-abil { width:66px; height:66px; border-radius:12px; background:var(--panel); border:1px solid var(--line);
  position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; color:var(--ink); }
.ad-abil small { position:absolute; top:3px; left:6px; color:var(--dim); font-size:11px; font-weight:600; }
.ad-abil .cd { position:absolute; inset:0; background:rgba(0,0,0,0.65); border-radius:12px; display:flex;
  align-items:center; justify-content:center; font-weight:700; font-size:16px; z-index:1; }
.ad-abil span { font-size:9px; text-align:center; line-height:1.05; padding:0 2px; color:var(--dim); }
.ad-abil .ad-abilic { width:26px; height:26px; margin-top:8px; color:var(--teal); }
.ad-abil .ad-abilic svg { width:100%; height:100%; display:block; }
.ad-abiltip { display:none; position:absolute; bottom:calc(100% + 10px); right:0; width:236px; background:#0d1420f2;
  border:1px solid var(--teal); border-radius:10px; padding:10px 12px; font-size:12px; text-align:left; z-index:30;
  pointer-events:none; }
.ad-abiltip b { color:var(--teal); display:block; margin-bottom:2px; font-size:13px; }
.ad-abiltip .meta { color:var(--dim); font-size:11px; margin-bottom:5px; }
.ad-abiltip .body { color:var(--ink); line-height:1.45; }
.ad-abil:hover .ad-abiltip { display:block; }
.ad-loc { position:absolute; top:10px; left:14px; color:var(--dim); font-size:13px; }
.ad-loc b { color:var(--ink); font-size:15px; display:block; }
.ad-toasts { position:absolute; top:52px; left:14px; display:flex; flex-direction:column; gap:4px; pointer-events:none; }
.ad-toast { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:5px 10px; font-size:12px;
  animation:adfade 3.2s forwards; max-width:340px; }
@keyframes adfade { 0%{opacity:0; transform:translateX(-8px)} 8%{opacity:1; transform:none} 80%{opacity:1} 100%{opacity:0} }
.ad-modal-wrap { position:absolute; inset:0; background:rgba(5,8,14,0.72); display:flex; align-items:center; justify-content:center; }
.ad-modal { width:min(560px, 92vw); background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:20px 22px; }
.ad-modal h3 { margin:0 0 2px; font-size:15px; color:var(--teal); letter-spacing:0.06em; text-transform:uppercase; }
.ad-modal .sub { color:var(--dim); font-size:12px; margin-bottom:12px; }
.ad-modal .q { font-size:17px; line-height:1.4; margin-bottom:14px; }
.ad-choice { display:block; width:100%; text-align:left; margin:6px 0; padding:10px 12px; border-radius:10px; font-size:14px;
  background:rgba(255,255,255,0.05); border:1px solid var(--line); color:var(--ink); cursor:pointer; }
.ad-choice:hover { background:rgba(255,255,255,0.10); }
.ad-choice.correct { background:rgba(52,199,89,0.18); border-color:var(--green); }
.ad-choice.wrong { background:rgba(229,72,77,0.18); border-color:var(--red); }
.ad-choice:disabled { cursor:default; }
.ad-why { margin-top:10px; padding:9px 12px; border-left:3px solid var(--teal); background:rgba(45,212,191,0.07);
  color:var(--ink); font-size:13px; border-radius:0 8px 8px 0; }
.ad-btnrow { display:flex; gap:8px; justify-content:flex-end; margin-top:14px; }
.ad-btn { padding:9px 18px; border-radius:10px; border:1px solid var(--line); background:rgba(255,255,255,0.06);
  color:var(--ink); font-size:14px; cursor:pointer; }
.ad-btn.primary { background:var(--teal); border-color:transparent; color:#04241f; font-weight:600; }
.ad-btn:hover { filter:brightness(1.12); }
.ad-invfull { position:absolute; inset:0; background:rgba(5,8,14,0.82); display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:12px; font-size:13px; --dim:#a7b1c2; }
.ad-invwrap { display:flex; gap:16px; width:min(1080px, 94vw); height:min(660px, 84vh); }
.ad-invchar { flex:0 0 440px; background:var(--panel); border:1px solid var(--line); border-radius:14px;
  padding:16px; display:flex; flex-direction:column; }
.ad-invchar h3, .ad-invpack h3 { margin:0 0 8px; font-size:14px; }
.ad-doll { position:relative; flex:1; min-height:300px; }
.ad-doll svg { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); height:92%; opacity:0.9; }
.ad-dollslot { position:absolute; width:128px; box-sizing:border-box; min-height:38px; padding:4px 7px; border-radius:8px;
  background:rgba(13,18,28,0.88); border:1px solid var(--line); cursor:default; }
.ad-dollslot.empty { border-style:dashed; opacity:0.65; background:rgba(255,255,255,0.05); }
.ad-dollslot .sl { font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:var(--dim); display:block; }
.ad-dollslot .nm { font-size:12px; line-height:1.25; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ad-dollslot .st { font-size:10px; line-height:1.4; color:var(--ink); display:block; }
.ad-dollslot .st.imp { color:var(--sky); }
.ad-dollslot .st.dim { color:var(--dim); font-style:italic; }
.ad-charstats { display:grid; grid-template-columns:1fr 1fr; gap:4px 10px; margin-top:10px; color:var(--dim); font-size:12px; }
.ad-charstats b { color:var(--ink); float:right; }
.ad-invpack { flex:1; background:var(--panel); border:1px solid var(--line); border-radius:14px;
  padding:16px; overflow:auto; }
.ad-invpack::-webkit-scrollbar { width:10px; }
.ad-invpack::-webkit-scrollbar-track { background:rgba(255,255,255,0.04); border-radius:8px; }
.ad-invpack::-webkit-scrollbar-thumb { background:rgba(45,212,191,0.35); border-radius:8px;
  border:2px solid rgba(13,18,28,0.9); }
.ad-invpack::-webkit-scrollbar-thumb:hover { background:rgba(45,212,191,0.6); }
.ad-invtools { display:flex; gap:8px; align-items:center; margin:2px 0 8px; flex-wrap:wrap; }
.ad-invgrid { display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin:3px 0 6px; }
.ad-invcell { background:rgba(255,255,255,0.04); border:1px solid transparent; border-radius:10px; padding:8px 9px;
  cursor:pointer; display:flex; flex-direction:column; gap:4px; }
.ad-invcell:hover { border-color:var(--line); }
.ad-invcell .icrow { display:flex; align-items:center; gap:6px; }
.ad-invcell .icrow .rar { font-size:10px; color:var(--dim); text-transform:uppercase; letter-spacing:0.04em; }
.ad-invcell .icrow .ad-mini { margin-left:auto; }
.ad-invcell .nm { font-size:12px; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.ad-pips { display:flex; gap:7px; margin:2px 0 12px; }
.ad-pip { width:15px; height:15px; border-radius:50%; border:1px solid var(--line); background:rgba(255,255,255,0.06); }
.ad-pip.on { background:var(--teal); border-color:var(--teal); box-shadow:0 0 8px rgba(45,212,191,0.5); }
.ad-x { position:absolute; top:10px; right:12px; width:28px; height:28px; border-radius:8px; border:1px solid var(--line);
  background:rgba(255,255,255,0.06); color:var(--dim); cursor:pointer; font-size:13px; }
.ad-x:hover { color:var(--ink); border-color:var(--red); }
.ad-cmp-wrap { position:fixed; z-index:40; display:flex; gap:8px; pointer-events:none;
  --ink:#dce3ec; --dim:#a7b1c2; --teal:#2dd4bf; --sky:#38bdf8; --green:#34c759; --red:#e5484d; }
.ad-cmp { width:230px; background:#0d1420f2; border:1px solid var(--teal); border-radius:10px; padding:10px 12px; font-size:12px; }
.ad-cmp .ad-cmptitle { font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--dim); margin-bottom:4px; }
.ad-cmp .impline { color:var(--sky); }
.ad-cmp .affline { color:var(--ink); }
.ad-cmp .cmp-b { color:var(--green); }
.ad-cmp .cmp-w { color:var(--red); }
.ad-cmp .cmp-s { color:var(--dim); }
.ad-cmp .lore { color:var(--dim); font-style:italic; margin-top:4px; }
.ad-comparehint { color:var(--dim); font-size:11px; margin:2px 0 8px; }
.ad-map { position:absolute; top:12px; left:50%; transform:translateX(-50%); background:rgba(8,12,20,0.72);
  border:1px solid var(--line); border-radius:12px; padding:10px; pointer-events:none; }
.ad-map canvas { display:block; }
.ad-maplabel { text-align:center; color:var(--dim); font-size:11px; margin-top:6px; }
.ad-banners { position:absolute; top:58px; left:0; right:0; display:flex; flex-direction:column; align-items:center;
  gap:6px; pointer-events:none; }
.ad-banner { min-width:46vw; max-width:82vw; text-align:center; padding:9px 56px; font-size:20px; font-weight:600;
  letter-spacing:0.12em; text-transform:uppercase; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.6);
  background:linear-gradient(90deg, transparent 0%, var(--bnr) 16%, var(--bnr) 84%, transparent 100%);
  animation:adbanner var(--bnrdur, 3.8s) forwards; }
.ad-banner small { display:block; font-size:12px; font-weight:400; letter-spacing:0.05em; text-transform:none;
  color:rgba(255,255,255,0.88); margin-top:2px; }
@keyframes adbanner { 0%{opacity:0; transform:translateY(-10px)} 8%{opacity:1; transform:none} 78%{opacity:1} 100%{opacity:0; transform:translateY(-6px)} }
.ad-slotrow { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:8px; margin-bottom:3px;
  background:rgba(255,255,255,0.04); border:1px solid transparent; }
.ad-slotrow.item { cursor:pointer; }
.ad-slotrow.item:hover { border-color:var(--line); }
.ad-slotname { color:var(--dim); width:62px; flex:none; font-size:11px; text-transform:uppercase; letter-spacing:0.04em; }
.ad-iname { flex:1; }
.ad-affix { color:var(--dim); font-size:11px; }
.r-stock { color:#c3c9d4; } .r-rated { color:#4aa3ff; } .r-certified { color:#ffd54a; } .r-master { color:#ff8c3a; }
.ad-menu { position:absolute; inset:0;
  /* night grid: stars, mountain ridges, transmission towers + sagging spans, one energized line */
  background:
    url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>\
<g fill='%23cfe0f0'><circle cx='120' cy='90' r='1.6' opacity='.22'/><circle cx='340' cy='170' r='1.2' opacity='.15'/>\
<circle cx='520' cy='60' r='1.4' opacity='.2'/><circle cx='700' cy='140' r='1' opacity='.13'/>\
<circle cx='930' cy='80' r='1.5' opacity='.2'/><circle cx='1090' cy='190' r='1.1' opacity='.14'/>\
<circle cx='1260' cy='70' r='1.5' opacity='.22'/><circle cx='1430' cy='150' r='1.2' opacity='.16'/>\
<circle cx='230' cy='300' r='1' opacity='.1'/><circle cx='620' cy='260' r='1.1' opacity='.12'/>\
<circle cx='1010' cy='320' r='1' opacity='.1'/><circle cx='1520' cy='280' r='1.2' opacity='.12'/></g>\
<ellipse cx='800' cy='830' rx='950' ry='170' fill='%232dd4bf' opacity='.05'/>\
<path d='M0 760 L140 640 260 720 420 600 560 700 720 610 880 710 1040 620 1180 700 1320 630 1470 710 1600 650 1600 900 0 900Z' fill='%23111e30'/>\
<g stroke='%2324364e' fill='none'>\
<g stroke-width='3'><path d='M192 790 L222 430 M268 790 L238 430 M230 412 L230 448'/><path d='M150 475 L310 475 M170 535 L290 535'/><path d='M204 700 L256 640 M256 700 L204 640 M212 620 L248 560 M248 620 L212 560'/></g>\
<g stroke-width='3'><path d='M772 770 L802 380 M848 770 L818 380 M810 362 L810 398'/><path d='M730 425 L890 425 M750 485 L870 485'/><path d='M784 680 L836 615 M836 680 L784 615 M790 590 L830 525 M830 590 L790 525'/></g>\
<g stroke-width='3'><path d='M1332 800 L1362 450 M1408 800 L1378 450 M1370 432 L1370 468'/><path d='M1290 495 L1450 495 M1310 555 L1430 555'/><path d='M1344 715 L1396 655 M1396 715 L1344 655 M1350 635 L1390 575 M1390 635 L1350 575'/></g>\
<g stroke-width='2.2' opacity='.85'><path d='M-40 480 Q95 550 150 475 M310 475 Q560 590 730 425 M890 425 Q1130 550 1290 495 M1450 495 Q1545 540 1640 505'/>\
<path d='M-40 545 Q90 615 170 535 M290 535 Q560 650 750 485 M870 485 Q1130 620 1310 555 M1430 555 Q1545 605 1640 570'/></g>\
</g>\
<path d='M-40 486 Q95 556 150 481 M310 481 Q560 596 730 431 M890 431 Q1130 556 1290 501 M1450 501 Q1545 546 1640 511' stroke='%232dd4bf' stroke-width='1.6' fill='none' opacity='.3'/>\
<path d='M0 810 L180 730 340 790 520 720 700 800 900 730 1080 795 1260 735 1440 800 1600 750 1600 900 0 900Z' fill='%230b1420'/>\
</svg>") center bottom / cover no-repeat,
    radial-gradient(ellipse at 50% 30%, #16233a 0%, #090d15 70%);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }
.ad-menu h1 { font-size:44px; letter-spacing:0.14em; margin:0; color:var(--ink); text-transform:uppercase; }
.ad-menu .tag { color:var(--teal); letter-spacing:0.3em; font-size:12px; text-transform:uppercase; margin-bottom:26px; }
.ad-menu .ad-btn { width:240px; text-align:center; font-size:15px; padding:12px; }
.ad-menu .meta { color:var(--dim); font-size:12px; margin-top:18px; }
.ad-home .tag { margin-bottom:14px; }
.ad-savehead { width:min(780px, 92vw); color:var(--dim); font-size:11px; letter-spacing:0.18em; text-transform:uppercase;
  margin:8px 0 2px; display:flex; align-items:center; gap:10px; }
.ad-savehead::after { content:''; flex:1; height:1px; background:var(--line); }
.ad-saves { width:min(780px, 92vw); max-height:44vh; overflow:auto; display:grid;
  grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:10px; padding:2px; }
.ad-savecard { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:12px 14px;
  display:flex; flex-direction:column; gap:6px; cursor:pointer; text-align:left; }
.ad-savecard:hover { border-color:var(--teal); }
.ad-saverow1 { display:flex; align-items:center; gap:6px; }
.ad-savename { font-size:15px; font-weight:600; color:var(--ink); flex:1; min-width:0;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ad-savename input { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.08); border:1px solid var(--teal);
  border-radius:6px; color:var(--ink); font:inherit; padding:1px 6px; outline:none; }
.ad-saveinfo { color:var(--dim); font-size:12px; line-height:1.5; }
.ad-saveinfo b { color:var(--ink); font-weight:600; }
.ad-saverow2 { display:flex; align-items:center; gap:8px; margin-top:2px; }
.ad-bankchip { border:1px solid var(--line); background:rgba(56,189,248,0.08); color:var(--sky); border-radius:7px;
  font-size:11px; padding:3px 8px; cursor:pointer; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ad-bankchip:hover { border-color:var(--sky); }
.ad-savewhen { color:var(--dim); font-size:11px; margin-left:auto; }
.ad-menu .ad-saves .ad-btn.play { width:auto; font-size:12px; padding:4px 14px; }
.ad-empty { color:var(--dim); font-size:13px; padding:14px; border:1px dashed var(--line); border-radius:12px;
  width:min(780px, 92vw); box-sizing:border-box; text-align:center; }
.ad-homerow { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; justify-content:center; }
.ad-menu .ad-homerow .ad-btn { width:auto; min-width:150px; }
.ad-cat { display:inline-block; padding:1px 7px; border-radius:6px; font-size:11px; font-weight:600; margin-left:8px; }
.ad-interact { position:absolute; left:50%; bottom:96px; transform:translateX(-50%); display:flex; align-items:center; gap:10px;
  background:var(--panel); border:1px solid var(--teal); border-radius:12px; padding:10px 18px; font-size:16px; color:var(--ink);
  pointer-events:none; box-shadow:0 4px 24px rgba(45,212,191,0.18); white-space:nowrap; }
.ad-interact .key { background:var(--teal); color:#04241f; font-weight:700; border-radius:6px; padding:2px 9px; font-size:14px; }
.ad-pickups { position:absolute; left:50%; bottom:152px; transform:translateX(-50%); display:flex; flex-direction:column-reverse;
  align-items:center; gap:4px; pointer-events:none; }
.ad-pickup { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:6px 14px; font-size:14px;
  font-weight:600; white-space:nowrap; animation:adpick 2.6s forwards; }
@keyframes adpick { 0%{opacity:0; transform:translateY(8px) scale(0.92)} 10%{opacity:1; transform:none} 75%{opacity:1} 100%{opacity:0; transform:translateY(-10px)} }
.ad-cathead { display:flex; align-items:center; gap:6px; padding:5px 8px; margin-top:6px; border-radius:8px; cursor:pointer;
  background:rgba(255,255,255,0.07); font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:var(--dim); user-select:none; }
.ad-cathead:hover { color:var(--ink); }
.ad-cathead .cnt { margin-left:auto; background:rgba(255,255,255,0.08); border-radius:6px; padding:0 6px; }
.ad-mini { flex:none; border:1px solid var(--line); background:rgba(255,255,255,0.05); color:var(--dim); border-radius:6px;
  font-size:11px; padding:2px 7px; cursor:pointer; }
.ad-mini:hover { color:var(--ink); border-color:var(--teal); }
.ad-slotic { width:18px; height:18px; flex:none; display:block; }
.ad-icwrap { flex:none; display:flex; align-items:center; }
.ad-cathead .ad-slotic { width:15px; height:15px; }
.ad-invfull .ad-cathead { background:rgba(255,255,255,0.12); color:var(--ink); }
.ad-invfull .ad-cathead:hover { background:rgba(255,255,255,0.16); }
.ad-invfull .ad-slotrow { background:rgba(255,255,255,0.07); border-color:rgba(120,150,190,0.16); }
.ad-invfull .ad-slotrow.item:hover { background:rgba(255,255,255,0.12); border-color:var(--teal); }
.ad-warp { position:absolute; left:50%; bottom:64px; transform:translateX(-50%); background:var(--panel);
  border:1px solid var(--line); color:var(--ink); border-radius:10px; padding:6px 14px; font-size:12px; cursor:pointer; }
.ad-warp:hover { border-color:var(--teal); color:var(--teal); }
.ad-price { flex:none; font-size:12px; color:var(--amber); min-width:56px; text-align:right; }
.ad-qbar { flex:0 0 110px; height:8px; background:rgba(0,0,0,0.5); border:1px solid var(--line); border-radius:6px; overflow:hidden; }
.ad-qbar > i { display:block; height:100%; background:var(--teal); }
.ad-statgrid { display:grid; grid-template-columns:1fr 1fr; gap:4px 26px; font-size:13px; color:var(--dim); }
.ad-statgrid b { color:var(--ink); float:right; }
.ad-stathead { grid-column:1 / -1; margin-top:10px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--teal); }
.ad-manfull { background:radial-gradient(ellipse at 50% 30%, #16233a 0%, #090d15 70%); }
.ad-manwrap { display:flex; gap:16px; width:min(1080px, 94vw); height:min(660px, 84vh); }
.ad-mantabs { flex:0 0 210px; background:var(--panel); border:1px solid var(--line); border-radius:14px;
  padding:10px; overflow:auto; display:flex; flex-direction:column; gap:4px; }
.ad-mantab { text-align:left; padding:8px 11px; border-radius:8px; border:1px solid transparent; background:none;
  color:var(--dim); font-size:13px; cursor:pointer; }
.ad-mantab:hover { color:var(--ink); background:rgba(255,255,255,0.06); }
.ad-mantab.sel { color:var(--teal); background:rgba(45,212,191,0.10); border-color:rgba(45,212,191,0.4); }
.ad-manpage { flex:1; background:var(--panel); border:1px solid var(--line); border-radius:14px;
  padding:16px 22px; overflow:auto; font-size:13px; line-height:1.55; }
.ad-manbody { max-width:70ch; }
.ad-manbody h3 { margin:14px 0 6px; font-size:13px; color:var(--teal); letter-spacing:0.06em; text-transform:uppercase; }
.ad-manbody h3:first-child { margin-top:0; }
`;

export const CAT_COLORS = {
  CIRC: '#38bdf8', COND: '#d97757', GRND: '#34c759', DIST: '#a78bfa', OCP: '#f5a623',
  FALL: '#e5484d', STRUCK: '#e5484d', CAUGHT: '#e5484d', ELEC: '#e5484d', FIRE: '#e5484d', PPE: '#e5484d', SITE: '#e5484d', GEN: '#8a94a6',
};
const RARITY_CLASS = { stock: 'r-stock', rated: 'r-rated', certified: 'r-certified', master: 'r-master' };

export function makeHud(root){
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  // --- ability icons (stroke glyphs, keyed by ability id; 'dodge' + fallback bolt) ---
  const aicon = body => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const ABILITY_ICON = {
    gaffLunge: aicon('<path d="M3 12h14M13 6l6 6-6 6"/>'),
    comeAlong: aicon('<path d="M21 12H7M11 6l-6 6 6 6"/><circle cx="21" cy="12" r="1.6"/>'),
    groundRod: aicon('<path d="M12 3v10M6 13h12M8.5 17h7M10.5 21h3"/>'),
    insulatingBlanket: aicon('<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>'),
    loadBreak: aicon('<circle cx="12" cy="12" r="3.4"/><path d="M12 2.5v3.7M12 17.8v3.7M2.5 12h3.7M17.8 12h3.7M5.2 5.2l2.6 2.6M16.2 16.2l2.6 2.6M18.8 5.2l-2.6 2.6M7.8 16.2l-2.6 2.6"/>'),
    meggerSurge: aicon('<path d="M2 12h5l2.5-5 4.5 10 2.5-5h5.5"/>'),
    leadFan: aicon('<path d="M12 21L5 6M12 21V5M12 21l7-15"/>'),
    hipot: aicon('<path d="M13 2L5 13.5h5L9 22l10-12.5h-6z"/>'),
    ampClamp: aicon('<path d="M14.5 3.3a9 9 0 1 0 .3 17.3"/><path d="M14.5 3.3L20 9M14.8 20.6L20 15"/>'),
    quickDisconnect: aicon('<path d="M15 12H3M7 6l-6 6 6 6"/><path d="M18 5v14M22 9v6"/>'),
    apprentices: aicon('<circle cx="8" cy="7" r="2.8"/><circle cx="16.5" cy="8.5" r="2.3"/><path d="M3 20c0-3.2 2.2-5 5-5s5 1.8 5 5M13.5 20c0-2.6 1.4-4 3-4s3 1.4 3 4"/>'),
    barricade: aicon('<path d="M3 9h18M3 15h18M6 5.5v13M12 5.5v13M18 5.5v13"/>'),
    spiderBox: aicon('<rect x="8" y="8" width="8" height="8" rx="1"/><path d="M8 8L4.2 4.2M16 8l3.8-3.8M8 16l-3.8 3.8M16 16l3.8 3.8"/>'),
    stopWork: aicon('<path d="M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2z"/><path d="M8.5 12h7"/>'),
    musterPoint: aicon('<path d="M6 21V4M6 4.5h11.5L14 8.5l3.5 4H6"/>'),
    dodge: aicon('<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 3v6h-6"/>'),
  };
  const ABILITY_FALLBACK = aicon('<path d="M13 2L5 13.5h5L9 22l10-12.5h-6z"/>');

  // --- persistent HUD ---
  const loc = el('div', 'ad-loc'); root.appendChild(loc);
  const toasts = el('div', 'ad-toasts'); root.appendChild(toasts);
  const interactEl = el('div', 'ad-interact'); interactEl.style.display = 'none'; root.appendChild(interactEl);
  const pickups = el('div', 'ad-pickups'); root.appendChild(pickups);
  const hudBar = el('div', 'ad-hud'); root.appendChild(hudBar);
  const warpBtn = el('button', 'ad-warp'); warpBtn.style.display = 'none'; root.appendChild(warpBtn);
  const bars = el('div', 'ad-bars');
  const hpBar = el('div', 'ad-bar'); const hpFill = el('i'); const hpVal = el('span', 'val');
  hpBar.append(hpFill, hpVal);
  const xpBar = el('div', 'ad-bar xp'); const xpFill = el('i'); const xpVal = el('span', 'val');
  xpBar.append(xpFill, xpVal);
  const statLine = el('div', 'ad-stats');
  bars.append(hpBar, xpBar, statLine);
  const abils = el('div', 'ad-abils');
  hudBar.append(bars, abils);
  const abilEls = [];

  const hud = {
    setLocation(realmName, floorLabel){ loc.innerHTML = `<b>${realmName}</b>${floorLabel || ''}`; },
    setHealth(cur, max){
      hpFill.style.width = `${Math.max(0, 100 * cur / max)}%`;
      hpFill.style.background = cur / max > 0.35 ? 'var(--red)' : '#ff2d55';
      hpVal.textContent = `${Math.max(0, Math.ceil(cur))} / ${max}`;
    },
    setXP(frac, lvl, label){
      xpFill.style.width = `${Math.round(frac * 100)}%`;
      xpVal.textContent = label || '';
      hud._lvl = lvl;
      hud._renderStats();
    },
    setCurrency(stamps, salvage, volts){ hud._cur = { stamps, salvage, volts }; hud._renderStats(); },
    _lvl: 1, _cur: { stamps: 0, salvage: 0, volts: 0 },
    _renderStats(){
      const c = hud._cur;
      statLine.innerHTML = `<span>Lv <b>${hud._lvl}</b></span><span>Stamps <b>${c.stamps}</b></span>` +
        `<span>Salvage <b>${c.salvage}</b></span><span>Volts <b>${c.volts}</b></span>`;
    },
    setAbilities(list){ // [{key, name, id, desc, cd}]
      abils.innerHTML = ''; abilEls.length = 0;
      for (const a of list){
        const tip = a.desc
          ? `<div class="ad-abiltip"><b>${a.name}</b><div class="meta">[${a.key}]${a.cd ? ` · ${a.cd} s cooldown` : ''}</div><div class="body">${a.desc}</div></div>`
          : '';
        const b = el('div', 'ad-abil',
          `<small>${a.key}</small><div class="ad-abilic">${ABILITY_ICON[a.id] || ABILITY_FALLBACK}</div>` +
          `<span>${a.name}</span><div class="cd" style="display:none"></div>${tip}`);
        abils.appendChild(b);
        abilEls.push(b.querySelector('.cd'));
      }
    },
    setCooldowns(cds){ // seconds remaining per ability
      cds.forEach((cd, i) => {
        const e = abilEls[i]; if (!e) return;
        if (cd > 0.05){ e.style.display = 'flex'; e.textContent = cd.toFixed(1); }
        else e.style.display = 'none';
      });
    },
    toast(msg){
      const t = el('div', 'ad-toast', msg);
      toasts.appendChild(t);
      setTimeout(() => t.remove(), 3300);
      while (toasts.children.length > 5) toasts.firstChild.remove();
    },
    // persistent interaction prompt (bottom center): label + key chip, or null to hide
    _intLabel: null,
    setInteract(label, keyChip = 'E'){
      const sig = label === null ? null : label + '|' + keyChip;
      if (sig === hud._intLabel) return;
      hud._intLabel = sig;
      if (!label){ interactEl.style.display = 'none'; return; }
      interactEl.style.display = 'flex';
      interactEl.innerHTML = (keyChip ? `<span class="key">${keyChip}</span>` : '') + `<span>${label}</span>`;
    },
    // item pickup feed (bottom center, above the prompt)
    pickup(html){
      const t = el('div', 'ad-pickup', html);
      pickups.appendChild(t);
      setTimeout(() => t.remove(), 2700);
      while (pickups.children.length > 4) pickups.firstChild.remove();
    },
    pickupItem(item, note = ''){
      const cls = RARITY_CLASS[item.rarity] || 'r-stock';
      const label = item.rarity === 'master' ? `MASTERCRAFT: ${item.name}` : item.name;
      hud.pickup(`<span class="${cls}">${label}</span>${note}`);
    },
    // warp-to-town button above the ability bar (play mode only)
    setWarp(visible, onClick){
      warpBtn.style.display = visible ? 'block' : 'none';
      if (visible){
        warpBtn.innerHTML = '⌂ Town <span style="color:var(--dim)">(H)</span>';
        warpBtn.onclick = onClick;
      }
    },
  };

  // --- question modal ---
  hud.askQuestion = (q, { title = 'Code Question', sub = '', eliminateOne = false } = {}) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const cat = (q.category || 'GEN').toUpperCase();
    const catChip = `<span class="ad-cat" style="background:${(CAT_COLORS[cat] || '#8a94a6')}22;color:${CAT_COLORS[cat] || '#8a94a6'}">${cat} · ${q.difficulty || 'medium'}</span>`;
    const m = el('div', 'ad-modal', `<h3>${title}${catChip}</h3><div class="sub">${sub}</div><div class="q">${q.question}</div>`);
    const order = q.choices.map((c, i) => i).sort(() => Math.random() - 0.5);
    const wrongIdx = eliminateOne && q.choices.length > 2
      ? order.filter(i => q.choices[i] !== q.answer)[0] : -1;
    const btns = [];
    for (const i of order){
      const b = el('button', 'ad-choice', q.choices[i]);
      if (i === wrongIdx){ b.disabled = true; b.style.opacity = '0.35'; b.title = 'First Ticket: continuity checked'; }
      b.onclick = () => {
        const correct = q.choices[i] === q.answer;
        btns.forEach(x => { x.disabled = true; if (x.textContent === q.answer) x.classList.add('correct'); });
        if (!correct) b.classList.add('wrong');
        if (q.why) m.appendChild(el('div', 'ad-why', q.why));
        const row = el('div', 'ad-btnrow');
        const cont = el('button', 'ad-btn primary', 'Continue');
        cont.onclick = () => { wrap.remove(); resolve(correct); };
        row.appendChild(cont); m.appendChild(row);
        cont.focus();
      };
      m.appendChild(b); btns.push(b);
    }
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- identify-all gauntlet: 5 correct in a row; a miss resets the streak but stays open.
  // Exits via ✕, Esc, or clicking off the modal. Resolves true only on a completed streak.
  hud.showIdentifyGauntlet = ({ nextQ, onAnswer, count }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal');
    m.style.position = 'relative';
    let streak = 0;
    const done = ok => { window.removeEventListener('keydown', onEsc, true); wrap.remove(); resolve(ok); };
    const onEsc = e => { if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); done(false); } };
    window.addEventListener('keydown', onEsc, true);
    wrap.addEventListener('pointerdown', e => { if (e.target === wrap) done(false); });
    const render = () => {
      const q = nextQ();
      const cat = (q.category || 'GEN').toUpperCase();
      const catChip = `<span class="ad-cat" style="background:${(CAT_COLORS[cat] || '#8a94a6')}22;color:${CAT_COLORS[cat] || '#8a94a6'}">${cat} · ${q.difficulty || 'medium'}</span>`;
      m.innerHTML = `<button class="ad-x" title="Leave — nothing is identified">✕</button>
        <h3>Calibration Gauntlet${catChip}</h3>
        <div class="sub">${count} unidentified item${count === 1 ? '' : 's'} on the bench. Five correct in a row calibrates them all — a miss resets the streak.</div>
        <div class="ad-pips">${[0, 1, 2, 3, 4].map(i => `<span class="ad-pip${i < streak ? ' on' : ''}"></span>`).join('')}</div>
        <div class="q">${q.question}</div>`;
      m.querySelector('.ad-x').onclick = () => done(false);
      const btns = [];
      for (const i of q.choices.map((c, ix) => ix).sort(() => Math.random() - 0.5)){
        const b = el('button', 'ad-choice', q.choices[i]);
        b.onclick = () => {
          const correct = q.choices[i] === q.answer;
          onAnswer(q, correct);
          btns.forEach(x => { x.disabled = true; if (x.textContent === q.answer) x.classList.add('correct'); });
          if (!correct) b.classList.add('wrong');
          streak = correct ? streak + 1 : 0;
          m.querySelectorAll('.ad-pip').forEach((p, ix) => p.classList.toggle('on', ix < streak));
          if (q.why) m.appendChild(el('div', 'ad-why', q.why));
          const row = el('div', 'ad-btnrow');
          const cont = el('button', 'ad-btn primary',
            streak >= 5 ? 'Calibrate everything' : correct ? `Next (${streak}/5)` : 'Streak reset — go again');
          cont.onclick = () => streak >= 5 ? done(true) : render();
          row.appendChild(cont); m.appendChild(row);
          cont.focus();
        };
        m.appendChild(b); btns.push(b);
      }
    };
    render();
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- generic dialog ---
  hud.dialog = ({ title, sub = '', body = '', buttons = ['OK'] }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal', `<h3>${title}</h3><div class="sub">${sub}</div><div>${body}</div>`);
    const row = el('div', 'ad-btnrow');
    buttons.forEach((label, i) => {
      const b = el('button', 'ad-btn' + (i === buttons.length - 1 ? ' primary' : ''), label);
      b.onclick = () => { wrap.remove(); resolve(i); };
      row.appendChild(b);
    });
    m.appendChild(row); wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- inventory ---
  let invEl = null;
  hud.itemLine = (item) => {
    const cls = RARITY_CLASS[item.rarity] || 'r-stock';
    const affixes = item.identified === false ? 'unidentified — click to calibrate'
      : (item.affixes || []).map(a => a.label).join(' · ');
    return `<span class="ad-iname ${cls}">${item.name}</span><span class="ad-affix">${affixes}</span>`;
  };
  const invCollapsed = {}; // per-slot collapse state, survives re-renders
  let invView = 'list';    // backpack layout: 'list' | 'grid'
  const SLOTS = ['tool', 'hardhat', 'jacket', 'gloves', 'boots', 'meter'];
  const SLOT_LABEL = { tool: 'Tools', hardhat: 'Hardhats', jacket: 'Jackets', gloves: 'Gloves', boots: 'Boots', meter: 'Meters' };
  const icon = (body) => `<svg class="ad-slotic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const SLOT_ICON = {
    tool: icon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    hardhat: icon('<path d="M5 15v-1a7 7 0 0 1 14 0v1"/><path d="M2 15h20v3H2z"/>'),
    jacket: icon('<path d="M7 3h2l3 4 3-4h2l2 6-2 1v11H7V10L5 9z"/>'),
    gloves: icon('<path d="M9 21v-2.6A7 7 0 0 1 6 12V6a2 2 0 0 1 4 0v4h1V4a2 2 0 0 1 4 0v6a4 4 0 0 1 3 4 7 7 0 0 1-3 5.4V21z"/>'),
    boots: icon('<path d="M7 3v9l-3 3v3h16a3 3 0 0 0-3-3h-3V3z"/>'),
    meter: icon('<circle cx="12" cy="13" r="8"/><path d="M12 13l3.5-3.5"/>'),
  };
  const RARITY_ORDER = { master: 0, certified: 1, rated: 2, stock: 3 };
  const IMPLICIT_LABEL = {
    damage: v => `+${v} Damage`, armor: v => `+${v} Armor`, hp: v => `+${v} HP`,
    asPct: v => `+${v}% Attack Speed`, msPct: v => `+${v}% Move Speed`,
  };
  // vs: the equipped counterpart — colors each stat line green/red/gray vs its value there
  const cmpCls = (mine, theirs) => mine > theirs ? ' cmp-b' : mine < theirs ? ' cmp-w' : ' cmp-s';
  const itemCard = (item, title, vs) => {
    if (!item) return `<div class="ad-cmp"><div class="ad-cmptitle">${title}</div><div class="ad-affix">nothing equipped</div></div>`;
    const cls = RARITY_CLASS[item.rarity] || 'r-stock';
    const vsImp = stat => ((vs && vs.implicits) || []).find(i => i.stat === stat);
    const vsAff = id => (vs && vs.identified !== false && (vs.affixes || []) || []).find(a => a.id === id);
    const imps = (item.implicits || []).map(i => {
      if (!IMPLICIT_LABEL[i.stat]) return '';
      const o = vsImp(i.stat);
      return `<div class="impline${vs ? cmpCls(i.value, o ? o.value : 0) : ''}">${IMPLICIT_LABEL[i.stat](Math.round(i.value))}</div>`;
    }).filter(Boolean).join('');
    const affs = item.identified === false ? '<div class="affline">unidentified — click to calibrate</div>'
      : (item.affixes || []).map(a => {
        const o = vsAff(a.id);
        return `<div class="affline${vs ? cmpCls(a.value, o ? o.value : 0) : ''}">${a.label}</div>`;
      }).join('');
    return `<div class="ad-cmp"><div class="ad-cmptitle">${title}</div>
      <div class="${cls}" style="font-weight:600">${item.name}</div>
      <div class="ad-affix">${RARITY_LABEL[item.rarity] || item.rarity} · item level ${item.ilvl}</div>
      ${imps}${affs}
      ${item.lore ? `<div class="lore">${item.lore}</div>` : ''}</div>`;
  };
  // hover/compare state: equipped items card on plain hover; backpack items compare on Shift
  let cmpEl = null, cmpHover = null, cmpArgs = null;
  const renderCompare = (ev) => {
    if (cmpEl){ cmpEl.remove(); cmpEl = null; }
    if (!cmpHover || !cmpArgs) return;
    const eq = cmpArgs.equipped[cmpHover.slot];
    cmpEl = el('div', 'ad-cmp-wrap', eq === cmpHover
      ? itemCard(cmpHover, `Equipped ${cmpHover.slot}`)
      : itemCard(cmpHover, 'Hovered', eq) + itemCard(eq, `Equipped ${cmpHover.slot}`));
    document.body.appendChild(cmpEl);
    const x = Math.min(ev.clientX + 18, innerWidth - cmpEl.offsetWidth - 12);
    const y = Math.min(ev.clientY - 20, innerHeight - cmpEl.offsetHeight - 12);
    cmpEl.style.left = Math.max(8, x) + 'px';
    cmpEl.style.top = Math.max(8, y) + 'px';
  };
  window.addEventListener('keydown', e => { if (e.key === 'Shift' && cmpHover && hud.inventoryOpen()) renderCompare(cmpHover._lastEv || { clientX: 400, clientY: 300 }); });
  window.addEventListener('keyup', e => { if (e.key === 'Shift' && cmpEl){ cmpEl.remove(); cmpEl = null; } });

  const DOLL_SVG = `<svg viewBox="0 0 120 240" fill="none">
    <circle cx="60" cy="30" r="18" fill="#33404f"/>
    <rect x="38" y="52" width="44" height="66" rx="10" fill="#33404f"/>
    <rect x="20" y="56" width="14" height="52" rx="7" fill="#2c3a4a"/>
    <rect x="86" y="56" width="14" height="52" rx="7" fill="#2c3a4a"/>
    <rect x="41" y="122" width="16" height="70" rx="8" fill="#2c3a4a"/>
    <rect x="63" y="122" width="16" height="70" rx="8" fill="#2c3a4a"/>
    <rect x="36" y="192" width="24" height="14" rx="5" fill="#22303d"/>
    <rect x="60" y="192" width="24" height="14" rx="5" fill="#22303d"/>
  </svg>`;
  // slot boxes around the silhouette: hat on head, gloves/jacket flanking the hands,
  // boots ON the svg's feet (center, raised), meter + tool in the bottom corners (nudged up).
  const DOLL_POS = {
    hardhat: 'left:50%;top:0;transform:translateX(-50%)',
    gloves: 'left:0;top:42%',
    jacket: 'right:0;top:42%',
    boots: 'left:50%;bottom:12%;transform:translateX(-50%)',
    meter: 'left:0;bottom:4%',
    tool: 'right:0;bottom:4%',
  };
  // inline stat lines for an equipped doll slot — visible without hovering
  const slotStats = (it) => {
    if (it.identified === false) return '<span class="st dim">unidentified</span>';
    const imps = (it.implicits || []).map(i => IMPLICIT_LABEL[i.stat] ? `<span class="st imp">${IMPLICIT_LABEL[i.stat](Math.round(i.value))}</span>` : '').join('');
    const affs = (it.affixes || []).map(a => `<span class="st">${a.label}</span>`).join('');
    return imps + affs;
  };

  hud.openInventory = (args) => {
    const { equipped, items, character, onEquip, onSalvage, onSalvageAll, onIdentifyAll, autoScrap, onDiscard, salvageValue, onClose } = args;
    cmpArgs = args;
    const prevScroll = invEl ? (invEl.querySelector('.ad-invpack') || {}).scrollTop || 0 : 0;
    hud.closeInventory(true);
    invEl = el('div', 'ad-invfull');
    const wrap = el('div', 'ad-invwrap');

    // --- left: character ---
    const charPane = el('div', 'ad-invchar');
    charPane.appendChild(el('h3', '', character ? `${character.cls} — Level ${character.level}` : 'Equipped'));
    const doll = el('div', 'ad-doll', DOLL_SVG);
    for (const slot of SLOTS){
      const it = equipped[slot];
      const box = el('div', 'ad-dollslot' + (it ? '' : ' empty'),
        `<span class="sl">${slot}</span><span class="nm ${it ? RARITY_CLASS[it.rarity] : ''}">${it ? it.name : '—'}</span>`
        + (it ? slotStats(it) : ''));
      box.style.cssText += DOLL_POS[slot];
      if (it){
        // stats are inline now; hover still brings the full card (rarity/ilvl/lore)
        box.onmousemove = (e) => { cmpHover = it; it._lastEv = e; renderCompare(e); };
        box.onmouseleave = () => { cmpHover = null; if (cmpEl){ cmpEl.remove(); cmpEl = null; } };
      }
      doll.appendChild(box);
    }
    charPane.appendChild(doll);
    if (character && character.stats){
      const s = character.stats;
      charPane.appendChild(el('div', 'ad-charstats',
        `<span>Max HP <b>${s.maxHp}</b></span><span>Damage <b>${s.damage}</b></span>` +
        `<span>Attack Speed <b>${s.atkSpeed.toFixed(2)}/s</b></span><span>Armor <b>${s.armor} (${Math.round(s.dr * 100)}%)</b></span>` +
        `<span>Move Speed <b>${s.moveSpeed.toFixed(1)}</b></span><span>Salvage Bonus <b>${Math.round((s.salvagePct || 0) * 100)}%</b></span>`));
    }
    wrap.appendChild(charPane);

    // --- right: backpack ---
    const pack = el('div', 'ad-invpack');
    pack.appendChild(el('h3', '', `Backpack (${items.length})`));
    const tools = el('div', 'ad-invtools');
    const viewBtn = el('button', 'ad-mini', invView === 'list' ? '▦ Grid view' : '☰ List view');
    viewBtn.onclick = () => { invView = invView === 'list' ? 'grid' : 'list'; hud.openInventory(args); };
    tools.appendChild(viewBtn);
    if (onIdentifyAll){
      const unid = items.filter(i => i.identified === false).length;
      if (unid > 0){
        const idb = el('button', 'ad-mini', `⚡ Identify all (${unid})`);
        idb.title = 'Calibration Gauntlet: answer 5 questions in a row to identify everything';
        idb.onclick = () => onIdentifyAll();
        tools.appendChild(idb);
      }
    }
    if (autoScrap){
      const asb = el('button', 'ad-mini', `Auto-scrap ${RARITY_LABEL.stock}+${RARITY_LABEL.rated}: ${autoScrap.on ? 'ON' : 'off'}`);
      asb.title = 'New Common and Rare drops are broken down into Salvage on pickup';
      if (autoScrap.on) asb.style.cssText += 'color:var(--teal);border-color:var(--teal)';
      asb.onclick = () => { autoScrap.toggle(); hud.openInventory(args); };
      tools.appendChild(asb);
    }
    pack.appendChild(tools);
    pack.appendChild(el('div', 'ad-comparehint', 'Click: equip · Shift-click: salvage · hold Shift over an item to compare with equipped'));
    if (!items.length) pack.appendChild(el('div', 'ad-affix', 'Empty — clear rooms and answer shrines.'));
    for (const slot of SLOTS){
      const group = items.filter(i => i.slot === slot)
        .sort((a, b) => (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9));
      if (!group.length) continue;
      const head = el('div', 'ad-cathead',
        `<span>${invCollapsed[slot] ? '▸' : '▾'}</span>${SLOT_ICON[slot]}<span>${SLOT_LABEL[slot]}</span><span class="cnt">${group.length}</span>`);
      head.onclick = () => { invCollapsed[slot] = !invCollapsed[slot]; hud.openInventory(args); };
      if (onSalvageAll && salvageValue){
        const sb = el('button', 'ad-mini', '⚒ all');
        sb.title = `Scrap every ${SLOT_LABEL[slot].toLowerCase()} in the backpack`;
        sb.onclick = async (e) => {
          e.stopPropagation();
          const total = group.reduce((s, it) => s + salvageValue(it), 0);
          const pick = await hud.dialog({
            title: `Scrap all ${SLOT_LABEL[slot]}`, sub: `${group.length} item${group.length === 1 ? '' : 's'}`,
            body: `Break everything in this category down for <b>${total}</b> Salvage? Equipped gear is untouched.`,
            buttons: ['Scrap all', 'Keep'],
          });
          if (pick === 0) onSalvageAll(group);
        };
        head.appendChild(sb);
      }
      pack.appendChild(head);
      if (invCollapsed[slot]) continue;
      const hoverHandlers = (elm, it) => {
        elm.onclick = (e) => { (e.shiftKey ? onSalvage : onEquip)(it); };
        elm.onmousemove = (e) => { cmpHover = it; it._lastEv = e; if (e.shiftKey) renderCompare(e); };
        elm.onmouseleave = () => { cmpHover = null; if (cmpEl){ cmpEl.remove(); cmpEl = null; } };
      };
      if (invView === 'grid'){
        const grid = el('div', 'ad-invgrid');
        for (const it of group){
          const cell = el('div', 'ad-invcell',
            `<div class="icrow"><span class="ad-icwrap ${RARITY_CLASS[it.rarity] || 'r-stock'}">${SLOT_ICON[it.slot]}</span>` +
            `<span class="rar">${RARITY_LABEL[it.rarity] || it.rarity}</span></div>` +
            `<span class="nm ${RARITY_CLASS[it.rarity] || 'r-stock'}">${it.name}</span>`);
          hoverHandlers(cell, it);
          if (onSalvage && salvageValue){
            const sv = el('button', 'ad-mini', `⚒ ${salvageValue(it)}`);
            sv.title = `Salvage for ${salvageValue(it)} Salvage`;
            sv.onclick = (e) => { e.stopPropagation(); onSalvage(it); };
            cell.querySelector('.icrow').appendChild(sv);
          }
          grid.appendChild(cell);
        }
        pack.appendChild(grid);
      } else {
        for (const it of group){
          const row = el('div', 'ad-slotrow item',
            `<span class="ad-icwrap ${RARITY_CLASS[it.rarity] || 'r-stock'}">${SLOT_ICON[it.slot]}</span>` + hud.itemLine(it));
          hoverHandlers(row, it);
          if (onSalvage && salvageValue){
            const sv = el('button', 'ad-mini', `⚒ ${salvageValue(it)}`);
            sv.title = `Salvage for ${salvageValue(it)} Salvage`;
            sv.onclick = (e) => { e.stopPropagation(); onSalvage(it); };
            row.appendChild(sv);
          }
          pack.appendChild(row);
        }
      }
    }
    wrap.appendChild(pack);
    invEl.appendChild(wrap);
    const close = el('button', 'ad-btn', 'Close (I)');
    close.onclick = () => { hud.closeInventory(); onClose && onClose(); };
    invEl.appendChild(close);
    root.appendChild(invEl);
    const packEl = invEl.querySelector('.ad-invpack');
    if (packEl) packEl.scrollTop = prevScroll;
  };
  hud.closeInventory = (rerender) => {
    if (invEl){ invEl.remove(); invEl = null; }
    if (!rerender){ cmpHover = null; cmpArgs = null; if (cmpEl){ cmpEl.remove(); cmpEl = null; } }
  };
  hud.inventoryOpen = () => !!invEl;

  // --- announcement banners: open-ended fade strip across the top ---
  const banners = el('div', 'ad-banners'); root.appendChild(banners);
  hud.banner = (title, { sub = '', color = 'rgba(45,212,191,0.45)', dur = 3.8 } = {}) => {
    const b = el('div', 'ad-banner', `${title}${sub ? `<small>${sub}</small>` : ''}`);
    b.style.setProperty('--bnr', color);
    b.style.setProperty('--bnrdur', dur + 's');
    banners.appendChild(b);
    setTimeout(() => b.remove(), dur * 1000 + 100);
    while (banners.children.length > 2) banners.firstChild.remove();
  };

  // --- dungeon map overlay (Tab): passive, gameplay continues underneath ---
  const mapWrap = el('div', 'ad-map'); mapWrap.style.display = 'none';
  const mapCanvas = document.createElement('canvas');
  mapWrap.appendChild(mapCanvas);
  mapWrap.appendChild(el('div', 'ad-maplabel',
    '<span style="color:#4ade80">explored</span> · <span>unexplored</span> · Tab to close'));
  root.appendChild(mapWrap);
  hud.showMap = () => { mapWrap.style.display = 'block'; };
  hud.hideMap = () => { mapWrap.style.display = 'none'; };
  hud.mapOpen = () => mapWrap.style.display !== 'none';
  hud.drawMap = ({ w, h, tiles, seen, markers = [], player }) => {
    const scale = Math.max(2, Math.floor(Math.min(430 / w, 430 / h)));
    if (mapCanvas.width !== w * scale || mapCanvas.height !== h * scale){
      mapCanvas.width = w * scale; mapCanvas.height = h * scale;
    }
    const ctx = mapCanvas.getContext('2d');
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    for (let z = 0; z < h; z++) for (let x = 0; x < w; x++){
      const i = z * w + x;
      if (tiles[i] !== 1) continue;
      ctx.fillStyle = seen && seen[i] ? 'rgba(74,222,128,0.55)' : 'rgba(148,163,184,0.18)';
      ctx.fillRect(x * scale, z * scale, scale, scale);
    }
    const ms = scale * 2;
    for (const mk of markers){
      ctx.fillStyle = mk.color;
      ctx.fillRect(mk.x * scale - ms / 2, mk.z * scale - ms / 2, ms, ms);
    }
    if (player){
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(player.x * scale, player.z * scale, scale * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // --- home page: saved games + new game + bank/upload/settings ---
  // saves: [{id, name, cls, lvl, loc, seals, bank, when}] — pre-formatted display strings.
  // Resolves {action, id?, name?}: resume/new/bank/upload/settings/rename/delete/slotbank.
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  hud.showHome = ({ saves, bankLabel, bankInfo, stats }) => new Promise(resolve => {
    const wrap = el('div', 'ad-menu ad-home');
    const done = v => { wrap.remove(); resolve(v); };
    wrap.appendChild(el('h1', '', 'Arc Descent'));
    wrap.appendChild(el('div', 'tag', 'ElectriAI · learn the trade, clear the grid'));
    wrap.appendChild(el('div', 'ad-savehead', 'Saved Descents'));
    if (!saves.length){
      wrap.appendChild(el('div', 'ad-empty', 'No saved descents yet — begin your first.'));
    } else {
      const grid = el('div', 'ad-saves');
      for (const s of saves){
        const card = el('div', 'ad-savecard');
        card.onclick = () => done({ action: 'resume', id: s.id });

        const r1 = el('div', 'ad-saverow1');
        const nameEl = el('div', 'ad-savename', esc(s.name));
        nameEl.title = s.name;
        const rename = el('button', 'ad-mini', '✎');
        rename.title = 'Rename';
        rename.onclick = e => {
          e.stopPropagation();
          const inp = document.createElement('input');
          inp.value = s.name; inp.maxLength = 40;
          nameEl.textContent = ''; nameEl.appendChild(inp);
          inp.focus(); inp.select();
          inp.onclick = ev => ev.stopPropagation();
          inp.onkeydown = ev => {
            ev.stopPropagation();
            if (ev.key === 'Enter') inp.blur();
            if (ev.key === 'Escape'){ inp.onblur = null; nameEl.innerHTML = esc(s.name); }
          };
          inp.onblur = () => {
            const v = inp.value.trim();
            if (v && v !== s.name) done({ action: 'rename', id: s.id, name: v });
            else nameEl.innerHTML = esc(s.name);
          };
        };
        const del = el('button', 'ad-mini', '✕');
        del.title = 'Delete save';
        del.onclick = e => { e.stopPropagation(); done({ action: 'delete', id: s.id }); };
        r1.appendChild(nameEl); r1.appendChild(rename); r1.appendChild(del);
        card.appendChild(r1);

        card.appendChild(el('div', 'ad-saveinfo',
          `<b>${esc(s.cls)}</b> · Lv ${s.lvl} · Seals ${s.seals}<br>${esc(s.loc)}`));

        const r2 = el('div', 'ad-saverow2');
        const chip = el('button', 'ad-bankchip', esc(s.bank) + ' ⇄');
        chip.title = 'Switch which question bank this save runs on';
        chip.onclick = e => { e.stopPropagation(); done({ action: 'slotbank', id: s.id }); };
        const play = el('button', 'ad-btn primary play', 'Play');
        play.onclick = e => { e.stopPropagation(); done({ action: 'resume', id: s.id }); };
        r2.appendChild(chip);
        r2.appendChild(el('span', 'ad-savewhen', esc(s.when)));
        r2.appendChild(play);
        card.appendChild(r2);
        grid.appendChild(card);
      }
      wrap.appendChild(grid);
    }
    const row = el('div', 'ad-homerow');
    const mk = (label, action, primary) => {
      const b = el('button', 'ad-btn' + (primary ? ' primary' : ''), label);
      b.onclick = () => done({ action });
      row.appendChild(b);
    };
    mk(saves.length ? 'New Descent' : 'Begin Descent', 'new', !saves.length);
    if (bankLabel) mk(`New-Game Bank: ${esc(bankLabel)} ⇄`, 'bank');
    mk('Field Manual', 'manual');
    mk('Upload Questions', 'upload');
    mk('Settings', 'settings');
    wrap.appendChild(row);
    wrap.appendChild(el('div', 'meta', `${bankInfo}<br>${stats || ''}`));
    root.appendChild(wrap);
  });

  // --- class selection ---
  hud.showClassSelect = (classes) => new Promise(resolve => {
    const wrap = el('div', 'ad-menu');
    wrap.appendChild(el('h1', '', 'Choose your trade'));
    wrap.appendChild(el('div', 'tag', 'the descent shapes itself to the journeyman'));
    const row = el('div', '');
    row.style.cssText = 'display:flex;gap:14px;justify-content:center;flex-wrap:wrap;max-width:900px';
    for (const c of classes){
      const card = el('div', '', `<h3 style="margin:0 0 6px;color:var(--teal)">${c.name}</h3>
        <div style="color:var(--dim);font-size:13px;margin-bottom:10px">${c.desc}</div>
        <div style="font-size:12px;line-height:1.6">${c.abilities.map(a => `<b>${a.name}</b>`).join(' · ')}<br>
        <span style="color:var(--dim)">Passive: ${c.passive.name} — ${c.passive.desc}</span></div>`);
      card.style.cssText = 'width:260px;padding:16px;background:var(--panel);border:1px solid var(--line);border-radius:14px;cursor:pointer';
      card.onmouseenter = () => card.style.borderColor = 'var(--teal)';
      card.onmouseleave = () => card.style.borderColor = 'var(--line)';
      card.onclick = () => { wrap.remove(); resolve(c.id); };
      row.appendChild(card);
    }
    wrap.appendChild(row);
    root.appendChild(wrap);
  });

  // --- Workbench Forge ---
  // items: [{item, ops: [{op, label, cost:{stamps,salvage}, can}]}]; resolve {item, op} | null
  const FORGE_HELP = {
    reinforce: 'Reinforce: upgrade a Common item to Rare and roll one affix onto it.',
    certify: 'Certify: upgrade a Rare item to Magic and add one extra, different affix.',
    recalibrate: 'Recalibrate: reroll the value of one random affix within its range. Same affixes, new numbers.',
    respec: 'Re-spec: reroll ALL affixes into new ones (same count). A gamble for a better spread.',
  };
  hud.showForge = ({ entries, stamps, salvage }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal',
      `<h3>Workbench Forge</h3>
       <div class="sub">Pick an operation — one question at the item's tier. Correct: pay and forge. Miss: full refund, item untouched.
       &nbsp; You hold <b>${stamps}</b> Stamps · <b>${salvage}</b> Salvage</div>
       <div class="sub" style="line-height:1.5">
         <b style="color:var(--ink)">Reinforce</b> — Common → Rare, rolls 1 affix ·
         <b style="color:var(--ink)">Certify</b> — Rare → Magic, adds 1 more affix<br>
         <b style="color:var(--ink)">Recalibrate</b> — rerolls one affix's number ·
         <b style="color:var(--ink)">Re-spec</b> — rerolls all affixes into new ones
       </div>`);
    m.style.maxHeight = '78vh'; m.style.overflow = 'auto';
    if (!entries.length) m.appendChild(el('div', 'ad-affix', 'Nothing forgeable — equip or carry Stock/Rated/Certified gear.'));
    for (const en of entries){
      const rowEl = el('div', 'ad-slotrow', `<span class="ad-slotname">${en.item.slot}</span>` + hud.itemLine(en.item));
      const ops = el('div', '');
      ops.style.cssText = 'display:flex;gap:6px;margin:2px 0 8px 66px;flex-wrap:wrap';
      for (const op of en.ops){
        const b = el('button', 'ad-btn', `${op.label} <span style="color:var(--dim);font-size:11px">${op.cost.stamps}st ${op.cost.salvage}sv</span>`);
        b.title = FORGE_HELP[op.op] || '';
        b.style.padding = '5px 10px'; b.style.fontSize = '12px';
        if (!op.can){ b.disabled = true; b.style.opacity = '0.4'; }
        b.onclick = () => { wrap.remove(); resolve({ item: en.item, op: op.op }); };
        ops.appendChild(b);
      }
      m.appendChild(rowEl); m.appendChild(ops);
    }
    const row = el('div', 'ad-btnrow');
    const close = el('button', 'ad-btn primary', 'Leave the bench');
    close.onclick = () => { wrap.remove(); resolve(null); };
    row.appendChild(close); m.appendChild(row);
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- Supply Shack (Volts shop) ---
  // entries: [{item, price, sold, can}]; resolves index to buy | null
  hud.showShop = ({ entries, volts }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal',
      `<h3>Supply Shack</h3>
       <div class="sub">Gear only, paid in Volts. Stamps and Salvage are earned, never sold.
       Stock rotates every town visit. &nbsp; You hold <b>${volts}</b> Volts</div>`);
    m.style.maxHeight = '78vh'; m.style.overflow = 'auto';
    entries.forEach((en, i) => {
      const row = el('div', 'ad-slotrow', `<span class="ad-slotname">${en.item.slot}</span>` + hud.itemLine(en.item));
      if (en.sold){
        row.appendChild(el('span', 'ad-price', 'sold'));
        row.style.opacity = '0.45';
      } else {
        const b = el('button', 'ad-btn', `${en.price} V`);
        b.style.cssText = 'padding:4px 12px;font-size:12px;flex:none';
        if (!en.can){ b.disabled = true; b.style.opacity = '0.4'; b.title = 'Not enough Volts'; }
        b.onclick = () => { wrap.remove(); resolve(i); };
        row.appendChild(b);
      }
      m.appendChild(row);
    });
    const row = el('div', 'ad-btnrow');
    const close = el('button', 'ad-btn primary', 'Leave the counter');
    close.onclick = () => { wrap.remove(); resolve(null); };
    row.appendChild(close); m.appendChild(row);
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- Work Orders (quest board) ---
  // quests: [{type, need, done, claimed, reward:{volts}}]; resolves index to claim | null
  const QUEST_LABEL = { kills: 'Fault clearing', chests: 'Job-box recovery', answers: 'Code compliance' };
  const QUEST_DESC = {
    kills: n => `Put down ${n} fault-monsters in the realms`,
    chests: n => `Crack open ${n} job boxes`,
    answers: n => `Answer ${n} code questions correctly`,
  };
  hud.showQuests = ({ quests }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal', `<h3>Work Orders</h3>
      <div class="sub">Posted by the town — rewards paid in Volts. Claimed orders are re-posted on your next visit.</div>`);
    if (!quests.length) m.appendChild(el('div', 'ad-affix', 'The board is bare. Come back after some field work.'));
    quests.forEach((q, i) => {
      const pct = Math.round(100 * Math.min(1, q.done / q.need));
      const row = el('div', 'ad-slotrow',
        `<span class="ad-iname">${QUEST_LABEL[q.type] || q.type}<br>
         <span class="ad-affix">${(QUEST_DESC[q.type] || (n => `${n}`))(q.need)} · ${q.done}/${q.need}</span></span>
         <span class="ad-qbar"><i style="width:${pct}%"></i></span>
         <span class="ad-price">+${q.reward.volts} V</span>`);
      if (q.claimed){
        row.appendChild(el('span', 'ad-affix', 'claimed'));
        row.style.opacity = '0.45';
      } else if (q.done >= q.need){
        const b = el('button', 'ad-btn primary', 'Claim');
        b.style.cssText = 'padding:4px 12px;font-size:12px;flex:none';
        b.onclick = () => { wrap.remove(); resolve(i); };
        row.appendChild(b);
      }
      m.appendChild(row);
    });
    const row = el('div', 'ad-btnrow');
    const close = el('button', 'ad-btn primary', 'Step away');
    close.onclick = () => { wrap.remove(); resolve(null); };
    row.appendChild(close); m.appendChild(row);
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- Service Record (stats kiosk, read-only) ---
  hud.showStats = ({ profileStats, mastery, run }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const s = profileStats;
    const acc = s.qa ? ` (${Math.round(100 * s.qc / s.qa)}%)` : '';
    const m = el('div', 'ad-modal', `<h3>Service Record</h3>
      <div class="sub">The meter never lies.</div>
      <div class="ad-statgrid">
        <div class="ad-stathead">Career</div>
        <span>Kills <b>${s.kills}</b></span><span>Deaths <b>${s.deaths}</b></span>
        <span>Shrines certified <b>${s.shrines}</b></span><span>Trials passed <b>${s.trials}</b></span>
        <span>Seals stamped <b>${s.seals}</b></span><span>Bosses downed <b>${s.bosses}</b></span>
        <span>Questions answered <b>${s.qa}</b></span><span>Correct <b>${s.qc}${acc}</b></span>
        <div class="ad-stathead">Category mastery</div>
        ${Object.entries(mastery).map(([cat, pct]) =>
          `<span>${cat} <b>${Math.round(pct * 100)}%</b></span>`).join('')}
        <div class="ad-stathead">Current descent</div>
        <span>Class <b>${run.cls}</b></span><span>Level <b>${run.level}</b></span>
        <span>Realm <b>${run.realm}</b></span><span>Seals <b>${run.seals}/5</b></span>
        <span>Volts <b>${run.volts}</b></span><span>Stamps <b>${run.stamps}</b></span>
        <span>Salvage <b>${run.salvage}</b></span>
      </div>`);
    const row = el('div', 'ad-btnrow');
    const close = el('button', 'ad-btn primary', 'Close');
    close.onclick = () => { wrap.remove(); resolve(); };
    row.appendChild(close); m.appendChild(row);
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- License Board viewer ---
  hud.showBoard = ({ className, level, nodes }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal', `<h3>License Board — ${className} · Level ${level}</h3>
      <div class="sub">Nodes activate automatically at their level; gated nodes also need category mastery.</div>`);
    m.style.maxHeight = '78vh'; m.style.overflow = 'auto';
    const STAT_FX = /^\+\d+(% (dmg|AS)| (HP|armor))$/; // main.js fxLabel stat forms; anything else is a skill
    let nextMarked = false;
    for (const n of nodes.slice().sort((a, b) => a.lvl - b.lvl)){
      const isNext = !nextMarked && n.lvl > level; if (isNext) nextMarked = true;
      const skill = n.effect.split(', ').every(p => STAT_FX.test(p)) ? ''
        : '<span class="ad-cat" style="background:rgba(45,212,191,0.16);color:var(--teal);margin:0 6px 0 0">Skill</span>';
      const state = n.active ? '<span style="color:var(--green)">ACTIVE</span>'
        : n.gateBlocked ? `<span style="color:var(--amber)">needs ${n.gate.cat} ≥ ${Math.round(n.gate.pct * 100)}%</span>`
        : isNext ? `<span style="color:var(--amber)">next at Lv ${n.lvl}</span>`
        : `<span style="color:var(--dim)">Lv ${n.lvl}</span>`;
      const row = el('div', 'ad-slotrow',
        `${skill}<span class="ad-iname" style="${n.active ? '' : 'color:var(--dim)'}">${n.name}</span>
         <span class="ad-affix">${n.effect}</span><span style="font-size:11px;margin-left:8px">${state}</span>`);
      if (n.lvl <= level) row.style.borderLeft = '2px solid rgba(45,212,191,0.55)';
      m.appendChild(row);
    }
    const row = el('div', 'ad-btnrow');
    const close = el('button', 'ad-btn primary', 'Close');
    close.onclick = () => { wrap.remove(); resolve(); };
    row.appendChild(close); m.appendChild(row);
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- Field Manual: full-screen reference, page tabs on the left, content pane on the right ---
  // pages: [{id, title, html}]; first page selected initially. Resolves on Close.
  hud.showManual = (pages) => new Promise(resolve => {
    const wrap = el('div', 'ad-invfull ad-manfull');
    const inner = el('div', 'ad-manwrap');
    const tabs = el('div', 'ad-mantabs');
    const pane = el('div', 'ad-manpage');
    const body = el('div', 'ad-manbody');
    pane.appendChild(body);
    const tabEls = {};
    const show = (id) => {
      for (const pid in tabEls) tabEls[pid].classList.toggle('sel', pid === id);
      body.innerHTML = pages.find(p => p.id === id).html;
      pane.scrollTop = 0;
    };
    for (const p of pages){
      const t = el('button', 'ad-mantab', p.title);
      t.onclick = () => show(p.id);
      tabEls[p.id] = t;
      tabs.appendChild(t);
    }
    inner.append(tabs, pane);
    wrap.appendChild(inner);
    const close = el('button', 'ad-btn', 'Close');
    close.onclick = () => { wrap.remove(); resolve(); };
    wrap.appendChild(close);
    root.appendChild(wrap);
    show(pages[0].id);
  });

  // --- pause menu (Esc during play/hub) ---
  // Resolves 'resume' | 'bank' | 'settings' | 'quit'. Esc resolves 'resume'.
  hud.showPause = ({ bankLabel }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal', `<h3>Paused</h3><div class="sub">The grid waits. Esc resumes.</div>`);
    m.style.width = 'min(340px, 92vw)';
    const done = v => { window.removeEventListener('keydown', onEsc, true); wrap.remove(); resolve(v); };
    const onEsc = e => {
      if (e.key !== 'Escape') return;
      e.preventDefault(); e.stopPropagation();
      done('resume');
    };
    window.addEventListener('keydown', onEsc, true);
    const mk = (label, action, primary) => {
      const b = el('button', 'ad-btn' + (primary ? ' primary' : ''), label);
      b.style.cssText = 'display:block;width:100%;margin:6px 0;text-align:center';
      b.onclick = () => done(action);
      m.appendChild(b);
    };
    mk('Resume', 'resume', true);
    mk(`Bank: ${bankLabel} ⇄`, 'bank');
    mk('Settings', 'settings');
    mk('Quit to Main Menu', 'quit');
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- settings: key binds + audio + graphics ---
  // Mutates `binds` (and `audio` {vol, mute} / `gfx` {preset}, if given) in place while open; resolves when done. Caller persists.
  hud.showSettings = ({ binds, keyLabel, defaults, audio, gfx }) => new Promise(resolve => {
    const ACTION_LABELS = { a1: 'Ability 1', a2: 'Ability 2', a3: 'Ability 3', a4: 'Ability 4', a5: 'Ability 5', dodge: 'Dodge', interact: 'Interact' };
    const RESERVED = ['i', 'tab', 'escape', 'w', 'a', 's', 'd'];
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal', `<h3>Settings</h3>
      <div class="sub">Key binds: click an action, then press its new key — or a side/middle mouse button (M3/M4/M5).
      Fixed: WASD move · I inventory · Tab map · Esc menu.
      Picking a key already in use swaps the two binds.</div>`);
    let listening = null;
    const btns = {};
    const render = () => {
      for (const a in btns) btns[a].textContent = listening === a ? 'press a key…' : keyLabel(binds[a]);
    };
    for (const action in ACTION_LABELS){
      const row = el('div', 'ad-slotrow', `<span class="ad-iname">${ACTION_LABELS[action]}</span>`);
      const btn = el('button', 'ad-btn', '');
      btn.style.cssText = 'padding:4px 14px;font-size:12px;min-width:88px';
      btn.onclick = () => { listening = action; render(); };
      btns[action] = btn;
      row.appendChild(btn);
      m.appendChild(row);
    }
    const onKey = (e) => {
      if (!listening) return;
      e.preventDefault(); e.stopPropagation();
      const k = e.key.toLowerCase();
      if (k === 'escape' || RESERVED.includes(k)){ listening = null; render(); return; }
      for (const other in binds) if (binds[other] === k && other !== listening) binds[other] = binds[listening];
      binds[listening] = k;
      listening = null;
      render();
    };
    // mouse rebinding: middle m3 / back m4 / forward m5; LMB and RMB still operate the UI
    const onMouse = (e) => {
      if (!listening) return;
      const code = { 1: 'm3', 3: 'm4', 4: 'm5' }[e.button];
      if (!code) return;
      e.preventDefault(); e.stopPropagation();
      for (const other in binds) if (binds[other] === code && other !== listening) binds[other] = binds[listening];
      binds[listening] = code;
      listening = null;
      render();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('mousedown', onMouse, true);
    render();
    if (audio){
      m.appendChild(el('h3', '', 'Audio'));
      const arow = el('div', 'ad-slotrow', `<span class="ad-iname">Master Volume</span>`);
      const slider = document.createElement('input');
      slider.type = 'range'; slider.min = 0; slider.max = 100; slider.value = Math.round(audio.vol * 100);
      slider.style.cssText = 'flex:1;accent-color:var(--teal)';
      const pct = el('span', 'ad-affix', slider.value + '%');
      pct.style.cssText = 'width:38px;text-align:right';
      slider.oninput = () => {
        audio.vol = slider.value / 100;
        pct.textContent = slider.value + '%';
        if (audio.onChange) audio.onChange();
      };
      arow.append(slider, pct);
      m.appendChild(arow);
      const mrow = el('div', 'ad-slotrow', `<span class="ad-iname">Sound</span>`);
      const mbtn = el('button', 'ad-btn', audio.mute ? 'Muted' : 'On');
      mbtn.style.cssText = 'padding:4px 14px;font-size:12px;min-width:88px';
      mbtn.onclick = () => {
        audio.mute = !audio.mute;
        mbtn.textContent = audio.mute ? 'Muted' : 'On';
        if (audio.onChange) audio.onChange();
      };
      mrow.appendChild(mbtn);
      m.appendChild(mrow);
    }
    if (gfx){
      m.appendChild(el('h3', '', 'Graphics'));
      const grow = el('div', 'ad-slotrow', `<span class="ad-iname">Preset</span>`);
      const seg = el('div', '');
      seg.style.cssText = 'display:flex;gap:6px';
      const gbtns = {};
      const paint = () => {
        for (const id in gbtns){
          const on = id === gfx.preset;
          gbtns[id].style.background = on ? 'var(--teal)' : 'rgba(255,255,255,0.06)';
          gbtns[id].style.color = on ? '#04241f' : 'var(--ink)';
          gbtns[id].style.fontWeight = on ? '600' : '400';
        }
      };
      for (const p of gfx.presets){
        const b = el('button', 'ad-btn', p.label);
        b.style.cssText = 'padding:4px 12px;font-size:12px';
        b.onclick = () => { gfx.preset = p.id; paint(); if (gfx.onChange) gfx.onChange(); };
        gbtns[p.id] = b;
        seg.appendChild(b);
      }
      paint();
      grow.appendChild(seg);
      m.appendChild(grow);
    }
    const row = el('div', 'ad-btnrow');
    const reset = el('button', 'ad-btn', 'Reset defaults');
    reset.onclick = () => { Object.assign(binds, defaults); listening = null; render(); };
    const done = el('button', 'ad-btn primary', 'Done');
    done.onclick = () => { window.removeEventListener('keydown', onKey, true); window.removeEventListener('mousedown', onMouse, true); wrap.remove(); resolve(binds); };
    row.append(reset, done); m.appendChild(row);
    wrap.appendChild(m); root.appendChild(wrap);
  });

  // --- upload panel ---
  hud.showUpload = ({ onParse, templateCsv }) => new Promise(resolve => {
    const wrap = el('div', 'ad-modal-wrap');
    const m = el('div', 'ad-modal',
      `<h3>Upload question bank</h3>
       <div class="sub">CSV or JSON, arcade-shared schema. Min 5 valid rows; bad rows are skipped with reasons.</div>`);
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.csv,.json';
    input.style.margin = '10px 0';
    const report = el('div', 'ad-affix');
    m.append(input, report);
    const row = el('div', 'ad-btnrow');
    const tmpl = el('button', 'ad-btn', 'Download template');
    tmpl.onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([templateCsv], { type: 'text/csv' }));
      a.download = 'questions-template.csv'; a.click();
    };
    const cancel = el('button', 'ad-btn', 'Back');
    cancel.onclick = () => { wrap.remove(); resolve(false); };
    row.append(tmpl, cancel); m.appendChild(row);
    input.onchange = async () => {
      const f = input.files[0]; if (!f) return;
      const text = await f.text();
      const res = onParse(f.name, text);
      if (res.error){ report.innerHTML = `<span style="color:var(--red)">${res.error}</span>`; return; }
      const skipped = res.skipped.length
        ? `<br><span style="color:var(--amber)">Skipped ${res.skipped.length}:</span> ` +
          res.skipped.slice(0, 6).map(s => `row ${s.n} (${s.reason})`).join(', ') + (res.skipped.length > 6 ? '…' : '')
        : '';
      if (res.ok.length < 5){ report.innerHTML = `<span style="color:var(--red)">Only ${res.ok.length} valid rows — need at least 5.</span>${skipped}`; return; }
      report.innerHTML = `<span style="color:var(--green)">${res.ok.length} valid questions.</span>${skipped}`;
      const install = el('button', 'ad-btn primary', `Install ${res.ok.length} questions`);
      install.onclick = () => { wrap.remove(); resolve({ questions: res.ok, src: f.name }); };
      row.prepend(install);
    };
    wrap.appendChild(m); root.appendChild(wrap);
  });

  return hud;
}
