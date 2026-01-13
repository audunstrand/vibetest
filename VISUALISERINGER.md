# Visualiseringsalternativer for NAV Arbeidssøkerdata

Dette dokumentet beskriver de ulike visualiseringstypene som er tilgjengelige i applikasjonen.

## Oversikt over visualiseringstyper

### 1. Linjediagram (Standard)
**Når brukes det:** Viser utvikling over tid for hver yrkesgruppe

**Fordeler:**
- Tydelig viser trender og utvikling over tid
- Enkelt å sammenligne flere yrkesgrupper samtidig
- God for å se sesongvariasjoner og langsiktige mønstre

**Bruksområde:** Best for å analysere hvordan arbeidssøkertall endrer seg over år for forskjellige yrkesgrupper.

---

### 2. Søylediagram
**Når brukes det:** Sammenligner yrkesgrupper side ved side per år

**Fordeler:**
- Enkel direkte sammenligning mellom yrkesgrupper
- Tydelig visuell forskjell i størrelsesorden
- God for å identifisere hvilke yrkesgrupper som har flest/færrest arbeidssøkere

**Bruksområde:** Best for å sammenligne absolutte tall mellom yrkesgrupper på tvers av år.

---

### 3. Stablede områder (Stacked Area Chart)
**Når brukes det:** Viser både sammensetning og totalt volum over tid

**Fordeler:**
- Viser totalt antall arbeidssøkere på toppen av grafen
- Illustrerer andelen hver yrkesgruppe utgjør av totalen
- God for å se både del-helhet forhold og totale trender

**Bruksområde:** Best for å forstå hvordan den totale arbeidssøkermassen er sammensatt og hvordan sammensetningen endrer seg over tid.

---

### 4. Horisontalt søylediagram
**Når brukes det:** Når det er mange yrkesgrupper som skal vises samtidig

**Fordeler:**
- Bedre plass til lange yrkesgruppennavn
- Lettere å lese når det er mange kategorier
- God for ranking og sammenligning

**Bruksområde:** Best når du har mange yrkesgrupper og trenger bedre oversikt med mer lesbar tekst.

---

### 5. Sektordiagram (Pie Chart)
**Når brukes det:** Viser fordeling for et enkelt år

**Fordeler:**
- Tydelig visualisering av prosentvis fordeling
- Enkelt å se hvilke yrkesgrupper som dominerer
- God for å kommunisere andeler til et bredt publikum

**Bruksområde:** Best for å vise fordeling og andeler for et spesifikt år. Fungerer best med færre kategorier (5-7 yrkesgrupper).

**Spesielt:** Krever at du velger et spesifikt år fra nedtrekksmenyen.

---

## Anbefalinger

### For tidsserie-analyse
Bruk **Linjediagram** eller **Stablede områder**

### For sammenligning på ett tidspunkt
Bruk **Søylediagram**, **Horisontalt søylediagram** eller **Sektordiagram**

### For å se totaler og sammensetning
Bruk **Stablede områder**

### For presentasjoner
- **Sektordiagram** for enkle budskap om fordeling
- **Linjediagram** for trender over tid
- **Søylediagram** for direkte sammenligninger

---

## Teknisk implementering

Alle visualiseringer bruker Chart.js biblioteket og støtter:
- Responsivt design (fungerer på mobil og desktop)
- Interaktive tooltips med detaljert informasjon
- Klikkbar legend for å skjule/vise yrkesgrupper
- Tilgjengelig datatabell for skjermlesere
- Konsistent fargepalett fra NAV Aksel design system

---

## Filtrering

For alle visualiseringer utenom sektordiagram kan du:
- Velge "Alle grupper" for å se alle yrkesgrupper samtidig
- Velge en spesifikk yrkesgruppe for å fokusere på én gruppe

For sektordiagram:
- Viser alltid alle yrkesgrupper
- Velg år fra nedtrekksmenyen for å se fordeling for det året
