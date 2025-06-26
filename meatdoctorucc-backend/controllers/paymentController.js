
const { supabase } = require('../config/supabase');
const { sendSMS } = require('../utils/sendSMS');
const logger = require('../utils/logger');
const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_34af9dda2e2a1427cae2a59a679bbff284f19e58';

const verifyPaystackPayment = async (req, res, next) => {
  try {
    const { reference, orderId } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    console.log('Verifying payment with reference:', reference);

    // Verify payment with Paystack
    const paymentVerification = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentData = paymentVerification.data;
    console.log('Paystack verification response:', paymentData);

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Extract order data from payment metadata
    const orderData = JSON.parse(paymentData.data.metadata.orderData);
    console.log('Order data from payment:', orderData);
    
    // Get the actual amount paid from Paystack response (in kobo, convert to cedis)
    const actualAmountPaid = paymentData.data.amount / 100;
    
    // Fetch food details
    const { data: food, error: foodError } = await supabase
      .from('foods')
      .select('id, name, price, category_id, categories!foods_category_id_fkey(name)')
      .eq('id', orderData.foodId)
      .single();

    if (foodError || !food) {
      logger.error('Food fetch error:', foodError?.message);
      throw new Error('Food item not found');
    }

    // Fetch addon details if addons are provided
    let addonsTotal = 0;
    let addonDetails = [];
    if (orderData.addons && orderData.addons.length > 0) {
      const { data: addonData, error: addonError } = await supabase
        .from('additional_options')
        .select('name, price')
        .in('name', orderData.addons);

      if (addonError) {
        logger.error('Addon fetch error:', addonError.message);
        throw new Error('Failed to fetch addon details');
      }
      addonDetails = addonData;
      addonsTotal = addonData.reduce((sum, addon) => sum + addon.price, 0);
    }

    const foodTotal = food.price * orderData.quantity;
    const totalPrice = foodTotal + addonsTotal;
    const generatedOrderId = `MD${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Create order in database
    const orderInsertData = {
      food_id: orderData.foodId,
      quantity: orderData.quantity,
      delivery_location: orderData.deliveryLocation,
      phone_number: orderData.phoneNumber,
      delivery_time: orderData.deliveryTime,
      order_status: 'Confirmed',
      payment_mode: orderData.paymentMode,
      additional_notes: orderData.additionalNotes,
      addons: orderData.addons || [],
      order_id: generatedOrderId,
      payment_reference: reference,
      payment_status: 'Completed',
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderInsertData])
      .select()
      .single();

    if (orderError) {
      logger.error('Order insert error:', orderError.message);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const deliveryDate = new Date(orderData.deliveryTime).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Send SMS notifications
    try {
      console.log('Attempting to send SMS notifications...');
      
      // SMS to the customer with correct payment details
      const customerSmsContent = `PAYMENT CONFIRMED! 💳✅

Order ID: ${generatedOrderId}
Payment Ref: ${reference}
Amount Paid: GHS ${actualAmountPaid.toFixed(2)}

ORDER DETAILS:
🍽️ ${food.name} x ${orderData.quantity}${orderData.addons && orderData.addons.length > 0 ? `
🍟 Add-ons: ${orderData.addons.join(', ')}` : ''}
📍 Delivery: ${orderData.deliveryLocation}
⏰ Time: ${deliveryDate}
💰 Total: GHS ${actualAmountPaid.toFixed(2)}
✅ Status: CONFIRMED

Track your order: meatdoctorucc.com/track-order/${generatedOrderId}

Thank you for choosing MeatDoctor UCC! 🍔`;

      console.log('Sending customer SMS to:', orderData.phoneNumber);
      console.log('Customer SMS content:', customerSmsContent);

      const customerSmsResult = await sendSMS({
        to: orderData.phoneNumber,
        content: customerSmsContent,
      });

      console.log('Customer SMS sent successfully:', customerSmsResult);
      logger.info('SMS notifications sent successfully');
      
    } catch (smsError) {
      logger.error('Failed to send SMS notifications:', smsError);
      console.error('SMS Error details:', {
        message: smsError.message,
        stack: smsError.stack,
        phoneNumber: orderData.phoneNumber
      });
      // Continue with the response even if SMS fails
    }

    res.status(200).json({
      ...order,
      totalPrice: actualAmountPaid,
      foodName: food.name,
      paymentStatus: 'Completed',
      paymentReference: reference,
      amountPaid: actualAmountPaid,
    });
  } catch (err) {
    logger.error(`Error in verifyPaystackPayment: ${err.message}`);
    console.error('Payment verification error:', err);
    next(err);
  }
};

module.exports = { verifyPaystackPayment };
