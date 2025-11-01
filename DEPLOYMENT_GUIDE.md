# Huoltosovelluksen Käyttöönotto-opas

## Sisällysluettelo
1. [Yleiskatsaus](#yleiskatsaus)
2. [Moniyritysarkkitehtuuri](#moniyritysarkkitehtuuri)
3. [Käyttöönoton vaiheet](#käyttöönoton-vaiheet)
4. [Lisenssijärjestelmä](#lisenssijärjestelmä)
5. [Domain-asetukset](#domain-asetukset)
6. [Tietoturvan testaus](#tietoturvan-testaus)
7. [Ylläpito ja skaalautuvuus](#ylläpito-ja-skaalautuvuus)
8. [Myyntimalli](#myyntimalli)

---

## Yleiskatsaus

### Mitä sovellus on?

Huoltosovellus on **multi-tenant SaaS-sovellus**, joka:
- Palvelee useita yrityksiä yhdestä instanssista
- Eristää yritysten tiedot täydellisesti toisistaan
- Käyttää lisenssijärjestelmää uusien yritysten rekisteröintiin
- Skaalautuu helposti sadoille yrityksille

### Teknologiat

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Render.com / Vercel / Netlify
- **Security**: Row Level Security (RLS)

---

## Moniyritysarkkitehtuuri

### Näin tiedot eristetään

Jokainen tietokantataulu sisältää `company_id`-kentän:

```sql
CREATE TABLE asiakkaat (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL,  -- Yrityksen tunniste
  nimi text NOT NULL,
  ...
);
```

### Row Level Security (RLS)

Jokaisessa taulussa on RLS-politiikat:

```sql
CREATE POLICY "Users see only own company data"
  ON asiakkaat FOR SELECT
  USING (company_id IN (
    SELECT company_id
    FROM profiles
    WHERE user_id = auth.uid()
  ));
```

### Käytännössä

```
SAMA SOVELLUS + SAMA TIETOKANTA
├── Yritys A (company_id: abc-123)
│   ├── 5 käyttäjää
│   ├── 150 asiakasta
│   └── 500 huoltoa
│
├── Yritys B (company_id: def-456)
│   ├── 3 käyttäjää
│   ├── 80 asiakasta
│   └── 300 huoltoa
│
└── Yritys C (company_id: ghi-789)
    ├── 2 käyttäjää
    ├── 50 asiakasta
    └── 200 huoltoa

TULOS: Yritykset eivät näe toistensa tietoja!
```

---

## Käyttöönoton vaiheet

### Vaihe 1: Supabase-projektin luonti

1. **Luo Supabase-projekti**
   - Mene osoitteeseen: https://supabase.com
   - Kirjaudu sisään tai luo tili
   - Klikkaa "New Project"
   - Anna projektille nimi (esim. "huoltosovellus-prod")
   - Valitse alue (Europe - Frankfurt)
   - Luo vahva tietokanta-salasana
   - Klikkaa "Create new project"

2. **Odota projektin valmistumista** (1-2 minuuttia)

3. **Kopioi API-avaimet**
   - Mene: Settings → API
   - Kopioi:
     - `Project URL` (esim. https://xxxxx.supabase.co)
     - `anon public` -avain
     - `service_role` -avain (pidä turvassa!)

### Vaihe 2: Tietokannan alustus

1. **Mene SQL Editoriin**
   - Supabase Dashboard → SQL Editor
   - Klikkaa "New query"

2. **Aja migraatiot järjestyksessä**
   - Avaa `supabase/migrations/` -kansio
   - Kopioi jokainen `.sql` -tiedosto SQL Editoriin
   - Aja ne aikajärjestyksessä (tiedostonimen mukaan)
   - Aloita tiedostosta: `20251101181512_initial_database_setup.sql`

3. **Varmista että taulut luotiin**
   - Mene: Table Editor
   - Näet kaikki taulut (asiakkaat, huollot, jne.)

### Vaihe 3: Hosting-palvelun valinta

#### Vaihtoehto A: Render.com (SUOSITUS aloittelijoille)

**Edut:**
- Ilmainen aloitussuunnitelma
- Helppo käyttää
- Automaattiset deploymentit GitHubista

**Vaiheet:**

1. **Luo Render-tili**
   - Mene: https://render.com
   - Rekisteröidy GitHub-tilillä

2. **Pushaa koodi GitHubiin**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/KÄYTTÄJÄ/REPO.git
   git push -u origin main
   ```

3. **Luo Web Service Renderissä**
   - Dashboard → New → Web Service
   - Yhdistä GitHub-repo
   - Asetukset:
     - **Name**: huoltosovellus
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run preview`
     - **Plan**: Free

4. **Lisää ympäristömuuttujat**
   - Environment-välilehdellä:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   NODE_VERSION=20
   ```

5. **Deploy**
   - Klikkaa "Create Web Service"
   - Odota 2-5 minuuttia
   - Sovellus on nyt osoitteessa: `https://huoltosovellus.onrender.com`

#### Vaihtoehto B: Vercel (NOPEIN)

**Edut:**
- Todella nopea deployment
- Erinomainen suorituskyky
- Ilmainen hobby-suunnitelma

**Vaiheet:**

1. **Asenna Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Pushaa koodi GitHubiin** (sama kuin yllä)

3. **Deploy Verceliin**
   ```bash
   vercel
   ```
   - Kirjaudu GitHub-tilillä
   - Vastaa kysymyksiin:
     - Link to existing project? **N**
     - Project name? **huoltosovellus**
     - Directory? **./** (paina Enter)
     - Override settings? **N**

4. **Lisää ympäristömuuttujat**
   - Mene: https://vercel.com/dashboard
   - Valitse projektisi
   - Settings → Environment Variables
   - Lisää:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

6. **Valmis!**
   - Sovellus on nyt osoitteessa: `https://huoltosovellus.vercel.app`

#### Vaihtoehto C: Netlify

**Edut:**
- Yksinkertainen käyttöliittymä
- Hyvä ilmainen suunnitelma
- CDN sisäänrakennettu

**Vaiheet:**

1. **Luo Netlify-tili**
   - Mene: https://netlify.com
   - Rekisteröidy GitHub-tilillä

2. **Pushaa koodi GitHubiin** (sama kuin yllä)

3. **Import project**
   - Dashboard → Add new site → Import an existing project
   - Valitse GitHub
   - Valitse repo

4. **Build settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

5. **Environment variables**
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

6. **Deploy site**
   - Odota 1-2 minuuttia
   - Valmis: `https://huoltosovellus.netlify.app`

### Vaihe 4: Domain-yhdistäminen

#### Oma domain omalle yritykselle

**Esimerkki**: `huolto.mobiilihuolto.com`

1. **Mene domain-palveluntarjoajalle** (esim. Namecheap, GoDaddy)

2. **Lisää DNS-tietueet** (esim. Renderille):
   ```
   Type: CNAME
   Name: huolto
   Value: huoltosovellus.onrender.com
   TTL: 3600
   ```

3. **Lisää custom domain hostingiin**
   - Render: Settings → Custom Domains → Add
   - Vercel: Settings → Domains → Add
   - Netlify: Domain settings → Add custom domain

4. **Odota DNS:n päivittymistä** (5-60 minuuttia)

5. **SSL-sertifikaatti**
   - Hosting-palvelu luo automaattisesti (Let's Encrypt)
   - Odota 1-2 minuuttia
   - Valmis: `https://huolto.mobiilihuolto.com` toimii!

#### Myyntidomain

**Esimerkki**: `huoltosovellus.fi`

Sama prosessi, mutta:
- Käytä root-domainia tai www-subdomainia
- Aseta A-record tai CNAME (riippuu palvelusta)

**Voit käyttää samaa sovellusta molemmilla domaineilla:**
```
huolto.mobiilihuolto.com → Render-sovellus
huoltosovellus.fi → Sama Render-sovellus
```

---

## Lisenssijärjestelmä

### Miten lisenssit toimivat?

Sovelluksessa on sisäänrakennettu lisenssijärjestelmä:

1. **Admin luo lisenssiavaimen** (sovelluksessa)
2. **Asiakas saa lisenssiavaimen** (sähköpostilla tai muulla tavalla)
3. **Asiakas rekisteröityy** lisenssillä
4. **Automaattisesti:**
   - Luodaan uusi `company_id`
   - Lisenssi merkitään käytetyksi
   - Käyttäjä saa admin-oikeudet omaan yritykseensä

### Lisenssien luominen

**Vaihtoehto 1: Sovelluksen kautta** (kun rakennettu)

Tulevaisuudessa sovelluksessa on admin-paneeli:
- Pääkäyttäjä → Asetukset → Lisenssit
- "Luo uusi lisenssi"
- Kopioi avain ja lähetä asiakkaalle

**Vaihtoehto 2: Suoraan tietokantaan (NYT)**

1. **Mene Supabase SQL Editoriin**

2. **Luo lisenssi**:
   ```sql
   INSERT INTO licenses (
     license_key,
     plan_type,
     max_users,
     expires_at,
     notes
   ) VALUES (
     'HUOLTO-2025-' || substr(gen_random_uuid()::text, 1, 8),
     'basic',
     5,
     NOW() + INTERVAL '1 year',
     'Mobiilihuolto Oy'
   )
   RETURNING license_key;
   ```

3. **Kopioi generoitu avain**:
   ```
   HUOLTO-2025-a1b2c3d4
   ```

4. **Lähetä asiakkaalle**

### Ensimmäisen käyttäjän luominen

**TÄRKEÄÄ**: Luo AINA lisenssi ensin!

1. **Luo lisenssi** (ks. yllä)

2. **Avaa sovellus selaimessa**
   - `https://huolto.mobiilihuolto.com`

3. **Klikkaa "Luo tili"**

4. **Täytä tiedot**:
   - Sähköposti
   - Salasana
   - **Lisenssinavain**: `HUOLTO-2025-a1b2c3d4`

5. **Rekisteröidy**
   - Automaattisesti:
     - Luodaan profiili
     - Luodaan yritys (`company_id`)
     - Lisenssi linkitetään yritykseen
     - Käyttäjä saa admin-roolin

6. **Kirjaudu sisään**
   - Valmis!

---

## Domain-asetukset

### Rakenne-ehdotukset

#### Vaihtoehto 1: Subdomain jokaiselle yritykselle

```
huoltosovellus.fi              → Pääsivu / markkinointi
mobiilihuolto.huoltosovellus.fi → Sinun yrityksesi
firmax.huoltosovellus.fi       → Asiakasyritys X
firmay.huoltosovellus.fi       → Asiakasyritys Y
```

**Toteutus:**
- Wildcard DNS: `*.huoltosovellus.fi → Render`
- Sovellus tunnistaa subdomainin ja näyttää oikeat tiedot
- Vaatii lisäkoodia: subdomain → company_id mapping

**EI VÄLTTÄMÄTÖN** - Voit aloittaa ilman tätä!

#### Vaihtoehto 2: Yksi domain kaikille (HELPOIN)

```
huoltosovellus.fi → Kaikki yritykset kirjautuvat tänne
```

**Toteutus:**
- Yksinkertaisin vaihtoehto
- Käyttäjät kirjautuvat sisään
- Näkevät automaattisesti oman yrityksensä tiedot
- EI tarvitse lisäkoodia

**SUOSITUS**: Aloita tästä!

#### Vaihtoehto 3: Omat domainit asiakkaille

```
huolto.mobiilihuolto.com → Sinun yrityksesi (oma domain)
huolto.firmax.fi         → Asiakasyritys X (heidän domain)
huolto.firmay.fi         → Asiakasyritys Y (heidän domain)
```

**Toteutus:**
- Lisää jokainen domain hosting-palveluun
- Sama sovellus palvelee kaikkia
- Asiakas voi käyttää omaa brändiään

**Kustannukset:**
- Domain: ~10-20€/vuosi per asiakas
- Voit laskuttaa tämän lisänä (esim. +10€/kk)

### DNS-asetukset eri palveluille

#### Render.com

```
Type: CNAME
Name: huolto (tai @, jos root domain)
Value: huoltosovellus.onrender.com
TTL: 3600
```

#### Vercel

```
Type: CNAME
Name: huolto (tai @, jos root domain)
Value: cname.vercel-dns.com
TTL: 3600
```

#### Netlify

```
Type: CNAME
Name: huolto (tai @, jos root domain)
Value: huoltosovellus.netlify.app
TTL: 3600
```

---

## Tietoturvan testaus

### KRIITTINEN: Testaa ennen tuotantokäyttöä!

#### Testi 1: Kahden yrityksen eristys

1. **Luo kaksi lisenssiä**
   ```sql
   INSERT INTO licenses (license_key, plan_type, max_users)
   VALUES
     ('TEST-YRITYS-A', 'basic', 5),
     ('TEST-YRITYS-B', 'basic', 5)
   RETURNING license_key;
   ```

2. **Rekisteröi kaksi käyttäjää**
   - Käyttäjä A: `testi-a@example.com` + lisenssi `TEST-YRITYS-A`
   - Käyttäjä B: `testi-b@example.com` + lisenssi `TEST-YRITYS-B`

3. **Kirjaudu Käyttäjä A:na**
   - Lisää asiakas: "Asiakas A"
   - Lisää huolto: "Huolto A"

4. **Kirjaudu Käyttäjä B:nä**
   - Lisää asiakas: "Asiakas B"
   - Lisää huolto: "Huolto B"

5. **Varmista eristys**
   - Käyttäjä A ei näe Asiakasta B tai Huoltoa B
   - Käyttäjä B ei näe Asiakasta A tai Huoltoa A

**JOS NÄKYY** → RLS-politiikoissa on virhe! ÄLÄ OTA TUOTANTOON!

#### Testi 2: Käyttäjäroolit

1. **Luo admin-käyttäjä** (lisensillä)
2. **Luo teknikko-käyttäjä**
   - Asetukset → Käyttäjät → Lisää käyttäjä
   - Rooli: Teknikko

3. **Testaa oikeudet**:
   - Admin: Voi muokata asetuksia
   - Teknikko: EI voi muokata asetuksia (pitäisi estää)

#### Testi 3: RLS SQL-kyselyillä

**Supabase SQL Editorissä:**

```sql
-- Aseta käyttäjäksi Käyttäjä A
SET request.jwt.claims TO '{"sub": "käyttäjä-a-uuid"}';

-- Yritä hakea kaikkia asiakkaita
SELECT * FROM asiakkaat;

-- Pitäisi näyttää VAIN Käyttäjä A:n yrityksen asiakkaat
-- JOS näkyy muiden yritysten asiakkaita → VIRHE!
```

### Tietoturvatarkistuslista

- [ ] Jokainen taulu käyttää `company_id`:tä
- [ ] RLS on päällä kaikissa tauluissa
- [ ] Käyttäjät näkevät vain oman yrityksensä tiedot
- [ ] Lisenssijärjestelmä toimii
- [ ] Käyttäjäroolit toimivat oikein
- [ ] SQL-injektio estetty (Supabase hoitaa)
- [ ] API-avaimet eivät näy frontendissä (anon-key OK)
- [ ] Service role -avainta ei käytetä frontendissä

---

## Ylläpito ja skaalautuvuus

### Supabase-rajat

**Ilmainen suunnitelma:**
- 500 MB tietokanta
- 1 GB tiedostotallennusta
- 2 GB lähtevää dataa/kk
- 50,000 aktiivista käyttäjää/kk

**Riittää:**
- 10-20 pienelle yritykselle
- Yhteensä ~1000-2000 huoltoa/kk

**Pro-suunnitelma ($25/kk):**
- 8 GB tietokanta
- 100 GB tiedostotallennusta
- 50 GB lähtevää dataa/kk
- 100,000 aktiivista käyttäjää/kk

**Riittää:**
- 50-100 yritykselle
- Yhteensä ~10,000 huoltoa/kk

### Seuranta

**Supabase Dashboardissa:**
- Database → Database size
- Usage → Bandwidth
- Auth → Users

**Hälytykset:**
- Aseta hälytykset 80% raja-arvoille
- Seuraa viikoittain

### Varmuuskopiot

**Automaattiset (Supabase Pro):**
- Päivittäiset automaattiset varmuuskopiot
- 7 päivän historia

**Manuaaliset:**
- Sovelluksessa on varmuuskopiointitoiminto
- Lataa Excel-tiedostona
- Tallenna turvalliseen paikkaan

### Päivitykset

**Backend (Supabase):**
1. Testaa migraatio kehitysympäristössä
2. Tee varmuuskopio
3. Aja migraatio tuotannossa
4. Varmista että kaikki toimii

**Frontend:**
1. Pushaa koodi GitHubiin
2. Hosting-palvelu deployaa automaattisesti
3. Testaa tuotannossa

---

## Myyntimalli

### Hinnoittelusuositukset

#### Kuukausimaksumalli (SaaS)

**Peruspaketti: 49€/kk**
- 1 yritys
- 3 käyttäjää
- Rajoittamaton määrä huoltoja
- Asiakastuki sähköpostilla

**Pro-paketti: 99€/kk**
- 1 yritys
- 10 käyttäjää
- Rajoittamaton määrä huoltoja
- Prioriteetti tuki
- Mukautettu logo
- API-käyttö

**Yritys-paketti: 199€/kk**
- 1 yritys
- Rajoittamaton määrä käyttäjiä
- Rajoittamaton määrä huoltoja
- Puhelin + sähköposti -tuki
- Räätälöinti
- Koulutus

#### Vuosimaksu (alennus)

- Peruspaketti: 490€/vuosi (2 kk ilmaiseksi)
- Pro: 990€/vuosi
- Yritys: 1990€/vuosi

### Kustannusrakenne (esimerkki)

**10 asiakasta (kaikki Peruspaketti):**

**Tulot:**
- 10 × 49€ = 490€/kk

**Kulut:**
- Supabase Pro: 25€/kk
- Render Pro: 7€/kk
- Domain: 2€/kk
- **Yhteensä: 34€/kk**

**Nettotulos: 456€/kk eli 5472€/vuosi**

### Myynnin aloittaminen

1. **Luo myyntisivu**
   - `huoltosovellus.fi`
   - Esittele ominaisuudet
   - Hinnoittelu
   - "Aloita ilmainen kokeilu" -painike

2. **Demotili**
   - Luo demo-lisenssi
   - Täytä esimerkkidataa
   - Anna potentiaalisille asiakkaille kokeilla

3. **Markkinointi**
   - Facebook-ryhmät (huoltoyritykset)
   - Google Ads
   - Suoramarkkinointi
   - Kumppanuudet (laitetoimittajat)

4. **Myyntiprosessi**
   - Asiakas pyytää demoa → Lähetä demo-tunnukset
   - Asiakas kiinnostuu → Lähetä tarjous
   - Asiakas tilaa → Luo lisenssi + lähetä ohjeet
   - Asiakas rekisteröityy → Aktivoi laskutus

### Laskutus

**Manuaalinen (aluksi):**
- Käytä omaa laskutusohjelmaa
- Lähetä lasku sähköpostilla
- Seuraa maksuja Excel/Google Sheets

**Automaattinen (myöhemmin):**
- Stripe/Paytrail-integraatio
- Automaattiset kuukausilaskut
- Luottokorttimaksut
- Laskun lähetys sähköpostilla

### Asiakashallinta

**CRM (aluksi):**
- Excel/Google Sheets
- Seuraa:
  - Asiakasnimi
  - Lisenssinavain
  - Paketti
  - Hinta
  - Maksupäivä
  - Status

**CRM (myöhemmin):**
- Pipedrive
- HubSpot
- Tai rakenna oma admin-paneeli sovellukseen

---

## Tukivinkit

### Yleisimmät ongelmat

**"En näe toisen käyttäjän lisäämiä tietoja"**
- Tarkista: Onko sama `company_id`?
- Ratkaisu: Lisää käyttäjä Asetukset → Käyttäjät

**"Lisenssinavain ei toimi"**
- Tarkista: Onko lisenssi luotu tietokantaan?
- Tarkista: Onko lisenssi jo käytetty?
- Ratkaisu: Luo uusi lisenssi

**"Sovellus ei lataudu"**
- Tarkista: Onko Render/Vercel käynnissä?
- Tarkista: Ovatko ympäristömuuttujat oikein?
- Ratkaisu: Katso lokit hosting-palvelusta

**"Tietokantavirhe"**
- Tarkista: Onko Supabase käynnissä?
- Tarkista: Ovatko API-avaimet oikein?
- Ratkaisu: Tarkista Supabase Dashboard → Logs

### Tuki asiakkaille

**Dokumentaatio:**
- Luo käyttöohje (PDF tai video)
- Sisällytä:
  - Rekisteröityminen
  - Ensimmäisen huollon luonti
  - Laskun luonti
  - Asetusten muuttaminen

**Koulutus:**
- Tarjoa 30 min etäkoulutus (Zoom/Teams)
- Käy läpi perusominaisuudet
- Vastaa kysymyksiin

**Sähköpostituki:**
- Vastaa 24h sisällä
- Käytä ticket-järjestelmää (esim. Zendesk)

---

## Seuraavat askeleet

### Välitön käyttöönotto (1-2 päivää)

1. [ ] Luo Supabase-projekti
2. [ ] Aja migraatiot
3. [ ] Deploy Renderiin/Verceliin
4. [ ] Luo ensimmäinen lisenssi
5. [ ] Rekisteröidy ja testaa

### Tuotantovalmius (1 viikko)

6. [ ] Yhdistä oma domain
7. [ ] Testaa tietoturva (2 yritystä)
8. [ ] Täytä omat yritystiedot
9. [ ] Ota varmuuskopio
10. [ ] Aloita käyttö omassa yrityksessä

### Myyntivalmius (2-4 viikkoa)

11. [ ] Luo myyntisivu
12. [ ] Luo demotili
13. [ ] Määrittele hinnoittelu
14. [ ] Käynnistä markkinointi
15. [ ] Hanki ensimmäinen asiakas

---

## Yhteenveto

### Mitä olet saanut?

✅ **Valmis multi-tenant SaaS-sovellus**
✅ **Tietoturva sisäänrakennettuna**
✅ **Lisenssijärjestelmä toimintavalmiina**
✅ **Skaalautuva arkkitehtuuri**
✅ **Helppo ottaa käyttöön**
✅ **Valmis myytäväksi eteenpäin**

### Kustannukset

**Aloitus:**
- Supabase: 0€ (ilmainen)
- Render: 0€ (ilmainen)
- Domain: 15€ (kertaluonteinen)
- **Yhteensä: 15€**

**Kun kasvaa:**
- Supabase Pro: 25€/kk
- Render Pro: 7€/kk
- Domain: 1€/kk
- **Yhteensä: 33€/kk**

### Tuottopotentiaali

**10 asiakasta × 49€/kk:**
- Tulot: 490€/kk
- Kulut: 33€/kk
- **Voitto: 457€/kk = 5484€/vuosi**

**50 asiakasta × 49€/kk:**
- Tulot: 2450€/kk
- Kulut: 50€/kk (skaalautunut)
- **Voitto: 2400€/kk = 28,800€/vuosi**

---

## Tuki

Kysymyksiä? Ota yhteyttä!

Onnea sovelluksen käyttöönottoon ja myyntiin! 🚀
