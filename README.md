# ⚡ Arc Descent

**Play it: https://john-holik.github.io/arc-descent/** · V1.01

A 3D top-down action dungeon crawler (Path of Exile DNA, drastically simplified) that teaches electrical theory. Part of the [ElectriAI](https://youtube.electriai.com) learning-games family.

The Grid failed across five realms. A journeyman electrician descends, clears fault-monsters, and re-energizes each realm's Substation Seal by passing question-streak Certification Trials. **Questions are the economy**: shrines, gear identification, lockout/tagout doors, boss Inspection Breaks, and realm-exit Trials all pay in Permit Stamps — and reaching 60% mastery in a realm's category makes that realm's gear CERTIFIED (+10%).

## Features
- **5 realms**, each with its own roster, hazards, boss, and question category (circuits · conductors · grounding · distribution · overcurrent protection)
- **3 classes** — Lineman (melee bruiser), Tester (ranged burst), Foreman (summoner) — 5 abilities each + per-class License Boards
- **Terminal Town** hub: forge, shop, quest board, and **The Abyss**, an endless permadeath mode with a depth leaderboard
- **Multiple save slots**, each pinned to its own question bank
- **Two bundled banks** (electrical theory, 190 questions · ML/RAG study track, 151 questions) — or upload your own via CSV/JSON
- Loot with rarities (Common → Rare → Magic → MasterCraft), a question-gated forge, spaced-repetition question routing, and Quizlet-style per-question mastery
- In-game Field Manual, rebindable keys (side mouse buttons supported), graphics presets

## Run locally
Static ES modules — needs any local server (`file://` won't load modules):

```
python serve.py     # http://localhost:8137 (or use start.bat on Windows)
```

Only external dependency: Three.js 0.170.0 via CDN importmap. Zero asset files — flat-shaded primitives, canvas sprites, WebAudio beeps.

## Tests
```
node _logic-test.js   # 58k+ checks over the pure core (questions, loot, dungeon gen, combat math, saves)
```

## Repo layout
- `src/core/` — pure game logic (node-importable, no DOM)
- `src/game/` — Three.js + DOM presentation
- `content/` — question banks (CSV sources)
- `templates/` — CSV template for custom question uploads

This repo is a published snapshot of the working project.
