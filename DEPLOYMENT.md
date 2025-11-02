# Projektin Deployment-ohjeet

## Projektin rakenne

Tämä projekti käyttää:
- **Frontend**: React + Vite (pyörii Renderissä)
- **Tietokanta + Kirjautuminen**: Supabase (erillinen palvelu)

## Supabase-projektin tunnistaminen

Projektisi käyttää Supabase-projektia, jonka ID on: `jgiwlvhuncqstxiayxdm`

### Miten löydät tämän projektin Supabasesta:

1. Kirjaudu sisään: https://supabase.com/dashboard
2. Etsi projektia nimellä tai ID:llä `jgiwlvhuncqstxiayxdm`
3. Jos sinulla on useita Supabase-tilejä, kokeile kirjautua eri tileillä

**Jos et löydä projektia:**
- Projekti on ehkä luotu eri sähköpostiosoitteella
- Voit luoda UUDEN Supabase-projektin ja päivittää `.env` tiedoston

## Deployment Renderiin

### 1. Pushaa koodi GitHubiin

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/KÄYTTÄJÄNIMI/REPO-NIMI.git
git push -u origin main
```

### 2. Luo Static Site Renderissä

1. Mene: https://dashboard.render.com
2. Klikkaa: **New** → **Static Site**
3. Yhdistä GitHub-repositoriosi
4. Aseta asetukset:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3. Lisää Environment Variables (ympäristömuuttujat)

Renderin dashboardissa lisää nämä:

```
VITE_SUPABASE_URL=https://jgiwlvhuncqstxiayxdm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXdsdmh1bmNxc3R4aWF5eGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDQ4MjgsImV4cCI6MjA3NzU4MDgyOH0.7ly-0GF2D_UUuzZpfCGqBKO1iwV7O1ynbKrpNizxtjM
```

### 4. Deploy

Klikkaa **Create Static Site** - Render buildaa ja deployaa projektin automaattisesti!

## Miten kirjautuminen toimii

1. **Käyttäjä kirjautuu frontendissä** (Renderin sivulla)
2. **Frontend lähettää kirjautumispyynnön Supabaseen**
3. **Supabase tarkistaa tunnukset ja palauttaa tokenin**
4. **Frontend tallentaa tokenin ja käyttäjä on kirjautunut sisään**

**Tämä kaikki toimii automaattisesti - ei tarvitse tehdä mitään erikseen!**

## Jos haluat luoda UUDEN Supabase-projektin

1. Mene: https://supabase.com/dashboard
2. Klikkaa: **New Project**
3. Täytä tiedot:
   - **Name**: Varasto App
   - **Database Password**: Valitse vahva salasana (TALLENNA TÄMÄ!)
   - **Region**: North Europe (Helsinki)
4. Odota ~2 minuuttia projektin valmistumista
5. Mene: **Settings** → **API**
6. Kopioi:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
7. Päivitä nämä `.env` tiedostoon
8. Aja migraatiot:
   - Mene Supabasessa: **SQL Editor**
   - Kopioi sisältö tiedostosta: `supabase/migrations/20250102000000_master_migration.sql`
   - Suorita SQL

## Yhteenveto

- **Projekti toimii itsenäisesti ilman Boltia**
- **Supabase on SINUN oma ilmainen tietokantasi**
- **Render hostaa frontendisi**
- **Kirjautuminen toimii automaattisesti näiden välillä**

## Ongelmatilanteet

### "Kirjautuminen ei toimi"
- Tarkista että ympäristömuuttujat ovat oikein Renderissä
- Tarkista että Supabase-projekti on olemassa ja aktiivinen

### "En löydä Supabase-projektia"
- Kokeile kirjautua eri sähköpostiosoitteilla Supabaseen
- Luo uusi projekti yllä olevien ohjeiden mukaan

### "Tietokanta on tyhjä"
- Aja migraatiot Supabase SQL Editorissa
- Tiedosto: `supabase/migrations/20250102000000_master_migration.sql`
