const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { sendSMS } = require('../utils/sendSMS');
const logger = require('../utils/logger');

const createOrder = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const {
      foodId,
      quantity,
      deliveryLocation,
      phoneNumber,
      deliveryTime,
      paymentMode,
      additionalNotes,
      addons,
      drink, 
    } = req.body;

    // Fetch food details
    const { data: food, error: foodError } = await supabase
      .from('foods')
      .select('id, name, price, category_id, categories!foods_category_id_fkey(name)')
      .eq('id', foodId)
      .single();

    if (foodError || !food) {
      logger.error('Food fetch error:', foodError?.message);
      throw new Error('Food item not found');
    }

    // Fetch addon details if addons are provided
    let addonsTotal = 0;
    let addonDetails = [];
    if (addons && addons.length > 0) {
      const { data: addonData, error: addonError } = await supabase
        .from('additional_options')
        .select('name, price')
        .in('name', addons);

      if (addonError) {
        logger.error('Addon fetch error:', addonError.message);
        throw new Error('Failed to fetch addon details');
      }
      addonDetails = addonData;
      addonsTotal = addonData.reduce((sum, addon) => sum + addon.price, 0);
    }

    const foodTotal = food.price * quantity;
    const totalPrice = foodTotal + addonsTotal;
    const orderId = `MD${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Ensure addons is in the correct format for PostgreSQL text[] column
    const formattedAddons = addons && addons.length > 0 ? addons : [];

    // Insert the order into the database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          food_id: foodId,
          quantity,
          delivery_location: deliveryLocation,
          phone_number: phoneNumber,
          delivery_time: deliveryTime,
          order_status: 'Pending',
          payment_mode: paymentMode,
          additional_notes: additionalNotes,
          addons: formattedAddons,
          order_id: orderId,
          drink,
        },
      ])
      .select()
      .single();

    if (orderError) {
      logger.error('Order insert error:', orderError.message);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Send SMS notification for new order (only for cash orders)
    if (paymentMode === 'Cash') {
      try {
        console.log('Attempting to send SMS notification for cash order...');
        
        const deliveryDate = new Date(deliveryTime).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        // Shortened SMS to the customer
        const customerSmsContent = `ORDER RECEIVED! 📋

Order ID: ${orderId}
${food.name} x ${quantity}
Total: GHS ${totalPrice.toFixed(2)}
Delivery: ${deliveryDate}
Status: PENDING

Track: meatdoctorucc.com/track-order/${orderId}

Thank you! 🍔`;

        console.log('Sending customer SMS to:', phoneNumber);
        console.log('SMS content:', customerSmsContent);

        // Send SMS without admin notifications for cash orders
        const smsResult = await sendSMS({
          to: phoneNumber,
          content: customerSmsContent,
          skipAdminNotification: true // Skip admin SMS for cash orders
        });

        console.log('Customer SMS sent successfully:', smsResult);
        logger.info('SMS notification sent successfully for cash order');
      } catch (smsError) {
        console.error('Failed to send SMS notification:', smsError);
        logger.error('Failed to send SMS notification:', smsError);
        // Continue with the response even if SMS fails
      }
    }

    logger.info(`Order ${orderId} created successfully`);

    res.status(201).json({ ...order, totalPrice, foodName: food.name });
  } catch (err) {
    logger.error(`Error in createOrder: ${err.message}`);
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) throw new Error('orderStatus is required');

    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('order_status, phone_number, order_id, food_id, quantity, delivery_location, delivery_time, payment_mode, addons')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      logger.error('Order fetch error:', fetchError?.message);
      throw new Error('Order not found');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, foods(name, price, category_id, categories!foods_category_id_fkey(name))')
      .single();

    if (error || !data) {
      logger.error('Order update error:', error?.message);
      throw new Error('Failed to update order');
    }

    // Send SMS notification to customer only for status update
    try {
      console.log('Attempting to send SMS notification to customer for status update...');
      
      let statusMessage = '';
      let statusEmoji = '';
      
      switch (orderStatus) {
        case 'Confirmed':
          statusMessage = 'Order confirmed and being prepared!';
          statusEmoji = '✅';
          break;
        case 'Delivered':
          statusMessage = 'Order delivered! Enjoy your meal!';
          statusEmoji = '🎉';
          break;
        case 'Cancelled':
          statusMessage = 'Order cancelled.';
          statusEmoji = '❌';
          break;
        default:
          statusMessage = `Status: ${orderStatus}`;
          statusEmoji = '📋';
      }

      const customerSmsContent = `ORDER UPDATE ${statusEmoji}

Order ID: ${data.order_id}
${statusMessage}

${data.foods.name} x ${data.quantity}
Status: ${orderStatus.toUpperCase()}

Track: meatdoctorucc.com/track-order/${data.order_id}

