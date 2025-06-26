
const { hubtelClient, HUBTEL_SENDER_ID } = require('../config/hubtel');
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const getAdminPhoneNumbers = async () => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      return ['+233543482189', '+233509106283']; // Fallback to default numbers
    }

    const { data, error } = await supabase
      .from('settings')
      .select('admin_phone_numbers')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !data || !data.admin_phone_numbers) {
      logger.warn('Failed to fetch admin phone numbers, using defaults');
      return ['+233543482189', '+233509106283']; // Fallback to default numbers
    }

    // Ensure we have an array and filter out empty strings
    const phoneNumbers = Array.isArray(data.admin_phone_numbers) 
      ? data.admin_phone_numbers.filter(num => num && num.trim() !== '')
      : ['+233543482189', '+233509106283'];

    return phoneNumbers.length > 0 ? phoneNumbers : ['+233543482189', '+233509106283'];
  } catch (err) {
    logger.error('Error fetching admin phone numbers:', err);
    return ['+233543482189', '+233509106283']; // Fallback to default numbers
  }
};

const sendSMS = async ({ from, to, content, skipAdminNotification = false }) => {
  try {
    // Ensure phone number is in the correct format
    let formattedPhone = to;
    
    // Remove any spaces, dashes, or parentheses
    formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
    
    // Handle different phone number formats
    if (formattedPhone.startsWith('0')) {
      // Convert 0XXXXXXXXX to +233XXXXXXXXX
      formattedPhone = '+233' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('233')) {
      // Convert 233XXXXXXXXX to +233XXXXXXXXX
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+233')) {
      // Assume it's a local number without country code
      formattedPhone = '+233' + formattedPhone;
    }

    // Validate the phone number format
    if (!/^\+233\d{9}$/.test(formattedPhone)) {
      throw new Error('Invalid phone number format. Expected format: +233XXXXXXXXX');
    }

    console.log(`Sending SMS to ${formattedPhone}: ${content}`);

    const smsData = {
      from: from || HUBTEL_SENDER_ID,
      to: formattedPhone,
      content: content,
    };

    console.log('SMS payload:', JSON.stringify(smsData, null, 2));

    const response = await hubtelClient.post('', smsData);

    console.log('SMS sent successfully:', response.data);
    logger.info('SMS sent successfully:', response.data);

    // Only send to admin numbers if not skipped (for payment confirmations only)
    if (!skipAdminNotification) {
      const adminNumbers = await getAdminPhoneNumbers();
      console.log('Admin numbers retrieved:', adminNumbers);
      
      for (const adminNumber of adminNumbers) {
        try {
          // Format admin number properly
          let formattedAdminPhone = adminNumber;
          
          // Remove any spaces, dashes, or parentheses
          formattedAdminPhone = formattedAdminPhone.replace(/[\s\-\(\)]/g, '');
          
          // Handle different phone number formats
          if (formattedAdminPhone.startsWith('0')) {
            formattedAdminPhone = '+233' + formattedAdminPhone.substring(1);
          } else if (formattedAdminPhone.startsWith('233')) {
            formattedAdminPhone = '+' + formattedAdminPhone;
          } else if (!formattedAdminPhone.startsWith('+233')) {
            formattedAdminPhone = '+233' + formattedAdminPhone;
          }

          // Validate admin phone number format
          if (!/^\+233\d{9}$/.test(formattedAdminPhone)) {
            console.warn(`Invalid admin phone number format: ${adminNumber}`);
            continue;
          }

          const adminSmsData = {
            from: from || HUBTEL_SENDER_ID,
            to: formattedAdminPhone,
            content: `Admin Notification: ${content}`,
          };

          const adminResponse = await hubtelClient.post('', adminSmsData);
          console.log(`Admin SMS sent to ${formattedAdminPhone}:`, adminResponse.data);
          logger.info(`Admin SMS sent to ${formattedAdminPhone}:`, adminResponse.data);
        } catch (adminError) {
          console.error(`Failed to send admin SMS to ${adminNumber}:`, adminError.message);
          logger.error(`Failed to send admin SMS to ${adminNumber}:`, adminError);
          // Continue even if admin SMS fails
        }
      }
    } else {
      console.log('Skipping admin notifications as requested');
    }

    return response.data;
  } catch (err) {
    console.error('Failed to send SMS:', err.message);
    console.error('SMS Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      statusText: err.response?.statusText
    });
    logger.error('SMS sending failed:', err);
    throw new Error('Failed to send SMS: ' + err.message);
  }
};

module.exports = { sendSMS };
