const supabase = require('../config/supabase');

const getAnalytics = async (req, res, next) => {
  try {
    // Fetch all orders with food details
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, foods(price)')
      .order('created_at', { ascending: false });

    if (ordersError) throw new Error('Failed to fetch orders for analytics');

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.foods.price * order.quantity, 0);
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {});

    // Orders by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const ordersByDay = orders
      .filter((order) => order.created_at >= thirtyDaysAgo)
      .reduce((acc, order) => {
        const date = order.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

    const analytics = {
      totalOrders,
      totalRevenue,
      statusBreakdown,
      ordersByDay,
    };

    res.status(200).json(analytics);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics };