import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OverdueInvoiceEmailRequest {
  invoiceId: string;
  isTest?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, isTest = false }: OverdueInvoiceEmailRequest = await req.json();
    console.log("Sending overdue invoice email for invoice:", invoiceId, "isTest:", isTest);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("laskut")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Error fetching invoice:", invoiceError);
      throw new Error("Laskua ei löytynyt");
    }

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
    if (!settings?.lasku_eraantynyt_kaytossa) {
      console.log("Overdue invoice notifications are disabled");
      return new Response(
        JSON.stringify({ message: "Ilmoitukset eivät ole käytössä" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if invoice is overdue (skip check for test emails)
    const today = new Date();
    const dueDate = new Date(invoice.erapaiva);
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const requiredDays = settings.lasku_eraantynyt_paivat ?? 7;
    if (!isTest && daysOverdue < requiredDays) {
      console.log("Invoice is not yet overdue enough");
      return new Response(
        JSON.stringify({ message: "Lasku ei ole vielä tarpeeksi erääntynyt" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if customer has email
    if (!invoice.asiakas_email) {
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
    const customerName = invoice.asiakas_nimi || "Asiakas";
    const invoiceNumber = invoice.numero || "N/A";
    const amount = invoice.kokonaissumma?.toFixed(2) || "0.00";
    const companyName = company?.yrityksen_nimi || "Huoltoliike";

    // Replace placeholders in template
    let emailBody = settings.lasku_eraantynyt_pohja || 
      "Hei [Asiakas], laskusi [Numero] on erääntynyt [Päivää] päivää sitten. Summa: [Summa]&euro;. Terv. [Yritys]";
    
    emailBody = emailBody
      .replace(/\[Asiakas\]/g, customerName)
      .replace(/\[Numero\]/g, invoiceNumber)
      .replace(/\[Päivää\]/g, daysOverdue.toString())
      .replace(/\[Summa\]/g, amount)
      .replace(/\[Yritys\]/g, companyName);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Huolto-ohjelma <noreply@mobiilihuolto.com>",
      to: [invoice.asiakas_email],
      subject: `Muistutus: Lasku ${invoiceNumber} erääntynyt`,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d9534f;">Laskumuistutus</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            ${emailBody.replace(/\n/g, '<br>')}
          </p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #d9534f;">
            <p style="margin: 5px 0;"><strong>Laskun numero:</strong> ${invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Eräpäivä:</strong> ${new Date(invoice.erapaiva).toLocaleDateString('fi-FI')}</p>
            <p style="margin: 5px 0;"><strong>Summa:</strong> ${amount} &euro;</p>
            <p style="margin: 5px 0;"><strong>Erääntynyt:</strong> ${daysOverdue} päivää sitten</p>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 14px; color: #888;">
            Tämä on automaattinen muistutus ${companyName} laskutusjärjestelmästä.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Muistutus lähetetty onnistuneesti",
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
    console.error("Error in send-overdue-invoice-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Muistutuksen lähetys epäonnistui" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
