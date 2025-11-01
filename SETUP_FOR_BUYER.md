# 🚀 Käyttöönotto-ohjeet ostajalle

Tervetuloa käyttämään Huoltokanta-sovellusta! Tämä dokumentti opastaa sinut askel askeleelta sovelluksen käyttöönotossa.

---

## 📋 Esivalmistelut

### Mitä tarvitset:

1. **Supabase-tili** (ilmainen)
   - Rekisteröidy: https://supabase.com
   - Ilmainen: 10 000+ asiakasta, 2M API-kutsua/kk
   
2. **Resend-tili** (sähköpostin lähetystä varten)
   - Rekisteröidy: https://resend.com
   - Ilmainen: 100 sähköpostia/päivä
   
3. **Sovelluksen linkki**
   - Saat myyjältä linkin valmiiseen sovellukseen
   - Ei asennusta, ei koodausta - vain avaa selaimessa!

**⏱️ Arvioitu aika: 20-30 minuuttia**

---

## 1️⃣ Supabase-projektin luominen

### Vaihe 1: Luo uusi projekti

1. Kirjaudu Supabaseen: https://supabase.com/dashboard
2. Klikkaa: **New Project**
3. Täytä tiedot:
   - **Name:** `Huoltokanta`
   - **Database Password:** Luo vahva salasana (tallenna turvallisesti!)
   - **Region:** `EU Central (Frankfurt)` (tai lähin)
   - **Pricing Plan:** Free (riittää loistavasti!)
4. Klikkaa: **Create new project**
5. Odota ~2 minuuttia kunnes projekti on valmis

### Vaihe 2: Tallenna projektin tunnukset

Kun projekti on valmis, tallenna nämä tiedot turvallisesti:

1. **Project URL:**
   - Settings → API → Project URL
   - Esim: `https://abcdefgh.supabase.co`

2. **API Keys:**
   - Settings → API → Project API keys
   - **anon public:** (julkinen avain)
   - **service_role:** (salainen avain, pidä turvassa!)

---

## 2️⃣ Tietokannan rakentaminen

**Hyvä uutinen:** Tietokanta rakennetaan **AUTOMAATTISESTI** kun yhdistät sovelluksen Supabaseesi vaiheessa 7!

**Sinun ei tarvitse:**
- ❌ Ajaa SQL-komentoja
- ❌ Kopioida tiedostoja
- ❌ Asentaa työkaluja

**Sovelluksessa on valmiit migraatiot**, jotka suoritetaan automaattisesti ensimmäisellä yhdistämiskerralla.

➡️ **Siirry suoraan kohtaan 3️⃣**

---

## 3️⃣ Autentikoinnin konfigurointi

### Email-autentikointi

1. **Settings → Authentication → Providers**
2. **Email:**
   - ✅ Enable Email provider
   - ✅ Confirm email: **OFF** (nopeampi aloitus)
   - ✅ Secure email change: ON (suositus)
3. **Save**

### (Valinnainen) Google OAuth

Jos haluat Google-kirjautumisen:

1. Luo Google OAuth credentials: https://console.cloud.google.com
2. Settings → Authentication → Providers → Google
3. Lisää Client ID ja Client Secret
4. Save

---

## 4️⃣ Storage-bucket luominen

### Luo company-logos bucket:

1. **Storage → Create new bucket**
2. Asetukset:
   - **Name:** `company-logos`
   - **Public bucket:** ✅ Yes (logot ovat julkisia)
   - **File size limit:** 2 MB (riittävä logoille)
   - **Allowed MIME types:** `image/*`
3. **Create bucket**

---

## 5️⃣ Edge Functions käyttöönotto

**Hyvä uutinen:** Edge Functions toimivat **AUTOMAATTISESTI**!

**Sinun ei tarvitse:**
- ❌ Deployata funktioita
- ❌ Kopioida koodia
- ❌ Asentaa mitään

Funktiot ovat valmiina sovelluksessa ja aktivoituvat automaattisesti kun lisäät tarvittavat API-avaimet (seuraava vaihe).

**Sovelluksessa on valmiina:**
- ✅ `send-service-ready-email` - Ilmoittaa kun huolto on valmis
- ✅ `send-overdue-invoice-email` - Muistuttaa erääntyneistä laskuista
- ✅ `send-low-stock-alert` - Varoittaa alhaisesta varastosaldosta

---

## 6️⃣ Secrets (API-avaimet) lisääminen

### Resend API Key (sähköpostit):

1. **Hanki Resend API key:**
   - Kirjaudu: https://resend.com/api-keys
   - **Create API Key**
   - Nimi: `Huoltokanta`
   - **Kopioi avain** (näkyy vain kerran!)

2. **Lisää Supabaseen:**
   - Settings → Edge Functions → **Secrets**
   - Klikkaa: **Add new secret**
   - Name: `RESEND_API_KEY`
   - Value: [liitä kopioimasi avain]
   - **Save**

### Muut tarvittavat secrets:

Lisää samalla tavalla:

```
SUPABASE_URL = https://[sinun-projekti].supabase.co
SUPABASE_ANON_KEY = [anon public key]
SUPABASE_SERVICE_ROLE_KEY = [service role key]
```

💡 **Vinkki:** Nämä löytyvät Settings → API

---

