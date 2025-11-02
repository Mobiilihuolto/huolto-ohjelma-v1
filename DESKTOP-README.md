# Huoltosovellus - Desktop-versio

Täysin itsenäinen desktop-sovellus huoltoliikkeiden hallintaan. Sisältää SQLite-tietokannan ja lisenssijärjestelmän.

## 🎯 Ominaisuudet

- ✅ **100% Offline** - Ei pilvipalveluja, ei kuukausimaksuja
- ✅ **SQLite-tietokanta** - Kaikki data paikallisesti
- ✅ **Lisenssijärjestelmä** - Suojattu luvaton käyttö
- ✅ **Cross-platform** - Windows, macOS, Linux
- ✅ **Nopea ja luotettava** - Ei internet-riippuvuutta

## 📋 Vaatimukset

- Node.js 20.x tai uudempi
- npm 10.x tai uudempi

## 🚀 Kehitysympäristön Käynnistys

### 1. Asenna riippuvuudet

```bash
npm install
```

### 2. Käynnistä kehitystila

```bash
npm run electron:dev
```

Tämä käynnistää sekä Vite-dev-serverin että Electron-sovelluksen.

## 📦 Sovelluksen Paketointi

### Windows (.exe asennusohjelma)

```bash
npm run electron:build:win
```

Tuottaa: `release/Huoltosovellus Setup 1.0.0.exe`

### macOS (.dmg)

```bash
npm run electron:build:mac
```

Tuottaa: `release/Huoltosovellus-1.0.0.dmg`

### Linux (.AppImage)

```bash
npm run electron:build:linux
```

Tuottaa: `release/Huoltosovellus-1.0.0.AppImage`

### Kaikki alustat

```bash
npm run electron:build
```

## 🔑 Lisenssijärjestelmä

### Lisenssien Generointi (Myyjälle)

Generoi uusia lisenssiavaimia:

```bash
# Yksi lisenssi
npm run generate-license

# Viisi lisenssiä
npm run generate-license 5

# Kymmenen lisenssiä
npm run generate-license 10
```

Esimerkki tuloste:
```
============================================================
HUOLTOSOVELLUS - LISENSSIEN GENEROINTI
============================================================

Generoitu 5 lisenssiavainta:

1. HU-A7B3-C9D4-E1F2-8G5H
2. HU-J2K4-L6M8-N1P3-Q5R7
3. HU-S9T1-U3V5-W7X9-Y2Z4
4. HU-B6C8-D1E3-F5G7-H9I2
5. HU-K4L6-M8N1-P3Q5-R7S9

============================================================
```

### Lisenssin Aktivointi (Asiakkaalle)

1. Asiakas asentaa sovelluksen
2. Sovellus pyytää lisenssiavainta käynnistyksessä
3. Asiakas syöttää ostamansa avaimen (esim. `HU-A7B3-C9D4-E1F2-8G5H`)
4. Sovellus aktivoituu ja toimii täysillä ominaisuuksilla

### Lisenssien Hallinta

**Myyjän tehtävät:**
1. Generoi lisenssejä `npm run generate-license` -komennolla
2. Tallenna myydyt lisenssit Excel-taulukkoon tai tietokantaan
3. Lähetä lisenssiavain asiakkaalle oston jälkeen
4. Pidä kirjaa myydyistä lisensseistä

**Tekninen toteutus:**
- Lisenssiavain: `HU-XXXX-XXXX-XXXX-XXXX` (20 merkkiä)
- Tallennetaan SQLite-tietokantaan käyttäjän koneella
- Konekohtainen tunniste (MAC-osoite + hostname)
- Ei online-tarkistuksia (offline-toiminta)

## 📂 Tietokannan Sijainti

SQLite-tietokanta tallennetaan automaattisesti:

- **Windows**: `C:\Users\[käyttäjä]\AppData\Roaming\Huoltosovellus\database.db`
- **macOS**: `~/Library/Application Support/Huoltosovellus/database.db`
- **Linux**: `~/.config/Huoltosovellus/database.db`

## 🏗️ Projektin Rakenne

```
huoltosovellus/
├── electron/
│   ├── main.js          # Electron pääprosessi + SQLite
│   └── preload.js       # IPC-silta renderöijälle
├── src/
│   ├── components/
│   │   └── LicenseActivation.tsx  # Lisenssin aktivointi UI
│   ├── lib/
│   │   └── electron-db.ts         # SQLite-wrapper
│   ├── electron.d.ts              # TypeScript-tyypit
│   └── App.tsx                    # Pääsovellus
├── tools/
│   └── generate-license.js        # Lisenssigeneraattori
└── package.json
```

