const express = require('express');

const routerTours = express.Router();
const controllerTours = require('../controllers/controllerTours');
// const controllerReviews = require('../controllers/controllerReviews');
const routerReviews = require('./reviews');
const authControllers = require('../controllers/authController');

// Tạo middleware checkBody
// Nếu body gửi lên mà không có name và price thì trả về bad request(400 )
// Nếu có thì xử lý tạo

routerTours.route('/getStatTour').get(controllerTours.getTourStats);
routerTours.route('/monthPlan/:year').get(controllerTours.getMonthPlan);

routerTours
  .route('/')
  .get(controllerTours.GetAllTours)
  .post(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    controllerTours.CreateTour
  );

routerTours.use('/:idTour/reviews', routerReviews);

routerTours
  .route('/:id')
  .get(authControllers.protect, controllerTours.GetTour)
  .patch(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    controllerTours.uploadImgTour,
    controllerTours.resizeImgTour,
    controllerTours.updateTour
  )
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    controllerTours.DeleteTour
  );

// /tour-within/:distance/center/:latlng/unit/:unit
// /tour-within/:200/center/:45,-50/unit/mi

routerTours
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(controllerTours.tourWithin);

// /distance/:latlng/unit/:unit

routerTours
  .route('/distance/:latlng/unit/:unit')
  .get(controllerTours.tourDistance);
module.exports = routerTours;
