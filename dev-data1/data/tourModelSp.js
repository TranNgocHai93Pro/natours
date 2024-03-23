const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

// 2. tạo đường dẫn
const uri = process.env.DATABASE_CLOUD.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// 3. Kêt nối database
mongoose.connect(uri).then(() => console.log('DB connected successful!'));

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
    min: 1,
    max: 5
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a size of group']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a given difficulty']
  },
  ratingsAverage: {
    type: Number,
    default: 0
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a given Number']
  },
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: 'No content...'
  },
  imageCover: {
    type: String // File ảnh lưu trữ trong hệ thống, cơ sỏ dữ liệu lư trữ tên file ảnh
  },
  createAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDate: [Date],
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    description: String,
    address: String,
    coodinates: [Number]
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      description: String,
      coodinates: [Number],
      day: Number
    }
  ]
});

// 5.Tạo 1 model(giống như tạo 1 document) từ Schema đã khai báo
const Tour = mongoose.model('Tours', tourSchema);

module.exports = Tour;
