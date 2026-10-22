# TODO pred objavo — spletna stran zavarovalnega svetovanja

> **Stran je PROTOTIP.** Ne sme biti objavljena kot resnična zavarovalna storitev,
> dokler niso zamenjane vse spodnje začasne vsebine in pregledane pravne vsebine.
> Trenutno ima stran `noindex, nofollow` (src/layouts/Base.astro) in `public/robots.txt` z `Disallow: /`.

Vsa vsebina je zbrana v **`src/data/content.ts`** z oznakami `[PDF]`, `[PREDLOG]` in `[PLACEHOLDER]`.

## 1. Obvezno zamenjati (PLACEHOLDER)

| Kaj | Kje | Trenutno |
|---|---|---|
| Priimek svetovalca / uradni naziv | `site.advisorFullName`, `site.brandSub` | samo »Aljaž«, »Zavarovalno svetovanje« |
| Telefon in WhatsApp | `site.phoneDisplay` + `Footer.astro` (dodaj `tel:` in WhatsApp povezavo) | fiktivno `040 000 000`, brez povezave |
| E-pošta | `site.email` | `aljaz@example.com` (rezervirana domena) |
| Lokacija za srečanja v živo | `site.location` | »bo dodana« |
| Fotografija svetovalca | `About.astro` (zamenjaj `<Art kind="portret">` z `<img>`/`<Picture>`) | abstraktna ilustracija |
| Daljši opis »Več o meni« | `about.moreText` | začasno besedilo |
| Odgovori na 7 pogostih vprašanj | `faq.items[].a` | osnutki — **posebej vprašanje o plačilu (#7)** |
| Zavarovalnice in ponudniki | `partners.insurers` + logotipi | »Ponudnik A–F« — **ni resničnih partnerjev** |
| JRM Finance | `partners.strategic` | potrdi dovoljenje za ime/logotip in dodaj povezavo »Več o partnerju« |
| Pravne strani | `src/pages/pravno/[slug].astro` | Pravne informacije, Varstvo osebnih podatkov, Piškotki, Pritožbeni postopek — samo placeholder |

## 2. Začasne kategorije storitev (PROVISIONAL — niso v PDF)

V `businessInsurance.services` so z `provisional: true` označene kategorije, ki jih PDF ne potrjuje.
Na strani so predstavljene previdno (»preverimo na posvetu«), vendar jih je treba potrditi ali odstraniti:

- Splošna in **poklicna** odgovornost (PDF omenja le »odgovornost«)
- Zavarovanje zaposlenih
- Vozila in vozni park (za podjetja)
- Poslovna prekinitev

Pri posameznikih so vse kategorije izpeljane iz PDF (življenjska, nezgodna, zdravstvena, skrb za mlade, finančno načrtovanje), opisi in »Kdaj vam to pride prav« pa so [PREDLOG].

## 3. Preveriti (PREDLOG — novo spremno besedilo)

- **Slovar »Pojmi, razloženi preprosto«** (`glossary`) — strokovni pregled definicij (AO, kasko, odgovornost, posrednik …)
- Opisi vseh storitev in »Kdaj vam to pride prav« (`individualGroups`, `businessInsurance`, `businessAdvisory`)
- »Kako začeti« (`howToStart`), navodilo na vstopni strani (`gate`)
- Delovni čas `site.hours` (PLACEHOLDER)
- Naslovi sekcij: »Zavarovanja za vas in vaše bližnje.«, »Kaj lahko zavarujete?«, »Zaščita premoženja, ljudi in poslovanja.«, »Strokovna pomoč — od analize do škode.«, »Sodelovanje, ki ga lahko preverite.«, »Odgovori, preden vprašate.«, »Kako želite nadaljevati?«
- Dodatne opombe pri korakih 01–04 (`businessAdvisory.steps[].note`)
- Trije principi v sekciji »O meni« (povzeti iz Aljaževega besedila)
- Če obstajajo dodatne kategorije zavarovanj (»…« v PDF), jih dodaj v `individualGroups`

## 4. Funkcionalnost, ki še ni resnična

- **Rezervacija posveta** (`src/scripts/booking.ts`): termini so ilustrativni, nič se ne pošlje.
  → Integracija s koledarjem (npr. Calendly ali Cal.com): prosti termini, oddaja, potrditveno e-sporočilo.
- **Pregled police / nalaganje** (`src/scripts/upload.ts`): datoteke ostanejo v brskalniku, nič se ne pošlje.
  → Varen backend (šifriran prenos, hramba, rok hrambe, dostopne pravice), obvestilo o varstvu podatkov (GDPR), soglasje.
- **Soglasja** v obrazcih so označena kot DEMO — besedilo uskladi s politiko zasebnosti.
- **Piškotki**: prototip jih ne uporablja. Ob dodajanju analitike ali zunanjih vtičnikov dodaj politiko in pasico za soglasje.

## 5. Pred objavo

- [x] Odstrani prototipno pasico in vse oznake `demo-tag` ter opozorila o začasni vsebini (narejeno 15. 10. 2026 — rezervacija in nalaganje še vedno ničesar ne pošiljata, glej razdelek 4)
- [ ] Odstrani `noindex` (Base.astro) in posodobi `public/robots.txt`
- [ ] Nastavi `site` (domena) v `astro.config.mjs`, dodaj Open Graph slike
- [ ] Pravni pregled vseh vsebin (posredniški/zastopniški status, razkritja, pritožbeni postopek)
- [ ] Ponovni pregled dostopnosti in kontrasta po zamenjavi fotografij

## 6. Struktura (faza 2)

- `/` — vstopna stran z obvezno izbiro poti (brez glavne vsebine pod herojem)
- `/posamezniki/` in `/podjetja/` — ločeni poti; preklop »Posamezniki | Podjetja« v navigaciji
- Izbrana pot se hrani samo v `sessionStorage` za trenutni obisk (brez piškotkov)
- Znana omejitev brskalnika: v Chromu se lahko po gumbu »Naprej« v konzoli izpiše
  `InvalidStateError: Transition was aborted` — navigacija deluje, izpusti se le animacija prehoda.

## 7. Ikone (faza 3)

- Lastna družina ikon: `src/components/Icon.astro` (30 ikon, mreža 32×32), ploščice `IconTile.astro`, žetoni v `src/styles/icons.css`.
- Novo ikono dodaj v slovar `icons` v `Icon.astro`; uporabljaj plasti `.f` (tonsko polnilo), `.w` (topel poudarek), `.b` (papir).
- Ikone storitev so določene s poljem `icon` v `src/data/content.ts`.
- Tretja referenčna slika (»Insurance and Assurance icon set«, mapa Prenosi) ni bila pregledana — premakni jo v projekt, če naj jo upoštevam.

## 8. Svetla tonska različica (faza 4)

- Celotna paleta je v `src/styles/tokens.css`. Temno modre/mornarske barve ni več; besedilo je nevtralni grafit (`--ink`).
- Primarni gumbi: mat svetlo modro-siva (`--primary-top` / `--primary-bottom`); izbrana stanja: `--selected-bg`, `--selected-ring`.
- Ozadje strani je en neprekinjen fiksni sloj `.atmosphere` (barve se spreminjajo po poglavjih prek `data-chapter`).
- Kartice so le za interakcijo (storitve, izbire, kontakti, odprto vprašanje v FAQ); obrazca uporabljata tiho površino `.mat-quiet`.
- Žetoni `--night-*` / `--on-night*` so ohranjeni le zaradi združljivosti in kažejo na svetle vrednosti — ne uporabljaj jih za nove elemente.

## 9. Zrnato atmosfersko ozadje (faza 5)

- Ozadje celotne strani: tri upodobljene slike v `public/atmosfera/` (mist = posamezniki/vstop, slate = podjetja, day = o svetovalcu/FAQ/rezervacija/noga), skupaj ~30 KB.
  Prelivajo se glede na poglavje (`html[data-chapter]`); zrnje doda CSS (`.grain`, overlay).
- Ponovna izdelava ali prilagoditev barv: `tools/generate-atmosphere.mjs`
  (zahteva Chrome in `puppeteer-core`: `npm i -D puppeteer-core`, nato `node tools/generate-atmosphere.mjs public/atmosfera`).
- Kontrast: sekundarno besedilo (`--ink-soft`, `--ink-mute`) je izbrano tako, da dosega ≥ 4.5:1 tudi na najglobljem delu ozadja — pri temnejših barvah ozadja kontrast ponovno preveri.

## 10. Minimalne kartice (faza 6)

- Kartica storitve: ikona · naslov · `short` (ena vrstica) · eno dejanje. Daljši `text` in `situations` se prikažeta ob »+« v kotu.
- Kratki opisi (`short` v `content.ts`) so [PREDLOG] — preveri skupaj z ostalim spremnim besedilom.
- Ikone: samo obris, enobarvne (bele na ploski modro-sivi ploščici, grafitne v besedilu). Plasti `.f/.w/.b` v `Icon.astro` se ne polnijo več.
- Opombe korakov procesa (`businessAdvisory.steps[].note`) se trenutno ne prikazujejo.

## 11. Družina materialov (faza 7)

- Materiali v `global.css`: `.m-frost`, `.m-white`, `.m-stone` (mat siva, zrnata), `.m-mist` (meglena modra, zrnata), `.m-glow` (bela z mehkim notranjim sijem).
- Gumbi: `.btn` (meglena modra), `.btn--white`, `.btn--stone`, `.btn--tonal` (frost), `.btn--graphite` (le majhni odločilni poudarki: Rezerviraj posvet, Naprej/oddaja).
- Kartice storitev menjavajo materiale (bela → mat siva → frost → meglena modra); ikona in gumb se prilagodita podlagi.
- Grafit (#333639) je nevtralno siv, ne mornarski — če ga ne želite, zamenjajte `--m-graphite` v `global.css`.

## 12. Naslovnica — uredniška platnica (atmosferski gradient)
- [ ] **Slogan** »Prave odločitve. Več miru.« in stavek »Svetovanje za tisto, kar vam pomeni največ.« sta od naročnika — potrdi končno besedilo (`src/data/content.ts`, `gate`).
- [ ] **Identiteta** je začasna: ime »AC« (`site.brandName`) + `brandSub` in generični znak (dva prepletena obroča) v `src/components/Logo.astro` ter `public/favicon.svg`. Ko bo uradni logotip, zamenjaj ta dva vira.
- Ozadje: priredba shaderja iz gradients.juangarcia.ch (šum simpleks, MIT) v `src/scripts/hero-gradient.ts`; nastavitve c1–c5, speed 0.09, fx 3.2, fy 5.4. Če se nastavitve spremenijo, ponovno ustvari statični sliki `public/atmosfera/naslovnica*.webp` (posnetek platna pri zmanjšanem gibanju).
- Na naslovnici ni več telefonske številke in navigacijske vrstice — kontakt je na obeh poteh.

## 13. Pisave
- Ena pisava: **Montserrat** (lokalno, fontsource, latin-ext za č, š, ž). Krona One je odstranjena.
- Veliki naslovi (h1, h2, `.display`, `.h2`, naslovnica, naslovi skupin in panelov): **Light 300, VELIKE ČRKE, razmik 0.16em** (`--ls-display`).
- Manjši naslovi (kartice, koraki, FAQ): Medium 500, navadne črke, razmik 0.02em (`--ls-title`).
- Tekoče besedilo: Regular 400, razmik 0.025em (`--ls-body`). Vse vrednosti so v `src/styles/tokens.css`.
- Poudarki v naslovih (`.serif`) so samo tonski.

## 14. Steklene površine in slike kategorij (faza 8)
- Vse površine in gumbi so prosojno matirano steklo nad istim gradientom kot naslovnica (žetoni `--glass-*` na koncu `src/styles/global.css`). Zrnja ni.
- Ozadje notranjih strani: `public/atmosfera/naslovnica*.webp` z mlečno tančico (`.atmosphere::before`).
- **Slike kategorij (kasnejša faza):** shrani v `public/kategorije/` (WebP) in v `src/data/content.ts` pri **kategoriji** (`individualCategories` / `businessCategories`) dodaj `image: '/kategorije/avto.webp'`. Na namizju slika napolni ploščico izbirnika (`.cat__media` v `CategoryExplorer.astro`); na telefonu je za zdaj skrita. Preveri kontrast besedila nad sliko.
- **Fotografija svetovalca (OBVEZNO pred objavo):** zdaj je začasna nevtralna silhueta `public/svetovalec/portret.svg` (ni fotografija svetovalca). Zamenjava: shrani fotografijo v `public/svetovalec/` (WebP/AVIF, pokončno ~1200 × 1500 px) in v `src/data/content.ts` → `about.portrait` spremeni `src`, nastavi `alt` (npr. 'Aljaž, zavarovalni svetovalec') in po potrebi `position` (izrez, privzeto '50% 28%'). Steklena plošča prekriva spodnjo tretjino — obraz naj bo v zgornji polovici.
- Besede na stekleni plošči (Osebni pristop · Razumeti. Svetovati. Zaščititi.) so vizualni predlog — potrdi ali spremeni v `about.glassLabel` / `about.glassWords`.

## 15. Pet področij na pot (faza 4)
- Posamezniki: Avtomobilska zavarovanja · Zavarovanje doma in nepremičnin · Finančna zaščita · Varčevanje, naložbe in finančno svetovanje · Skrb za mlade. Zavarovalno posredništvo je sekcija »Način dela« (`Approach.astro`), ne šesta kategorija.
- Podjetja: Poslovna zavarovanja · Zavarovanje odgovornosti podjetij · Zavarovalno posredništvo · Finančno načrtovanje in svetovanje · Naložbe in skladi.
- **Potrdi pred objavo (`provisional: true`):** celotni področji »Finančno načrtovanje in svetovanje« in »Naložbe in skladi« (vsebina je predlog; preveri tudi, ali so za naložbe/sklade potrebna dovoljenja), storitve Finančno svetovanje (posamezniki), Finančni načrt, Vzajemni skladi, Poklicna odgovornost, Zavarovanje zaposlenih, Vozila in vozni park, Poslovna prekinitev.
- Zrno na ploščicah izbirnika: `--cat-grain` v `CategoryExplorer.astro` (0 = izklopljeno).
