# Izvještaj o radu — Issue #139: Greška kod rješavanja kviza (izlazak iz Quasara)

**Student:** Franko Krstić
**Tim:** JBT
**Repozitorij:** vdavid033/iooa-2026-kviz (grana `development`)
**Datum:** 23. kolovoza 2026.

## 1. Prijavljena greška

> **Greška kod rješavanja kviza** (korisnik nije logiran)
>
> - Nakon dolaska do kraja kviza → klik na „Prihvati i završi” → pojavi se poruka
>   „Kraj kviza” i **aplikacija se završava (izlazak iz Quasara)**.
> - Ista situacija ako se želi ranije završiti kviz.
> - Dodatno se na dnu pojavljuje notifikacija da korisnik mora biti logiran da bi se
>   podaci spremili.
>
> Naknadno pojašnjenje: greška se javlja i odmah — **izlazak iz Quasara nakon klika na
> „Započnite kviz”**. Na grani `tim_jbt` greške nema.

## 2. Metoda testiranja

Greška je reproducirana automatiziranim end-to-end testom:

- pokrenut backend (`node backend/index.js`, baza `student.veleri.hr / iooa_biljnedev`),
- pokrenut `quasar dev` s **neizmijenjenom** konfiguracijom projekta,
- preglednik Google Chrome vođen preko Chrome DevTools Protokola (klikovi, čitanje DOM-a,
  hvatanje iznimaka, mrežnih grešaka i snimke zaslona),
- nakon svakog koraka provjeravano je je li `quasar dev` proces još živ
  (`GET http://localhost:8080/`).

Okruženje: macOS 24.6.0, **Node.js v22.12.0**, npm 10.9.0, Quasar v2.6.6,
@quasar/app-webpack v3.5.1.

## 3. Uzrok greške

Nije riječ o grešci u Vue kodu kviza, nego o **rušenju samog `quasar dev` procesa** — doslovno
„izlazak iz Quasara”: razvojni server se ugasi i korisnik se vrati u terminal.

Lanac događaja:

1. Na grani `development` stranica `KvizPage5.vue` uvodi zvučni feedback na odgovor:

   ```js
   import correctSound from "src/assets/correct.mp3";
   import incorrectSound from "src/assets/incorrect.mp3";

   const correctAudio = new Audio(correctSound);
   correctAudio.preload = "auto";
   ```

2. Klik na „Započnite kviz” montira `KvizPage5`, a `<audio>` element odmah zatraži datoteku
   `/media/incorrect.<hash>.mp3` — i to **s `Range` zaglavljem**, jer preglednici medijske
   datoteke dohvaćaju u dijelovima.
3. `webpack-dev-server` poslužuje rezultat builda iz memorije, preko paketa **`memfs`**.
   Kod parcijalnog odgovora (HTTP 206) stream se uništava, pri čemu se poziva `memfs`-ov
   `FsReadStream.close()`, koji izvršava:

   ```js
   this.closed = true;   // memfs 3.4.1, lib/volume.js:2047
   ```

4. Od **Node.js verzije 18** svojstvo `Readable.prototype.closed` ima **samo getter**, pa
   gornje pridruživanje baca:

   ```
   TypeError: Cannot set property closed of #<Readable> which has only a getter
   ```

5. Iznimka se emitira kao neuhvaćeni `'error'` event na streamu → Node ruši cijeli proces →
   **`quasar dev` prestaje raditi**.

### 3.1. Dokaz izolacijom

Na svježe pokrenutom razvojnom serveru izvršeni su pojedinačni zahtjevi:

| Zahtjev | Odgovor | Stanje `quasar dev` nakon toga |
|---|---|---|
| `GET /index.html` | 200 | živ |
| `GET /media/incorrect.<hash>.mp3` (cijela datoteka) | 200 | živ |
| `GET /media/incorrect.<hash>.mp3` s `Range: bytes=0-1023` | **206** | **srušen** (+ `TypeError` u logu) |
| prekinuta veza usred prijenosa iste datoteke | — | **srušen** (+ `TypeError` u logu) |

