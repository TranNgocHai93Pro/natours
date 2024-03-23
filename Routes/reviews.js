const express = require('express');
const {
  getAllReview,
  createReview,
  getReview,
  DeleteReview,
  setTourUserId,
  UpdateReview
} = require('./../controllers/controllerReviews');

const { protect, restrictTo } = require('./../controllers/authController');

const routerReviews = express.Router({ mergeParams: true });

routerReviews
  .route('/')
  .get(getAllReview)
  .post(protect, restrictTo('user'), setTourUserId, createReview);

routerReviews
  .route('/:id')
  .get(getReview)
  .delete(protect, restrictTo('user', 'admin'), DeleteReview)
  .patch(protect, restrictTo('user', 'admin'), UpdateReview);

module.exports = routerReviews;
