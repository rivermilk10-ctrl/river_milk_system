const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for pickup
  date: { type: Date, required: true },
  quantityLitres: { type: Number, required: true },
  milkType: {
    type: String,
    enum: ['full_cream', 'cow', 'buffalo'],
    default: 'cow'
  }, // switchable per delivery
  pricePerLitre: { type: Number, default: null }, // snapshot at time of delivery
  status: { type: String, enum: ['pending', 'delivered', 'collected'], default: 'pending' },
  markedAt: { type: Date },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);

