const express = require('express');

const routerBooking = express.Router();
const controllerBooking = require('../controllers/bookingController');

const authControllers = require('../controllers/authController');

routerBooking.use(authControllers.protect);
routerBooking
  .route('/checkout-session/:tourId')
  .get(authControllers.protect, controllerBooking.getCheckoutSession);

routerBooking.use(authControllers.restrictTo('admin', 'leader'));

routerBooking
  .route('/')
  .get(controllerBooking.getAllBookings)
  .post(controllerBooking.createBooking);
routerBooking
  .route('/:id')
  .get(controllerBooking.getBooking)
  .patch(controllerBooking.updateBooking)
  .delete(controllerBooking.deleteBooking);

module.exports = routerBooking;
