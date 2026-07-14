const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null }, // optional, for partial payments against a specific sale
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
