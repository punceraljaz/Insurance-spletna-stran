/** Skupno gibanje: razkrivanje ob drsenju in spomin izbrane poti (samo za trenutni obisk). */

export function initReveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/**
 * Izbrana pot se zapomni v sessionStorage (izbriše se ob zaprtju zavihka).
 * Ni piškotek, ni sledenje in se nikamor ne pošilja — zgolj udobje med obiskom.
 */
const KEY = 'izbrana-pot';
export function rememberAudience(value: string) {
  try {
    sessionStorage.setItem(KEY, value);
  } catch {
    /* zasebni način ali blokirana shramba — stran deluje tudi brez tega */
  }
}
export function recallAudience(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
