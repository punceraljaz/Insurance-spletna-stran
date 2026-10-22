/**
 * VSEBINA SPLETNE STRANI
 *
 * Oznake v komentarjih:
 *   [PDF]          besedilo prevzeto iz "struktura spletna.pdf"
 *   [PREDLOG]      novo spremno besedilo (oblikovni predlog) — preveri pred objavo
 *   [PLACEHOLDER]  izmišljena/začasna vsebina — OBVEZNO zamenjaj pred objavo (glej TODO.md)
 *
 * `provisional: true` pri storitvi pomeni: kategorija NI potrjena v PDF-ju.
 * Na strani je predstavljena previdno (»preverimo, ali je za vas smiselno …«) in ne
 * trdi, da jo svetovalec zagotovo ponuja. Pred objavo potrdi ali odstrani (glej TODO.md).
 */

export type Audience = 'posamezniki' | 'podjetja';

export const site = {
  brandName: 'AC', // [PLACEHOLDER] začasna oznaka znamke — potrdi
  advisorFirstName: 'Aljaž', // [PDF]
  advisorFullName: 'Aljaž', // [PLACEHOLDER] priimek ni znan — dopolni
  brandSub: 'Zavarovalno svetovanje', // [PLACEHOLDER] potrdi uradni naziv dejavnosti
  // [PLACEHOLDER] fiktivni kontakti — ne vodijo do resnične osebe
  phoneDisplay: '040 000 000',
  email: 'aljaz@example.com', // example.com je rezervirana domena (RFC 2606)
  hours: 'Pon–pet, 8.00–16.00', // [PLACEHOLDER] dosegljivost
  location: 'Srečanje v živo po dogovoru', // [PLACEHOLDER] dodaj naslov
};

/* ============================================================
   VSTOPNA STRAN (izbira poti)
   ============================================================ */
export const gate = {
  // Naslovnica: ena izjava, en stavek, dve izbiri. Prelom vrstic je oblikovan ročno.
  statement: ['Prave odločitve.', 'Več miru.'], // [UPORABNIK] potrjen slogan
  support: 'Svetovanje za tisto, kar vam pomeni največ.', // [UPORABNIK]
  choicesLabel: 'Izberite, za koga iščete zavarovanje',
  choices: { posamezniki: 'Za posameznike', podjetja: 'Za podjetja' } as Record<Audience, string>,
};

export const audiences: Record<Audience, {
  href: string;
  choice: string;
  choiceSub: string;
  choiceText: string;
  switchLabel: string;
  chapter: string;
}> = {
  posamezniki: {
    href: '/posamezniki/',
    choice: 'Zase in za družino',
    choiceSub: 'Zavarovanja za posameznike',
    choiceText: 'Avto, dom, zdravje, družina in prihodnost.', // [PDF — razširjeno]
    switchLabel: 'Posamezniki',
    chapter: 'mist',
  },
  podjetja: {
    href: '/podjetja/',
    choice: 'Za podjetje',
    choiceSub: 'Zavarovanja in svetovanje za podjetja',
    choiceText: 'Posredništvo, kritja in analiza tveganj.', // [PDF]
    switchLabel: 'Podjetja',
    chapter: 'slate',
  },
};

/** Navigacija posamezne poti — jasne, preproste oznake */
export const navByAudience: Record<Audience, { href: string; label: string }[]> = {
  posamezniki: [
    { href: '#zavarovanja', label: 'Področja' },
    { href: '#o-meni', label: 'O svetovalcu' },
    { href: '#nacin-dela', label: 'Način dela' },
    { href: '#pregled', label: 'Pregled police' },
    { href: '#vprasanja', label: 'Vprašanja' },
    { href: '#kontakt', label: 'Kontakt' },
  ],
  podjetja: [
    { href: '#zavarovanja', label: 'Področja' },
    { href: '#k-posrednistvo', label: 'Posredništvo' },
    { href: '#o-meni', label: 'O svetovalcu' },
    { href: '#pregled', label: 'Pregled police' },
    { href: '#vprasanja', label: 'Vprašanja' },
    { href: '#kontakt', label: 'Kontakt' },
  ],
};

/* ============================================================
   STORITVE
   ============================================================ */
