/**
 * OBRAZCA »NOVO ZAVAROVANJE« IN »PREGLED OBSTOJEČE POLICE« (Intake.astro, data-inquiry-form)
 * - Oddaja: multipart/form-data na /api/povprasevanje (pages/api/povprasevanje.ts).
 * - Potrditev se pokaže samo po uspešnem odgovoru strežnika; ob napaki ostanejo vnosi in datoteke.
 * - Datoteke se v brskalniku ne berejo (uporabljamo samo ime, vrsto in velikost).
 */
import { ALLOWED_EXT, EMAIL_RE, ENDPOINT, MAX_BYTES, MAX_FILES, PHONE_RE, ext, type InquiryKind } from '../lib/inquiry';

const sizeFmt = new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 1 });
const fmtSize = (b: number) => (b < 1024 * 1024 ? `${sizeFmt.format(Math.max(1, b / 1024))} KB` : `${sizeFmt.format(b / 1024 / 1024)} MB`);

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

/** Izbira datotek: gumb, povleci in spusti, seznam z odstranjevanjem, preverjanje vrste in velikosti */
function initFiles(form: HTMLFormElement, setError: (name: string, msg: string) => void) {
  const input = form.querySelector<HTMLInputElement>('[data-file-input]')!;
  const drop = form.querySelector<HTMLElement>('[data-drop]')!;
  const list = form.querySelector<HTMLElement>('[data-file-list]')!;
  const status = form.querySelector<HTMLElement>('[data-file-status]')!;
  let files: File[] = [];
  const listeners: (() => void)[] = [];
  const changed = () => listeners.forEach((fn) => fn());

  const render = () => {
    list.replaceChildren(
      ...files.map((f, i) => {
        const remove = el('button', { type: 'button', class: 'file__remove', 'aria-label': `Odstrani datoteko ${f.name}` }, '×');
        remove.addEventListener('click', () => {
          files.splice(i, 1);
          status.textContent = `Datoteka ${f.name} je odstranjena. Izbranih: ${files.length}.`;
          render();
          changed();
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
      if (!ALLOWED_EXT.includes(ext(f.name))) {
        problems.push(`${f.name}: dovoljeni so samo PDF, JPG in PNG.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        problems.push(`${f.name}: datoteka je večja od 10 MB.`);
        continue;
      }
      if (!f.size) {
        problems.push(`${f.name}: datoteka je prazna.`);
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
    if (added) {
      status.textContent = `Dodanih datotek: ${added}. Skupaj izbranih: ${files.length}.`;
      changed();
    }
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

  return {
    input,
    get: () => files,
    clear: () => {
      files = [];
      render();
      changed();
    },
    onChange: (fn: () => void) => listeners.push(fn),
  };
}

function initForm(form: HTMLFormElement) {
  const kind = form.dataset.inquiryForm as InquiryKind;
  const result = form.querySelector<HTMLElement>('[data-form-result]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-submit-btn]')!;
  const submitLabel = submitBtn.querySelector<HTMLElement>('[data-submit-label]')!;
  const attach = form.querySelector<HTMLElement>('[data-attach]');
  const attachToggle = form.querySelector<HTMLInputElement>('[data-attach-toggle]');
  const later = form.querySelector<HTMLInputElement>('[data-later]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let sending = false;

  const setError = (name: string, msg: string) => {
    const p = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (p) {
      p.textContent = msg;
      p.hidden = !msg;
    }
    const fields = name === 'files' ? [files.input] : Array.from(form.querySelectorAll<HTMLElement>(`[name="${name}"]`));
    fields.forEach((f) => (msg ? f.setAttribute('aria-invalid', 'true') : f.removeAttribute('aria-invalid')));
  };
  const files = initFiles(form, setError);

  // Datoteke se pošljejo le, če je območje za nalaganje odprto (pri povpraševanju je neobvezno)
  const attachedFiles = () => (attachToggle && !attachToggle.checked ? [] : files.get());

  /* --- Neobvezna priloga pri povpraševanju --- */
  attachToggle?.addEventListener('change', () => {
    attach!.hidden = !attachToggle.checked;
    attachToggle.setAttribute('aria-expanded', String(attachToggle.checked));
    if (!attachToggle.checked) setError('files', '');
  });

  /* --- Pregled police: »Police trenutno nimam pri sebi.« --- */
  const updateLabel = () => {
    if (!later || sending) return;
    const noDoc = later.checked && !files.get().length;
    submitLabel.textContent = (noDoc ? submitBtn.dataset.labelLater : submitBtn.dataset.labelDefault) ?? submitLabel.textContent;
  };
  later?.addEventListener('change', () => {
    if (later.checked) setError('files', '');
    updateLabel();
  });
  files.onChange(() => {
    if (files.get().length) setError('files', '');
    updateLabel();
  });

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name && t.getAttribute('aria-invalid')) setError(t.name, '');
  });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'type') setError('type', '');
  });

  const val = (n: string) => ((form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim();
  const typeValue = () => form.querySelector<HTMLInputElement>('input[name="type"]:checked')?.value ?? '';

  const validate = () => {
    const errors: [string, string][] = [];
    if (!val('name')) errors.push(['name', 'Vpišite ime in priimek.']);
    if (!val('email')) errors.push(['email', 'Vpišite e-poštni naslov.']);
    else if (!EMAIL_RE.test(val('email'))) errors.push(['email', 'E-poštni naslov ni veljaven, npr. ime@domena.si.']);
    if (val('phone') && !PHONE_RE.test(val('phone'))) errors.push(['phone', 'Telefonska številka ni veljavna, npr. 040 123 456.']);
    if (kind === 'nova' && !typeValue()) errors.push(['type', 'Izberite vrsto zavarovanja.']);
    if (kind === 'pregled' && !files.get().length && !later?.checked)
      errors.push(['files', 'Priložite polico ali označite, da je trenutno nimate pri sebi.']);
    return errors;
  };

  const showErrors = (errors: [string, string][]) => {
    ['name', 'email', 'phone', 'type', 'files'].forEach((n) => setError(n, errors.find(([k]) => k === n)?.[1] ?? ''));
    if (!errors.length) return;
    const first = errors[0][0];
    const target =
      first === 'files' ? files.input : first === 'type' ? form.querySelector<HTMLElement>('input[name="type"]') : form.querySelector<HTMLElement>(`[name="${first}"]`);
    target?.focus();
  };

  const setSending = (on: boolean) => {
    sending = on;
    submitBtn.disabled = on;
    form.setAttribute('aria-busy', String(on));
    if (on) {
      submitBtn.dataset.labelIdle = submitLabel.textContent ?? '';
      submitLabel.textContent = form.dataset.sending ?? '';
    } else {
      submitLabel.textContent = submitBtn.dataset.labelIdle ?? submitLabel.textContent;
      updateLabel();
    }
  };

  // Ob uspehu ostaneta vidna le naslov in potrditev
  const content = Array.from(form.children).filter((c) => c !== result && !c.classList.contains('intake__card-title')) as HTMLElement[];

  const showSuccess = (sentFiles: number) => {
    const msg = kind === 'pregled' && !sentFiles ? form.dataset.successNone : form.dataset.success;
    const again = el('button', { type: 'button', class: 'btn btn--tonal' }, form.dataset.again ?? '');
    again.addEventListener('click', () => {
      form.reset();
      files.clear();
      if (attach && attachToggle) attach.hidden = true;
      attachToggle?.setAttribute('aria-expanded', 'false');
      content.forEach((c) => (c.hidden = c === attach && !!attachToggle));
      result.hidden = true;
      updateLabel();
      form.querySelector<HTMLElement>('.input')?.focus();
    });
    result.replaceChildren(el('p', { class: 'result__title' }, msg ?? ''), el('div', { class: 'result__actions' }, again));
    content.forEach((c) => (c.hidden = true));
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    setError('submit', '');
    const errors = validate();
    showErrors(errors);
    if (errors.length) return;

    const body = new FormData();
    body.set('kind', kind);
    body.set('audience', form.dataset.audience ?? '');
    ['name', 'email', 'phone', 'message', 'website'].forEach((n) => body.set(n, val(n)));
    if (kind === 'nova') body.set('type', typeValue());
    if (later?.checked) body.set('later', '1');
    const sent = attachedFiles();
    sent.forEach((f) => body.append('files', f, f.name));

    setSending(true);
    let res: Response;
    try {
      res = await fetch(ENDPOINT, { method: 'POST', body, headers: { accept: 'application/json' } });
    } catch {
      setSending(false);
      setError('submit', 'Pošiljanje ni uspelo. Preverite internetno povezavo in poskusite znova. Vneseni podatki in datoteke so ohranjeni.');
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; files?: number; error?: string; fields?: Record<string, string> };
    setSending(false);

    if (res.ok && data.ok) {
      showSuccess(data.files ?? 0);
      return;
    }
    if (res.status === 422 && data.fields) {
      showErrors(Object.entries(data.fields));
      setError('submit', 'Preverite označena polja.');
      return;
    }
    const reason =
      res.status === 503
        ? 'Pošiljanje obrazca trenutno ni na voljo. Poskusite znova pozneje.'
        : res.status === 413
          ? 'Datoteke so skupaj prevelike za pošiljanje. Odstranite katero od njih in poskusite znova.'
          : (data.error ?? 'Pošiljanje ni uspelo. Poskusite znova.');
    setError('submit', `${reason} Vneseni podatki in datoteke so ohranjeni.`);
  });

  updateLabel();
}

export function initUpload() {
  document.querySelectorAll<HTMLFormElement>('form[data-inquiry-form]').forEach(initForm);

  // Prepreči, da bi brskalnik odprl datoteko, spuščeno mimo območja
  ['dragover', 'drop'].forEach((t) =>
    window.addEventListener(t, (e) => {
      const target = e.target as Element;
      if ((e as DragEvent).dataTransfer?.types.includes('Files') && !target.closest?.('[data-drop]')) e.preventDefault();
    }),
  );
}
