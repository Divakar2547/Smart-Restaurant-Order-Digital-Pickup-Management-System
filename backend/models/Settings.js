const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Smart Restaurant' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  gstRate: { type: Number, default: 5 },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  logo: { type: String, default: '' },
  openTime: { type: String, default: '09:00' },
  closeTime: { type: String, default: '22:00' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
