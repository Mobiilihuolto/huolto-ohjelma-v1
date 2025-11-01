-- Dropaa KAIKKI vanhat politiikat ensin

-- ALV ASETUKSET - dropaa sekä vanhat että mahdolliset uudet
DROP POLICY IF EXISTS "Users can view VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can insert VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can update VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can delete VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can view own VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can insert own VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can update own VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Users can delete own VAT settings" ON alv_asetukset;

-- HINNOITTELU ASETUKSET
DROP POLICY IF EXISTS "Users can view pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can insert pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can update pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can delete pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can view own pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can insert own pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can update own pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can delete own pricing settings" ON hinnoittelu_asetukset;

-- TAKUU ASETUKSET
DROP POLICY IF EXISTS "Users can view warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can insert warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can update warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can delete warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can view own warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can insert own warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can update own warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can delete own warranty settings" ON takuu_asetukset;

-- LASKU ASETUKSET
DROP POLICY IF EXISTS "Users can view invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can insert invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can update invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can delete invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can view own invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can insert own invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can update own invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Users can delete own invoice settings" ON lasku_asetukset;

-- NUMEROINTI ASETUKSET
DROP POLICY IF EXISTS "Users can view numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can insert numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can update numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can delete numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can view own numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can insert own numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can update own numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can delete own numbering settings" ON numerointi_asetukset;

-- VARASTO ASETUKSET
DROP POLICY IF EXISTS "Users can view inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can insert inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can update inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can delete inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can view own inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can insert own inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can update own inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can delete own inventory settings" ON varasto_asetukset;

-- MAKSUTAVAT
DROP POLICY IF EXISTS "Users can view payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can insert payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can update payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can delete payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can view own payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can update own payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can delete own payment methods" ON maksutavat;

-- LAITE VALMISTAJAT
DROP POLICY IF EXISTS "Users can view manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can insert manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can update manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can delete manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can view own manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can insert own manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can update own manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can delete own manufacturers" ON laite_valmistajat;

-- SERVICE STATUSES
DROP POLICY IF EXISTS "Users can view service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can insert service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can update service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can delete service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can view own service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can insert own service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can update own service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Users can delete own service statuses" ON service_statuses;

-- TEKNIIKAT
DROP POLICY IF EXISTS "Users can view technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can insert technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can update technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can delete technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can view own technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can insert own technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can update own technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can delete own technicians" ON tekniikat;

-- VARAOSAT
DROP POLICY IF EXISTS "Users can view own parts" ON varaosat;
DROP POLICY IF EXISTS "Users can insert own parts" ON varaosat;
DROP POLICY IF EXISTS "Users can update own parts" ON varaosat;
DROP POLICY IF EXISTS "Users can delete own parts" ON varaosat;
DROP POLICY IF EXISTS "Users can view parts" ON varaosat;
DROP POLICY IF EXISTS "Users can insert parts" ON varaosat;
DROP POLICY IF EXISTS "Users can update parts" ON varaosat;
DROP POLICY IF EXISTS "Users can delete parts" ON varaosat;

-- Nyt luodaan uudet oikeat politiikat

-- ALV ASETUKSET
CREATE POLICY "Users can view own VAT settings" ON alv_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own VAT settings" ON alv_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own VAT settings" ON alv_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own VAT settings" ON alv_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- HINNOITTELU ASETUKSET
CREATE POLICY "Users can view own pricing settings" ON hinnoittelu_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pricing settings" ON hinnoittelu_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pricing settings" ON hinnoittelu_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own pricing settings" ON hinnoittelu_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- TAKUU ASETUKSET
CREATE POLICY "Users can view own warranty settings" ON takuu_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own warranty settings" ON takuu_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own warranty settings" ON takuu_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own warranty settings" ON takuu_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- LASKU ASETUKSET
CREATE POLICY "Users can view own invoice settings" ON lasku_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own invoice settings" ON lasku_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own invoice settings" ON lasku_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own invoice settings" ON lasku_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- NUMEROINTI ASETUKSET
CREATE POLICY "Users can view own numbering settings" ON numerointi_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own numbering settings" ON numerointi_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own numbering settings" ON numerointi_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own numbering settings" ON numerointi_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- VARASTO ASETUKSET
CREATE POLICY "Users can view own inventory settings" ON varasto_asetukset
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own inventory settings" ON varasto_asetukset
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own inventory settings" ON varasto_asetukset
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own inventory settings" ON varasto_asetukset
  FOR DELETE USING (user_id = auth.uid());

-- MAKSUTAVAT
CREATE POLICY "Users can view own payment methods" ON maksutavat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own payment methods" ON maksutavat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own payment methods" ON maksutavat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own payment methods" ON maksutavat
  FOR DELETE USING (user_id = auth.uid());

-- LAITE VALMISTAJAT
CREATE POLICY "Users can view own manufacturers" ON laite_valmistajat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own manufacturers" ON laite_valmistajat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own manufacturers" ON laite_valmistajat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own manufacturers" ON laite_valmistajat
  FOR DELETE USING (user_id = auth.uid());

-- SERVICE STATUSES
CREATE POLICY "Users can view own service statuses" ON service_statuses
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own service statuses" ON service_statuses
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own service statuses" ON service_statuses
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own service statuses" ON service_statuses
  FOR DELETE USING (user_id = auth.uid());

-- TEKNIIKAT
CREATE POLICY "Users can view own technicians" ON tekniikat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own technicians" ON tekniikat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own technicians" ON tekniikat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own technicians" ON tekniikat
  FOR DELETE USING (user_id = auth.uid());

-- VARAOSAT
CREATE POLICY "Users can view own parts" ON varaosat
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own parts" ON varaosat
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own parts" ON varaosat
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own parts" ON varaosat
  FOR DELETE USING (user_id = auth.uid());