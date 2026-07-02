# Izvještaj o radu — Korisnička priča #138: Galerija slika za dijelove biljaka

**Student:** Ivan Posel
**Tim:** JBT
**Repozitorij:** vdavid033/iooa-2026-kviz (grana `development`)
**Datum:** 2. srpnja 2026.

## 1. Zadatak

Dodijeljena mi je korisnička priča **#138 — Galerija slika za dijelove biljaka**:

> „Kao korisnik želim pogledati više slika pojedinog dijela biljke kako bih isti mogao
> raspoznati u prirodi. Primjer: želim vidjeti na slikama kako izgleda list jagode ili
> želim vidjeti kako izgleda cvijet mente.”

Prema uputama, priču sam zajedno s kolegom Frankom Krstićem razčlanio na manje pod-zadatke
(sub-issues), riješio svoj dio, izradio commitove i pripremio ovaj izvještaj.

## 2. Analiza postojećeg stanja

Prije implementacije analizirao sam postojeći kod i shemu baze:

- U bazi **već postoji** tablica `plant_part_image (plant_species_id, useful_part_id, image_id)`
  koja povezuje sliku s konkretnim dijelom konkretne biljke, no **nijedan dio aplikacije ju
  nije koristio**.
- Postojeća galerija (`AdminGallery.vue`) prikazuje slike vezane uz **cijelu biljnu vrstu**
  (`plant_species_image`), a ne uz pojedini dio biljke.

Zaključak: nije potrebna izmjena sheme baze — potrebno je izraditi backend API nad postojećom
tablicom te korisničko sučelje galerije po dijelu biljke.

## 3. Razčlamba na sub-issue-e

Priču #138 razčlanili smo na pet pod-zadataka (povezanih kao GitHub sub-issues):

| # | Pod-zadatak | Nositelj | Status |
|---|-------------|----------|--------|
| #140 | Backend API za slike po dijelu biljke | Ivan Posel | ✅ riješeno |
| #141 | Korisnička stranica za pregled slika po dijelu | Ivan Posel | ✅ riješeno |
| #144 | Prikaz opisa dijela biljke u galeriji | Ivan Posel | ✅ riješeno |
| #142 | Uvećani prikaz slike (lightbox) | Franko Krstić | u tijeku |
| #143 | Ulaz iz navigacije, filter po dijelu, prazna stanja | Franko Krstić | u tijeku |

Podjela je napravljena tako da moja polovica (#140, #141, #144) čini funkcionalnu okosnicu
(podaci + prikaz galerije s opisima dijelova), a kolegina polovica (#142, #143) dodaje
interakciju i integraciju u sučelje.

## 4. Što sam implementirao

### 4.1. Backend (#140) — `backend/index.js`

Dodao sam dva nova endpointa:

- `GET /plant_species_with_part_images` — vraća popis biljnih vrsta koje imaju barem jednu
  sliku vezanu uz neki dio biljke (koristi se za padajući izbornik u galeriji).
- `GET /plant_part_images/:plant_species_id` — za odabranu biljnu vrstu vraća sve njezine
  dijelove (list, cvijet, plod ...) s pripadajućim popisom slika, grupirano po dijelu.

Odgovori slijede postojeći format ostalih endpointa (`{ error, data }`). Dijelovi bez slika
vraćaju prazan niz `images` (ne izostavljaju se iz odgovora).

### 4.2. Frontend — korisnička stranica (#141) i prikaz opisa (#144)

Izradio sam novu korisničku stranicu `src/pages/GalerijaDijelova.vue` i registrirao rutu
`/galerija-dijelova`. Stranica omogućuje:

- odabir biljne vrste iz padajućeg izbornika,
- prikaz dijelova odabrane biljke, svaki s hrvatskim i latinskim nazivom,
- prikaz opisa svakog dijela biljke (#144),
- mrežu (grid) slika za svaki dio biljke.

## 5. Provjera ispravnosti

- Backend endpointi testirani su protiv baze (`student.veleri.hr / iooa_biljnedev`).
  Npr. `/plant_part_images/2` (Malina) ispravno vraća dio *Plod* sa slikom „Plod maline”, a dio
  *List* s praznim nizom slika.
- Aplikacija je pokrenuta i stranica provjerena u pregledniku: odabirom biljne vrste
  (npr. „Prava lavanda”) prikazuju se dijelovi *Cvijet* (s opisom i slikom) i *Plod* (s opisom),
  bez pogrešaka u konzoli.
- Frontend datoteke prolaze ESLint provjeru bez pogrešaka.

## 6. Commitovi (grana `development`)

- `f464a14` — Dodan backend API za slike po dijelu biljke - galerija dijelova #140 #138
- `0af7923` — Dodana korisnicka stranica Galerija dijelova biljke i ruta #141 #138
- `0c0911b6` — Prikaz opisa dijela biljke u galeriji dijelova #144 #138

## 7. Zaključak

Moj dio korisničke priče #138 (#140, #141 i #144) je dovršen, testiran i pushan na granu
`development`. Preostali dio priče (#142, #143) preuzima kolega Franko Krstić.
