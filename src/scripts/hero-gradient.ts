/**
 * NASLOVNICA — animiran gradient (WebGL)
 *
 * Zvesta priredba shaderja iz generatorja https://gradients.juangarcia.ch/
 * (potrjene nastavitve: c1–c5, amount 0, speed 0.09, fx 3.2, fy 5.4).
 * Generator barva ravnino 1,5 × 1,5 (three.js, kamera fov 35° v točki (0; 0,5; 0,4),
 * pogled v izhodišče). Ker je amount = 0, je ravnina ploska, zato isti rezultat
 * izračunamo neposredno: za vsak slikovni element poiščemo presečišče žarka z ravnino.
 * Šum: 3D simpleks, Ian McEwan / Ashima Arts (licenca MIT).
 *
 * Varčevanje: izris v polovični ločljivosti (gradient je mehak), največ ~30 sličic/s,
 * premor v ozadju, en sam statični izris ob »zmanjšanem gibanju«.
 * Brez WebGL ostane statična slika (poster) pod platnom.
 */

const COLORS = ['#F5F2EE', '#EAE0D4', '#D8CABF', '#C9BDB4', '#B5C8D6'];
const SPEED = 0.09;
const FREQ: [number, number] = [3.2, 5.4];
const RENDER_SCALE = 0.5;
const MAX_SIDE = 1200;
const FRAME_MS = 1000 / 30;
const TIME_KEY = 'naslovnica-cas';

const VERT = `
attribute vec2 aPos;
varying vec2 vNdc;
void main(){ vNdc = aPos; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uFrequency;
uniform float uTime;
uniform float uSpeed;
uniform float uAspect;
uniform vec3 uColor[5];
varying vec2 vNdc;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main(){
  // Kamera generatorja: položaj (0, 0.5, 0.4), pogled v izhodišče, navpični fov 35°
  vec3 cam = vec3(0.0, 0.5, 0.4);
  vec3 fwd = normalize(-cam);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  float t = tan(radians(17.5));
  vec3 dir = normalize(fwd + vNdc.x * t * uAspect * right + vNdc.y * t * up);
  vec3 hit = cam + dir * (-cam.y / dir.y);
  // UV ravnine 1.5 × 1.5, zasukane za -90° okoli osi X
  vec2 uv = vec2(hit.x / 1.5 + 0.5, -hit.z / 1.5 + 0.5);

  vec2 noiseCoord = uv * uFrequency;
  vec3 color = uColor[4];
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float noiseFlow = 0.0002 + fi * 0.05;
    float noiseSpeed = 0.0001 + fi * 0.03;
    float noiseSeed = 1.0 + fi * 10.0;
    vec2 noiseFreq = vec2(0.3, 0.6);
    float noiseCeiling = 0.6 + fi * 0.08;
    float n = smoothstep(0.1, noiseCeiling, snoise(vec3(
      noiseCoord.x * noiseFreq.x + uTime * noiseFlow,
      noiseCoord.y * noiseFreq.y,
      uTime * noiseSpeed + noiseSeed)));
    color = mix(color, uColor[i], n);
  }
  gl_FragColor = vec4(color, 1.0);
}`;

/** Kot v generatorju (three.js): barve se pretvorijo v linearni prostor in se izrišejo brez ponovnega kodiranja. */
function toLinear(hex: string): number[] {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return v.map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
}

export interface HeroGradient {
  pause(): void;
  resume(): void;
}

export function initHeroGradient(canvas: HTMLCanvasElement): HeroGradient | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
  } catch {
    gl = null;
  }
  if (!gl) return null; // ostane statična slika

  const compile = (type: number, src: string) => {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // En trikotnik čez cel zaslon
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uAspect = gl.getUniformLocation(prog, 'uAspect');
  gl.uniform2f(gl.getUniformLocation(prog, 'uFrequency'), FREQ[0], FREQ[1]);
  gl.uniform1f(gl.getUniformLocation(prog, 'uSpeed'), SPEED);
  gl.uniform3fv(gl.getUniformLocation(prog, 'uColor'), new Float32Array(COLORS.flatMap(toLinear)));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Čas se nadaljuje med obiski v istem zavihku — atmosfera ne skoči nazaj
  let offset = 0;
  try { offset = Number(sessionStorage.getItem(TIME_KEY)) || 0; } catch { /* brez shrambe */ }
  let start = performance.now();
  let raf = 0;
  let last = -Infinity;
  let running = false;
  let paused = false;

  const elapsed = () => offset + (performance.now() - start) / 1000;

  const resize = () => {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    const k = Math.min(RENDER_SCALE, MAX_SIDE / Math.max(w, h));
    canvas.width = Math.max(2, Math.round(w * k));
    canvas.height = Math.max(2, Math.round(h * k));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform1f(uAspect, w / h);
  };

  const draw = (t: number) => {
    gl!.uniform1f(uTime, t);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    if (!canvas.classList.contains('is-live')) canvas.classList.add('is-live');
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME_MS) return;
    last = now;
    draw(elapsed());
  };

  const play = () => {
    if (running || paused || reduce.matches || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const sync = () => {
    stop();
    resize();
    draw(elapsed());
    play();
  };

  resize();
  draw(elapsed());
  play();

  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(sync, 120);
  });
  reduce.addEventListener?.('change', sync);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      offset = elapsed();
      stop();
    } else {
      start = performance.now();
      play();
    }
  });
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(TIME_KEY, String(elapsed())); } catch { /* brez shrambe */ }
  });
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    canvas.classList.remove('is-live'); // pokaže se statična slika
  });

  return {
    pause() {
      paused = true;
      offset = elapsed();
      start = performance.now();
      stop();
    },
    resume() {
      paused = false;
      start = performance.now();
      play();
    },
  };
}
