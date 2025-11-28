const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB connected'))
  .catch(err=>console.log(err));

app.use('/customers', routes);

app.listen(3000, ()=>console.log('Customer service running on port 3000'));
