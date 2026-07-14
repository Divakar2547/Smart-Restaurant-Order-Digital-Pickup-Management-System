let client = null;

const initTwilio = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token && sid.startsWith('AC')) {
    try {
      const twilio = require('twilio');
      client = twilio(sid, token);
    } catch (e) {
      console.warn('Twilio init failed:', e.message);
    }
  }
};

initTwilio();

const sendSMS = async (to, message) => {
  if (!client) {
    console.log(`[SMS Mock] To: ${to} | Message: ${message}`);
    return { success: true, mock: true };
  }
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
