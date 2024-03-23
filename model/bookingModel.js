const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tours',
    require: [true, 'The Booking must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    require: [true, 'The Booking must belong to a user']
  },
  createAt: {
    type: Date,
    default: Date.now()
  },
  price: {
    type: Number,
    require: [true, 'The Booking must belong to a price']
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function() {
  this.populate({
    path: 'tour',
    select: 'name'
  }).populate('user');
});

const Bookings = mongoose.model('Bookings', bookingSchema);
module.exports = Bookings;
