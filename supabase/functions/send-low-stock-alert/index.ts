import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// TODO: PRODUCTION - This edge function currently uses the developer's Resend account
// and verified domain (mobiilihuolto.com). For production multi-tenant use, implement:
// 1. Per-user Resend API keys stored in Supabase secrets
// 2. Per-user domain verification in Resend
// 3. Dynamic 'from' address based on user's verified domain
// Currently suitable for testing and single-tenant use only.
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("send-low-stock-alert function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get inventory settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from("varasto_asetukset")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (settingsError) {
      console.error("Settings error:", settingsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch inventory settings',
          details: settingsError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if inventory and alerts are enabled
    if (!settings?.varasto_kaytossa || !settings?.varoita_matalasta_saldosta) {
      console.log("Inventory or low stock alerts not enabled");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Inventory or alerts are disabled" 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch notification settings to get the recipient email
    const { data: notificationSettings, error: notificationError } = await supabaseClient
      .from('ilmoitus_asetukset')
      .select('varasto_varoitus_kaytossa, varasto_varoitus_email')
      .maybeSingle();

    if (notificationError) {
      console.error('Error fetching notification settings:', notificationError);
    }

    // Check if inventory alerts are disabled in notification settings
    if (notificationSettings && notificationSettings.varasto_varoitus_kaytossa === false) {
      console.log('Inventory alerts are disabled in notification settings');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Inventory alerts are disabled in notification settings' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch company settings as fallback
    const { data: companySettings, error: companyError } = await supabaseClient
      .from('yrityksen_asetukset')
      .select('email, yrityksen_nimi')
      .eq('is_active', true)
      .maybeSingle();

    if (companyError) {
      console.error('Error fetching company settings:', companyError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch company settings',
          details: companyError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use notification email if set, otherwise use company email
    const recipientEmail = notificationSettings?.varasto_varoitus_email || companySettings?.email;

    if (!recipientEmail) {
      console.log('No email configured for inventory alerts');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No email configured for inventory alerts' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all parts with low stock
    const { data: lowStockParts, error: partsError } = await supabaseClient
      .from("varaosat")
      .select("*")
      .eq("is_active", true)
      .order("nimi");

    if (partsError) {
      console.error("Parts error:", partsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch parts',
          details: partsError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter parts that are below minimum stock
    const criticalParts = lowStockParts?.filter(part => 
      part.saldo < (part.minimisaldo || 0)
    ) || [];

    if (criticalParts.length === 0) {
      console.log("No critical stock parts found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No critical stock parts found" 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build email content with list of low stock parts
    const partsList = criticalParts.map(part => {
      const deficit = (part.minimisaldo || 0) - part.saldo;
      return `• ${part.nimi} - Saldo: ${part.saldo} ${part.yksikko} (Min: ${part.minimisaldo || 0}, Puuttuu: ${deficit})`;
    }).join('\n');

    const emailHtml = `
      <h2>Varaston varoitus: Matalat saldot</h2>
      <p>Seuraavat varaosat ovat minimisaldon alapuolella:</p>
      <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
${partsList}
      </pre>
      <p><strong>Kriittisiä osia yhteensä: ${criticalParts.length}</strong></p>
      <p>Ole hyvä ja tilaa lisää varastoon.</p>
      <hr>
      <p style="color: #888; font-size: 12px;">Tämä on automaattinen ilmoitus varastonhallintajärjestelmästä.</p>
    `;

    // Send email
    // NOTE: Using developer's verified domain for BETA testing
    // TODO: Replace with user's own domain when implementing multi-tenant production version
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Varasto-ilmoitus <noreply@mobiilihuolto.com>',
      to: [recipientEmail],
      subject: `⚠️ Varoitus: ${criticalParts.length} varaosaa matalalla saldolla`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      
      // Check if it's a domain verification issue
      const errorMessage = emailError.message || '';
      const isVerificationError = errorMessage.includes('verify a domain') || errorMessage.includes('testing emails');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: isVerificationError 
            ? 'Sähköpostin lähetys epäonnistui: Verifoi domain Resendissä (resend.com/domains) tai käytä Resend-tilin omaa sähköpostiosoitetta testauksessa.'
            : 'Sähköpostin lähetys epäonnistui',
          details: emailError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        criticalParts: criticalParts.length,
        emailId: emailData.id,
        sentTo: recipientEmail
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in send-low-stock-alert:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);