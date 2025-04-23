
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get settings
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('*')
      .single();

    if (req.method === 'POST') {
      const { type, orderId } = await req.json();

      // Get order details
      const { data: order } = await supabaseClient
        .from('orders')
        .select(`
          *,
          foods (
            name,
            price
          )
        `)
        .eq('id', orderId)
        .single();

      if (!order) throw new Error('Order not found');

      // Log notification attempt
      console.log(`Sending ${type} notification for order ${orderId}`);
      console.log('Order details:', order);
      console.log('Settings:', settings);

      // In a real implementation, you would use the settings to send actual notifications
      // For now, we'll just simulate the notification
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${type} notification sent for order ${orderId}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default response for unsupported methods
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
