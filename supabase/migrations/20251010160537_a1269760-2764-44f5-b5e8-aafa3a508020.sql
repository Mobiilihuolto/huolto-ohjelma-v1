-- VAIHE 1: Muuta kaikki RESTRICTIVE-politiikat PERMISSIVE-tyyppisiksi
-- Poistetaan ensin kaikki RESTRICTIVE-politiikat ja luodaan ne uudelleen PERMISSIVE-tyyppisinä

-- ASIAKKAAT
DROP POLICY IF EXISTS "Users can view own customers" ON asiakkaat;
DROP POLICY IF EXISTS "Users can insert own customers" ON asiakkaat;
DROP POLICY IF EXISTS "Users can update own customers" ON asiakkaat;
DROP POLICY IF EXISTS "Users can delete own customers" ON asiakkaat;

CREATE POLICY "Users can view own customers" ON asiakkaat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own customers" ON asiakkaat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own customers" ON asiakkaat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own customers" ON asiakkaat
  FOR DELETE USING (user_id = auth.uid());

-- LASKUT
DROP POLICY IF EXISTS "Users can view own invoices" ON laskut;
DROP POLICY IF EXISTS "Users can insert own invoices" ON laskut;
DROP POLICY IF EXISTS "Users can update own invoices" ON laskut;
DROP POLICY IF EXISTS "Users can delete own invoices" ON laskut;

CREATE POLICY "Users can view own invoices" ON laskut
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own invoices" ON laskut
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own invoices" ON laskut
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own invoices" ON laskut
  FOR DELETE USING (user_id = auth.uid());

-- HUOLLOT
DROP POLICY IF EXISTS "Users can view own services" ON "Huollot";
DROP POLICY IF EXISTS "Users can insert own services" ON "Huollot";
DROP POLICY IF EXISTS "Users can update own services" ON "Huollot";
DROP POLICY IF EXISTS "Users can delete own services" ON "Huollot";

CREATE POLICY "Users can view own services" ON "Huollot"
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own services" ON "Huollot"
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own services" ON "Huollot"
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own services" ON "Huollot"
  FOR DELETE USING (user_id = auth.uid());

-- LAITTEET
DROP POLICY IF EXISTS "Users can view own devices" ON "Laitteet";
DROP POLICY IF EXISTS "Users can insert own devices" ON "Laitteet";
DROP POLICY IF EXISTS "Users can update own devices" ON "Laitteet";
DROP POLICY IF EXISTS "Users can delete own devices" ON "Laitteet";

CREATE POLICY "Users can view own devices" ON "Laitteet"
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own devices" ON "Laitteet"
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own devices" ON "Laitteet"
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own devices" ON "Laitteet"
  FOR DELETE USING (user_id = auth.uid());

-- YRITYKSEN ASETUKSET
DROP POLICY IF EXISTS "Users can view own company settings" ON yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can insert own company settings" ON yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can update own company settings" ON yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can delete own company settings" ON yrityksen_asetukset;

CREATE POLICY "Users can view own company settings" ON yrityksen_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own company settings" ON yrityksen_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own company settings" ON yrityksen_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own company settings" ON yrityksen_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- ILMOITUS ASETUKSET
DROP POLICY IF EXISTS "Users can view own notification settings" ON ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can update own notification settings" ON ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON ilmoitus_asetukset;

CREATE POLICY "Users can view own notification settings" ON ilmoitus_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notification settings" ON ilmoitus_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notification settings" ON ilmoitus_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notification settings" ON ilmoitus_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- HUOLTO VARAOSAT
DROP POLICY IF EXISTS "Users can view service parts" ON huolto_varaosat;
DROP POLICY IF EXISTS "Users can insert service parts" ON huolto_varaosat;
DROP POLICY IF EXISTS "Users can update service parts" ON huolto_varaosat;
DROP POLICY IF EXISTS "Users can delete service parts" ON huolto_varaosat;

CREATE POLICY "Users can view service parts" ON huolto_varaosat
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert service parts" ON huolto_varaosat
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update service parts" ON huolto_varaosat
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete service parts" ON huolto_varaosat
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- VAIHE 2: Lisää user_id asetustauluihin
ALTER TABLE alv_asetukset ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE hinnoittelu_asetukset ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE takuu_asetukset ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE lasku_asetukset ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE numerointi_asetukset ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE varasto_asetukset ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE maksutavat ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE laite_valmistajat ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE service_statuses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE tekniikat ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE varaosat ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- VAIHE 3: Päivitä olemassa olevat asetukset käyttäjän user_id:llä
UPDATE alv_asetukset SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE hinnoittelu_asetukset SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE takuu_asetukset SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE lasku_asetukset SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE numerointi_asetukset SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE varasto_asetukset SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE maksutavat SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE laite_valmistajat SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE service_statuses SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE tekniikat SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;
UPDATE varaosat SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' WHERE user_id IS NULL;

