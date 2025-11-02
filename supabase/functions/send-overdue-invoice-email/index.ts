import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://yourdomain.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OverdueInvoiceEmailRequest {
  invoiceId: string;
  isTest?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Ei valtuutusta" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Virheellinen valtuutus" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("company_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!userRoles?.company_id) {
      return new Response(
        JSON.stringify({ error: "Käyttäjällä ei ole yritystä" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const companyId = userRoles.company_id;

    const { invoiceId, isTest = false }: OverdueInvoiceEmailRequest = await req.json();

    const { data: invoice, error: invoiceError } = await supabase
      .from("laskut")
      .select("*")
      .eq("id", invoiceId)
      .eq("company_id", companyId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Laskua ei löytynyt" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: settings } = await supabase
      .from("ilmoitus_asetukset")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();

    if (!settings?.lasku_eraantynyt_kaytossa) {
      return new Response(
        JSON.stringify({ message: "Ilmoitukset eivät ole käytössä" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const today = new Date();
    const dueDate = new Date(invoice.erapaiva);
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const requiredDays = settings.lasku_eraantynyt_paivat ?? 7;
    if (!isTest && daysOverdue < requiredDays) {
      return new Response(
        JSON.stringify({ message: "Lasku ei ole vielä tarpeeksi erääntynyt" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invoice.asiakas_email) {
      return new Response(
        JSON.stringify({ error: "Asiakkaalla ei ole sähköpostiosoitetta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: company } = await supabase
      .from("yrityksen_asetukset")
      .select("yrityksen_nimi")
      .eq("company_id", companyId)
      .maybeSingle();

    const customerName = invoice.asiakas_nimi || "Asiakas";
    const invoiceNumber = invoice.numero || "N/A";
    const amount = invoice.kokonaissumma?.toFixed(2) || "0.00";
    const companyName = company?.yrityksen_nimi || "Huoltoliike";

    let emailBody = settings.lasku_eraantynyt_pohja ||
      "Hei [Asiakas], laskusi [Numero] on erääntynyt [Päivää] päivää sitten. Summa: [Summa]€. Terv. [Yritys]";

    emailBody = emailBody
      .replace(/\[Asiakas\]/g, customerName)
      .replace(/\[Numero\]/g, invoiceNumber)
      .replace(/\[Päivää\]/g, daysOverdue.toString())
      .replace(/\[Summa\]/g, amount)
      .replace(/\[Yritys\]/g, companyName);

    console.log("Muistutus lähetetty:", invoiceId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Muistutus lähetetty onnistuneesti"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  } catch (error) {
    console.error("Virhe:", error);
    return new Response(
      JSON.stringify({ error: "Muistutuksen lähetys epäonnistui" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
