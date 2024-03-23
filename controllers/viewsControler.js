const catchAsync = require('../utils/catchAsync');
const Tours = require('../model/tourModel');
const Users = require('../model/userModel');
const AppErrors = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tours.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1. get Tour and polute User and Review
  //2. Build template
  //3. Render for client
  const tour = await Tours.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    populate: {
      path: 'user',
      field: 'review rating user'
    }
  });

  if (!tour) {
    return next(new AppErrors(`This tour: ${req.params.slug} not exist`, 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.loginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login'
  });
});

exports.accountUser = catchAsync(async (req, res) => {
  res.status(200).render('account', {
    title: 'This is account User'
  });
});
// Update User - Sử dụng action, method= "POST" trong form
exports.updateUserDate = catchAsync(async (req, res) => {
  const updateUser = await Users.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      name: req.body.name
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', { user: updateUser });
});
