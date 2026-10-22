/**
 * PREGLED OBSTOJEČE POLICE — PROTOTIP NALAGANJA
 * - Datoteke se NE pošiljajo, NE shranjujejo in NE berejo (uporabljamo samo ime, vrsto in velikost).
 * - Stanje obstaja le v pomnilniku odprte strani.
 * TODO (integracija): varno nalaganje (šifriran prenos, hramba, rok hrambe, obvestilo o varstvu podatkov).
 */
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['pdf', 'jpg', 'jpeg', 'png'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s/().-]{6,}$/;

const sizeFmt = new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 1 });
const fmtSize = (b: number) => (b < 1024 * 1024 ? `${sizeFmt.format(Math.max(1, b / 1024))} KB` : `${sizeFmt.format(b / 1024 / 1024)} MB`);
const ext = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

export function initUpload() {
  const form = document.querySelector<HTMLFormElement>('[data-policy-form]');
  if (!form) return;

  const input = form.querySelector<HTMLInputElement>('[data-file-input]')!;
  const drop = form.querySelector<HTMLElement>('[data-drop]')!;
  const list = form.querySelector<HTMLElement>('[data-file-list]')!;
  const status = form.querySelector<HTMLElement>('[data-file-status]')!;
  const result = form.querySelector<HTMLElement>('[data-policy-result]')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let files: File[] = [];

  const setError = (name: string, msg: string) => {
    const p = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (p) {
      p.textContent = msg;
      p.hidden = !msg;
    }
    const field = name === 'files' ? input : form.querySelector<HTMLElement>(`[name="${name}"]`);
    if (msg) field?.setAttribute('aria-invalid', 'true');
    else field?.removeAttribute('aria-invalid');
  };

  const render = () => {
    list.replaceChildren(
      ...files.map((f, i) => {
        const remove = el('button', { type: 'button', class: 'file__remove', 'aria-label': `Odstrani datoteko ${f.name}` }, '×');
        remove.addEventListener('click', () => {
          files.splice(i, 1);
          status.textContent = `Datoteka ${f.name} je odstranjena. Izbranih: ${files.length}.`;
          render();
          const buttons = list.querySelectorAll<HTMLButtonElement>('.file__remove');
          (buttons[Math.min(i, buttons.length - 1)] ?? input).focus();
        });
        return el(
          'li',
          { class: 'file' },
          el('span', { class: 'file__badge', 'aria-hidden': 'true' }, ext(f.name).toUpperCase().slice(0, 4)),
          el('span', { class: 'file__meta' }, el('span', { class: 'file__name' }, f.name), el('span', { class: 'file__size' }, fmtSize(f.size))),
          remove,
        );
      }),
    );
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const problems: string[] = [];
    let added = 0;
    for (const f of Array.from(incoming)) {
      if (!ALLOWED.includes(ext(f.name))) {
        problems.push(`${f.name}: dovoljeni so samo PDF, JPG in PNG.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        problems.push(`${f.name}: datoteka je večja od 10 MB.`);
        continue;
      }
      if (files.some((x) => x.name === f.name && x.size === f.size)) continue;
      if (files.length >= MAX_FILES) {
        problems.push(`Priložite lahko največ ${MAX_FILES} datotek.`);
        break;
      }
      files.push(f);
      added++;
    }
    setError('files', problems.join(' '));
    render();
    if (added) status.textContent = `Dodanih datotek: ${added}. Skupaj izbranih: ${files.length}.`;
  };

  input.addEventListener('change', () => {
    addFiles(input.files);
    input.value = '';
  });

  // Povleci in spusti
  let depth = 0;
  drop.addEventListener('dragenter', (e) => {
    e.preventDefault();
    depth++;
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragover', (e) => e.preventDefault());
  drop.addEventListener('dragleave', () => {
    depth = Math.max(0, depth - 1);
    if (!depth) drop.classList.remove('is-over');
  });
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    depth = 0;
    drop.classList.remove('is-over');
    addFiles(e.dataTransfer?.files ?? null);
  });
  // Prepreči, da bi brskalnik odprl datoteko, spuščeno mimo območja
  ['dragover', 'drop'].forEach((t) =>
    window.addEventListener(t, (e) => {
      if ((e as DragEvent).dataTransfer?.types.includes('Files') && !drop.contains(e.target as Node)) e.preventDefault();
    }),
  );

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.getAttribute('aria-invalid') && t.name) setError(t.name, '');
  });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'consent' && t.checked) setError('consent', '');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // PROTOTIP: nič se ne pošlje
    const note = (form.elements.namedItem('note') as HTMLTextAreaElement).value.trim();
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const contact = (form.elements.namedItem('contact') as HTMLInputElement).value.trim();
    const consent = (form.elements.namedItem('consent') as HTMLInputElement).checked;

    const errors: [string, string][] = [];
    if (!files.length) errors.push(['files', 'Priložite vsaj en dokument.']);
    if (!name) errors.push(['name', 'Vpišite ime in priimek.']);
    if (!contact) errors.push(['contact', 'Vpišite e-poštni naslov ali telefonsko številko.']);
    else if (!EMAIL_RE.test(contact) && !PHONE_RE.test(contact)) errors.push(['contact', 'Vpišite veljaven e-poštni naslov (ime@domena.si) ali telefonsko številko.']);
    if (!consent) errors.push(['consent', 'Za nadaljevanje potrdite soglasje.']);

    ['files', 'name', 'contact', 'consent'].forEach((n) => setError(n, errors.find(([k]) => k === n)?.[1] ?? ''));
    if (errors.length) {
      const first = errors[0][0];
      (first === 'files' ? input : form.querySelector<HTMLElement>(`[name="${first}"]`))?.focus();
      return;
    }

    const dl = el('dl');
    const rows: [string, string][] = [
      ['Dokumenti', files.map((f) => `${f.name} (${fmtSize(f.size)})`).join(', ')],
      ...(note ? [['Želja', note.length > 220 ? `${note.slice(0, 220)}…` : note] as [string, string]] : []),
      ['Ime in priimek', name],
      ['Kontakt', contact],
      ...(((form.elements.namedItem('company') as HTMLInputElement | null)?.value.trim()) ? [['Podjetje', (form.elements.namedItem('company') as HTMLInputElement).value.trim()] as [string, string]] : []),
    ];
    rows.forEach(([k, v]) => dl.append(el('dt', {}, k), el('dd', {}, v)));

    const reset = el('button', { type: 'button', class: 'btn btn--tonal' }, 'Počisti obrazec');
    reset.addEventListener('click', () => {
      form.reset();
      files = [];
      render();
      result.hidden = true;
      status.textContent = 'Obrazec je počiščen.';
      input.focus();
    });

    result.replaceChildren(
      el('p', { class: 'result__title' }, 'Povzetek zahteve za pregled'),
      dl,
      el('p', { class: 'field__help' }, 'Svetovalec bo pregledal dokumente in vas kontaktiral.'),
      el('div', { class: 'result__actions' }, reset),
    );
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
  });
}
