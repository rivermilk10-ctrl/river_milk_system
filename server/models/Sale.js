const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true }, // snapshot at time of sale
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  pricePerUnit: { type: Number, required: true }, // snapshot at time of sale
  subtotal: { type: Number, required: true }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: Date, required: true, default: Date.now },
  items: [saleItemSchema],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true, default: 0 },
  balanceDue: { type: Number, required: true, default: 0 },
  paymentMode: {
    type: String,
    enum: ['cash', 'credit', 'partial'],
    required: true,
    default: 'cash'
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
