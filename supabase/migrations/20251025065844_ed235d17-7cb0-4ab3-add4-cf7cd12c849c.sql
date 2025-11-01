-- Poista vanhat policyt ja luo uudet

-- Poista kaikki vanhat policyt
DROP POLICY IF EXISTS "Admin and teknikko can view customers" ON asiakkaat;
DROP POLICY IF EXISTS "Admin and teknikko can insert customers" ON asiakkaat;
DROP POLICY IF EXISTS "Admin and teknikko can update customers" ON asiakkaat;
DROP POLICY IF EXISTS "Only admin can delete customers" ON asiakkaat;

DROP POLICY IF EXISTS "Users can view company devices" ON laitteet;
DROP POLICY IF EXISTS "Admin and teknikko can insert devices" ON laitteet;
DROP POLICY IF EXISTS "Admin and teknikko can update devices" ON laitteet;
DROP POLICY IF EXISTS "Only admin can delete devices" ON laitteet;

DROP POLICY IF EXISTS "Users can view company devices" ON "Laitteet";
DROP POLICY IF EXISTS "Admin and teknikko can insert devices" ON "Laitteet";
DROP POLICY IF EXISTS "Admin and teknikko can update devices" ON "Laitteet";
DROP POLICY IF EXISTS "Only admin can delete devices" ON "Laitteet";

DROP POLICY IF EXISTS "Admins can view all company services" ON huollot;
DROP POLICY IF EXISTS "Technicians can view own services" ON huollot;
DROP POLICY IF EXISTS "Users can view all company services" ON huollot;
DROP POLICY IF EXISTS "Admin and teknikko can insert services" ON huollot;
DROP POLICY IF EXISTS "Admin and teknikko can update services" ON huollot;
DROP POLICY IF EXISTS "Only admin can delete services" ON huollot;

DROP POLICY IF EXISTS "Admins can view all company services" ON "Huollot";
DROP POLICY IF EXISTS "Technicians can view own services" ON "Huollot";
DROP POLICY IF EXISTS "Users can view all company services" ON "Huollot";
DROP POLICY IF EXISTS "Admin and teknikko can insert services" ON "Huollot";
DROP POLICY IF EXISTS "Admin and teknikko can update services" ON "Huollot";
DROP POLICY IF EXISTS "Only admin can delete services" ON "Huollot";

DROP POLICY IF EXISTS "Admin and teknikko can view invoices" ON laskut;
DROP POLICY IF EXISTS "Admin and teknikko can insert invoices" ON laskut;
DROP POLICY IF EXISTS "Admin and teknikko can update invoices" ON laskut;
DROP POLICY IF EXISTS "Only admin can delete invoices" ON laskut;

DROP POLICY IF EXISTS "Users can view company parts" ON varaosat;
DROP POLICY IF EXISTS "Admin and teknikko can insert parts" ON varaosat;
DROP POLICY IF EXISTS "Admin and teknikko can update parts" ON varaosat;
DROP POLICY IF EXISTS "Only admin can delete parts" ON varaosat;

DROP POLICY IF EXISTS "Users can view company service parts" ON huolto_varaosat;
DROP POLICY IF EXISTS "Admin and teknikko can insert service parts" ON huolto_varaosat;
DROP POLICY IF EXISTS "Admin and teknikko can update service parts" ON huolto_varaosat;
DROP POLICY IF EXISTS "Admin and teknikko can delete service parts" ON huolto_varaosat;

DROP POLICY IF EXISTS "Users can view company settings" ON yrityksen_asetukset;
DROP POLICY IF EXISTS "Only admin can manage company settings" ON yrityksen_asetukset;

DROP POLICY IF EXISTS "Users can view company service statuses" ON service_statuses;
DROP POLICY IF EXISTS "Only admin can manage service statuses" ON service_statuses;

DROP POLICY IF EXISTS "Admin can view pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Teknikko can view pricing settings" ON hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Only admin can manage pricing settings" ON hinnoittelu_asetukset;

DROP POLICY IF EXISTS "Users can view company warranty settings" ON takuu_asetukset;
DROP POLICY IF EXISTS "Only admin can manage warranty settings" ON takuu_asetukset;

DROP POLICY IF EXISTS "Users can view company technicians" ON tekniikat;
DROP POLICY IF EXISTS "Only admin can manage technicians" ON tekniikat;
DROP POLICY IF EXISTS "Teknikko can insert self" ON tekniikat;

DROP POLICY IF EXISTS "Users can view company manufacturers" ON laite_valmistajat;
DROP POLICY IF EXISTS "Only admin can manage manufacturers" ON laite_valmistajat;

