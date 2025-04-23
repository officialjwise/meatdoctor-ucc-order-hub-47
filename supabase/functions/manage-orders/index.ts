
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

    if (req.method === 'POST') {
      // Create new order
      const { foodId, quantity, location, phoneNumber, deliveryTime, paymentMode, additionalInfo, drink } = await req.json();
      
      const { data: order, error } = await supabaseClient
        .from('orders')
        .insert([{
          food_id: foodId,
          quantity,
          location,
          phone_number: phoneNumber,
          delivery_time: deliveryTime,
          payment_mode: paymentMode,
          additional_info: additionalInfo,
          drink,
          status: 'Pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notification (you can implement SMS/email notifications here)
      console.log('New order received:', order);

      return new Response(
        JSON.stringify({ success: true, order }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'PUT') {
      // Update order status
      const { orderId, status } = await req.json();
      
      const { data: order, error } = await supabaseClient
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, order }),
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
