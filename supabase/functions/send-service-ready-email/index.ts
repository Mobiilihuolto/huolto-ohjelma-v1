import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ServiceReadyEmailRequest {
  serviceId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceId }: ServiceReadyEmailRequest = await req.json();
    console.log("Sending service ready email for service:", serviceId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch service data
    const { data: service, error: serviceError } = await supabase
      .from("huollot")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (serviceError || !service) {
      console.error("Error fetching service:", serviceError);
      throw new Error("Huoltoa ei löytynyt");
    }

    // Fetch customer data separately
    const { data: customer, error: customerError } = await supabase
      .from("asiakkaat")
      .select("nimi, email")
      .eq("id", service.asiakas_id)
      .single();

    if (customerError || !customer) {
      console.error("Error fetching customer:", customerError);
      throw new Error("Asiakasta ei löytynyt");
    }

    // Fetch device data separately if exists
    const { data: device } = await supabase
      .from("laitteet")
      .select("merkki, malli")
      .eq("id", service.laite_id)
      .maybeSingle();

    // Fetch notification settings
    const { data: settings, error: settingsError } = await supabase
      .from("ilmoitus_asetukset")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching notification settings:", settingsError);
      throw new Error("Ilmoitusasetuksia ei löytynyt");
    }

    // Check if notifications are enabled
    if (!settings?.huolto_valmis_kaytossa) {
      console.log("Service ready notifications are disabled");
      return new Response(
        JSON.stringify({ message: "Ilmoitukset eivät ole käytössä" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if customer has email
    if (!customer.email) {
      console.log("Customer has no email address");
      throw new Error("Asiakkaalla ei ole sähköpostiosoitetta");
    }

    // Fetch company settings
    const { data: company } = await supabase
      .from("yrityksen_asetukset")
      .select("yrityksen_nimi")
      .limit(1)
      .maybeSingle();

    // Prepare replacement values
    const customerName = customer.nimi || "Asiakas";
    const deviceInfo = device
      ? `${device.merkki || ""} ${device.malli || ""}`.trim()
      : `${service.merkki || ""} ${service.malli || ""}`.trim() || "Laite";
    const companyName = company?.yrityksen_nimi || "Huoltoliike";

    // Replace placeholders in template
    let emailBody = settings.huolto_valmis_pohja || 
      "Hei [Asiakas], laitteesi [Laite] on valmis noudettavaksi. Terv. [Yritys]";
    
    emailBody = emailBody
      .replace(/\[Asiakas\]/g, customerName)
      .replace(/\[Laite\]/g, deviceInfo)
      .replace(/\[Yritys\]/g, companyName);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Huolto-ohjelma <noreply@mobiilihuolto.com>",
      to: [customer.email],
      subject: `Laitteesi ${deviceInfo} on valmis`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Huolto valmis!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            ${emailBody.replace(/\n/g, '<br>')}
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 14px; color: #888;">
            Tämä on automaattinen viesti ${companyName} huoltojärjestelmästä.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Ilmoitus lähetetty onnistuneesti",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-service-ready-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Ilmoituksen lähetys epäonnistui" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