Kroz stvarni korisnički tok: početna stranica → klik „ZAPOČNITE KVIZ” → u konzoli
`Failed to load resource: net::ERR_EMPTY_RESPONSE @ /media/incorrect.4b6f478d.mp3`, zatim
`WebSocket connection to 'ws://localhost:8080/ws' failed` (pao je i HMR), a razvojni server
više ne odgovara.

### 3.2. Zašto greške nema na grani `tim_jbt`

`git diff origin/tim_jbt development -- KvizPage5.vue` pokazuje da su `import ... .mp3`,
`new Audio(...)` i `playFeedbackSound()` **dodani na grani `development`**. Na `tim_jbt` te
datoteke uopće nisu dio bundlea, pa preglednik nikad ne pošalje `Range` zahtjev za medijskom
datotekom i greška u `memfs`-u se ne aktivira. Grana `tim_jbt` nije ispravnija — samo ne dira
pokvarenu putanju.

### 3.3. Zašto je u prvotnoj prijavi izgledalo kao da puca tek na kraju kviza

Razvojni server umire **već pri ulasku u kviz**, ali SPA u pregledniku nastavlja raditi jer je
sav JavaScript već učitan. Prvi trenutak kad preglednik ponovno nešto zatraži od mrtvog servera
bio je gumb „Početna” u dijalogu „Kraj kviza”, koji je u ranijoj verziji koristio `href="/"`
(puno učitavanje stranice) — tada se prikaže „site can't be reached”, što je korisnik opisao kao
„aplikacija se završava”. Taj `href="/"` u međuvremenu je zamijenjen s
`v-close-popup` + `$router.push('/')` (commit `026c9bed`), pa se pad sada primijeti ranije —
odmah nakon klika na „Započnite kviz”.

## 4. Rješenje

Greška je u razvojnoj ovisnosti, a ne u kodu aplikacije, pa je i popravak napravljen ondje.
`memfs` verzije 3.5.3 sadrži upravo ovaj popravak (uz komentar u izvornom kodu
*„Since Node 18, there is only a getter for '.closed'”*):

```js
if (typeof this._readableState?.closed === 'boolean') {
    this._readableState.closed = true;
}
else {
    this.closed = true;
}
```

`webpack-dev-middleware@5.3.1` traži `memfs: ^3.4.1`, pa verzija 3.5.3 ulazi bez ikakvih drugih
izmjena. U `frontend/quasar-project/package.json` dodano je:

```jsonc
"overrides": {
  "memfs": "^3.5.3"
}
```

nakon čega je pokrenut `npm install`. Promjene u repozitoriju:

- `frontend/quasar-project/package.json` — dodan blok `overrides`,
- `frontend/quasar-project/package-lock.json` — `memfs` 3.4.1 → 3.5.3, `fs-monkey` 1.0.3 → 1.1.0
  (obje su `dev` ovisnosti, produkcijski bundle se ne mijenja).

**Nijedna datoteka aplikacije nije mijenjana.** Popravak vrijedi za sve medijske datoteke i za
sve članove tima (svatko nakon `git pull` pokrene `npm install`).

### 4.1. Razmotrene alternative

| Alternativa | Zašto nije odabrana |
|---|---|
| Premjestiti mp3 datoteke u `public/` i dohvaćati ih URL-om | Zaobilazi simptom, ne uklanja uzrok; svaka buduća medijska datoteka u `src/assets/` opet ruši server |
| Ukloniti zvuk ili `preload="auto"` | Gubi se funkcionalnost, a prva reprodukcija svejedno šalje `Range` zahtjev — samo pomiče trenutak pada |
| Vratiti stariju verziju Node.js-a | Nije praktično nametnuti cijelom timu; problem je u zastarjelom `memfs`-u |

## 5. Provjera ispravnosti nakon popravka

Svi testovi ponovljeni su s **neizmijenjenom** konfiguracijom projekta (`open: true`).

**Izolirani testovi** (isti koji su prije rušili server):

| Zahtjev | Odgovor | Stanje `quasar dev` |
|---|---|---|
| `Range: bytes=0-1023` na mp3 | 206 | **živ (200)** |
| prekinuta veza usred prijenosa mp3 | — | **živ (200)** |
| broj `TypeError` u logu servera | — | **0** |

