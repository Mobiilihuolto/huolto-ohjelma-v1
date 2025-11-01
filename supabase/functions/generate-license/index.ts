import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateLicenseRequest {
  maxUsers?: number;
  expiresInDays?: number | null;
  notes?: string;
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const year = new Date().getFullYear();
  return `MOBILE-${year}-${segment1}${segment2}`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Ei valtuutusta' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Virheellinen valtuutus' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError || !roles?.some(r => r.role === 'admin')) {
      console.error('Not admin:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Vain adminit voivat luoda lisenssejä' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GenerateLicenseRequest = await req.json();
    const {
      maxUsers = 5,
      expiresInDays = null,
      notes = ''
    } = body;

    // Generate unique license key
    let licenseKey = generateLicenseKey();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('licenses')
        .select('license_key')
        .eq('license_key', licenseKey)
        .single();

      if (!existing) break;
      licenseKey = generateLicenseKey();
      attempts++;
    }

    if (attempts >= 10) {
      return new Response(
        JSON.stringify({ error: 'Lisenssinavain generointiin epäonnistui' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration date
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Insert new license
    const { data: license, error: insertError } = await supabase
      .from('licenses')
      .insert({
        license_key: licenseKey,
        max_users: maxUsers,
        expires_at: expiresAt,
        notes: notes || `Luotu ${new Date().toLocaleDateString('fi-FI')}`,
        is_used: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Lisenssin tallennus epäonnistui', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('License created:', licenseKey);

    return new Response(
      JSON.stringify({ 
        success: true,
        license: license
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in generate-license function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
