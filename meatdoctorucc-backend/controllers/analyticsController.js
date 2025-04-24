const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const getAnalytics = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    // Get date range from query parameters (optional)
    const { startDate, endDate } = req.query;
    let query = supabase
      .from('orders')
      .select(`
        *,
        foods (
          name,
          price,
          category_id,
          categories!foods_category_id_fkey (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply date range filter if provided
    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      logger.error(`Error fetching orders for analytics: ${ordersError.message}`);
      throw new Error('Failed to fetch orders for analytics');
    }

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.foods?.price || 0) * order.quantity, 0);

    // Status breakdown
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {});

    // Popular foods
    const foodCounts = orders.reduce((acc, order) => {
      const foodName = order.foods?.name || 'Unknown';
      acc[foodName] = (acc[foodName] || 0) + order.quantity;
      return acc;
    }, {});
    const popularFoods = Object.entries(foodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Popular categories
    const categoryCounts = orders.reduce((acc, order) => {
      const categoryName = order.foods?.categories?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + order.quantity;
      return acc;
    }, {});
    const popularCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Most buying locations
    const locationCounts = orders.reduce((acc, order) => {
      const location = order.delivery_location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Payment mode breakdown
    const paymentModeCounts = orders.reduce((acc, order) => {
      const paymentMode = order.payment_mode || 'Unknown';
      acc[paymentMode] = (acc[paymentMode] || 0) + 1;
      return acc;
    }, {});
    const paymentModes = Object.entries(paymentModeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Drink preferences
    const drinkCounts = orders.reduce((acc, order) => {
      const drink = order.drink || 'None';
      acc[drink] = (acc[drink] || 0) + 1;
      return acc;
    }, {});
    const drinkPreferences = Object.entries(drinkCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Orders by day for histogram
    const ordersByDay = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const ordersByDayArray = Object.entries(ordersByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Prepare detailed data for insights
    const detailedFoodData = Object.entries(foodCounts).map(([name, count]) => {
      const foodOrders = orders.filter((order) => order.foods?.name === name);
      return {
        name,
        count,
        totalRevenue: foodOrders.reduce((sum, order) => sum + (order.foods?.price || 0) * order.quantity, 0),
        orders: foodOrders.map((order) => ({
          order_id: order.order_id,
          quantity: order.quantity,
          delivery_location: order.delivery_location,
          order_status: order.order_status,
          created_at: order.created_at,
        })),
      };
    });

    const detailedCategoryData = Object.entries(categoryCounts).map(([name, count]) => {
      const categoryOrders = orders.filter((order) => (order.foods?.categories?.name || 'Uncategorized') === name);
      return {
        name,
        count,
        totalRevenue: categoryOrders.reduce((sum, order) => sum + (order.foods?.price || 0) * order.quantity, 0),
        orders: categoryOrders.map((order) => ({
          order_id: order.order_id,
          quantity: order.quantity,
          delivery_location: order.delivery_location,
          order_status: order.order_status,
          created_at: order.created_at,
        })),
      };
    });

    const detailedLocationData = Object.entries(locationCounts).map(([name, count]) => {
      const locationOrders = orders.filter((order) => (order.delivery_location || 'Unknown') === name);
      return {
        name,
        count,
        totalRevenue: locationOrders.reduce((sum, order) => sum + (order.foods?.price || 0) * order.quantity, 0),
        orders: locationOrders.map((order) => ({
          order_id: order.order_id,
          quantity: order.quantity,
          food_name: order.foods?.name || 'Unknown',
          order_status: order.order_status,
          created_at: order.created_at,
        })),
      };
    });

    const analytics = {
      totalBookings: totalOrders,
      totalRevenue,
      statusCounts,
      popularFoods,
      popularCategories,
      topLocations,
      paymentModes,
      drinkPreferences,
      ordersByDay: ordersByDayArray,
      detailedFoodData,
      detailedCategoryData,
      detailedLocationData,
    };

    res.status(200).json(analytics);
  } catch (err) {
    logger.error(`Error in getAnalytics: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAnalytics };