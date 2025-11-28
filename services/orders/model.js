const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: String,
  customerId: String,
  products: [{ productId: String, quantity: Number }]
});

module.exports = mongoose.model('Order', orderSchema);
