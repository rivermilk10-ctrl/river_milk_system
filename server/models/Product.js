const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['milk', 'dairy'],
    required: true
  },
  // Internal key for milk types, null for dairy products
  milkTypeKey: {
    type: String,
    enum: ['full_cream', 'cow', 'buffalo', null],
    default: null
  },
  unit: { type: String, required: true }, // "L", "KG", "Glass"
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  currentStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
