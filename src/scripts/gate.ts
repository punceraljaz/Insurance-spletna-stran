/**
 * Naslovnica. Izbiri sta navadni povezavi — JS doda atmosfero (WebGL)
 * in kratek prehod ob kliku. Brez JS vse deluje kot navadne povezave.
 */
import { rememberAudience } from './motion';
import { initHeroGradient } from './hero-gradient';

const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-gradient]');
if (canvas) initHeroGradient(canvas);

const cover = document.querySelector<HTMLElement>('[data-cover]');
const choices = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-choice]'));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

// Uporabnik ne čaka na koreografijo: prva tipka ali dotik takoj pokaže vse
const skipIntro = () => cover?.classList.add('intro-skip');
window.addEventListener('keydown', skipIntro, { once: true });
window.addEventListener('pointerdown', skipIntro, { once: true });
window.setTimeout(skipIntro, 2700);

let leaving = false;
choices.forEach((a) =>
  a.addEventListener('click', (e) => {
    rememberAudience(a.dataset.choice!);
    // Nov zavihek, prenos ipd. — brskalnik naj ravna po svoje
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (reduce.matches || !cover) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    // 1) izbira potrdi klik  2) izjava se umakne  3) atmosfera teče naprej  4) navigacija
    a.classList.add('is-chosen');
    cover.classList.add('intro-skip', 'is-leaving');
    window.setTimeout(() => window.location.assign(a.href), 300);
  }),
);

// Gumb »Nazaj« lahko obnovi stran iz predpomnilnika (bfcache) — stanje odhoda pospravimo
window.addEventListener('pageshow', () => {
  leaving = false;
  cover?.classList.remove('is-leaving');
  choices.forEach((a) => a.classList.remove('is-chosen'));
});
