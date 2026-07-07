// Pooled particles, floating damage numbers, billboard health bars, WebAudio beeps.

import * as THREE from 'three';

/* ---- particle pool (one Points object, recycled slots) ---- */
const MAX_P = 2000;

export function makeFx(scene){
  const pos = new Float32Array(MAX_P * 3);
  const col = new Float32Array(MAX_P * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  // slot state
  const vel = new Float32Array(MAX_P * 3);
  const life = new Float32Array(MAX_P);   // remaining
  const ttl = new Float32Array(MAX_P);    // total
  const grav = new Float32Array(MAX_P);
  let cursor = 0;

  function emit(p, c, v, lifeSec, g = 0){
    const i = cursor; cursor = (cursor + 1) % MAX_P;
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    vel[i * 3] = v.x; vel[i * 3 + 1] = v.y; vel[i * 3 + 2] = v.z;
    life[i] = ttl[i] = lifeSec; grav[i] = g;
  }

  const tmpC = new THREE.Color();
  const fx = {
    quality: 1, // particle-count multiplier, set by the graphics preset
    burst(p, colorHex, n = 14, speed = 5, lifeSec = 0.5, up = 2){
      tmpC.set(colorHex);
      n = Math.max(1, Math.round(n * fx.quality));
      for (let i = 0; i < n; i++){
        const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.6);
        emit(p, tmpC, { x: Math.cos(a) * s, y: up * (0.5 + Math.random()), z: Math.sin(a) * s }, lifeSec * (0.6 + Math.random() * 0.8), -9);
      }
    },
    fountain(p, colorHex, n = 8, lifeSec = 0.9){
      tmpC.set(colorHex);
      n = Math.max(1, Math.round(n * fx.quality));
      for (let i = 0; i < n; i++)
        emit(p, tmpC, { x: (Math.random() - 0.5) * 1.5, y: 3 + Math.random() * 3, z: (Math.random() - 0.5) * 1.5 }, lifeSec, -6);
    },
    // dash wind: pale streaks streaming back opposite the dash direction
    wind(p, dirRad, n = 3){
      tmpC.set(0xdfe9f2);
      n = Math.max(1, Math.round(n * fx.quality));
      for (let i = 0; i < n; i++){
        const back = dirRad + Math.PI + (Math.random() - 0.5) * 0.7;
        const s = 3.5 + Math.random() * 2.5;
        emit(
          { x: p.x + (Math.random() - 0.5) * 0.5, y: 0.4 + Math.random() * 0.9, z: p.z + (Math.random() - 0.5) * 0.5 },
          tmpC, { x: Math.cos(back) * s, y: 0.4 + Math.random() * 0.8, z: Math.sin(back) * s },
          0.25 + Math.random() * 0.2, 0
        );
      }
    },
    // ambient realm weather: emitterFn called each frame with dt to drip particles
    ambient: null,
    setAmbient(cfg){ // {rate, area, y, vel:{x,y,z}, colors:[hex], life, size?}
      fx.ambient = cfg ? { ...cfg, acc: 0 } : null;
    },
    update(dt, center){
      // ambient drip
      const amb = fx.ambient;
      if (amb && center){
        amb.acc += dt * amb.rate * fx.quality;
        while (amb.acc >= 1){
          amb.acc -= 1;
          tmpC.set(amb.colors[(Math.random() * amb.colors.length) | 0]);
          emit(
            { x: center.x + (Math.random() - 0.5) * amb.area, y: amb.y + Math.random() * 2, z: center.z + (Math.random() - 0.5) * amb.area },
            tmpC, { x: amb.vel.x, y: amb.vel.y, z: amb.vel.z }, amb.life, 0
          );
        }
      }
      let alive = 0;
      for (let i = 0; i < MAX_P; i++){
        if (life[i] <= 0) continue;
        life[i] -= dt;
        if (life[i] <= 0){ pos[i * 3 + 1] = -999; continue; }
        alive++;
        vel[i * 3 + 1] += grav[i] * dt;
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      mat.visible = alive > 0 || !!fx.ambient;
    },
  };
  return fx;
}

/* ---- floating damage numbers (canvas-texture sprites, pooled) ---- */
export function makeDamageNumbers(scene){
  const pool = [];
  function makeSprite(){
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 64;
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(2.4, 1.2, 1);
    spr.visible = false;
    scene.add(spr);
    return { spr, canvas, tex, t: 0, ttl: 0, vy: 0 };
  }
  return {
    spawn(p, text, color = '#ffffff', big = false){
      let d = pool.find(x => !x.spr.visible);
      if (!d){ d = makeSprite(); pool.push(d); }
      const ctx = d.canvas.getContext('2d');
      ctx.clearRect(0, 0, 128, 64);
      ctx.font = `bold ${big ? 40 : 30}px Segoe UI, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.strokeText(text, 64, 32);
      ctx.fillStyle = color;
      ctx.fillText(text, 64, 32);
      d.tex.needsUpdate = true;
      d.spr.position.set(p.x + (Math.random() - 0.5) * 0.6, p.y + 1.8, p.z);
      d.spr.material.opacity = 1;
      d.spr.visible = true;
      d.t = 0; d.ttl = big ? 1.0 : 0.7; d.vy = big ? 2.6 : 2.0;
      d.spr.scale.set(big ? 3.4 : 2.4, big ? 1.7 : 1.2, 1);
    },
    update(dt){
      for (const d of pool){
        if (!d.spr.visible) continue;
        d.t += dt;
        if (d.t >= d.ttl){ d.spr.visible = false; continue; }
        d.spr.position.y += d.vy * dt;
        d.spr.material.opacity = 1 - (d.t / d.ttl) ** 2;
      }
    },
  };
}

/* ---- billboard health bars ---- */
export function makeHealthBar(parent, width = 1.6, yOff = 2.6){
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 8;
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  spr.scale.set(width, width / 8, 1);
  spr.position.y = yOff;
  parent.add(spr);
  const ctx = canvas.getContext('2d');
  return {
    set(frac, color = '#e5484d'){
      frac = Math.max(0, Math.min(1, frac));
      ctx.clearRect(0, 0, 64, 8);
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, 64, 8);
      ctx.fillStyle = color; ctx.fillRect(1, 1, 62 * frac, 6);
      tex.needsUpdate = true;
      spr.visible = frac < 1;
    },
    show(v){ spr.visible = v; },
    dispose(){ parent.remove(spr); tex.dispose(); spr.material.dispose(); },
  };
}

/* ---- WebAudio beeps (family style) ---- */
export const Snd = {
  ctx: null, muted: false, volume: 1, // master volume 0..1, set from Settings
  ensure(){
    if (!this.ctx){ try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e){} }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  beep(f0, dur, type = 'sine', vol = 0.13, f1){
    if (this.muted || this.volume <= 0) return;
    this.ensure(); if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol * this.volume, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  hit(){ this.beep(220, 0.08, 'square', 0.10, 140); },
  hurt(){ this.beep(140, 0.15, 'sawtooth', 0.12, 80); },
  kill(){ this.beep(330, 0.18, 'square', 0.11, 110); },
  pickup(){ this.beep(660, 0.09, 'sine', 0.10, 990); },
  correct(){ this.beep(523, 0.10, 'sine', 0.12, 784); this.beep(784, 0.16, 'sine', 0.10); },
  wrong(){ this.beep(196, 0.22, 'sawtooth', 0.11, 130); },
  levelup(){ this.beep(392, 0.12, 'sine', 0.12, 523); this.beep(659, 0.22, 'sine', 0.11, 880); },
  seal(){ this.beep(262, 0.3, 'sine', 0.12, 1047); },
  dodge(){ this.beep(880, 0.05, 'sine', 0.07, 1200); },
};
