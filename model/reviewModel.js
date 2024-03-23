const mongoose = require('mongoose');

const Tours = require('./tourModel');

//review, rating, createAt, -- Prarent reference Tour,Parent Ref User
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    createAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      require: [true, 'Review must belong to Tour'],
      dropDups: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
      require: [true, 'Review must belong to Tour'],
      dropDups: true
    }
  },
  {
    toJSON: { virtuals: true },
    toOject: { virtuals: true },
    timestamps: true
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name  '
  // }).populate({
  //   path: 'user',
  //   select: 'username -_id'
  // });

  // this.populate({
  //   path: 'user',
  //   select: 'name -_id'
  // });

  next();
});

reviewSchema.statics.calAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nReviews: { $sum: 1 },
        avgRatings: { $avg: '$rating' }
      }
    }
  ]);
  console.log('stats', stats);

  // Update averageTour
  if (stats.length > 0) {
    await Tours.findByIdAndUpdate(
      tourId,
      {
        ratingAvertage: stats[0].avgRatings,
        ratingQuatity: stats[0].nReviews
      },
      {
        new: true,
        runValidators: true
      }
    );
  } else {
    await Tours.findByIdAndUpdate(
      tourId,
      {
        ratingAvertage: 4.5,
        ratingQuatity: 0
      },
      {
        new: true,
        runValidators: true
      }
    );
  }

  // console.log('reViewModel-80', updateTour);
};

reviewSchema.pre('save', function() {
  if (this.tour) this.constructor.calAverageRatings(this.tour);
});

// Update and Delete reviews in order to update to tour's property
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) await doc.constructor.calAverageRatings(doc.tour);
});

// Duplicate review, only one user and one review

const Reviews = mongoose.model('Reviews', reviewSchema);
// Nestest Router
// Post/:idTour/123AS/reviews
// Get/:idTour/123AS/reviews
module.exports = Reviews;
