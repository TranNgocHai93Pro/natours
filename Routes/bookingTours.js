const express = require('express');

const routerBooking = express.Router();
const controllerBooking = require('../controllers/bookingController');

const authControllers = require('../controllers/authController');

routerBooking
  .route('/checkout-session/:tourId')
  .get(authControllers.protect, controllerBooking.getCheckoutSession);

module.exports = routerBooking;