MeatDoctor UCC 🍔`;

      console.log('Sending status update SMS to customer:', data.phone_number);
      console.log('SMS content:', customerSmsContent);

      // Send SMS to customer only - no admin notifications for status updates
      const smsResult = await sendSMS({
        to: data.phone_number,
        content: customerSmsContent,
        skipAdminNotification: true // Skip admin SMS for status updates
      });

      console.log('Customer status update SMS sent successfully:', smsResult);
      logger.info('SMS notification sent to customer for status update');
    } catch (smsError) {
      console.error('Failed to send SMS notification for status update:', smsError);
      logger.error('Failed to send SMS notification for status update:', smsError);
      // Continue with the response even if SMS fails
    }

    // Fetch addon details for total price calculation
    let addonsTotal = 0;
    if (data.addons && data.addons.length > 0) {
      const { data: addonData, error: addonError } = await supabase
        .from('additional_options')
        .select('price')
        .in('name', data.addons);

      if (addonError) {
        logger.error('Addon fetch error in updateOrder:', addonError.message);
        throw new Error('Failed to fetch addon details');
      }
      addonsTotal = addonData.reduce((sum, addon) => sum + addon.price, 0);
    }

    const order = {
      ...data,
      food: {
        id: data.foods.id,
        name: data.foods.name,
        price: data.foods.price,
        category_id: data.foods.category_id,
        categories: data.foods.categories,
      },
      totalPrice: (data.foods.price * data.quantity) + addonsTotal,
    };
    delete order.foods;

    res.status(200).json(order);
  } catch (err) {
    logger.error(`Error in updateOrder: ${err.message}`);
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { status, orderId, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = supabase
      .from('orders')
      .select('*, foods(id, name, price, category_id, categories!foods_category_id_fkey(name))', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('order_status', status);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59.999Z');
    }

    // Apply pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Order fetch error:', error.message);
      throw new Error('Failed to fetch orders');
    }

    // Fetch addon details for each order
    const orders = await Promise.all(
      data.map(async (order) => {
        let addonsTotal = 0;
        let addonDetails = [];
        if (order.addons && order.addons.length > 0) {
          const { data: addonData, error: addonError } = await supabase
            .from('additional_options')
            .select('name, price')
            .in('name', order.addons);

          if (addonError) {
            logger.error('Addon fetch error in getOrders:', addonError.message);
          } else {
            addonDetails = addonData;
            addonsTotal = addonData.reduce((sum, addon) => sum + addon.price, 0);
          }
        }

        return {
          id: order.id,
          order_id: order.order_id,
          food: order.foods ? {
            id: order.foods.id,
            name: order.foods.name,
            price: order.foods.price,
            category_id: order.foods.category_id,
            categories: order.foods.categories,
          } : null,
          food_id: order.food_id,
          quantity: order.quantity,
          delivery_location: order.delivery_location,
          phone_number: order.phone_number,
          delivery_time: order.delivery_time,
          payment_mode: order.payment_mode,
          additional_notes: order.additional_notes,
          addons: order.addons,
          addonDetails: addonDetails,
          order_status: order.order_status,
          created_at: order.created_at,
          drink: order.drink,
          payment_status: order.payment_status,
          totalPrice: order.foods ? (order.foods.price * order.quantity) + addonsTotal : 0,
        };
      })
    );

    res.status(200).json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      }
    });
  } catch (err) {
    logger.error(`Error in getOrders: ${err.message}`);
    next(err);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Order delete error:', error.message);
      throw new Error('Failed to delete order');
    }

    res.status(204).send();
  } catch (err) {
    logger.error(`Error in deleteOrder: ${err.message}`);
    next(err);
  }
};

const deleteAllOrders = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', 0); // This will delete all rows since id will never be 0

    if (error) {
      logger.error('Delete all orders error:', error.message);
      throw new Error('Failed to delete all orders');
    }

    logger.info('All orders deleted successfully');
    res.status(200).json({ message: 'All orders deleted successfully' });
  } catch (err) {
    logger.error(`Error in deleteAllOrders: ${err.message}`);
    next(err);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { orderId } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select('*, foods(id, name, price, category_id, categories!foods_category_id_fkey(name))')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      logger.error('Order fetch error:', error?.message);
      throw new Error('Order not found');
    }

    // Fetch addon details for total price calculation
    let addonsTotal = 0;
    let addonDetails = [];
    if (data.addons && data.addons.length > 0) {
      const { data: addonData, error: addonError } = await supabase
        .from('additional_options')
        .select('name, price')
        .in('name', data.addons);

      if (addonError) {
        logger.error('Addon fetch error in trackOrder:', addonError.message);
      } else {
        addonDetails = addonData;
        addonsTotal = addonData.reduce((sum, addon) => sum + addon.price, 0);
      }
    }

    const order = {
      id: data.id,
      order_id: data.order_id,
      food: data.foods ? {
        id: data.foods.id,
        name: data.foods.name,
        price: data.foods.price,
        category_id: data.foods.category_id,
        categories: data.foods.categories,
      } : null,
      food_id: data.food_id,
      quantity: data.quantity,
      delivery_location: data.delivery_location,
      phone_number: data.phone_number,
      delivery_time: data.delivery_time,
      payment_mode: data.payment_mode,
      additional_notes: data.additional_notes,
      addons: data.addons,
      addonDetails: addonDetails,
      order_status: data.order_status,
      created_at: data.created_at,
      drink: data.drink,
      payment_status: data.payment_status,
      totalPrice: data.foods ? (data.foods.price * data.quantity) + addonsTotal : 0,
      foodName: data.foods ? data.foods.name : null,
    };

    res.status(200).json(order);
  } catch (err) {
    logger.error(`Error in trackOrder: ${err.message}`);
    next(err);
  }
};

module.exports = { createOrder, updateOrder, getOrders, deleteOrder, deleteAllOrders, trackOrder };
