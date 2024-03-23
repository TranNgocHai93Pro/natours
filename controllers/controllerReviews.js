const AppErrors = require('../utils/appError');
const Reviews = require('./../model/reviewModel');
const factory = require('./factoryController');

exports.setTourUserId = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.idTour;
  if (!req.body.user) req.body.user = req.user._id;
  const existReview = await Reviews.findOne({
    user: req.body.user,
    tour: req.body.tour
  });
  if (existReview) {
    return next(
      new AppErrors('This User already commented about this tour', 409)
    );
  }
  next();
};
exports.getAllReview = factory.getAll(Reviews);
exports.createReview = factory.createOne(Reviews);
exports.DeleteReview = factory.deleteOne(Reviews);
exports.UpdateReview = factory.updateOne(Reviews);

exports.getReview = async (req, res) => {
  const review = await Reviews.findById(req.params.id);
  if (review) {
    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } else {
    res.status(404).json({
      status: 'Fail',
      message: 'Not Found Review'
    });
  }
};
