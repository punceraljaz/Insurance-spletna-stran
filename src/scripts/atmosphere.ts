/**
 * Scroll-reactive warm atmospheric background — audience pages only.
 * Continuously interpolates CSS custom properties and SVG form position
 * based on scroll progress between sections. No libraries required.
 * Respects prefers-reduced-motion.
 */

interface RGB { r: number; g: number; b: number }

interface AtmoState {
  c1: string; c2: string; c3: string; ca: string;
  fx: number; fy: number; fs: number; fo: number;
}

// One atmospheric state per major section (in page order)
const SECTION_STATES: Record<string, AtmoState> = {
  // A — category cards: warm champagne/pearl editorial atmosphere
  zavarovanja: {
    c1: '#F5F2EE', c2: '#E6DDD4', c3: '#C9BDB4', ca: '#B5C8D6',
    fx: 65, fy: 30, fs: 1.00, fo: 0.72,
  },
  // B — about: cool silver mist, form recedes and moves left
  'o-meni': {
    c1: '#EEF1F5', c2: '#D2DCE8', c3: '#BEC9D6', ca: '#C2D0DC',
    fx: 22, fy: 54, fs: 0.78, fo: 0.32,
  },
  // C — approach: neutral pearl, form rises upper right
  'nacin-dela': {
    c1: '#F0EEF0', c2: '#D8D8DC', c3: '#C2C8D0', ca: '#B8C6D0',
    fx: 60, fy: 22, fs: 0.68, fo: 0.20,
  },
  // D — intake/form: silver-blue, subtle sculptural suggestion
  pregled: {
    c1: '#EBF1F6', c2: '#C8D8E8', c3: '#ABBCC9', ca: '#B2C4D2',
    fx: 56, fy: 30, fs: 0.74, fo: 0.22,
  },
  // E — partners: light pearl, form nearly gone, quiet
  partnerji: {
    c1: '#F2F0EC', c2: '#E0D8D0', c3: '#C4BCB4', ca: '#CDD5DC',
    fx: 48, fy: 70, fs: 0.55, fo: 0.10,
  },
  // F — final CTA: blue-grey calm
  'naslednji-korak': {
    c1: '#E8F0F5', c2: '#C4D4E0', c3: '#A8BBC8', ca: '#CCD5DC',
    fx: 40, fy: 44, fs: 0.62, fo: 0.14,
  },
};

const ORDER = [
  'zavarovanja', 'o-meni', 'nacin-dela',
  'pregled', 'partnerji', 'naslednji-korak',
];

function parseHex(h: string): RGB {
  const n = parseInt(h.slice(1), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function blendRGB(a: RGB, b: RGB, t: number): string {
  return `rgb(${Math.round(lerp(a.r, b.r, t))} ${Math.round(lerp(a.g, b.g, t))} ${Math.round(lerp(a.b, b.b, t))})`;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

export function initAtmosphere(): void {
  const canvas = document.querySelector<HTMLElement>('.atmosphere__warm');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Collect only sections present in this page
  const sections: Array<{ el: HTMLElement; state: AtmoState }> = [];
  for (const id of ORDER) {
    const el = document.getElementById(id);
    if (el && SECTION_STATES[id]) sections.push({ el, state: SECTION_STATES[id] });
  }
  if (sections.length === 0) return;

  // Pre-parse colors
  const parsed = sections.map(s => ({
    c1: parseHex(s.state.c1), c2: parseHex(s.state.c2),
    c3: parseHex(s.state.c3), ca: parseHex(s.state.ca),
    fx: s.state.fx, fy: s.state.fy, fs: s.state.fs, fo: s.state.fo,
  }));

  let rafId = 0;
  let lastProgress = -99;

  function measure(): { idx: number; t: number } {
    const probe = window.scrollY + window.innerHeight * 0.45;
    for (let i = sections.length - 1; i >= 0; i--) {
      const top = sections[i].el.getBoundingClientRect().top + window.scrollY;
      if (probe >= top) {
        if (i === sections.length - 1) return { idx: i, t: 1 };
        const nextTop = sections[i + 1].el.getBoundingClientRect().top + window.scrollY;
        const span = Math.max(1, nextTop - top);
        return { idx: i, t: Math.max(0, Math.min(1, (probe - top) / span)) };
      }
    }
    return { idx: 0, t: 0 };
  }

  function apply(idx: number, t: number): void {
    const a = parsed[idx];
    const b = parsed[Math.min(idx + 1, parsed.length - 1)];
    const et = easeInOut(t);

    canvas.style.setProperty('--w1', blendRGB(a.c1, b.c1, et));
    canvas.style.setProperty('--w2', blendRGB(a.c2, b.c2, et));
    canvas.style.setProperty('--w3', blendRGB(a.c3, b.c3, et));
    canvas.style.setProperty('--wa', blendRGB(a.ca, b.ca, et));

  }

  function tick(): void {
    const { idx, t } = measure();
    const p = idx + t;
    if (Math.abs(p - lastProgress) > 0.001) {
      apply(idx, t);
      lastProgress = p;
    }
  }

  // Apply initial state immediately
  apply(0, 0);

  if (reduced.matches) return;

  window.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }, { passive: true });

  // Re-measure on resize (section positions may change)
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }, { passive: true });
}