DROP POLICY IF EXISTS "Users can view company VAT settings" ON alv_asetukset;
DROP POLICY IF EXISTS "Only admin can manage VAT settings" ON alv_asetukset;

DROP POLICY IF EXISTS "Users can view company payment methods" ON maksutavat;
DROP POLICY IF EXISTS "Only admin can manage payment methods" ON maksutavat;

DROP POLICY IF EXISTS "Users can view company invoice settings" ON lasku_asetukset;
DROP POLICY IF EXISTS "Only admin can manage invoice settings" ON lasku_asetukset;

DROP POLICY IF EXISTS "Users can view company numbering settings" ON numerointi_asetukset;
DROP POLICY IF EXISTS "Only admin can manage numbering settings" ON numerointi_asetukset;

DROP POLICY IF EXISTS "Users can view company inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Only admin can manage inventory settings" ON varasto_asetukset;

DROP POLICY IF EXISTS "Users can view company notification settings" ON ilmoitus_asetukset;
DROP POLICY IF EXISTS "Only admin can manage notification settings" ON ilmoitus_asetukset;

-- Ota RLS käyttöön
ALTER TABLE IF EXISTS asiakkaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS laitteet ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Laitteet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS huollot ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Huollot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS laskut ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS varaosat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS huolto_varaosat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS yrityksen_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hinnoittelu_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS takuu_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tekniikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS laite_valmistajat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alv_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maksutavat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lasku_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS numerointi_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS varasto_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ilmoitus_asetukset ENABLE ROW LEVEL SECURITY;

-- Luo uudet policyt
CREATE POLICY "Admin and teknikko can view customers" ON asiakkaat
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can insert customers" ON asiakkaat
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update customers" ON asiakkaat
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Only admin can delete customers" ON asiakkaat
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company devices" ON laitteet
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin and teknikko can insert devices" ON laitteet
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update devices" ON laitteet
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Only admin can delete devices" ON laitteet
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company devices cap" ON "Laitteet"
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin and teknikko can insert devices cap" ON "Laitteet"
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update devices cap" ON "Laitteet"
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Only admin can delete devices cap" ON "Laitteet"
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can view all company services" ON huollot
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Technicians can view own services" ON huollot
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'teknikko')
    AND teknikko_id = auth.uid()
  );

CREATE POLICY "Users can view all company services" ON huollot
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'kayttaja')
  );

CREATE POLICY "Admin and teknikko can insert services" ON huollot
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update services" ON huollot
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Only admin can delete services" ON huollot
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can view all company services cap" ON "Huollot"
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Technicians can view own services cap" ON "Huollot"
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'teknikko')
    AND teknikko_id = auth.uid()
  );

CREATE POLICY "Users can view all company services cap" ON "Huollot"
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'kayttaja')
  );

CREATE POLICY "Admin and teknikko can insert services cap" ON "Huollot"
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update services cap" ON "Huollot"
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Only admin can delete services cap" ON "Huollot"
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admin and teknikko can view invoices" ON laskut
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can insert invoices" ON laskut
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update invoices" ON laskut
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Only admin can delete invoices" ON laskut
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company parts" ON varaosat
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin and teknikko can insert parts" ON varaosat
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update parts" ON varaosat
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Only admin can delete parts" ON varaosat
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company service parts" ON huolto_varaosat
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin and teknikko can insert service parts" ON huolto_varaosat
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can update service parts" ON huolto_varaosat
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Admin and teknikko can delete service parts" ON huolto_varaosat
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko'))
  );

CREATE POLICY "Users can view company settings" ON yrityksen_asetukset
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage company settings" ON yrityksen_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company service statuses" ON service_statuses
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage service statuses" ON service_statuses
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admin can view pricing settings" ON hinnoittelu_asetukset
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teknikko can view pricing settings" ON hinnoittelu_asetukset
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'teknikko')
  );

CREATE POLICY "Only admin can manage pricing settings" ON hinnoittelu_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company warranty settings" ON takuu_asetukset
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage warranty settings" ON takuu_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company technicians" ON tekniikat
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage technicians" ON tekniikat
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teknikko can insert self" ON tekniikat
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'teknikko')
  );

CREATE POLICY "Users can view company manufacturers" ON laite_valmistajat
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage manufacturers" ON laite_valmistajat
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company VAT settings" ON alv_asetukset
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage VAT settings" ON alv_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company payment methods" ON maksutavat
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage payment methods" ON maksutavat
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company invoice settings" ON lasku_asetukset
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage invoice settings" ON lasku_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company numbering settings" ON numerointi_asetukset
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage numbering settings" ON numerointi_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company inventory settings" ON varasto_asetukset
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage inventory settings" ON varasto_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view company notification settings" ON ilmoitus_asetukset
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage notification settings" ON ilmoitus_asetukset
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );