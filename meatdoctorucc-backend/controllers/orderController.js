const { supabase } = require('../config/supabase');
const { sendSMS } = require('../utils/sendSMS');
const { v4: uuidv4 } = require('uuid');

const createOrder = async (req, res, next) => {
  try {
    if (!supabase) {
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
      drink,
    } = req.body;

    const { data: food, error: foodError } = await supabase
      .from('foods')
      .select('name, price')
      .eq('id', foodId)
      .single();

    if (foodError || !food) throw new Error('Food item not found');

    const totalPrice = food.price * quantity;
    const orderId = `MD${Math.floor(100000000 + Math.random() * 900000000)}`;

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
          drink,
          order_id: orderId,
        },
      ])
      .select()
      .single();

    if (orderError) throw new Error('Failed to create order');

    const deliveryDate = new Date(deliveryTime).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const smsContent = `Order Confirmed!\nYour order has been successfully placed.\n\nOrder ID: ${orderId}\nSave this ID to track your order status.\n\nOrder Details:\nFood: ${food.name}\nQuantity: ${quantity}\n${drink ? `Drink: ${drink}\n` : ''}Total Price: GHS ${totalPrice}\nPayment: ${paymentMode}\nDelivery Location: ${deliveryLocation}\nDelivery Time: ${deliveryDate}\nStatus: Pending`;

    await sendSMS({
      to: phoneNumber,
      content: smsContent,
    });

    res.status(201).json({ ...order, totalPrice, foodName: food.name });
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) throw new Error('orderStatus is required');

    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('order_status, phone_number, order_id')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) throw new Error('Order not found');

    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, foods(name)')
      .single();

    if (error || !data) throw new Error('Failed to update order');

    if (currentOrder.order_status !== orderStatus) {
      const smsContent = `Order Update!\nYour order ${currentOrder.order_id} status has been updated to ${orderStatus}.`;
      await sendSMS({
        to: currentOrder.phone_number,
        content: smsContent,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { status, orderId } = req.query;
    let query = supabase
      .from('orders')
      .select('*, foods(name, price)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('order_status', status);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query;

    if (error) throw new Error('Failed to fetch orders');

    const orders = data.map((order) => ({
      ...order,
      totalPrice: order.foods.price * order.quantity,
    }));

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete order');

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { orderId } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select('*, foods(name, price)')
      .eq('order_id', orderId)
      .single();

    if (error || !data) throw new Error('Order not found');

    const order = {
      ...order,
      totalPrice: data.foods.price * data.quantity,
      foodName: data.foods.name,
    };

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, updateOrder, getOrders, deleteOrder, trackOrder };