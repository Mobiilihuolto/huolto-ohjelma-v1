/*
  # Fix ALL RLS Policies to use user_id
  
  ## Problem
  All RLS policies were using profiles.id when they should use profiles.user_id
  This caused "row-level security policy" errors
  
  ## Solution
  Update all RLS policies to correctly reference profiles.user_id = auth.uid()
  
  ## Tables Fixed
  - asiakkaat
  - laitteet  
  - huollot
  - varaosat
  - laskut
  - hinnoittelu_asetukset
  - takuu_asetukset
  - numerointi_asetukset
  - tekniikat
  - maksutavat
  - ilmoitus_asetukset
  - laite_valmistajat
*/

-- ASIAKKAAT
DROP POLICY IF EXISTS "Users can view own company customers" ON asiakkaat;
DROP POLICY IF EXISTS "Users can create customers" ON asiakkaat;
DROP POLICY IF EXISTS "Users can update own company customers" ON asiakkaat;
DROP POLICY IF EXISTS "Users can delete own company customers" ON asiakkaat;

CREATE POLICY "Users can view own company customers" ON asiakkaat FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create customers" ON asiakkaat FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own company customers" ON asiakkaat FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own company customers" ON asiakkaat FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- LAITTEET
DROP POLICY IF EXISTS "Users can view own company devices" ON laitteet;
DROP POLICY IF EXISTS "Users can create devices" ON laitteet;
DROP POLICY IF EXISTS "Users can update own company devices" ON laitteet;
DROP POLICY IF EXISTS "Users can delete own company devices" ON laitteet;

CREATE POLICY "Users can view own company devices" ON laitteet FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create devices" ON laitteet FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own company devices" ON laitteet FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own company devices" ON laitteet FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- HUOLLOT
DROP POLICY IF EXISTS "Users can view own company services" ON huollot;
DROP POLICY IF EXISTS "Users can create services" ON huollot;
DROP POLICY IF EXISTS "Users can update own company services" ON huollot;
DROP POLICY IF EXISTS "Users can delete own company services" ON huollot;

CREATE POLICY "Users can view own company services" ON huollot FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create services" ON huollot FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own company services" ON huollot FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own company services" ON huollot FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- VARAOSAT
DROP POLICY IF EXISTS "Users can view own company parts" ON varaosat;
DROP POLICY IF EXISTS "Users can create parts" ON varaosat;
DROP POLICY IF EXISTS "Users can update own company parts" ON varaosat;
DROP POLICY IF EXISTS "Users can delete own company parts" ON varaosat;

CREATE POLICY "Users can view own company parts" ON varaosat FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create parts" ON varaosat FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own company parts" ON varaosat FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own company parts" ON varaosat FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- LASKUT
DROP POLICY IF EXISTS "Users can view own company invoices" ON laskut;
DROP POLICY IF EXISTS "Users can create invoices" ON laskut;
DROP POLICY IF EXISTS "Users can update own company invoices" ON laskut;
DROP POLICY IF EXISTS "Users can delete own company invoices" ON laskut;

CREATE POLICY "Users can view own company invoices" ON laskut FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create invoices" ON laskut FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own company invoices" ON laskut FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own company invoices" ON laskut FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- HINNOITTELU_ASETUKSET
DROP POLICY IF EXISTS "Users can view pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can create pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can update pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can delete pricing settings" ON hinnoittelu_asetukset;

CREATE POLICY "Users can view pricing settings" ON hinnoittelu_asetukset FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create pricing settings" ON hinnoittelu_asetukset FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update pricing settings" ON hinnoittelu_asetukset FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete pricing settings" ON hinnoittelu_asetukset FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- TAKUU_ASETUKSET
DROP POLICY IF EXISTS "Users can view warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can create warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can update warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Users can delete warranty settings" ON takuu_asetukset;

CREATE POLICY "Users can view warranty settings" ON takuu_asetukset FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create warranty settings" ON takuu_asetukset FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update warranty settings" ON takuu_asetukset FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete warranty settings" ON takuu_asetukset FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- NUMEROINTI_ASETUKSET
DROP POLICY IF EXISTS "Users can view numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can create numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Users can update numbering settings" ON numerointi_asetukset;

CREATE POLICY "Users can view numbering settings" ON numerointi_asetukset FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create numbering settings" ON numerointi_asetukset FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update numbering settings" ON numerointi_asetukset FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- TEKNIIKAT
DROP POLICY IF EXISTS "Users can view technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can create technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can update technicians" ON tekniikat;
DROP POLICY IF EXISTS "Users can delete technicians" ON tekniikat;

CREATE POLICY "Users can view technicians" ON tekniikat FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create technicians" ON tekniikat FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update technicians" ON tekniikat FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete technicians" ON tekniikat FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- MAKSUTAVAT
DROP POLICY IF EXISTS "Users can view payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can create payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can update payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Users can delete payment methods" ON maksutavat;

CREATE POLICY "Users can view payment methods" ON maksutavat FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create payment methods" ON maksutavat FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update payment methods" ON maksutavat FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete payment methods" ON maksutavat FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- ILMOITUS_ASETUKSET
DROP POLICY IF EXISTS "Users can view notification settings" ON ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can create notification settings" ON ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can update notification settings" ON ilmoitus_asetukset;

CREATE POLICY "Users can view notification settings" ON ilmoitus_asetukset FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create notification settings" ON ilmoitus_asetukset FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update notification settings" ON ilmoitus_asetukset FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- LAITE_VALMISTAJAT
DROP POLICY IF EXISTS "Users can view manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can create manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can update manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Users can delete manufacturers" ON laite_valmistajat;

CREATE POLICY "Users can view manufacturers" ON laite_valmistajat FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create manufacturers" ON laite_valmistajat FOR INSERT TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update manufacturers" ON laite_valmistajat FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete manufacturers" ON laite_valmistajat FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));