import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const { data: settings } = await supabase
      .from("varasto_asetukset")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .maybeSingle();

    if (!settings?.varasto_kaytossa || !settings?.varoita_matalasta_saldosta) {
      return new Response(
        JSON.stringify({ message: "Varasto tai varoitukset eivät ole käytössä" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: notificationSettings } = await supabase
      .from("ilmoitus_asetukset")
      .select("varasto_varoitus_kaytossa, varasto_varoitus_email")
      .eq("company_id", companyId)
      .maybeSingle();

    if (notificationSettings?.varasto_varoitus_kaytossa === false) {
      return new Response(
        JSON.stringify({ message: "Varastovaroitukset eivät ole käytössä" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: companySettings } = await supabase
      .from("yrityksen_asetukset")
      .select("email, yrityksen_nimi")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .maybeSingle();

    const recipientEmail = notificationSettings?.varasto_varoitus_email || companySettings?.email;

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Varoituksille ei ole määritetty sähköpostiosoitetta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: lowStockParts } = await supabase
      .from("varaosat")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("nimi");

    const criticalParts = lowStockParts?.filter(part =>
      part.saldo < (part.minimisaldo || 0)
    ) || [];

    if (criticalParts.length === 0) {
      return new Response(
        JSON.stringify({ message: "Ei kriittisiä varastosaldoja" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Varastovaroitus lähetetty: ${criticalParts.length} kriittistä osaa`);

    return new Response(
      JSON.stringify({
        success: true,
        criticalParts: criticalParts.length,
        sentTo: recipientEmail
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  } catch (error) {
    console.error("Virhe:", error);
    return new Response(
      JSON.stringify({ error: "Varastovaroituksen lähetys epäonnistui" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
