/**
 * REZERVACIJA POSVETA — PROTOTIP
 * - Ne pošilja podatkov nikamor in ne shranjuje osebnih podatkov (samo stanje v pomnilniku strani).
 * - Prikazani termini so ilustrativni (deterministično »zasedeni« samo za videz).
 * - Ne simulira potrditve rezervacije: rezultat je izrecno označen kot povzetek, ki NI rezerviran.
 * TODO (integracija): zamenjaj korak 3 z resničnimi prostimi termini (npr. Calendly / Cal.com) in oddajo.
 */
import { booking as data } from '../data/content';

type TopicInfo = { label?: string; type?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fmtDow = new Intl.DateTimeFormat('sl-SI', { weekday: 'short' });
const fmtMon = new Intl.DateTimeFormat('sl-SI', { month: 'short' });
const fmtLong = new Intl.DateTimeFormat('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('sl-SI', { weekday: 'short', day: 'numeric', month: 'numeric' });

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

/** Naslednjih N delovnih dni (od jutri naprej) */
function workingDays(n: number) {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (days.length < n) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) days.push(new Date(d));
  }
  return days;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Ilustrativna »zasedenost« — stabilna za isti datum */
function isBusy(date: string, slot: string) {
  let h = 0;
  for (const c of date + slot) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 4 === 0;
}

export function initBooking() {
  const form = document.querySelector<HTMLFormElement>('[data-booking]');
  if (!form) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const steps = Array.from(form.querySelectorAll<HTMLFieldSetElement>('[data-bstep]'));
  const progress = Array.from(form.querySelectorAll<HTMLButtonElement>('[data-goto]'));
  const prevBtn = form.querySelector<HTMLButtonElement>('[data-prev]')!;
  const nextBtn = form.querySelector<HTMLButtonElement>('[data-next]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const datesEl = form.querySelector<HTMLElement>('[data-dates]')!;
  const timesEl = form.querySelector<HTMLElement>('[data-times]')!;
  const body = form.querySelector<HTMLElement>('.booking__body')!;
  const result = form.querySelector<HTMLElement>('[data-booking-result]')!;
  const chip = form.querySelector<HTMLElement>('[data-topic-chip]')!;
  const modeNote = form.querySelector<HTMLElement>('[data-mode-note]');
  const live = el('p', { class: 'sr-only', 'aria-live': 'polite' });
  form.append(live);

  let current = 0;
  let reached = 0;
  let topic: TopicInfo = null;
  const audienceLabel = form.dataset.audience === 'podjetja' ? 'Podjetje' : 'Posameznik oziroma družina';

  /* --- Datumi --- */
  workingDays(10).forEach((d, i) => {
    const value = iso(d);
    const label = el(
      'label',
      { class: 'date', style: `--i:${i}` },
      el('input', { type: 'radio', name: 'date', value, 'aria-label': fmtLong.format(d) }),
      el('span', { class: 'date__dow', 'aria-hidden': 'true' }, fmtDow.format(d).replace('.', '')),
      el('span', { class: 'date__day', 'aria-hidden': 'true' }, String(d.getDate())),
      el('span', { class: 'date__mon', 'aria-hidden': 'true' }, fmtMon.format(d)),
    );
    datesEl.append(label);
  });

  const renderTimes = (date: string) => {
    timesEl.replaceChildren();
    data.slots.forEach((slot, i) => {
      const busy = isBusy(date, slot);
      const input = el('input', { type: 'radio', name: 'slot', value: slot }) as HTMLInputElement;
      input.disabled = busy;
      timesEl.append(
        el('label', { class: 'slot', style: `--i:${i}` }, input, slot, ...(busy ? [el('span', { class: 'slot__busy' }, ' — zasedeno')] : [])),
      );
    });
  };

  /* --- Pomožne funkcije --- */
  const checked = (name: string) => form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  const labelOf = (input: HTMLInputElement | null) =>
    input?.closest('label')?.querySelector('.option__label')?.textContent?.trim() ?? '';
  const slotText = () => {
    const date = checked('date');
    const slot = checked('slot');
    if (!date) return '';
    const d = new Date(`${date.value}T12:00:00`);
    return slot ? `${fmtShort.format(d)} ob ${slot.value}` : fmtShort.format(d);
  };

  const setError = (name: string, msg: string) => {
    const p = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (p) {
      p.textContent = msg;
      p.hidden = !msg;
    }
    form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`).forEach((i) => {
      if (msg) i.setAttribute('aria-invalid', 'true');
      else i.removeAttribute('aria-invalid');
    });
  };

  const sum = (key: string, value: string) => {
    const dd = form.querySelector<HTMLElement>(`[data-sum="${key}"]`);
    if (!dd) return;
    const v = value || '—';
    if (dd.textContent !== v) {
      dd.textContent = v;
      dd.classList.remove('is-updated');
      void dd.offsetWidth;
      dd.classList.add('is-updated');
    }
  };

  const updateSummary = () => {
    sum('topic', topic?.label ?? '');
    sum('type', labelOf(checked('type')));
    sum('mode', labelOf(checked('mode')));
    sum('slot', slotText());
    if (modeNote) modeNote.hidden = checked('mode')?.value !== 'zivo';
  };

  const validate = (i: number) => {
    const state: { first: HTMLElement | null; ok: boolean } = { first: null, ok: true };
    const fail = (name: string, msg: string, focusEl?: HTMLElement | null) => {
      setError(name, msg);
      if (state.ok) state.first = focusEl ?? form.querySelector<HTMLElement>(`[name="${name}"]`);
      state.ok = false;
    };
    if (i === 2) {
      if (!checked('date')) fail('slot', 'Izberite datum.', datesEl.querySelector('input'));
      else if (!checked('slot')) fail('slot', 'Izberite uro.', timesEl.querySelector('input:not(:disabled)'));
      else setError('slot', '');
    }
    if (i === 3) {
      const name = form.elements.namedItem('name') as HTMLInputElement;
      const email = form.elements.namedItem('email') as HTMLInputElement;
      const consent = form.elements.namedItem('consent') as HTMLInputElement;
      if (!name.value.trim()) fail('name', 'Vpišite ime in priimek.');
      else setError('name', '');
      if (!email.value.trim()) fail('email', 'Vpišite e-poštni naslov.');
      else if (!EMAIL_RE.test(email.value.trim())) fail('email', 'E-poštni naslov ni veljaven, npr. ime@domena.si.');
      else setError('email', '');
      if (!consent.checked) fail('consent', 'Za nadaljevanje potrdite soglasje.');
      else setError('consent', '');
    }
    state.first?.focus();
    return state.ok;
  };

  const show = (i: number, opts: { focus?: boolean } = {}) => {
    const dir = i - current;
    current = i;
    reached = Math.max(reached, i);
    steps.forEach((s, j) => {
      s.classList.toggle('is-current', j === i);
      s.classList.toggle('is-back', j === i && dir < 0);
    });
    progress.forEach((b, j) => {
      b.disabled = j > reached;
      b.classList.toggle('is-done', j < reached && j !== i);
      if (j === i) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    prevBtn.hidden = i === 0;
    nextBtn.hidden = i === steps.length - 1;
    submitBtn.hidden = i !== steps.length - 1;
    const legend = steps[i].querySelector('legend')?.textContent?.replace(/\s+/g, ' ').trim();
    live.textContent = `Korak ${i + 1} od ${steps.length}: ${legend}`;
    if (opts.focus) {
      const target = steps[i].querySelector<HTMLElement>('input:checked, input:not([type="hidden"])');
      target?.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top;
      if (top < 0) form.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    }
  };

  /* --- Dogodki --- */
  nextBtn.addEventListener('click', () => {
    if (validate(current)) show(current + 1, { focus: true });
  });
  prevBtn.addEventListener('click', () => show(current - 1, { focus: true }));
  progress.forEach((b, j) =>
    b.addEventListener('click', () => {
      if (j <= reached) show(j, { focus: true });
    }),
  );

  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'date') {
      renderTimes(t.value);
      setError('slot', '');
    }
    if (t.name === 'slot') setError('slot', '');
    if (t.name === 'consent' && t.checked) setError('consent', '');
    if (t.name === 'type' && topic?.type && t.value !== topic.type) setTopic(null);
    updateSummary();
  });
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if ((t.name === 'name' || t.name === 'email') && t.getAttribute('aria-invalid')) setError(t.name, '');
  });
  // Enter v polju ne sme preskočiti korakov
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && current < steps.length - 1) {
      e.preventDefault();
      nextBtn.click();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // PROTOTIP: nič se ne pošlje
    if (!validate(3)) return;
    renderResult();
  });

  /* --- Povzetek (NI potrditev) --- */
  const summaryText = () => {
    const f = form.elements;
    const val = (n: string) => ((f.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim();
    return [
      'REZERVACIJA POSVETA',
      `Za koga: ${audienceLabel}`,
      topic?.label ? `Področje: ${topic.label}` : '',
      val('company') ? `Podjetje: ${val('company')}` : '',
      `Vrsta svetovanja: ${labelOf(checked('type'))}`,
      `Način srečanja: ${labelOf(checked('mode'))}`,
      `Termin: ${slotText()}`,
      `Ime in priimek: ${val('name')}`,
      `E-pošta: ${val('email')}`,
      val('phone') ? `Telefon: ${val('phone')}` : '',
      val('message') ? `Sporočilo: ${val('message')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  };

  const renderResult = () => {
    const f = form.elements;
    const val = (n: string) => ((f.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim();
    const rows: [string, string][] = [
      ['Za koga', audienceLabel],
      ...(topic?.label ? [['Področje', topic.label] as [string, string]] : []),
      ['Vrsta svetovanja', labelOf(checked('type'))],
      ['Način srečanja', labelOf(checked('mode'))],
      ['Termin', slotText()],
      ['Ime in priimek', val('name')],
      ['E-pošta', val('email')],
      ...(val('company') ? [['Podjetje', val('company')] as [string, string]] : []),
      ...(val('phone') ? [['Telefon', val('phone')] as [string, string]] : []),
    ];
    const dl = el('dl');
    rows.forEach(([k, v]) => dl.append(el('dt', {}, k), el('dd', {}, v)));

    const copyBtn = el('button', { type: 'button', class: 'btn' }, 'Kopiraj povzetek') as HTMLButtonElement;
    const editBtn = el('button', { type: 'button', class: 'btn btn--tonal' }, 'Uredi izbiro');
    const copied = el('p', { class: 'result__copied', 'aria-live': 'polite' });

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(summaryText());
        copied.textContent = 'Povzetek je kopiran v odložišče.';
      } catch {
        copied.textContent = 'Kopiranje ni uspelo — besedilo lahko označite ročno.';
      }
    });
    editBtn.addEventListener('click', () => {
      result.hidden = true;
      body.hidden = false;
      show(3, { focus: true });
    });

    result.replaceChildren(
      el('p', { class: 'result__title' }, 'Povzetek rezervacije'),
      dl,
      el('p', { class: 'field__help' }, 'Potrditev termina boste prejeli po e-pošti.'),
      el('div', { class: 'result__actions' }, copyBtn, editBtn, copied),
    );
    body.hidden = true;
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
  };

  /* --- Tema iz kartic --- */
  const setTopic = (t: TopicInfo) => {
    topic = t?.label ? t : null;
    chip.hidden = !topic;
    if (t) {
      if (t.label) chip.querySelector('[data-topic-label]')!.textContent = t.label;
      const radio = form.querySelector<HTMLInputElement>(`input[name="type"][value="${t.type}"]`);
      if (radio) radio.checked = true;
      if (!result.hidden) {
        result.hidden = true;
        body.hidden = false;
      }
      show(0);
    }
    updateSummary();
  };
  chip.querySelector('[data-topic-clear]')?.addEventListener('click', () => {
    setTopic(null);
    form.querySelector<HTMLInputElement>('input[name="type"]:checked')?.focus();
  });

  show(0);
  updateSummary();
  return { setTopic };
}
