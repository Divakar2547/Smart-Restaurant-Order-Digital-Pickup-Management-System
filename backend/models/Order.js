const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  foodName: { type: String, required: true },
  foodImage: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  pickupCode: { type: String, required: true, unique: true },
  pickupCodeUsed: { type: Boolean, default: false },
  orderedItems: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi'], default: 'cash' },
  orderStatus: { type: String, enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveredAt: Date,
  qrCode: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