export interface Service {
  id: string;
  kind: 'zavarovanje' | 'svetovanje';
  title: string;
  short: string; // ena vrstica na kartici
  text: string; // daljša razlaga (prikaže se ob razširitvi)
  situations: string[]; // »Kdaj vam to pride prav« [PREDLOG]
  cta: string;
  bookingType: string; // vrednost vrste svetovanja v obrazcu
  icon: string; // ime ikone iz components/Icon.astro
  /** Slika kategorije, npr. '/kategorije/avto.webp' (mapa public/kategorije). Brez slike: tonski preliv. */
  image?: string;
  provisional?: boolean;
}

/* ------------------------------------------------------------
   KATEGORIJE — natanko pet na pot, v tem vrstnem redu (potrdil naročnik).
   Izbirnik prikaže naslov + en stavek; vse podrobnosti so v odprtem področju.
   `provisional: true` = vsebina področja še ni potrjena (glej TODO.md).
   `image` (neobvezno) = fotografija za ploščico v kasnejši fazi, npr. '/kategorije/avto.webp'.
   ------------------------------------------------------------ */
export interface Category {
  id: string;
  title: string;
  short: string; // en stavek na ploščici
  intro: string; // uvod v odprtem področju
  services: Service[];
  points?: string[]; // kratek seznam »kaj vključuje«
  steps?: { title: string; text: string }[]; // potek sodelovanja
  cta: string;
  ctaTopic: string;
  bookingType: string;
  image?: string;
  provisional?: boolean;
}

/** Pot A — posamezniki in družine */
export const individualsPage = {
  label: 'Posamezniki in družine',
  title: 'Zavarovanja za', // [PREDLOG]
  titleAccent: 'posameznike in družine.', // [PREDLOG]
  cta: 'Rezerviraj posvet',
};