## 🔧 Tietokantataulut

Sovellus luo automaattisesti seuraavat taulut:

- `licenses` - Lisenssitiedot
- `yritykset` - Yritystiedot
- `profiles` - Käyttäjäprofiilit
- `asiakkaat` - Asiakasrekisteri
- `laitteet` - Laiterekisteri
- `huollot` - Huoltotilaukset
- `varaosat` - Varaosavarasto
- `laskut` - Laskutus
- `tekniikat` - Teknikot
- Sekä kaikki asetustaulut

## 💰 Myyntimalli

### Suositeltu hinnoittelu:

**Vaihtoehto 1: Kertamaksu**
- Yksittäinen lisenssi: 299€ (elinikäinen)
- 5 lisenssiä: 1200€ (240€/kpl)
- 10 lisenssiä: 2000€ (200€/kpl)

**Vaihtoehto 2: Vuosilisenssi**
- Vuosilisenssi: 99€/vuosi
- 3 vuotta: 249€ (83€/vuosi)
- 5 vuotta: 349€ (70€/vuosi)

**Vaihtoehto 3: Hybridi**
- Perushinta: 149€ (kertamaksu)
- Päivitykset: 49€/vuosi (valinnainen)

### Myyntiprosessi:

1. **Asiakas löytää sovelluksesi** (verkkosivut, sosiaalinen media)
2. **Asiakas voi ladata sovelluksen** (ilmainen lataus)
3. **Sovellus vaatii lisenssiavaimen** (ei toimi ilman)
4. **Asiakas ostaa lisenssin** (verkkokauppa, lasku, Stripe)
5. **Lähetät lisenssiavaimen** (sähköposti, automaattisesti)
6. **Asiakas aktivoi** (syöttää avaimen sovellukseen)
7. **Valmis!** Asiakas käyttää sovellusta

## 🛡️ Suojaus

**Toteutetut suojaukset:**
- Lisenssiavain vaaditaan käynnistyksessä
- Konekohtainen tunniste (MAC + hostname)
- Lisenssi tallennetaan paikalliseen SQLite-kantaan
- Muoto-tarkistus: `HU-XXXX-XXXX-XXXX-XXXX`

**Huomautus:**
Mikään ei ole 100% suojattu. Tämä suojaus riittää normaalille liiketoiminnalle. 95% asiakkaista ei yritä kiertää lisenssijärjestelmää.

## 🚢 Jakelu

### 1. Luo asennusohjelmat

```bash
npm run electron:build
```

### 2. Jaa asennusohjelmat

- Lataa `release/`-kansiosta asennusohjelmat
- Jaa ne verkkosivuillasi / latauspalvelussa
- TAI: Lähetä suoraan asiakkaille

### 3. Myy lisenssejä

- Generoi lisenssejä `npm run generate-license`
- Lähetä lisenssiavain ostajalle
- Pidä kirjaa myydyistä lisensseistä

## 📞 Tuki

Jos asiakkaalla on ongelmia:

1. **Lisenssi ei toimi**: Tarkista avaimen muoto
2. **Sovellus ei käynnisty**: Asenna uudelleen
3. **Tietokanta korruptoitunut**: Poista `database.db` ja aloita alusta
4. **Unohtunut data**: Varmuuskopioi `database.db`-tiedosto säännöllisesti

## 🔄 Päivitykset

Kun julkaiset uuden version:

1. Päivitä `package.json` version numero
2. Rakenna uudet asennusohjelmat: `npm run electron:build`
3. Jaa uudet versiot asiakkaille
4. **Lisenssiavain pysyy samana** - ei tarvitse aktivoida uudelleen!

## 📝 Lisätiedot

**Kehittäjä:** [Lisää nimesi]
**Versio:** 1.0.0
**Lisenssi:** Kaupallinen (proprietary)
**Tuki:** [Lisää sähköpostisi]

---

## ⚠️ Tärkeää

- **ÄLÄ JAA** lähdekoodia asiakkaille (vain .exe/.dmg/.AppImage)
- **SÄILYTÄ** myytyjien lisenssien lista
- **VARMUUSKOPIOI** tietokantatiedosto säännöllisesti
- **TESTAA** jokainen versio ennen julkaisua

---

**Onnea myynnille!** 🎉
