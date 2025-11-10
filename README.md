# Zone Drawing App - React Native

Aplikacija za crtanje i upravljanje geografskim zonama na interaktivnoj mapi. Napravljena s React Native i Expo za iOS i Android.

Crtaj zone, editiraj ih, filtriraj po bojama, i sve se automatski sprema na uređaj. Radi offline, nema potrebe za backendom.

---

## Što app radi?

Interaktivna mapa za crtanje zona s real-time validacijom, detekcijom overlapa i trajnim spremanjem podataka.

### Key featuri:

- **Crtanje zona** - Polygon (više točaka), Pravokutnik, Krug
- **Undo/Redo** - Puna historija za polygon crtanje
- **Detekcija overlapa** - Stroga validacija koristeći Turf.js (sprječava preklapanje zona)
- **Prevencija self-intersection** - Real-time validacija tijekom crtanja polygona
- **Kodiranje bojama** - 5 boja (crvena, plava, zelena, žuta, ljubičasta) s filterom
- **Auto-save** - AsyncStorage persistencija (preživi restart aplikacije)
- **Zone metrike** - Auto-kalkulacija površine (m²) i centra
- **Zoom na zonu** - Tapni zonu u listi da se fokusiraš na mapi
- **Toast notifikacije** - Ne-blokirajući feedback (zamjena za Alert.alert)
- **Confirmation modali** - Sigurno brisanje (jedna zona, sve zone)

---

## Tech Stack

### Core Framework

```json
"expo": "~52.0.23"
"react": "18.3.1"
"react-native": "0.76.6"
```

**Zašto Expo?**

- Managed workflow - brži development
- Cross-platform (iOS + Android) iz jednog codebase-a
- Built-in alati (mape, storage, crypto)
- OTA updatei bez ponovnog submita u app store
- Jednostavan deployment s EAS Build

**Zašto React Native?**

- Native performanse (nije webview)
- Velika ekosistema (npm paketi)
- Hot reload - instant feedback
- Dijeljeni codebase s webom (90%+ kod reuse)

---

### Mapping

```json
"react-native-maps": "1.18.0"
```

**Zašto react-native-maps?**

- Native map komponente (Apple Maps na iOS-u, Google Maps na Androidu)
- Najbolje performanse za markere/poligone (tisuće shapea)
- Built-in gesture handling (pan, zoom, rotate)
- Podržava Polygon, Circle, Polyline, Marker komponente
- Aktivno održavanje (Airbnb origin)

---

### Geometrijski Kalkulacije

```json
"@turf/turf": "^7.1.0"
```

**Zašto Turf.js?**

- Industry-standard GIS biblioteka
- Točna detekcija overlapa (handla sve kombinacije shapea)
- 64-točkasta aproksimacija kruga (bolje od custom matematike)
- GeoJSON standard compliance
- Radi u JS threadu (nema potrebe za native modulima)

**Korištene funkcije:**

- `turf.booleanOverlap()` - Zona-na-zonu overlap check
- `turf.booleanIntersects()` - Detekcija presjecanja rubova
- `turf.circle()` - Pretvara radius u polygon
- `turf.polygon()` - Kreira GeoJSON geometrije

**Custom geometry.js:**

- `wouldIntersect()` - Real-time polygon self-intersection check (tijekom crtanja)
- `doLinesIntersect()` - Line segment intersection (cross-product metoda)

---

### Storage

```json
"@react-native-async-storage/async-storage": "2.1.0"
```

**Zašto AsyncStorage?**

- React Native-ov localStorage ekvivalent
- Persistentni key-value storage
- Async API (ne blokira UI thread)
- Radi offline
- Jednostavna JSON serijalizacija

---

### State Management

**Context API (bez Reduxa)**

**Zašto Context umjesto Reduxa?**

- Jednostavniji za single-feature app
- Nema boilerplate-a (actions, reduceri, middleware)
- Ugrađen u React
- Dovoljan za zone CRUD + drawing state

---

## Struktura Projekta

```
zones-app/
├── src/
│   ├── components/              # UI komponente
│   │   ├── BottomToolbar.js     # Odabir moda + undo/redo/complete
│   │   ├── ColorFilter.js       # Floating color toggle gumbi
│   │   ├── ConfirmationModal.js # Delete potvrde
│   │   ├── DrawingLayer.js      # In-progress shapes (plavi overlay)
│   │   ├── Toast.js             # Success/error notifikacije
│   │   ├── ZoneActionSheet.js   # Edit/Delete bottom sheet
│   │   ├── ZoneDetailsModal.js  # Ime/boja input (create + edit)
│   │   ├── ZoneLayer.js         # Rendering spremljenih zona
│   │   └── ZoneListModal.js     # Lista svih zona s zoom-om
│   ├── context/
│   │   └── ZonesContext.js      # Globalni state (zone + drawing + filteri)
│   ├── hooks/
│   │   └── useZones.js          # CRUD operacije + AsyncStorage sync
│   ├── utils/
│   │   ├── geometry.js          # Self-intersection detekcija (custom)
│   │   ├── storage.js           # AsyncStorage wrapper
│   │   └── zoneValidation.js    # Turf.js overlap detekcija
├── shared/                       # Cross-platform kod
│   ├── colors.js                # Paleta boja + hex konverzija
│   ├── constants.js             # Storage ključevi
│   └── zoneCalculations.js      # Area + center kalkulacije
├── App.js                        # Root komponenta (MapScreen + Provider)
├── app.json                      # Expo config
└── package.json
```

