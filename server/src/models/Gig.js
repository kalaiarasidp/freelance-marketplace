const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  freelancerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  category:      { type: String, required: true },
  price:         { type: Number, required: true },
  deliveryTime:  { type: Number },
  images:        [{ type: String }],
  tags:          [{ type: String }],
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Gig', gigSchema);
