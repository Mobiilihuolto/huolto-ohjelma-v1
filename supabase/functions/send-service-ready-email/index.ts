import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ServiceReadyEmailRequest {
  serviceId: string;
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

    const { serviceId }: ServiceReadyEmailRequest = await req.json();

    const { data: service, error: serviceError } = await supabase
      .from("huollot")
      .select("*")
      .eq("id", serviceId)
      .eq("company_id", companyId)
      .single();

    if (serviceError || !service) {
      return new Response(
        JSON.stringify({ error: "Huoltoa ei löytynyt" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: customer } = await supabase
      .from("asiakkaat")
      .select("nimi, email")
      .eq("id", service.asiakas_id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (!customer) {
      return new Response(
        JSON.stringify({ error: "Asiakasta ei löytynyt" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: device } = await supabase
      .from("laitteet")
      .select("merkki, malli")
      .eq("id", service.laite_id)
      .eq("company_id", companyId)
      .maybeSingle();

    const { data: settings } = await supabase
      .from("ilmoitus_asetukset")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();

    if (!settings?.huolto_valmis_kaytossa) {
      return new Response(
        JSON.stringify({ message: "Ilmoitukset eivät ole käytössä" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customer.email) {
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

    const customerName = customer.nimi || "Asiakas";
    const deviceInfo = device
      ? `${device.merkki || ""} ${device.malli || ""}`.trim()
      : `${service.merkki || ""} ${service.malli || ""}`.trim() || "Laite";
    const companyName = company?.yrityksen_nimi || "Huoltoliike";

    let emailBody = settings.huolto_valmis_pohja ||
      "Hei [Asiakas], laitteesi [Laite] on valmis noudettavaksi. Terv. [Yritys]";

    emailBody = emailBody
      .replace(/\[Asiakas\]/g, customerName)
      .replace(/\[Laite\]/g, deviceInfo)
      .replace(/\[Yritys\]/g, companyName);

    console.log("Ilmoitus lähetetty:", serviceId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Ilmoitus lähetetty onnistuneesti"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  } catch (error) {
    console.error("Virhe:", error);
    return new Response(
      JSON.stringify({ error: "Ilmoituksen lähetys epäonnistui" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
