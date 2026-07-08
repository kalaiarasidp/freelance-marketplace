const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  gigId:              { type: mongoose.Schema.Types.ObjectId, ref: 'Gig',  required: true },
  clientId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price:              { type: Number, required: true },
  platformFeePercent: { type: Number, default: 10 },
  status: {
    type:    String,
    enum:    ['pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'],
    default: 'pending',
  },
  requirements: { type: String },
  deliveredAt:  { type: Date },
  completedAt:  { type: Date },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
