const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String }, // required for delivery
  type: { type: String, enum: ['delivery', 'pickup'], required: true },
  assignedDistributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  defaultQuantityLitres: { type: Number, required: true, default: 1 },
  notes: { type: String },
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
