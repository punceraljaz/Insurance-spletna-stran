/**
 * Sprejem obrazcev »Novo zavarovanje« in »Pregled obstoječe police« (multipart/form-data).
 *
 * - Priložene datoteke ostanejo samo v pomnilniku zahteve in se pošljejo kot priponke e-sporočila
 *   svetovalcu. Na disk se NE zapisujejo in niso nikoli javno dostopne.
 * - V dnevnik se ne zapisuje vsebina obrazca ali dokumentov (samo kode napak).
 * - Brez nastavljenega SMTP vrne 503 — obrazec nikoli ne pokaže lažne potrditve.
 *
 * Potrebne spremenljivke okolja (glej .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_FROM, INQUIRY_TO
 */
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { inquiry, type Audience } from '../../data/content';
import { ALLOWED_EXT, EMAIL_RE, LIMITS, MAX_BYTES, MAX_FILES, PHONE_RE, ext, type InquiryKind } from '../../lib/inquiry';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

/* Preprosta omejitev pogostosti: največ 8 oddaj na IP v 10 minutah (pomnilnik procesa) */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_PER_WINDOW;
}

/* Vsebina mora ustrezati končnici (prepreči npr. preimenovane izvršljive datoteke) */
async function signatureOk(file: File) {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const e = ext(file.name);
  if (e === 'pdf') return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
  if (e === 'png') return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  if (e === 'jpg' || e === 'jpeg') return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  return false;
}

const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, ' ').trim();
const MIME: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

function smtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_FROM, INQUIRY_TO } = process.env;
  if (!SMTP_HOST || !INQUIRY_FROM || !INQUIRY_TO) return null;
  const port = Number(SMTP_PORT || 587);
  return {
    transport: {
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465 && SMTP_HOST !== 'localhost' && SMTP_HOST !== '127.0.0.1',
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    },
    from: INQUIRY_FROM,
    to: INQUIRY_TO,
  };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (limited(clientAddress || 'neznan')) return json(429, { error: 'Preveč poskusov v kratkem času. Poskusite znova čez nekaj minut.' });

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json(400, { error: 'Obrazca ni bilo mogoče prebrati. Poskusite znova.' });
  }

  const str = (k: string) => (typeof data.get(k) === 'string' ? (data.get(k) as string).trim() : '');

  // Past za robote: skrito polje mora ostati prazno
  if (str('website')) return json(200, { ok: true, files: 0 });

  const kind = str('kind') as InquiryKind;
  const audience = (str('audience') === 'podjetja' ? 'podjetja' : 'posamezniki') as Audience;
  const name = oneLine(str('name'));
  const email = oneLine(str('email'));
  const phone = oneLine(str('phone'));
  const message = str('message');
  const later = str('later') === '1';
  const files = data.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);

  const errors: Record<string, string> = {};
  if (kind !== 'nova' && kind !== 'pregled') return json(400, { error: 'Neznana vrsta obrazca.' });
  if (!name) errors.name = 'Vpišite ime in priimek.';
  else if (name.length > LIMITS.name) errors.name = 'Ime je predolgo.';
  if (!email) errors.email = 'Vpišite e-poštni naslov.';
  else if (!EMAIL_RE.test(email) || email.length > LIMITS.email) errors.email = 'E-poštni naslov ni veljaven, npr. ime@domena.si.';
  if (phone && (!PHONE_RE.test(phone) || phone.length > LIMITS.phone)) errors.phone = 'Telefonska številka ni veljavna.';
  if (message.length > LIMITS.message) errors.message = `Sporočilo je daljše od ${LIMITS.message} znakov.`;

  const type = kind === 'nova' ? inquiry.types.find((t) => t.value === str('type') && t.for.includes(audience)) : undefined;
  if (kind === 'nova' && !type) errors.type = 'Izberite vrsto zavarovanja.';
  if (kind === 'pregled' && !files.length && !later) errors.files = 'Priložite polico ali označite, da je trenutno nimate pri sebi.';

  if (files.length > MAX_FILES) errors.files = `Priložite lahko največ ${MAX_FILES} datotek.`;
  else {
    for (const f of files) {
      if (!ALLOWED_EXT.includes(ext(f.name))) errors.files = `${f.name}: dovoljeni so samo PDF, JPG in PNG.`;
      else if (f.size > MAX_BYTES) errors.files = `${f.name}: datoteka je večja od 10 MB.`;
      else if (!(await signatureOk(f))) errors.files = `${f.name}: vsebina datoteke ne ustreza vrsti ${ext(f.name).toUpperCase()}.`;
      if (errors.files) break;
    }
  }
  if (Object.keys(errors).length) return json(422, { error: 'Preverite označena polja.', fields: errors });

  const smtp = smtpConfig();
  if (!smtp) {
    console.error('[povprasevanje] SMTP ni nastavljen — oddaja zavrnjena');
    return json(503, { error: 'Pošiljanje obrazca trenutno ni na voljo.' });
  }

  const title = kind === 'nova' ? 'Povpraševanje za novo zavarovanje' : 'Pregled obstoječe police';
  const lines = [
    title.toUpperCase(),
    `Za koga: ${audience === 'podjetja' ? 'Podjetje' : 'Posameznik oziroma družina'}`,
    ...(type ? [`Vrsta zavarovanja: ${type.label}`] : []),
    `Ime in priimek: ${name}`,
    `E-pošta: ${email}`,
    `Telefon: ${phone || '—'}`,
    '',
    kind === 'nova' ? 'Kako vam lahko pomagamo:' : 'Kaj želi preveriti:',
    message || '—',
    '',
    files.length
      ? `Priloženi dokumenti (${files.length}): ${files.map((f) => f.name).join(', ')}`
      : kind === 'pregled'
        ? 'Brez priloge — stranka bo polico posredovala naknadno.'
        : 'Brez priloge.',
  ];

  try {
    const attachments = await Promise.all(
      files.map(async (f) => ({ filename: oneLine(f.name), content: Buffer.from(await f.arrayBuffer()), contentType: MIME[ext(f.name)] })),
    );
    await nodemailer.createTransport(smtp.transport).sendMail({
      from: smtp.from,
      to: smtp.to,
      replyTo: { name, address: email },
      subject: `${title}${type ? ` — ${type.label}` : ''} — ${name}`,
      text: lines.join('\n'),
      attachments,
    });
  } catch (err) {
    console.error('[povprasevanje] pošiljanje ni uspelo:', (err as { code?: string }).code ?? 'neznana napaka');
    return json(502, { error: 'Pošiljanje ni uspelo.' });
  }

  return json(200, { ok: true, files: files.length });
};

export const ALL: APIRoute = () => json(405, { error: 'Metoda ni dovoljena.' });
