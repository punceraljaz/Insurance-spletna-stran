/**
 * Interakcije spletne strani — brez zunanjih knjižnic.
 * Vse animacije spoštujejo prefers-reduced-motion (CSS + spodnja zastavica).
 */
import { initBooking } from './booking';
import { initUpload } from './upload';
import { initReveal, rememberAudience } from './motion';
import { initCategories } from './categories';
import { initAtmosphere } from './atmosphere';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/* ---------- Atmosferska poglavja ---------- */
function initChapters() {
  const root = document.documentElement;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) root.dataset.chapter = (e.target as HTMLElement).dataset.chapter;
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  $$('[data-chapter]').forEach((el) => el !== root && io.observe(el));
}

/* ---------- Navigacija ---------- */
function initNav() {
  const wrap = $('[data-nav]');
  if (!wrap) return;

  // Zgoščena navigacija po začetku drsenja
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      wrap.classList.toggle('is-condensed', window.scrollY > 40);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Meni: okrogel gumb v desnem kotu (vse širine)
  const toggle = $<HTMLButtonElement>('[data-nav-toggle]');
  const menu = $('[data-mobile-menu]');
  if (!toggle || !menu) return;
  const setOpen = (open: boolean, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zapri meni' : 'Odpri meni');
    menu.hidden = !open;
    if (open) $<HTMLAnchorElement>('a', menu)?.focus();
    else if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false, true);
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !wrap.contains(e.target as Node)) setOpen(false);
  });
}

/* ---------- Razširljive kartice in FAQ ---------- */
function initToggles() {
  $$<HTMLButtonElement>('[data-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    if (!panel) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.dataset.open = String(open);
      btn.closest('[data-expandable], [data-qa]')?.classList.toggle('is-open', open);
      const closed = $('[data-label-closed]', btn);
      const opened = $('[data-label-open]', btn);
      if (closed && opened) {
        closed.hidden = open;
        opened.hidden = !open;
      }
    });
  });
}

/* ---------- Povezave na rezervacijo (#rezervacija) in pregled police (#pregled) ---------- */
type Target = 'pregled' | 'rezervacija';
type TopicLink = { label?: string; type?: string };
function initActionLinks(onTopic: (t: TopicLink) => void) {
  const goTo = (name: Target) => {
    // Skok na začetek sekcije (naslov ostane viden), fokus na obrazec za bralnike zaslona
    const section = name === 'rezervacija' ? $('#naslednji-korak') : $('#pregled');
    const focusEl = name === 'rezervacija' ? $('[data-panel="rezervacija"]') : $('[data-policy-form]');
    if (!section) return;
    section.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    if (focusEl) {
      focusEl.tabIndex = -1;
      focusEl.focus({ preventScroll: true });
    }
    history.replaceState(null, '', `#${name}`);
  };

  // Vse povezave (kartice, CTA, navigacija, dok)
  document.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[href="#rezervacija"], a[href="#pregled"]');
    if (!link) return;
    e.preventDefault();
    const name = link.getAttribute('href')!.slice(1) as Target;
    if (name === 'rezervacija' && (link.dataset.topic || link.dataset.type)) onTopic({ label: link.dataset.topic, type: link.dataset.type });
    goTo(name);
  });

  const hash = location.hash.slice(1);
  if (hash === 'rezervacija' || hash === 'pregled') requestAnimationFrame(() => goTo(hash));
}

/* ---------- Mobilni spodnji dok ---------- */
function initDock() {
  const dock = $('[data-dock]');
  if (!dock) return;
  const hero = $('.ahero__head');
  const next = $('#naslednji-korak');
  const footer = $('#kontakt');
  let heroVisible = true;
  let actionVisible = false;
  const footerVisible = { v: false };
  const update = () => dock.classList.toggle('is-visible', !heroVisible && !actionVisible && !footerVisible.v);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.target === hero) heroVisible = e.isIntersecting;
      if (e.target === next) actionVisible = e.isIntersecting;
      if (e.target === footer) footerVisible.v = e.isIntersecting;
    });
    update();
  });
  [hero, next, footer].forEach((el) => el && io.observe(el));
}

/* ---------- Zagon ---------- */
initReveal();
initChapters();
initAtmosphere();
initNav();
initToggles();
initCategories();
const bookingApi = initBooking();
initActionLinks((t) => bookingApi?.setTopic(t));

// Zapomni izbrano pot za trenutni obisk
const audience = document.documentElement.dataset.audience;
if (audience) rememberAudience(audience);
initUpload();
initDock();