---

## Quick Start

### Preduvjeti

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Instalacija

```bash
# Clone repo
git clone https://github.com/yoyocortex/zones-rn-app.git
cd zones-rn-app

# Instaliraj dependencije
npm install

# Pokreni Expo dev server
npx expo start
```

### Pokreni na Uređaju

1. Instaliraj **Expo Go** app (iOS/Android)
2. Skeniraj QR kod iz terminala
3. App se loada na uređaju

### Pokreni na Simulatoru

```bash
# iOS (zahtijeva macOS + Xcode)
npx expo start --ios

# Android (zahtijeva Android Studio)
npx expo start --android
```

---

## Kako Koristiti?

### 1. Crtaj Zonu

1. Tapni gumb moda (Krug, Pravokutnik, Polygon)
2. **Krug:** Tapni mapu → kreira krug od 300m
3. **Pravokutnik:** Tapni mapu → kreira pravokutnik 300×200m
4. **Polygon:** Tapni više točaka → formira shape
5. Tapni **✓** (Complete)
6. Unesi ime + odaberi boju
7. Tapni **Kreiraj**

### 2. Undo/Redo (Samo polygon)

- **Undo (↶):** Ukloni zadnju točku
- **Redo (↷):** Vrati uklonjenu točku
- Redo se briše kad dodaš novu točku

### 3. Editiraj Zonu

1. Tapni spremljenu zonu na mapi
2. Tapni **Uredi** u bottom sheetu
3. Promijeni ime ili boju
4. Tapni **Spremi**

### 4. Obriši Zonu

1. Tapni zonu → **Obriši**
2. Potvrdi u modalu
3. Toast prikazuje: "Zona obrisana"

### 5. Filtriraj po Boji

- Tapni krugove s bojama na desnoj strani
- **Aktivno:** Puna opacitet
- **Neaktivno:** 30% opacitet (zone skrivene)

### 6. Zoom na Zonu

1. Tapni **☰** (ikona liste) u headeru
2. Tapni zonu u listi
3. Kamera animira na granice zone

### 7. Obriši Sve

1. Otvori listu zona → **Obriši Sve Zone**
2. Potvrdi
3. Toast prikazuje: "X zona obrisano"

---

## Budući Featuri

- [ ] **Grupiranje zona** - Organizacija po kategorijama/folderima
- [ ] **Export/Import** - JSON, GeoJSON, KML formati
- [ ] **Backend sync** - Opcionalna Firebase/Supabase integracija
- [ ] **Multi-select** - Bulk edit/delete zona
- [ ] **Statistike zona** - Ukupna površina, najveća/najmanja zona
- [ ] **Pretraga** - Filtriranje zona po imenu
- [ ] **Custom markeri** - Odabir ikone za tipove zona
- [ ] **Offline mape** - Download tile-ova za offline korištenje
- [ ] **Dijeljenje zona** - Export drugim korisnicima
- [ ] **Dark mode** - Tema toggle

---

## Performanse

### Testirano s:

- **1000 zona:** Smooth rendering (React Native Maps koristi native viewove)
- **Kompleksni polygon (100 točaka):** Bez laga tijekom crtanja
- **Overlap check:** ~50ms za 100 zona (Turf.js optimizacija)

### Tehnike optimizacije:

- `filteredZones` computed u contextu (ne u renderu)
- `useRef` za usporedbu prethodnih zona (sprječava save loopove)
- AsyncStorage batched writes (React batcha state updateove)
- Native map komponente (ne WebView)

---

## 🔧 Build za Produkciju

### Expo EAS Build (Preporučeno)

```bash
# Instaliraj EAS CLI
npm install -g eas-cli

# Login
eas login

# Konfiguriraj projekt
eas build:configure

# Build za iOS
eas build --platform ios

# Build za Android
eas build --platform android
```

### Lokalni Build (Napredno)

```bash
# iOS (zahtijeva macOS)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

---

## Licenca

MIT License - radi što hoćeš s kodom.

---

## Autor

**yoyocortex**  
GitHub: [@yoyocortex](https://github.com/yoyocortex)

---

Built with ☕ and 🎵.
