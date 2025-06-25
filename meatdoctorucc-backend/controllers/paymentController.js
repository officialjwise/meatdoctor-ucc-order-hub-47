
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

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Extract order data from payment metadata
    const orderData = JSON.parse(paymentData.data.metadata.orderData);
    
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
    if (orderData.addons && orderData.addons.length > 0) {
      const { data: addonData, error: addonError } = await supabase
        .from('additional_options')
        .select('name, price')
        .in('name', orderData.addons);

      if (addonError) {
        logger.error('Addon fetch error:', addonError.message);
        throw new Error('Failed to fetch addon details');
      }
      addonsTotal = addonData.reduce((sum, addon) => sum + addon.price, 0);
    }

    const foodTotal = food.price * orderData.quantity;
    const totalPrice = foodTotal + addonsTotal;
    const generatedOrderId = `MD${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          food_id: orderData.foodId,
          quantity: orderData.quantity,
          delivery_location: orderData.deliveryLocation,
          phone_number: orderData.phoneNumber,
          delivery_time: orderData.deliveryTime,
          order_status: 'Confirmed', // Set as confirmed since payment is successful
          payment_mode: orderData.paymentMode,
          additional_notes: orderData.additionalNotes,
          addons: orderData.addons || [],
          order_id: generatedOrderId,
          payment_reference: reference,
          payment_status: 'Completed',
        },
      ])
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

    // SMS to the customer
    const customerSmsContent = `Payment Successful! Order Confirmed!\n\nOrder ID: ${generatedOrderId}\nYour payment of GHS ${totalPrice.toFixed(2)} has been confirmed.\n\nOrder Details:\nFood: ${food.name}\nQuantity: ${orderData.quantity}\n${orderData.addons && orderData.addons.length > 0 ? `Addons: ${orderData.addons.join(', ')}\n` : ''}Total Price: GHS ${totalPrice.toFixed(2)}\nPayment: ${orderData.paymentMode}\nDelivery Location: ${orderData.deliveryLocation}\nDelivery Time: ${deliveryDate}\nStatus: Confirmed`;

    await sendSMS({
      to: orderData.phoneNumber,
      content: customerSmsContent,
    });

    // SMS to the admin
    const adminPhoneNumber = '+233543482189';
    const adminSmsContent = `New Paid Order Received!\n\nOrder ID: ${generatedOrderId}\nPayment Reference: ${reference}\nCustomer Phone: ${orderData.phoneNumber}\nFood: ${food.name}\nQuantity: ${orderData.quantity}\n${orderData.addons && orderData.addons.length > 0 ? `Addons: ${orderData.addons.join(', ')}\n` : ''}Total Price: GHS ${totalPrice.toFixed(2)}\nPayment: ${orderData.paymentMode} (PAID)\nDelivery Location: ${orderData.deliveryLocation}\nDelivery Time: ${deliveryDate}\nStatus: Confirmed`;

    await sendSMS({
      to: adminPhoneNumber,
      content: adminSmsContent,
    });

    res.status(200).json({
      ...order,
      totalPrice,
      foodName: food.name,
      paymentStatus: 'Completed',
    });
  } catch (err) {
    logger.error(`Error in verifyPaystackPayment: ${err.message}`);
    next(err);
  }
};

module.exports = { verifyPaystackPayment };