export const individualCategories: Category[] = [
  {
    id: 'avto',
    image: '/kategorije/avto.jpg',
    title: 'Avtomobilska zavarovanja', // [NAROČNIK]
    short: 'AO, kasko in asistenca.', // [PREDLOG]
    intro: 'Obvezno zavarovanje, kasko in dodatna kritja za vozilo. Primerjava kritij in premij več zavarovalnic.', // [PDF + PREDLOG]
    services: [
      {
        id: 'avto',
        icon: 'avto',
        kind: 'zavarovanje',
        title: 'Obvezno in kasko zavarovanje', // [PDF]
        short: 'AO, kasko, asistenca in dodatna kritja.', // [PREDLOG]
        text: 'Obvezno zavarovanje (AO), kasko, asistenca in dodatna kritja za vozilo. Primerjava kritij in premij.', // [PDF + PREDLOG]
        situations: ['Nakup novega ali rabljenega vozila.', 'Iztek obstoječe police.', 'Odločitev o kasku ali asistenci.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'zavarovalno',
      },
    ],
    cta: 'Rezerviraj posvet',
    ctaTopic: 'Avtomobilska zavarovanja',
    bookingType: 'zavarovalno',
  },
  {
    id: 'dom',
    image: '/kategorije/nepremicnine.jpg',
    title: 'Zavarovanje doma in nepremičnin', // [NAROČNIK]
    short: 'Hiša, stanovanje in oprema.', // [PREDLOG]
    intro: 'Zaščita hiše, stanovanja in opreme pred požarom, vodo, vlomom in naravnimi nesrečami.', // [PDF + PREDLOG]
    services: [
      {
        id: 'dom',
        icon: 'dom',
        kind: 'zavarovanje',
        title: 'Hiša, stanovanje in oprema', // [PDF]
        short: 'Požar, voda, vlom, naravne nesreče.', // [PREDLOG]
        text: 'Zavarovanje hiše, stanovanja in opreme pred požarom, vodo, vlomom in naravnimi nesrečami. Preverba zavarovalne vsote.', // [PDF + PREDLOG]
        situations: ['Nakup ali najem nepremičnine.', 'Prenova ali nova oprema.', 'Nejasno kritje obstoječe police.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'zavarovalno',
      },
    ],
    cta: 'Rezerviraj posvet',
    ctaTopic: 'Zavarovanje doma in nepremičnin',
    bookingType: 'zavarovalno',
  },
  {
    id: 'mladi',
    image: '/kategorije/mladi.jpg',
    title: 'Skrb za mlade', // [PDF]
    short: 'Varčevanje in zaščita za otroke.', // [PREDLOG]
    intro: 'Varčevanje in nezgodna zaščita za otroke, dijake in študente.', // [PDF]
    services: [
      {
        id: 'mladi',
        icon: 'druzina',
        kind: 'zavarovanje',
        title: 'Varčevanje za otroke', // [PDF: »Skrb za mlade«]
        short: 'Za šolanje, študij ali prvi dom.', // [PREDLOG]
        text: 'Dolgoročno varčevanje za otroka, ki ga lahko začnete ob rojstvu ali kasneje.', // [PREDLOG]
        situations: ['Varčevanje za šolanje ali študij.', 'Darilo ob rojstvu.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'financno',
      },
      {
        id: 'mladi-nezgoda',
        icon: 'nezgoda',
        kind: 'zavarovanje',
        title: 'Nezgodna zaščita otrok', // [PDF]
        short: 'V šoli, pri športu in prostem času.', // [PREDLOG]
        text: 'Nezgodno zavarovanje otrok, dijakov in študentov za šolo, šport in prosti čas.', // [PDF + PREDLOG]
        situations: ['Otroci v šoli in pri dejavnostih.', 'Tekmovalni šport.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'zavarovalno',
      },
    ],
    cta: 'Rezerviraj posvet',
    ctaTopic: 'Skrb za mlade',
    bookingType: 'financno',
  },
  {
    id: 'zascita',
    image: '/kategorije/dom.png',
    title: 'Finančna zaščita', // [NAROČNIK]
    short: 'Življenjsko, nezgodno in zdravstveno.', // [PREDLOG]
    intro: 'Izplačila ob smrti, hudi bolezni ali nezgodi in dodatna zdravstvena kritja.', // [PDF + PREDLOG]
    services: [
      {
        id: 'zivljenjsko',
        icon: 'zivljenje',
        kind: 'zavarovanje',
        title: 'Življenjsko zavarovanje', // [PDF: »Življenjska«]
        short: 'Izplačilo ob smrti ali hudi bolezni.', // [PREDLOG]
        text: 'Izplačilo družini ob smrti ali zavarovancu ob hudi bolezni. Določitev ustrezne zavarovalne vsote.', // [PDF + PREDLOG]
        situations: ['Družina je odvisna od vašega dohodka.', 'Odplačevanje stanovanjskega kredita.', 'Zavarovanje kredita ali posojila.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'zavarovalno',
      },
      {
        id: 'nezgodno',
        icon: 'nezgoda',
        kind: 'zavarovanje',
        title: 'Nezgodno zavarovanje', // [PDF: »nezgodna«]
        short: 'Izplačilo ob poškodbi zaradi nezgode.', // [PREDLOG]
        text: 'Izplačilo ob poškodbi, invalidnosti ali smrti zaradi nezgode — doma, na poti, pri delu ali športu.', // [PREDLOG]
        situations: ['Šport in pogosta potovanja.', 'Fizično zahtevno delo.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'zavarovalno',
      },
      {
        id: 'zdravstveno',
        icon: 'zdravje',
        kind: 'zavarovanje',
        title: 'Zdravstveno zavarovanje', // [PDF: »zdravstvena«]
        short: 'Dopolnilno in dodatno zavarovanje.', // [PREDLOG]
        text: 'Dodatna zdravstvena zavarovanja poleg obveznega: hitrejši dostop do specialistov, operacije, zdravila.', // [PREDLOG]
        situations: ['Krajše čakalne dobe pri specialistih.', 'Primerjava obstoječih zdravstvenih zavarovanj.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'zavarovalno',
      },
    ],
    cta: 'Rezerviraj posvet',
    ctaTopic: 'Finančna zaščita',
    bookingType: 'zavarovalno',
  },
  {
    id: 'varcevanje',
    image: '/kategorije/varcevanje.jpg',
    title: 'Varčevanje, naložbe in finančno svetovanje', // [NAROČNIK]
    short: 'Dolgoročno varčevanje in pokojnina.', // [PREDLOG]
    intro: 'Dolgoročno varčevanje, naložbena zavarovanja in dodatno pokojninsko varčevanje. Brez obljub o donosih: tveganje in ročnost določimo skupaj.', // [PDF + PREDLOG]
    services: [
      {
        id: 'nacrtovanje',
        icon: 'nacrtovanje',
        kind: 'zavarovanje',
        title: 'Varčevanje in naložbe', // [PDF: »Finančno načrtovanje«]
        short: 'Varčevanje, naložbena zavarovanja, pokojnina.', // [PREDLOG]
        text: 'Dolgoročno varčevanje, naložbena zavarovanja in dodatno pokojninsko varčevanje.', // [PDF + PREDLOG]
        situations: ['Dodatno pokojninsko varčevanje.', 'Redno varčevanje za večji cilj.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'financno',
      },
      {
        id: 'financno-svetovanje',
        icon: 'svetovanje',
        kind: 'svetovanje',
        title: 'Finančno svetovanje', // [NAROČNIK — vsebina PREDLOG, potrdi]
        short: 'Pregled ciljev, rokov in tveganja.', // [PREDLOG]
        text: 'Pregled finančnih ciljev, časovnega okvira in sprejemljivega tveganja. Predlog načina varčevanja.', // [PREDLOG]
        situations: ['Prvi korak pri varčevanju.', 'Pregled obstoječih varčevalnih pogodb.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'financno',
        provisional: true,
      },
    ],
    cta: 'Rezerviraj finančni posvet',
    ctaTopic: 'Varčevanje, naložbe in finančno svetovanje',
    bookingType: 'financno',
  },
];

/**
 * Zavarovalno posredništvo za posameznike: ni šesta kategorija, ampak način dela
 * pri vseh zavarovanjih zgoraj (sekcija »Način dela«).
 */
export const individualApproach = {
  label: 'Način dela',
  title: 'Zavarovalno', // [PREDLOG]
  titleAccent: 'posredništvo.', // [PREDLOG]
  intro: 'Velja za vsa področja: analiza potreb, ponudbe več zavarovalnic, pomoč po sklenitvi.', // [PDF + PREDLOG]
  points: [
    { k: 'Analiza potreb', v: 'Katera kritja potrebujete in v kakšni višini.' },
    { k: 'Primerjava ponudb', v: 'Kritja, izključitve in premije več zavarovalnic.' },
    { k: 'Pregled polic', v: 'Vrzeli in podvojena kritja v obstoječih policah.' },
    { k: 'Pomoč pri škodi', v: 'Prijava, dokumentacija in komunikacija z zavarovalnico.' },
  ], // [PDF + PREDLOG]
  services: [
    {
      id: 'pregled',
      icon: 'pregled',
      kind: 'svetovanje',
      title: 'Pregled obstoječih zavarovanj', // [PDF]
      short: 'Kritja, vrzeli, podvojena zavarovanja.', // [PREDLOG]
      text: 'Pregled vseh vaših polic: kaj krijejo, kje so vrzeli in katera kritja se podvajajo.', // [PDF FAQ + PREDLOG]
      situations: ['Več polic pri različnih zavarovalnicah.', 'Življenjske spremembe: poroka, otrok, upokojitev.'],
      cta: 'Pošlji polico v pregled',
      bookingType: 'pregled',
    },
    {
      id: 'osebno',
      icon: 'svetovanje',
      kind: 'svetovanje',
      title: 'Osebni posvet', // [PDF: »Zavarovalno svetovanje«]
      short: 'V živo, po telefonu ali video klicu.', // [PREDLOG]
      text: 'Posvet v živo, po telefonu ali video klicu. Analiza potreb in predlog zavarovanj.', // [PDF booking + PREDLOG]
      situations: ['Prva ureditev zavarovanj.', 'Drugo mnenje o prejeti ponudbi.', 'Prijava škode.'],
      cta: 'Rezerviraj posvet',
      bookingType: 'zavarovalno',
    },
  ] as Service[],
};

/** Pot B — podjetja in podjetniki */
export const businessPage = {
  label: 'Podjetja in podjetniki', // [PDF]
  title: 'Zavarovanja in svetovanje', // [PREDLOG]
  titleAccent: 'za podjetja.', // [PREDLOG]
  cta: 'Rezerviraj poslovni posvet',
};

export const businessCategories: Category[] = [
  {
    id: 'poslovna',
    image: '/kategorije/poslovna.jpg',
    title: 'Poslovna zavarovanja', // [NAROČNIK]
    short: 'Premoženje, zaposleni, vozila, prekinitev.', // [PREDLOG]
    intro: 'Zaščita premoženja, zaposlenih in poslovanja. Ponudba je odvisna od dejavnosti podjetja in zavarovalnice.', // [PREDLOG]
    services: [
      {
        id: 'premozenje',
        icon: 'stavba',
        kind: 'zavarovanje',
        title: 'Premoženje podjetja', // [PDF: »Premoženje«]
        short: 'Prostori, oprema, stroji in zaloge.', // [PREDLOG]
        text: 'Zaščita poslovnih prostorov, opreme, strojev in zalog pred požarom, vodo, vlomom in drugimi nevarnostmi.', // [PREDLOG]
        situations: ['Lastni ali najeti poslovni prostori.', 'Draga oprema ali stroji.', 'Večje zaloge blaga.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
      },
      {
        id: 'zaposleni',
        icon: 'zaposleni',
        kind: 'zavarovanje',
        title: 'Zavarovanje zaposlenih', // PROVISIONAL — ni v PDF
        short: 'Kolektivno nezgodno in zdravstveno.', // [PREDLOG]
        text: 'Kolektivno nezgodno in dodatno zdravstveno zavarovanje zaposlenih.', // [PREDLOG]
        situations: ['Ugodnosti za zaposlene.', 'Delo z večjim tveganjem poškodb.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
        provisional: true,
      },
      {
        id: 'vozila',
        icon: 'vozni-park',
        kind: 'zavarovanje',
        title: 'Vozila in vozni park', // PROVISIONAL — ni v PDF za podjetja
        short: 'Službena in dostavna vozila.', // [PREDLOG]
        text: 'AO in kasko za službena in dostavna vozila. Ena polica za celoten vozni park.', // [PREDLOG]
        situations: ['Službena ali dostavna vozila.', 'Poenotenje polic za več vozil.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
        provisional: true,
      },
      {
        id: 'prekinitev',
        icon: 'prekinitev',
        kind: 'zavarovanje',
        title: 'Poslovna prekinitev', // PROVISIONAL — ni v PDF
        short: 'Izpad prihodka ob zastoju poslovanja.', // [PREDLOG]
        text: 'Krije izpad prihodka in stalne stroške, ko poslovanje zaradi zavarovane škode (npr. požara) zastane.', // [PREDLOG]
        situations: ['Proizvodnja na eni lokaciji.', 'Stalne obveznosti: najemnina, plače.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
        provisional: true,
      },
    ],
    cta: 'Rezerviraj poslovni posvet',
    ctaTopic: 'Poslovna zavarovanja',
    bookingType: 'poslovno',
  },
  {
    id: 'odgovornost',
    image: '/kategorije/odgovornost.jpg',
    title: 'Zavarovanje odgovornosti podjetij', // [NAROČNIK]
    short: 'Škoda, povzročena strankam in tretjim.', // [PREDLOG]
    intro: 'Krije škodo, ki jo podjetje ali zaposleni povzročijo strankam ali drugim osebam.', // [PREDLOG]
    services: [
      {
        id: 'splosna-odgovornost',
        icon: 'odgovornost',
        kind: 'zavarovanje',
        title: 'Splošna odgovornost', // [PDF: »odgovornost«]
        short: 'Škoda tretjim osebam pri poslovanju.', // [PREDLOG]
        text: 'Krije škodo, ki jo podjetje ali zaposleni pri poslovanju povzročijo strankam, obiskovalcem ali drugim osebam.', // [PREDLOG]
        situations: ['Stranke ali obiskovalci v prostorih.', 'Dela in storitve pri strankah.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
      },
      {
        id: 'poklicna-odgovornost',
        icon: 'odgovornost',
        kind: 'zavarovanje',
        title: 'Poklicna odgovornost', // PROVISIONAL — ni v PDF
        short: 'Napake pri opravljanju poklica.', // [PREDLOG]
        text: 'Krije premoženjsko škodo, ki nastane zaradi strokovne napake pri opravljanju poklica.', // [PREDLOG]
        situations: ['Svetovanje ali projektiranje.', 'Pogodbena zahteva naročnika.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
        provisional: true,
      },
    ],
    cta: 'Rezerviraj poslovni posvet',
    ctaTopic: 'Zavarovanje odgovornosti podjetij',
    bookingType: 'poslovno',
  },
  {
    id: 'posrednistvo',
    image: '/kategorije/zavarovalno-posrednistvo.jpg',
    title: 'Zavarovalno posredništvo', // [PDF: »Posredništvo«]
    short: 'Analiza tveganj, ponudbe, škode.', // [PREDLOG]
    intro: 'Pridobitev in primerjava ponudb več zavarovalnic, pregled obstoječih polic in pomoč pri škodnih zahtevkih.', // [PDF — skrajšano]
    points: ['Analiza in ocena poslovnih tveganj', 'Pregled obstoječih zavarovalnih polic', 'Primerjava ponudb in pogojev', 'Podpora pri urejanju škodnih zahtevkov'], // [PDF]
    steps: [
      { title: 'Analiza poslovnih tveganj', text: 'Ključne nevarnosti in vrzeli v kritju.' }, // [PDF]
      { title: 'Zavarovalni program', text: 'Potrebna kritja, limiti in prednostne naloge.' }, // [PDF]
      { title: 'Primerjava ponudb', text: 'Rešitve in pogoji več zavarovalnic.' }, // [PDF]
      { title: 'Dolgoročna podpora', text: 'Spremembe kritij in pomoč pri škodah.' }, // [PDF]
    ],
    services: [
      {
        id: 'posredovanje',
        icon: 'posredovanje',
        kind: 'svetovanje',
        title: 'Pridobivanje in primerjava ponudb', // [PDF: »Posredništvo«]
        short: 'Ponudbe več zavarovalnic, pogajanje o pogojih.', // [PREDLOG]
        text: 'Pridobitev ponudb več zavarovalnic, primerjava pogojev in sklenitev zavarovanja.', // [PREDLOG]
        situations: ['Primerjava ponudb več zavarovalnic.', 'Pogajanje o pogojih in premijah.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
      },
      {
        id: 'pregled-polic',
        icon: 'pregled',
        kind: 'svetovanje',
        title: 'Pregled obstoječih polic', // [PDF]
        short: 'Kritja, vrzeli, previsoke premije.', // [PREDLOG]
        text: 'Pregled vseh polic podjetja: kaj krijejo, kje so vrzeli in kje so premije previsoke.', // [PREDLOG]
        situations: ['Police, sklenjene pred leti.', 'Rast ali sprememba dejavnosti.'],
        cta: 'Pošlji police v pregled',
        bookingType: 'pregled',
      },
      {
        id: 'skode',
        icon: 'skoda',
        kind: 'svetovanje',
        title: 'Pomoč pri škodnih zahtevkih', // [PDF]
        short: 'Prijava in urejanje škode do izplačila.', // [PREDLOG]
        text: 'Prijava škode, zbiranje dokumentacije in komunikacija z zavarovalnico do izplačila.', // [PDF + PREDLOG]
        situations: ['Prijava nove škode.', 'Zapleten ali zavrnjen zahtevek.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
      },
    ],
    cta: 'Rezerviraj poslovni posvet',
    ctaTopic: 'Zavarovalno posredništvo',
    bookingType: 'poslovno',
  },
  {
    id: 'financno-nacrtovanje',
    image: '/kategorije/financno-nacrtovanje.png',
    title: 'Finančno načrtovanje in svetovanje', // [NAROČNIK]
    short: 'Za podjetje in podjetnika.', // [PREDLOG]
    intro: 'Načrtovanje zaščite in finančnih obveznosti podjetja ter ločitev zasebnih in poslovnih tveganj.', // [PREDLOG — potrdi obseg]
    services: [
      {
        id: 'podjetniki',
        icon: 'podjetnik',
        kind: 'svetovanje',
        title: 'Svetovanje podjetnikom', // [PDF: »poslovni posvet«]
        short: 'Za s.p. in manjša podjetja.', // [PREDLOG]
        text: 'Posvet za samostojne podjetnike in manjša podjetja: zaščita podjetja in podjetnika.', // [PREDLOG]
        situations: ['Začetek poslovanja.', 'Ločitev zasebnih in poslovnih tveganj.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
      },
      {
        id: 'financni-nacrt',
        icon: 'nacrtovanje',
        kind: 'svetovanje',
        title: 'Finančni načrt', // PROVISIONAL — vsebina ni potrjena
        short: 'Cilji, obveznosti in rezerve podjetja.', // [PREDLOG]
        text: 'Pregled finančnih ciljev, obveznosti in rezerv podjetja ter predlog ukrepov za zaščito poslovanja.', // [PREDLOG]
        situations: ['Rast ali večja naložba.', 'Pregled finančne varnosti podjetja.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
        provisional: true,
      },
    ],
    cta: 'Rezerviraj poslovni posvet',
    ctaTopic: 'Finančno načrtovanje in svetovanje',
    bookingType: 'poslovno',
    provisional: true,
  },
  {
    id: 'nalozbe',
    image: '/kategorije/nalozbe.jpg',
    title: 'Naložbe in skladi', // [NAROČNIK]
    short: 'Prosta sredstva podjetja.', // [PREDLOG]
    intro: 'Posvet o nalaganju prostih sredstev podjetja. Brez obljub o donosih: tveganje, ročnost in razpršenost določimo skupaj.', // [PREDLOG — potrdi obseg in dovoljenja]
    services: [
      {
        id: 'skladi',
        icon: 'nacrtovanje',
        kind: 'svetovanje',
        title: 'Vzajemni skladi', // PROVISIONAL — vsebina ni potrjena
        short: 'Pregled možnosti in tveganj.', // [PREDLOG]
        text: 'Predstavitev vrst skladov, stroškov in tveganj. Odločitev o naložbi je vaša.', // [PREDLOG]
        situations: ['Presežna likvidna sredstva.', 'Dolgoročne rezerve podjetja.'],
        cta: 'Rezerviraj posvet',
        bookingType: 'poslovno',
        provisional: true,
      },
    ],
    cta: 'Rezerviraj poslovni posvet',
    ctaTopic: 'Naložbe in skladi',
    bookingType: 'poslovno',
    provisional: true,
  },
];

/* ============================================================
   SKUPNE SEKCIJE
   ============================================================ */
export const about = {
  label: 'O svetovalcu', // [PDF]
  title: 'Aljaž,', // [PREDLOG]
  titleAccent: 'zavarovalni svetovalec.', // [PREDLOG]
  text: 'Svetovanje pri izbiri, pregledu in urejanju zavarovanj za posameznike in podjetja. Podpora tudi po sklenitvi: spremembe polic in prijava škode.', // [PDF — skrajšano]
  principles: [
    { k: 'Jasno', v: 'Razlaga kritij, izključitev in pogojev.' },
    { k: 'Primerjava', v: 'Ponudbe več zavarovalnic na enem mestu.' },
    { k: 'Podpora', v: 'Pomoč pri spremembah in škodah.' },
  ], // [PREDLOG] povzeto iz besedila
  more: 'Način dela', // [PREDLOG] povezava: posamezniki → #nacin-dela, podjetja → #k-posrednistvo
  /**
   * PORTRET — ZAČASNA SLIKA (nevtralna silhueta, NI fotografija svetovalca).
   * Zamenjava: shrani fotografijo v public/svetovalec/ (WebP/AVIF, pokončno ~1200 × 1500 px)
   * in spremeni src; alt nastavi na npr. 'Aljaž, zavarovalni svetovalec'. position = izrez (object-position).
   */
  portrait: { src: '/svetovalec/portret.svg', alt: '', position: '50% 28%' },
  // Besedilo na stekleni plošči čez portret — [PREDLOG] vizualni koncept, ne trditev
  glassLabel: 'Osebni pristop',
  glassWords: ['Razumeti.', 'Svetovati.', 'Zaščititi.'],
};

export const partners = {
  label: 'Partnerji',
  title: 'Partnerji in',
  titleAccent: 'zavarovalnice.',
  strategic: {
    kicker: 'Strateški partner', // [PDF]
    name: 'JRM Finance', // [PDF] — TODO: potrdi dovoljenje za uporabo imena/logotipa
    text: 'Partner za zavarovalne in finančne storitve.', // [PDF — skrajšano]
    cta: 'Več o partnerju', // [PDF]
  },
  poweredBy: 'Powered by:',
  collaboratorsLabel: 'V sodelovanju z:',
  /**
   * Uradni vektorski logotipi (public/images/partners/), preneseni z uradnih spletnih strani.
   * `ratio` = širina / višina iz viewBox — za enako optično velikost na traku.
   * Na strani se prikažejo SAMO vnosi z `verified: true`.
   * TODO: seznam je posredoval naročnik; pred objavo pri JRM potrdi vsako sodelovanje.
   * Manjka: Best Doctors (ni uradnega vektorja), Primorski skladi (zdaj OTP Skladi — čaka odobritev).
   */
  collaborators: [
    { name: 'Zavarovalnica Triglav', src: '/images/partners/triglav.svg', ratio: 70 / 21, verified: true },
    { name: 'Generali', src: '/images/partners/generali.svg', ratio: 427.7 / 58.5, verified: true },
    { name: 'Wiener Städtische', src: '/images/partners/wiener-staedtische.svg', ratio: 481.9 / 288.1, verified: true },
    { name: 'Vzajemna', src: '/images/partners/vzajemna.svg', ratio: 200 / 40, verified: true },
    { name: 'PRVA osebna zavarovalnica', src: '/images/partners/prva.svg', ratio: 51 / 12, verified: true },
    { name: 'Allianz', src: '/images/partners/allianz.svg', ratio: 399.76 / 99.15, verified: true },
    { name: 'Merkur zavarovalnica', src: '/images/partners/merkur.svg', ratio: 657 / 159, verified: true },
  ],
};

type FaqAudience = Audience | 'vsi';
export const faq = {
  label: 'Vprašanja', // [PDF]
  title: 'Pogosta', // [PREDLOG]
  titleAccent: 'vprašanja.', // [PREDLOG]
  lead: '',
  // Vprašanja [PDF]; vsi odgovori so [PLACEHOLDER] osnutki, ki jih mora potrditi svetovalec.
  items: [
    { for: 'vsi' as FaqAudience, q: 'Pregled obstoječe police', a: 'Da. Pregled kritij, vrzeli in podvojenih zavarovanj. Polico naložite v obrazec ali jo prinesete na posvet.' },
    { for: 'vsi' as FaqAudience, q: 'Primerjava ponudb', a: 'Določimo potrebna kritja, pridobim ponudbe več zavarovalnic in pripravim pregled razlik v kritjih, pogojih in premijah.' },
    { for: 'podjetja' as FaqAudience, q: 'Analiza tveganj za podjetje', a: 'Ključne nevarnosti za poslovanje, vrzeli v obstoječem kritju, potrebna kritja in limiti.' },
    { for: 'vsi' as FaqAudience, q: 'Svetovanje na daljavo', a: 'Da. Video klic, telefon ali v živo — izberete ob rezervaciji.' },
    { for: 'posamezniki' as FaqAudience, q: 'Dokumenti za avtomobilsko zavarovanje', a: 'Prometno dovoljenje in obstoječa polica, če jo imate.' },
    { for: 'vsi' as FaqAudience, q: 'Pomoč po sklenitvi', a: 'Da. Spremembe polic, letni pregled kritij in urejanje škodnih zahtevkov.' },
    { for: 'vsi' as FaqAudience, q: 'Plačilo svetovanja', a: 'Odvisno od vrste storitve. Cena je znana pred začetkom sodelovanja.' },
  ],
};

export const policyReview = {
  label: 'Pošlji polico v pregled', // [UPORABNIK]
  title: 'Začnite s pregledom obstoječih zavarovanj.', // [UPORABNIK]
  text: 'Kritja, vrzeli in podvojena zavarovanja pregledamo skupaj. Pošljite polico in pripravimo naslednji korak.', // [UPORABNIK]
  helper: 'Odzovemo se z jasnim pregledom in predlogom naslednjih korakov.', // [UPORABNIK]
  cardTitle: 'Pregled police', // [PDF]
  dropTitle: 'Priložite polico', // [PDF — prirejeno]
  submit: 'Pošlji v pregled', // [UPORABNIK]
  /** Ozadje sekcije — zamenjava: nova slika v public/atmosfera/ in sprememba poti tukaj */
  background: { landscape: '/intake-bg.png', portrait: '/intake-bg.png' },
};

export const booking = {
  title: 'Rezervacija posveta', // [PDF]
  // [PDF] vrste svetovanja; prikaz je prilagojen izbrani poti
  types: [
    { value: 'zavarovalno', icon: 'svetovanje', label: 'Zavarovalno svetovanje', for: ['posamezniki', 'podjetja'] },
    { value: 'poslovno', icon: 'analiza', label: 'Poslovna zavarovanja in analiza tveganj', for: ['podjetja'] },
    { value: 'pregled', icon: 'pregled', label: 'Pregled obstoječih polic', for: ['posamezniki', 'podjetja'] },
    { value: 'financno', icon: 'nacrtovanje', label: 'Finančno načrtovanje', for: ['posamezniki'] },
  ] as { value: string; icon: string; label: string; for: Audience[] }[],
  defaultType: { posamezniki: 'zavarovalno', podjetja: 'poslovno' } as Record<Audience, string>,
  modes: [
    { value: 'video', icon: 'video', label: 'Video klic' },
    { value: 'telefon', icon: 'telefon', label: 'Telefon' },
    { value: 'zivo', icon: 'srecanje', label: 'V živo' },
  ], // [PDF]
  slots: ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00'], // [PDF] ilustrativne ure
  slotsNote: 'Prikazani so prosti termini v naslednjih dneh.', // [PREDLOG]
};

export const contact = {
  title: 'Kontakt', // [PREDLOG]
  titleAccent: 'in rezervacija.', // [PREDLOG]
  text: 'Telefon, e-pošta ali spletna rezervacija termina.', // [PREDLOG]
  legal: [
    { label: 'Pravne informacije', href: '/pravno/pravne-informacije/' },
    { label: 'Varstvo osebnih podatkov', href: '/pravno/varstvo-osebnih-podatkov/' },
    { label: 'Piškotki', href: '/pravno/piskotki/' },
    { label: 'Pritožbeni postopek', href: '/pravno/pritozbeni-postopek/' },
  ], // [PDF]
};
