// services/products/model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: String,
  name: String,
  quantity: Number
});

module.exports = mongoose.model('Product', productSchema);
