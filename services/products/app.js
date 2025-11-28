const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Products MongoDB connected'))
  .catch(err => console.log(err));

app.use('/products', routes);

app.listen(3001, () => console.log('Products service running on port 3001'));