-- VAIHE 4: Luo oikeat RLS-politiikat asetustauluille

-- ALV ASETUKSET
DROP POLICY IF EXISTS "Users can view VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can insert VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can update VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can delete VAT settings" ON alv_asetukset;

CREATE POLICY "Users can view own VAT settings" ON alv_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own VAT settings" ON alv_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own VAT settings" ON alv_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own VAT settings" ON alv_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- HINNOITTELU ASETUKSET
DROP POLICY IF EXISTS "Users can view pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can insert pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can update pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can delete pricing settings" ON hinnoittelu_asetukset;

CREATE POLICY "Users can view own pricing settings" ON hinnoittelu_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pricing settings" ON hinnoittelu_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pricing settings" ON hinnoittelu_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own pricing settings" ON hinnoittelu_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- TAKUU ASETUKSET
DROP POLICY IF EXISTS "Users can view warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can insert warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can update warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can delete warranty settings" ON takuu_asetukset;

CREATE POLICY "Users can view own warranty settings" ON takuu_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own warranty settings" ON takuu_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own warranty settings" ON takuu_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own warranty settings" ON takuu_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- LASKU ASETUKSET
DROP POLICY IF EXISTS "Users can view invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can insert invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can update invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can delete invoice settings" ON lasku_asetukset;

CREATE POLICY "Users can view own invoice settings" ON lasku_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own invoice settings" ON lasku_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own invoice settings" ON lasku_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own invoice settings" ON lasku_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- NUMEROINTI ASETUKSET
DROP POLICY IF EXISTS "Users can view numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can insert numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can update numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can delete numbering settings" ON numerointi_asetukset;

CREATE POLICY "Users can view own numbering settings" ON numerointi_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own numbering settings" ON numerointi_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own numbering settings" ON numerointi_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own numbering settings" ON numerointi_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- VARASTO ASETUKSET
DROP POLICY IF EXISTS "Users can view inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can insert inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can update inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can delete inventory settings" ON varasto_asetukset;

CREATE POLICY "Users can view own inventory settings" ON varasto_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own inventory settings" ON varasto_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own inventory settings" ON varasto_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own inventory settings" ON varasto_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- MAKSUTAVAT
DROP POLICY IF EXISTS "Users can view payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can insert payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can update payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can delete payment methods" ON maksutavat;

CREATE POLICY "Users can view own payment methods" ON maksutavat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own payment methods" ON maksutavat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own payment methods" ON maksutavat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own payment methods" ON maksutavat
  FOR DELETE USING (user_id = auth.uid());

-- LAITE VALMISTAJAT
DROP POLICY IF EXISTS "Users can view manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can insert manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can update manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can delete manufacturers" ON laite_valmistajat;

CREATE POLICY "Users can view own manufacturers" ON laite_valmistajat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own manufacturers" ON laite_valmistajat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own manufacturers" ON laite_valmistajat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own manufacturers" ON laite_valmistajat
  FOR DELETE USING (user_id = auth.uid());

-- SERVICE STATUSES
DROP POLICY IF EXISTS "Users can view service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can insert service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can update service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can delete service statuses" ON service_statuses;

CREATE POLICY "Users can view own service statuses" ON service_statuses
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own service statuses" ON service_statuses
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own service statuses" ON service_statuses
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own service statuses" ON service_statuses
  FOR DELETE USING (user_id = auth.uid());

-- TEKNIIKAT
DROP POLICY IF EXISTS "Users can view technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can insert technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can update technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can delete technicians" ON tekniikat;

CREATE POLICY "Users can view own technicians" ON tekniikat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own technicians" ON tekniikat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own technicians" ON tekniikat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own technicians" ON tekniikat
  FOR DELETE USING (user_id = auth.uid());

-- VARAOSAT
DROP POLICY IF EXISTS "Users can view own parts" ON varaosat;
DROP POLICY IF EXISTS "Users can insert own parts" ON varaosat;
DROP POLICY IF EXISTS "Users can update own parts" ON varaosat;
DROP POLICY IF EXISTS "Users can delete own parts" ON varaosat;

CREATE POLICY "Users can view own parts" ON varaosat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own parts" ON varaosat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own parts" ON varaosat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own parts" ON varaosat
  FOR DELETE USING (user_id = auth.uid());