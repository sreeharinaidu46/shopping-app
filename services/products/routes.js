// services/products/routes.js
const express = require('express');
const Product = require('./model');
const { Kafka } = require('kafkajs');

const router = express.Router();

// Kafka setup
const kafka = new Kafka({ clientId: 'products', brokers: [process.env.KAFKA_BROKER] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'products-group' });

producer.connect();
consumer.connect();

// Subscribe to ORDER_CREATED events
consumer.subscribe({ topic: 'ORDER_CREATED', fromBeginning: true });
consumer.run({
  eachMessage: async ({ message }) => {
    const order = JSON.parse(message.value.toString());
    if (order.products && order.products.length) {
      for (const item of order.products) {
        const product = await Product.findOne({ productId: item.productId });
        if (product) {
          product.quantity -= item.quantity; // decrement quantity
          await product.save();
          console.log(`Product ${product.name} updated, new quantity: ${product.quantity}`);
        }
      }
    }
  }
});

// Routes

// Create product
router.post('/', async (req, res) => {
  const { productId, name, quantity } = req.body;
  const product = new Product({ productId, name, quantity });
  await product.save();

  // Emit PRODUCT_CREATED event
  await producer.send({ topic: 'PRODUCT_CREATED', messages: [{ value: JSON.stringify(product) }] });
  res.status(201).send(product);
});

// Get product by id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.send(product);
});

module.exports = router;
