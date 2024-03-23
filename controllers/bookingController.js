// const stripe = require('stripe')(process.env.STRIPE_KEY_SECRET);
const Stripe = require('stripe');

const Tours = require('../model/tourModel');
const BookingTours = require('../model/bookingModel');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tours.findById(req.params.tourId);

  // 2) Create checkout session
  const stripe = await Stripe(process.env.STRIPE_KEY_SECRET);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          },
          unit_amount: tour.price * 100 // Đây là giá tiền tính bằng cent
        },
        quantity: 1
      }
    ],
    mode: 'payment'
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  // This is only TEMPORERY, because anyone can consider payment withour paying
  if (!tour && !user && !price) return next();
  await BookingTours.create({ tour, user, price });
  // Thay vì next() chuyền đên mid tiếp với đường dẫn chứa tham số
  //     ta điều hướng nó về URL gốc mà không có tham số truy vấn
  res.redirect(req.originalUrl.split('?')[0]);
});
