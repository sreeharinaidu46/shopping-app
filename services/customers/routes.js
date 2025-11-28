const express = require('express');
const Customer = require('./model');
const { Kafka } = require('kafkajs');

const router = express.Router();

// Kafka producer + consumer
const kafka = new Kafka({ clientId: 'customers', brokers: [process.env.KAFKA_BROKER] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'customers-group' });

producer.connect();
consumer.connect();

// Subscribe to ORDER_CREATED events
consumer.subscribe({ topic: 'ORDER_CREATED', fromBeginning: true });
consumer.run({
  eachMessage: async ({ topic, message }) => {
    const order = JSON.parse(message.value.toString());
    if(order.customerId){
      const customer = await Customer.findById(order.customerId);
      if(customer){
        customer.totalOrders += 1;
        await customer.save();
        console.log('Customer updated from ORDER_CREATED event');
      }
    }
  }
});

// Routes
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  const customer = new Customer({ name, email, password });
  await customer.save();

  // Emit event
  await producer.send({ topic: 'CUSTOMER_CREATED', messages: [{ value: JSON.stringify(customer) }] });
  res.status(201).send(customer);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  res.send(customer);
});

module.exports = router;
