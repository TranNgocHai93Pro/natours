const express = require('express');

const viewsController = require('../controllers/viewsControler');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLogging,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLogging, viewsController.getTour);
router.get('/login', viewsController.loginForm);
router.get(
  '/my-booking',
  authController.isLogging,
  authController.protect,
  viewsController.getBookingTours
);

router.get('/me', authController.isLogging, viewsController.accountUser);

// router.post(
//   '/updateUserData',
//   authController.protect,
//   viewsController.updateUserDate
// );

module.exports = router;
