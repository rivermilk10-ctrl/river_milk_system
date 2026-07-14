const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerNumber: { type: String, unique: true, sparse: true }, // e.g., RM001
  name: { type: String, required: true },
  primaryPhone: { type: String },
  secondaryPhone: { type: String },
  // Legacy field kept for backward compatibility
  phone: { type: String },
  address: { type: String },
  type: { type: String, enum: ['delivery', 'pickup'], required: true },
  milkType: {
    type: String,
    enum: ['full_cream', 'cow', 'buffalo'],
    default: 'cow'
  },
  assignedDistributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  defaultQuantityLitres: { type: Number, required: true, default: 1 },
  notes: { type: String },
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  outstandingBalance: { type: Number, default: 0 }, // cumulative credit balance
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
