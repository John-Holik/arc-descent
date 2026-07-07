// Seeded RNG + noise. Pure, no imports.

export function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s){
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

export const rngInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
export const rngPick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
export function rngShuffle(rng, arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function rngWeighted(rng, pairs){ // pairs: [[value, weight], ...]
  let total = 0;
  for (const [, w] of pairs) total += w;
  let r = rng() * total;
  for (const [v, w] of pairs){ r -= w; if (r <= 0) return v; }
  return pairs[pairs.length - 1][0];
}

// 2D value noise on integer lattice, smoothed. For terrain displacement.
export function makeValueNoise2D(seed){
  const lattice = (x, y) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2246822519) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const fade = t => t * t * (3 - 2 * t);
  return function noise(x, y){
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const tx = fade(x - x0), ty = fade(y - y0);
    const a = lattice(x0, y0), b = lattice(x0 + 1, y0);
    const c = lattice(x0, y0 + 1), d = lattice(x0 + 1, y0 + 1);
    return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
  };
}
