# Implementasjonsplan: NAV Arbeidssøkere Visualisering

## Oversikt
Enkel webapp med Vanilla HTML/CSS/JS + Chart.js for å visualisere NAV arbeidssøkerdata på localhost.

---

## Tasks

### Task 1: Sett opp prosjektstruktur
- [x] `index.html` med grunnleggende HTML5-struktur
- [x] `style.css` for styling
- [x] `app.js` for JavaScript-logikk
- [x] Chart.js og PapaParse inkludert via CDN

### Task 2: Last og parse CSV-data
- [x] Funksjon `loadData()` som henter CSV fra GitHub
- [x] Parse med PapaParse
- [x] Konverter `antall_arbeidssokere` til tall
- [x] Loading-indikator under lasting

### Task 3: Implementer aggregering per yrkesgruppe og år
- [ ] Funksjon `aggregateByGroupAndYear(data)`
- [ ] Summer `antall_arbeidssokere` per `yrke_grovgruppe` og `aar`
- [ ] Output-format kompatibelt med Chart.js

### Task 4: Vis linjediagram med utvikling over tid
- [ ] Canvas-element med Chart.js linjediagram
- [ ] En linje per yrkesgruppe med ulike farger
- [ ] Klikkbar legend for å toggle linjer
- [ ] Tooltip ved hover

### Task 5: Legg til dropdown-filter for yrkesgruppe
- [ ] Dropdown med alle yrkesgrupper + "Alle"
- [ ] Event listener som oppdaterer grafen
- [ ] Umiddelbar oppdatering ved valg

### Task 6: Legg til enkel styling og layout
- [ ] Responsiv container
- [ ] Tydelig tittel og beskrivelse
- [ ] Mobilvennlig layout

---

## Estimat

| # | Task | Estimat | Status |
|---|------|---------|--------|
| 1 | Prosjektstruktur | 10 min | ✅ |
| 2 | Last/parse CSV | 20 min | ✅ |
| 3 | Aggregering | 15 min | 🔲 |
| 4 | Linjediagram | 20 min | 🔲 |
| 5 | Dropdown-filter | 15 min | 🔲 |
| 6 | Styling | 10 min | 🔲 |

**Total: ~1.5 timer**
