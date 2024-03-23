const mongoose = require('mongoose');
// const User = require('./userModel');
// const Reviews = require('./reviewModel');
// const validator = require('validator');

// 4. Tạo Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
      // validate: [validator.isAlpha, 'Name only contain of characters']
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users'
      }
    ],
    price: {
      type: Number,
      required: [true, 'You must have a price!']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price {VALUE} must below regular price'
      }
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      min: 1
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a size of group']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a given difficulty'],
      enum: ['difficult', 'easy', 'medium']
    },
    ratingAvertage: {
      type: Number,
      default: 4.5,
      set: value => Math.round(value * 10) / 10
    },
    ratingQuatity: {
      type: Number,
      default: 0
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    summary: {
      type: String,
      trim: true // Remove all spaces in the beginning and the ending of the string
      // required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true,
      default: 'No content...'
    },
    imageCover: {
      type: String, // File ảnh lưu trữ trong hệ thống, cơ sỏ dữ liệu lư trữ tên file ảnh
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    slug: String,
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        required: true
      },
      description: String,
      address: String,
      name: String
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          require: true
        },
        coordinates: {
          type: [Number],
          require: true
        },
        day: Number,
        description: String
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// 6. Sử dụng Virtual properties: thuộc tính ảo, khi ta không muốn lưu trữ giá trị
// dùng hàm setter() và getter()
tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});
// 5.Tạo 1 model(giống như tạo 1 document) từ Schema đã khai báo

//7. Sử dụng Middleware documents, tức là trước khi xảy ra các sự kiện như :
// save: save() or create(), remove, update, insert, findAndUpdate
// sử dụng method: pre('event', callback) and post

// tourSchema.pre('save', function(next) {
//   console.log('Will save document');
//   next();
// });

// tourSchema.pre('save', async function(next) {
//   const guidePromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   console.log(this.guides);

//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -changePasswordAt'
  });

  next();
});
tourSchema.pre('save', function(next) {
  if (!this.slug) this.slug = this.name.replace(/\s+/g, '-').toLowerCase();
  next();
});

// Middleware query: find(), findAndUpdate() ...
tourSchema.pre(`${/^find/}`, function(next) {
  this.find({ secretTour: { $eq: true } });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Time query tour: ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// Nhung findAndModify, findAndUpdate, findAndDelte
// Middleware Aggregation:
// tourSchema.pre('aggregate', function(next) {
//   console.log(this.pipeline());
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

tourSchema.virtual('reviews', {
  ref: 'Reviews',
  localField: '_id',
  foreignField: 'tour'
});

// tourSchema.index({ price: 1, ratingAvertage: 1 });
// tourSchema.index({ price: 1, ratingsAverage: 1 });

tourSchema.index({ startLocation: '2dsphere' }, { unique: true });

const Tours = mongoose.model('Tours', tourSchema);

module.exports = Tours;
