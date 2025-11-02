import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateLicenseRequest {
  maxUsers?: number;
  expiresInDays?: number | null;
  notes?: string;
}

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const year = new Date().getFullYear();
  return `MOBILE-${year}-${segment1}${segment2}`;
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
      .select("role, company_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!userRoles?.company_id) {
      return new Response(
        JSON.stringify({ error: "Käyttäjällä ei ole yritystä" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userRoles.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Vain adminit voivat luoda lisenssejä" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const companyId = userRoles.company_id;

    const body: GenerateLicenseRequest = await req.json();
    const {
      maxUsers = 5,
      expiresInDays = null,
      notes = ""
    } = body;

    let licenseKey = generateLicenseKey();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from("licenses")
        .select("license_key")
        .eq("license_key", licenseKey)
        .maybeSingle();

      if (!existing) break;
      licenseKey = generateLicenseKey();
      attempts++;
    }

    if (attempts >= 10) {
      return new Response(
        JSON.stringify({ error: "Lisenssinavain generointiin epäonnistui" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: license, error: insertError } = await supabase
      .from("licenses")
      .insert({
        license_key: licenseKey,
        max_users: maxUsers,
        expires_at: expiresAt,
        notes: notes || `Luotu ${new Date().toLocaleDateString("fi-FI")}`,
        is_used: false,
        company_id: companyId
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Lisenssin tallennus epäonnistui" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Lisenssi luotu:", licenseKey);

    return new Response(
      JSON.stringify({
        success: true,
        license: license
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Virhe:", error);
    return new Response(
      JSON.stringify({ error: "Lisenssin luonti epäonnistui" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
