const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require('cors')

mongoose.set('useFindAndModify', false);

const meals = require('./routes/meals')
const orders = require('./routes/orders')
const users = require('./routes/users')
const auth = require('./routes/auth')

const app = express()

app.use(bodyParser.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/api/meals', meals)
app.use('/api/orders', orders)
app.use('/api/auth', auth)
app.use('/api/users', users)

module.exports = app
