/**
 * Izbirnik področij (components/CategoryExplorer.astro).
 *  · namizje: vedno je odprto natanko eno področje (izbrana ploščica je širša);
 *  · telefon/tablica: kartice se odpirajo neodvisno (brez skakanja vsebine nad prstom).
 * Tipkovnica: puščice, Home in End premikajo fokus med področji; Enter/presledek odpre.
 * Povezava #k-<id> odpre področje (tudi iz menija).
 */
const desktop = window.matchMedia('(min-width: 1180px)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

export function initCategories() {
  document.querySelectorAll<HTMLElement>('[data-cats]').forEach((root) => {
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-cat]'));
    const btns = items.map((it) => it.querySelector<HTMLButtonElement>('[data-cat-btn]')!);
    const panels = items.map((it) => it.querySelector<HTMLElement>('.cat__panel')!);

    const set = (i: number, open: boolean) => {
      btns[i].setAttribute('aria-expanded', String(open));
      panels[i].dataset.open = String(open);
      items[i].classList.toggle('is-open', open);
    };
    const select = (i: number) => {
      items.forEach((_, j) => set(j, j === i));
      root.dataset.active = String(i);
    };
    const active = () => btns.findIndex((b) => b.getAttribute('aria-expanded') === 'true');

    // Začetno stanje: vse kartice zaprte
    items.forEach((_, j) => set(j, false));
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));

    btns.forEach((b, i) => {
      b.addEventListener('click', () => {
        if (desktop.matches) {
          if (active() !== i) {
            select(i);
            setTimeout(() => {
              panels[i].scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
            }, 150);
          }
        } else {
          set(i, b.getAttribute('aria-expanded') !== 'true');
        }
        if (b.getAttribute('aria-expanded') === 'true') history.replaceState(null, '', `#k-${items[i].dataset.cat}`);
      });
      b.addEventListener('keydown', (e) => {
        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % btns.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + btns.length) % btns.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = btns.length - 1;
        if (next < 0) return;
        e.preventDefault();
        btns[next].focus();
      });
    });

    // Prehod med postavitvama: ohrani trenutno stanje
    desktop.addEventListener('change', () => {
      const a = active();
      if (a >= 0) select(a);
    });

    const openFromHash = () => {
      const id = location.hash.match(/^#k-(.+)$/)?.[1];
      const i = items.findIndex((it) => it.dataset.cat === id);
      if (i < 0) return;
      if (desktop.matches) select(i);
      else set(i, true);
      const target = desktop.matches ? root : items[i];
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' }),
      );
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    // Povezave na isto področje (#k-…), ko je zgoščena že nastavljena, ne sprožijo hashchange
    document.addEventListener('click', (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#k-"]');
      if (a && a.getAttribute('href') === location.hash) {
        e.preventDefault();
        openFromHash();
      }
    });
  });
}