**Puni korisnički tok** (razvojni server provjeren nakon svakog koraka):

| # | Korak | Rezultat | Server |
|---|---|---|---|
| 1 | Učitana početna stranica | OK | 200 |
| 2 | Klik „Započnite kviz” | `#/kviz5`, pitanje prikazano | 200 |
| 3 | Odgovor na pitanje (svira se zvuk) | dijalog ✗ NETOČNO + zanimljivost | 200 |
| 4 | Klik OK → sljedeće pitanje | pitanje 2 učitano | 200 |
| 5 | **Puno osvježavanje stranice** (prije je ovdje pucalo) | stranica se normalno učita | 200 |
| 6 | Klik „Prihvati i završi” | dijalog „Kraj kviza” + notifikacija o prijavi (na vrhu) | 200 |
| 7 | Klik „POČETNA” | `#/`, ostaje unutar Quasar aplikacije | 200 |

Greške u konzoli preglednika: **nema**. Neuspjeli mrežni zahtjevi: **nema**.

**Odigran cijeli kviz** (10 pitanja, zvuk nakon svakog odgovora): server je nakon svakog
pitanja odgovarao sa 200, kviz je uredno završio dijalogom
„Kraj kviza | Točno: 5 | Netočno: 5 | Bodovi: 14”.

**Produkcijski build:** `quasar build` prolazi uspješno (`compiled with success`) — `memfs` je
isključivo razvojna ovisnost, pa produkcija nije zahvaćena.

## 6. Status pojedinih simptoma iz #139

| Simptom iz prijave | Status |
|---|---|
| „aplikacija se završava (izlazak iz Quasara)” | **riješeno** — nadogradnja `memfs`-a |
| isto pri ranijem završetku kviza | **riješeno** — isti uzrok |
| pojavi se poruka „Kraj kviza” | očekivano ponašanje, radi ispravno |
| notifikacija da korisnik nije prijavljen (na dnu) | ranije popravljeno u commitu `026c9bed` — sada se prikazuje na vrhu, s jasnijim tekstom i gumbom „Prijava” |

## 7. Nalazi izvan opsega #139

Tijekom testiranja uočene su još neke greške koje **nisu dio prijave #139** i namjerno nisu
dirane u ovom popravku. Predlaže se otvaranje zasebnih issue-a:

1. **Krivo bodovanje pri završetku kviza.** Funkcija `handleFinish()` u `KvizPage5.vue` ne
   koristi `checkAnswer()`, nego vlastitu usporedbu `state.odabraniOdgovor === state.tocanOdgovor.id`,
   koja vrijedi samo za pitanja s ponuđenim odgovorima. Kod pitanja s prazninom i kod pitanja
   točno/netočno odgovor se **uvijek** boduje kao netočan (izmjereno: 0/4 točnih uz unesen
   ispravan odgovor, dok kontrolni gumb „Prihvati odgovor” daje 3/3 točnih). Kako je na 10.
   pitanju gumb „Prihvati odgovor” skriven, zadnje pitanje uvijek prolazi kroz ovu putanju.
2. **`MainLayout.vue`** — gumb „Početna stranica” još uvijek koristi `href="/"` (isti obrazac
   koji je popravljen u dijalogu kviza).
3. Za zadnji odgovor u kvizu nema povratne informacije (točno/netočno, zvuk, zanimljivost).
4. Grana `questionNumber >= 10` u `nextQuestion()` je nedostižan kod.

## 8. Zaključak

Uzrok greške #139 je nekompatibilnost zastarjele razvojne ovisnosti `memfs@3.4.1` s Node.js-om
18+, koja se aktivira tek otkad `KvizPage5.vue` učitava mp3 datoteke — zbog čega se greška
pojavljuje na grani `development`, a ne na `tim_jbt`. Popravak je nadogradnja `memfs`-a na
3.5.3 putem `overrides` u `package.json`. Greška je nakon popravka provjerena i **više se ne
reproducira** ni u izoliranim testovima ni u punom korisničkom toku, a produkcijski build i
dalje prolazi.