## 7️⃣ Avaa sovellus ja yhdistä Supabaseesi

### Sovellus on JO VALMIS käyttöön!

1. **Avaa sovelluksen linkki** (sait myyjältä)
   - Esim: `https://app.example.com`

2. **Sovellus toimii HETI!**
   - Kaikki ominaisuudet ovat valmiina
   - Tietokanta rakennetaan automaattisesti ensimmäisellä kirjautumisella
   - Edge Functions aktivoituvat automaattisesti

3. **Ei asennuksia, ei konfiguraatioita - vain avaa ja aloita!**

➡️ **Siirry suoraan kohtaan 8️⃣ ja rekisteröidy sovellukseen**

---

## 8️⃣ Ensimmäinen käyttäjä (sinä!)

### Luo admin-tili:

1. Sovelluksen etusivulla: **Rekisteröidy**
2. Täytä:
   - **Sähköposti:** [sinun-sähköpostisi]
   - **Salasana:** (vahva salasana!)
   - **Nimi:** [nimesi]
3. **Rekisteröidy**

**🎉 TÄRKEÄÄ:** Ensimmäinen rekisteröitynyt käyttäjä saa automaattisesti **admin-oikeudet**!

### Täytä yrityksen tiedot:

1. Kirjaudu sisään
2. Mene: **Asetukset → Yrityksen tiedot**
3. Täytä:
   - Yrityksen nimi
   - Y-tunnus
   - Osoite
   - Yhteystiedot
   - Lataa logo (valinnainen)
4. **Tallenna**

---

## 9️⃣ Perusasetusten konfigurointi

### Käy läpi nämä asetukset:

**Asetukset → Numerointi:**
- Asiakkaiden numerot (esim. `AS2025-0001`)
- Huoltojen numerot (esim. `HU2025-0001`)
- Laskujen numerot (esim. `LA2025-0001`)

**Asetukset → Hinnoittelu:**
- Oletustuntihinta (esim. 60€/h)
- Sisältääkö ALV:n

**Asetukset → ALV:**
- ALV-prosentti (25.5% Suomessa)

**Asetukset → Maksutavat:**
- Käteinen, Kortti, Lasku jne.

**Asetukset → Takuut:**
- Osatakuu (esim. 12 kk)
- Työtakuu (esim. 3 kk)

**Asetukset → Laitteet:**
- Laitevalmistajat (Apple, Samsung jne.)

---

## 🔟 Testaa sovellusta

### Tarkistuslista:

- [ ] **Asiakkaat:**
  - [ ] Luo testiasiakasta
  - [ ] Muokkaa asiakasta
  - [ ] Poista testiasiakkaa

- [ ] **Laitteet:**
  - [ ] Lisää testilaite
  - [ ] Liitä asiakkaaseen

- [ ] **Huollot:**
  - [ ] Luo testihuolto
  - [ ] Lisää varaosia
  - [ ] Vaihda status
  - [ ] Tulosta huoltokaavake

- [ ] **Laskutus:**
  - [ ] Luo lasku huollosta
  - [ ] Tulosta lasku PDF:ksi
  - [ ] Merkitse maksetuksi

- [ ] **Ilmoitukset:**
  - Asetukset → Ilmoitukset
  - [ ] Testaa "Huolto valmis" -sähköposti

---

## 🆘 Ongelmanratkaisu

### Sovellus ei avaudu / kirjautuminen ei toimi:

- ✅ Tarkista että Supabase URL ja Anon Key ovat oikein
- ✅ Tarkista että Email provider on päällä Supabasessa
- ✅ Katso selainkonsolista virheet (F12 → Console)

### Tietokantavirheet:

- ✅ Tarkista että kaikki migraatiot on ajettu
- ✅ Tarkista RLS (Row Level Security) policies:
  - Supabase → Authentication → Policies

### Sähköpostit eivät lähe:

- ✅ Tarkista että `RESEND_API_KEY` on lisätty secretseihin
- ✅ Tarkista Resend dashboard: https://resend.com/emails
- ✅ Edge Function logs: Supabase → Edge Functions → Logs

### Edge Functions ei toimi:

- ✅ Tarkista että funktiot on deployattu
- ✅ Tarkista että kaikki secrets on lisätty
- ✅ Katso Function logs Supabasessa

---

## 📚 Lisäresurssit

### Dokumentaatio:

- **Supabase:** https://supabase.com/docs
- **Resend:** https://resend.com/docs

### Yhteisöt:

- Supabase Discord: https://discord.supabase.com

### Videot:

- Supabase tutorials: https://supabase.com/docs/guides/getting-started

---

## ✅ Valmis!

Onnittelut! Sovelluksesi on nyt käytössä. 🎉

### Seuraavat askeleet:

1. **Lisää käyttäjiä:**
   - Asetukset → Käyttäjät
   - Kutsu tiimisi jäsenet

2. **Tutustu ominaisuuksiin:**
   - Asiakashallinta
   - Huoltojen seuranta
   - Varastonhallinta
   - Laskutus

3. **Ota yhteyttä myyjään:**
   - Jos tarvitset apua tai räätälöintiä
   - Tukitiedot alla

---

**Onnea sovelluksen käyttöön! 🚀**

**Tuki:** [myyjän yhteystiedot]  
**Versio:** 1.0  
**Päivitetty:** 2025-01-20
