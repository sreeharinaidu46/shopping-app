const express = require('express');
const Order = require('./model');
const { Kafka } = require('kafkajs');

const router = express.Router();
const kafka = new Kafka({ clientId: 'orders', brokers: [process.env.KAFKA_BROKER] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'orders-group' });

producer.connect();
consumer.connect();

// Optionally subscribe to PRODUCT_CREATED, CUSTOMER_CREATED
consumer.subscribe({ topic: 'PRODUCT_CREATED', fromBeginning: true });
consumer.run({ eachMessage: async ({ message }) => { console.log('Order service got product event'); } });

// Routes
router.post('/', async (req, res) => {
  const { orderId, customerId, products } = req.body;
  const order = new Order({ orderId, customerId, products });
  await order.save();

  // Emit ORDER_CREATED event
  await producer.send({ topic: 'ORDER_CREATED', messages: [{ value: JSON.stringify(order) }] });
  res.status(201).send(order);
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.send(order);
});

module.exports = router;
