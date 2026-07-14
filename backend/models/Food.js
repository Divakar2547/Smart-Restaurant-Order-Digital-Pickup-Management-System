const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  foodName: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
