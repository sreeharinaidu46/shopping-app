const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  totalOrders: { type: Number, default: 0 }
});

module.exports = mongoose.model('Customer', customerSchema);
