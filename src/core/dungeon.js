// Floor generation: cell-walk room graphs carved into a tile grid.
// Pure data out — the renderer builds meshes from this. Tile units.
// 0 = void, 1 = floor. Walls are derived by the renderer (floor-adjacent void).

import { rngInt, rngPick, rngShuffle } from './rng.js';

const CELL = 16;          // tile span per cell
const GRID = 7;           // cell grid is GRID x GRID
const ROOM_MIN = 9, ROOM_MAX = 13;
const CORRIDOR_W = 3;

export function genFloor(rng, opts){
  const { realm = 1, floorIdx = 0, roomCount = 10, shrineCount = 2, loto = false, boss = false } = opts || {};
  const W = GRID * CELL + 2, H = GRID * CELL + 2;
  const tiles = new Uint8Array(W * H);
  const at = (x, y) => tiles[y * W + x];
  const set = (x, y) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = 1; };

  // --- cell walk: main path then branches ---
  const key = (cx, cy) => cx + ',' + cy;
  const cells = new Map(); // key -> {cx, cy, order, main}
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let cur = { cx: 3, cy: GRID - 1 }; // enter from the bottom
  cells.set(key(cur.cx, cur.cy), { ...cur, order: 0, main: true });
  const mainLen = Math.max(5, Math.round(roomCount * 0.6));
  const path = [cur];
  while (path.length < mainLen){
    const opts2 = dirs
      .map(([dx, dy]) => ({ cx: cur.cx + dx, cy: cur.cy + dy }))
      .filter(c => c.cx >= 0 && c.cy >= 0 && c.cx < GRID && c.cy < GRID && !cells.has(key(c.cx, c.cy)));
    if (!opts2.length){
      // backtrack
      const idx = path.indexOf(cur);
      if (idx <= 0) break;
      cur = path[idx - 1];
      continue;
    }
    cur = rngPick(rng, opts2);
    cells.set(key(cur.cx, cur.cy), { ...cur, order: path.length, main: true });
    path.push(cur);
  }
  const edges = []; // [{a:key, b:key, loto?}]
  for (let i = 1; i < path.length; i++) edges.push({ a: key(path[i - 1].cx, path[i - 1].cy), b: key(path[i].cx, path[i].cy) });

  // branches
  let guard = 200;
  while (cells.size < roomCount && guard-- > 0){
    const host = rngPick(rng, [...cells.values()]);
    const free = dirs
      .map(([dx, dy]) => ({ cx: host.cx + dx, cy: host.cy + dy }))
      .filter(c => c.cx >= 0 && c.cy >= 0 && c.cx < GRID && c.cy < GRID && !cells.has(key(c.cx, c.cy)));
    if (!free.length) continue;
    const c = rngPick(rng, free);
    cells.set(key(c.cx, c.cy), { ...c, order: -1, main: false });
    edges.push({ a: key(host.cx, host.cy), b: key(c.cx, c.cy) });
  }

  // --- rooms from cells ---
  const rooms = [];
  for (const c of cells.values()){
    const rw = rngInt(rng, ROOM_MIN, ROOM_MAX), rh = rngInt(rng, ROOM_MIN, ROOM_MAX);
    const baseX = 1 + c.cx * CELL, baseY = 1 + c.cy * CELL;
    const x = baseX + Math.floor((CELL - rw) / 2), y = baseY + Math.floor((CELL - rh) / 2);
    rooms.push({
      id: rooms.length, cellKey: key(c.cx, c.cy), cx: x + Math.floor(rw / 2), cy: y + Math.floor(rh / 2),
      x, y, w: rw, h: rh, order: c.order, main: c.main, type: 'combat', doors: [],
    });
  }
  const byCell = new Map(rooms.map(r => [r.cellKey, r]));

  // --- carve rooms + corridors ---
  for (const r of rooms) for (let yy = r.y; yy < r.y + r.h; yy++) for (let xx = r.x; xx < r.x + r.w; xx++) set(xx, yy);
  const corridors = [];
  const carveCorridor = (ra, rb, isLoto) => {
    // L-shaped 3-wide: horizontal from ra center, then vertical to rb center
    const half = Math.floor(CORRIDOR_W / 2);
    const x0 = ra.cx, y0 = ra.cy, x1 = rb.cx, y1 = rb.cy;
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let o = -half; o <= half; o++) set(x, y0 + o);
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let o = -half; o <= half; o++) set(x1 + o, y);
    const door = { x: Math.round((x0 + x1) / 2), y: Math.round((y0 + y1) / 2), rooms: [ra.id, rb.id], loto: !!isLoto };
    corridors.push(door);
    ra.doors.push(door); rb.doors.push(door);
  };
  for (const e of edges) carveCorridor(byCell.get(e.a), byCell.get(e.b), false);

  // --- room typing ---
  const mainRooms = rooms.filter(r => r.main).sort((a, b) => a.order - b.order);
  const startRoom = mainRooms[0];
  const lastRoom = mainRooms[mainRooms.length - 1];
  startRoom.type = 'start';
  lastRoom.type = boss ? 'boss' : 'exit';
  const degree = r => r.doors.length;
  const leaves = rooms.filter(r => r !== startRoom && r !== lastRoom && degree(r) === 1);
  const shrinePool = rngShuffle(rng, leaves.length ? leaves : rooms.filter(r => r !== startRoom && r !== lastRoom));
  let placedShrines = 0;
  for (const r of shrinePool){
    if (placedShrines >= shrineCount) break;
    if (r.type !== 'combat') continue;
    r.type = 'shrine'; placedShrines++;
  }
  const treasureCand = shrinePool.find(r => r.type === 'combat');
  if (treasureCand) treasureCand.type = 'treasure';
  // elite room: mid-late on the main path
  const eliteRoom = mainRooms[Math.max(1, mainRooms.length - 2)];
  if (eliteRoom && eliteRoom.type === 'combat') eliteRoom.type = 'elite';

  // --- LOTO shortcut: connect an early main room to a late one ---
  // The door must sit ON the L-shaped corridor (the naive center-to-center midpoint
  // usually lands in the void) at a cross-section walled on both sides, and it
  // blocks the corridor's full 3-tile width.
  let lotoDoor = null;
  if (loto && mainRooms.length >= 5){
    const a = mainRooms[1], b = mainRooms[mainRooms.length - 2];
    carveCorridor(a, b, true);
    const door = corridors[corridors.length - 1];
    const x0 = a.cx, y0 = a.cy, x1 = b.cx, y1 = b.cy;
    const cands = [];
    for (let x = Math.min(x0, x1) + 1; x <= Math.max(x0, x1) - 1; x++)
      if (at(x, y0 - 2) === 0 && at(x, y0 + 2) === 0)
        cands.push({ x, y: y0, horiz: true, mid: Math.abs(x - (x0 + x1) / 2) });
    for (let y = Math.min(y0, y1) + 1; y <= Math.max(y0, y1) - 1; y++)
      if (at(x1 - 2, y) === 0 && at(x1 + 2, y) === 0)
        cands.push({ x: x1, y, horiz: false, mid: Math.abs(y - (y0 + y1) / 2) });
    if (cands.length){
      cands.sort((p, q) => p.mid - q.mid);
      const c = cands[0];
      door.x = c.x; door.y = c.y; door.horiz = c.horiz;
      door.tiles = c.horiz
        ? [{ x: c.x, y: c.y - 1 }, { x: c.x, y: c.y }, { x: c.x, y: c.y + 1 }]
        : [{ x: c.x - 1, y: c.y }, { x: c.x, y: c.y }, { x: c.x + 1, y: c.y }];
      lotoDoor = door;
    }
    // no clean cross-section: the shortcut stays carved but open (no door)
  }

  // --- spawn packs (composition decided by balance/game layer) ---
  const packs = [];
  for (const r of rooms){
    if (r.type === 'combat' || r.type === 'elite' || r.type === 'treasure'){
      const n = r.type === 'treasure' ? rngInt(rng, 1, 2) : rngInt(rng, 2, 4) + (floorIdx > 0 ? 1 : 0);
      const slots = [];
      for (let i = 0; i < n; i++) slots.push({ kind: rng() < 0.25 && i > 0 ? 'special' : 'trash' });
      if (r.type === 'elite') slots.push({ kind: 'elite' });
      packs.push({
        room: r.id,
        slots: slots.map(s => ({
          ...s,
          x: rngInt(rng, r.x + 2, r.x + r.w - 3),
          y: rngInt(rng, r.y + 2, r.y + r.h - 3),
        })),
      });
    }
  }

  // --- environmental hazard patches (realm config; blobs inside combat rooms) ---
  const hazards = [];
  const hz = opts.hazard;
  if (hz){
    const candRooms = rngShuffle(rng, rooms.filter(r => r.type === 'combat' || r.type === 'elite'));
    for (let p = 0; p < hz.patches && p < candRooms.length; p++){
      const r = candRooms[p];
      const size = rngInt(rng, hz.size[0], hz.size[1]);
      const seen = new Set();
      let px = rngInt(rng, r.x + 2, r.x + r.w - 3), pz = rngInt(rng, r.y + 2, r.y + r.h - 3);
      const cells = [];
      let guard2 = size * 6;
      while (cells.length < size && guard2-- > 0){
        const k = px + ',' + pz;
        if (!seen.has(k) && at(px, pz) === 1 && px > r.x && pz > r.y && px < r.x + r.w - 1 && pz < r.y + r.h - 1){
          seen.add(k); cells.push({ x: px, z: pz });
        }
        const [dx, dz] = rngPick(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
        px += dx; pz += dz;
        if (px <= r.x || pz <= r.y || px >= r.x + r.w - 1 || pz >= r.y + r.h - 1){ px = r.cx; pz = r.cy; }
      }
      if (cells.length >= 3) hazards.push({ id: p, kind: hz.kind, room: r.id, tiles: cells });
    }
  }

  return {
    realm, floorIdx, w: W, h: H, tiles, rooms, corridors, packs, lotoDoor, hazards,
    start: { x: startRoom.cx, y: startRoom.cy },
    exit: lastRoom.type === 'exit' ? { x: lastRoom.cx, y: lastRoom.cy } : null,
    bossRoom: boss ? lastRoom.id : null,
  };
}

// Reachability check (used by tests and as a generation invariant).
export function allRoomsReachable(floor){
  const { w, h, tiles, rooms, start } = floor;
  const seen = new Uint8Array(w * h);
  const qx = [start.x], qy = [start.y];
  seen[start.y * w + start.x] = 1;
  while (qx.length){
    const x = qx.pop(), y = qy.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const i = ny * w + nx;
      if (!seen[i] && tiles[i] === 1){ seen[i] = 1; qx.push(nx); qy.push(ny); }
    }
  }
  return rooms.every(r => seen[r.cy * w + r.cx] === 1);
}
