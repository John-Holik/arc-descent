// Input (WASD + click-to-move + ability keys) and the fixed-pitch follow camera.

import * as THREE from 'three';

export function makeCameraRig(camera, { pitchDeg = 52, dist = 22, lerp = 4, minDist = 14, maxDist = 34 } = {}){
  let d = dist;
  let pitch = pitchDeg * Math.PI / 180;
  const baseDist = dist, basePitch = pitchDeg;
  const offset = new THREE.Vector3();
  const setOffset = () => offset.set(0, Math.sin(pitch) * d, Math.cos(pitch) * d);
  setOffset();
  const goal = new THREE.Vector3();
  return {
    snap(target){
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
    },
    update(target, dt){
      goal.copy(target).add(offset);
      camera.position.lerp(goal, Math.min(1, lerp * dt));
      camera.lookAt(camera.position.x - offset.x, camera.position.y - offset.y, camera.position.z - offset.z);
    },
    // scroll zoom: distance plus a mild pitch shift (closer = flatter perspective,
    // farther = more top-down); passes exactly through the canon pitch at base dist
    zoom(deltaY){
      d = Math.max(minDist, Math.min(maxDist, d + deltaY * 0.012));
      const t = (d - baseDist) / (maxDist - minDist);
      pitch = (basePitch + t * 12) * Math.PI / 180;
      setOffset();
    },
  };
}

// binds: rebindable action -> key (lowercase e.key) or mouse pseudo-code ('m3' middle,
// 'm4' back, 'm5' forward — LMB/RMB stay move/attack). Movement (WASD), I, Tab, Esc stay fixed.
export function makeControls(dom, camera, binds = { a1: '1', a2: '2', a3: '3', dodge: ' ', interact: 'e' }){
  const keys = {};
  const state = {
    move: new THREE.Vector3(),      // WASD direction, world XZ
    clickTarget: null,              // click-to-move destination {x, z} | null
    aim: new THREE.Vector3(1, 0, 0),// last aim direction (toward mouse)
    pressed: {},                    // one-shot ability presses this frame
    enabled: true,
  };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  let mouseEvent = null;

  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    keys[k] = true; // before the repeat gate: OS key-repeat re-registers keys held across a reset()
    if (k === ' ') e.preventDefault(); // never scroll the page
    if (e.repeat) return;
    for (const action in binds) if (binds[action] === k) state.pressed[action] = true;
    if (k === 'i') state.pressed.inventory = true;
    if (k === 'tab'){ state.pressed.map = true; e.preventDefault(); }
    if (k === 'escape') state.pressed.esc = true;
  });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  // bindable mouse buttons → pseudo-codes, mirroring keydown (pressed flags are consumed by main during play)
  window.addEventListener('mousedown', e => {
    const code = { 1: 'm3', 3: 'm4', 4: 'm5' }[e.button];
    if (!code) return;
    e.preventDefault(); // middle: no autoscroll; side: no history navigation
    for (const action in binds) if (binds[action] === code) state.pressed[action] = true;
  });
  // side buttons (back/forward) must never navigate the browser while the game is open
  window.addEventListener('mouseup', e => { if (e.button === 3 || e.button === 4) e.preventDefault(); });
  window.addEventListener('auxclick', e => { if (e.button === 3 || e.button === 4) e.preventDefault(); });
  window.addEventListener('pointerup', e => { if (e.button === 3 || e.button === 4) e.preventDefault(); });

  dom.addEventListener('pointermove', e => { mouseEvent = e; });
  dom.addEventListener('pointerdown', e => {
    if (!state.enabled) return;
    mouseEvent = e;
    const p = groundPoint(e);
    if (!p) return;
    if (e.button === 0) state.clickTarget = { x: p.x, z: p.z };
    if (e.button === 2) state.rmbHeld = true;
  });
  window.addEventListener('pointerup', e => { if (e.button === 2) state.rmbHeld = false; });
  dom.addEventListener('contextmenu', e => e.preventDefault());

  function groundPoint(e){
    const r = dom.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.ray.intersectPlane(ground, hit) ? hit : null;
  }

  return {
    state,
    keys,
    update(playerPos){
      // WASD overrides click-to-move
      const mx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
      const mz = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
      if (mx || mz){
        state.move.set(mx, 0, mz).normalize();
        state.clickTarget = null;
      } else if (state.clickTarget){
        const dx = state.clickTarget.x - playerPos.x, dz = state.clickTarget.z - playerPos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.35){ state.clickTarget = null; state.move.set(0, 0, 0); }
        else state.move.set(dx / d, 0, dz / d);
      } else {
        state.move.set(0, 0, 0);
      }
      // aim toward mouse (and remember the cursor's ground point for placed abilities)
      if (mouseEvent){
        const p = groundPoint(mouseEvent);
        if (p){
          state.cursor = { x: p.x, z: p.z };
          const ax = p.x - playerPos.x, az = p.z - playerPos.z;
          const d = Math.hypot(ax, az);
          if (d > 0.01) state.aim.set(ax / d, 0, az / d);
        }
      }
    },
    consumePressed(){
      const p = state.pressed;
      state.pressed = {};
      return p;
    },
    stop(){ state.clickTarget = null; state.move.set(0, 0, 0); },
    // full input reset (modal close): a key released while a modal was open must not keep moving us
    reset(){
      for (const k in keys) keys[k] = false;
      state.pressed = {};
      state.rmbHeld = false;
      this.stop();
    },
  };
}
