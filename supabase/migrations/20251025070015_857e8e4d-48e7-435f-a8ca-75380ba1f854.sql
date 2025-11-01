-- Poista KAIKKI vanhat policyt molemmista versioista
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename IN (
            'asiakkaat', 'laitteet', 'Laitteet', 'huollot', 'Huollot', 'laskut', 
            'varaosat', 'huolto_varaosat', 'yrityksen_asetukset', 'service_statuses',
            'hinnoittelu_asetukset', 'takuu_asetukset', 'tekniikat', 'laite_valmistajat',
            'alv_asetukset', 'maksutavat', 'lasku_asetukset', 'numerointi_asetukset',
            'varasto_asetukset', 'ilmoitus_asetukset'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename
        );
    END LOOP;
END $$;

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

-- Luo policyt
CREATE POLICY "Admin and teknikko can view customers" ON asiakkaat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin and teknikko can insert customers" ON asiakkaat FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin and teknikko can update customers" ON asiakkaat FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Only admin can delete customers" ON asiakkaat FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view company devices" ON laitteet FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin and teknikko can insert devices" ON laitteet FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin and teknikko can update devices" ON laitteet FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Only admin can delete devices" ON laitteet FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view devices cap" ON "Laitteet" FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin teknikko insert devices cap" ON "Laitteet" FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko update devices cap" ON "Laitteet" FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin delete devices cap" ON "Laitteet" FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all services" ON huollot FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Techs view own services" ON huollot FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'teknikko') AND teknikko_id = auth.uid());
CREATE POLICY "Users view all services" ON huollot FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'kayttaja'));
CREATE POLICY "Admin teknikko insert services" ON huollot FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko update services" ON huollot FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin delete services" ON huollot FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view services cap" ON "Huollot" FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Techs view own services cap" ON "Huollot" FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'teknikko') AND teknikko_id = auth.uid());
CREATE POLICY "Users view services cap" ON "Huollot" FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'kayttaja'));
CREATE POLICY "Admin teknikko insert services cap" ON "Huollot" FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko update services cap" ON "Huollot" FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin delete services cap" ON "Huollot" FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin teknikko view invoices" ON laskut FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko insert invoices" ON laskut FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko update invoices" ON laskut FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin delete invoices" ON laskut FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view parts" ON varaosat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin teknikko insert parts" ON varaosat FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko update parts" ON varaosat FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin delete parts" ON varaosat FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view service parts" ON huolto_varaosat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin teknikko insert service parts" ON huolto_varaosat FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko update service parts" ON huolto_varaosat FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin teknikko delete service parts" ON huolto_varaosat FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));

CREATE POLICY "View company settings" ON yrityksen_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage company settings" ON yrityksen_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View service statuses" ON service_statuses FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage service statuses" ON service_statuses FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin view pricing" ON hinnoittelu_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Teknikko view pricing" ON hinnoittelu_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'teknikko'));
CREATE POLICY "Admin manage pricing" ON hinnoittelu_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View warranty settings" ON takuu_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage warranty" ON takuu_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View technicians" ON tekniikat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage technicians" ON tekniikat FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Teknikko insert self" ON tekniikat FOR INSERT WITH CHECK (user_id = auth.uid() AND company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'teknikko'));

CREATE POLICY "View manufacturers" ON laite_valmistajat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage manufacturers" ON laite_valmistajat FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View VAT settings" ON alv_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage VAT" ON alv_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View payment methods" ON maksutavat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage payment methods" ON maksutavat FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View invoice settings" ON lasku_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage invoice settings" ON lasku_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View numbering settings" ON numerointi_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage numbering" ON numerointi_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View inventory settings" ON varasto_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage inventory" ON varasto_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "View notification settings" ON ilmoitus_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage notifications" ON ilmoitus_asetukset FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));