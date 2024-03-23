const multer = require('multer');
const sharp = require('sharp');

const Tours = require('./../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppErrors = require('../utils/appError');
const factory = require('./factoryController');
// Class resuable

exports.aliasTopTours = async (req, res, next) => {
  // Set Header befor Query Document
  req.query.limit = 3;
  req.query.sort = '-price';
  req.query.fields = 'name, duration, price, difficulty';
  next();
};

// exports.GetAllTours = catchAsync(async (req, res) => {
// //  Filter query
// const queryObj = { ...req.query };
// const excluedFields = ['limit', 'sort', 'page', 'fields'];
// excluedFields.forEach(el => delete queryObj[el]);

// // Advanced query
// const queryStr = JSON.stringify(queryObj);
// const updateStr = queryStr.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   match => `$${match}`
// );

// // console.log(updateQueryObj);
// let query = Tours.find(JSON.parse(updateStr));

// // Sort documents
// if (req.query.sort) {
//   // const sortBy = req.query.sort.split(',').join(' ');
//   const sortBy = req.query.sort;
//   query = query.sort(sortBy);
//   console.log(sortBy);
// } else {
//   query = query.sort('-createAt');
// }

// // Limit documents
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
//   console.log(fields);
// } else {
//   query = query.select('-__v');
// }

// // Pagination page

// const page = req.query.page * 1 || 1;
// const valueLimit = req.query.limit * 1 || 100;
// const valueSkip = (page - 1) * valueLimit;
// query = query.skip(valueSkip).limit(valueLimit);

// if (req.query.page) {
//   const numberTour = await Tours.countDocuments();
//   if (valueSkip > numberTour) {
//     // throw new Error('Page not found');
//     return res.status(404).json({
//       status: 'Fail',
//       message: 'Page not Found'
//     });
//   }
// }

// EXCUTED QUERY
//   const features = new ApiFeatures(Tours.find(), req.query)
//     .filter()
//     .sort()
//     .limit();

//   const x = await features.pagination();
//   const tours = await x.query;
//   res.status(201).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tour: tours
//     }
//   });
// });

exports.GetAllTours = factory.getAll(Tours);
exports.CreateTour = factory.createOne(Tours);
exports.GetTour = factory.getOne(Tours, {
  path: 'reviews',
  select: '  -__v'
});
exports.updateTour = factory.updateOne(Tours);
exports.DeleteTour = factory.deleteOne(Tours);

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingAvertage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRatingsAverageDemo: { $avg: '$ratingAvertage' },
        avgPriceDemo: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        firstPrice: { $first: '$price' },
        numTours: { $sum: 1 }
      }
    },
    {
      $addFields: {
        avgRatingsAverage: { $round: ['$avgRatingsAverageDemo', 2] },
        avgPrice: { $round: ['$avgPriceDemo', 2] }
      }
    },
    {
      $project: {
        avgRatingsAverageDemo: 0,
        avgPriceDemo: 0
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $eq: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats
    }
  });
});

exports.getMonthPlan = catchAsync(async (req, res) => {
  const yearSelect = req.params.year * 1;

  const plan = await Tours.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        $expr: {
          $and: [
            {
              $gte: ['$startDates', new Date(`${yearSelect}-01-01T00:00:00Z`)]
            },
            { $lte: ['$startDates', new Date(`${yearSelect}-12-31T23:59:59Z`)] }
          ]
        }
      }
    },
    {
      $addFields: {
        monthTour: { $month: '$startDates' }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        // numTours: { $count: {} },
        nameTours: {
          $push: {
            name: '$name',
            price: '$price',
            ratingAvertage: '$ratingAvertage'
          }
        }
      }
    }
    // {
    //   $sort: { _id: 1 }
    // },
    // {
    //   $limit: 3
    // }
  ]);
  // toán tử $-toán tử, còn tham chiếu tên miền '$field'
  if (plan.length !== 0) {
    res.status(200).json({
      status: 'success',
      result: plan.length,
      data: {
        plan
      }
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Not Found'
    });
  }
});

//'/tour-within/:distance/center/:latlng/unit/ml'
exports.tourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      AppErrors(
        'You have to provide latitude and longtitue about your possible'
      ),
      400
    );
  let radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // 6378.1- bán kinh Trai dat = km, 3963.2-ban kinh td = dặm
  const tour = await Tours.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });

  res.status(200).json({
    status: 'success',
    result: tour.length,
    data: {
      data: tour
    }
  });
});

// Tour distance from point
exports.tourDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppErrors(
        'you must provide to longtitude and latitude in format latlng!',
        400
      )
    );
  }
  const distance = await Tours.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'Distance',
        distanceMultiplier: unit === 'mi' ? 0.00621371 : 0.001
      }
    },
    {
      $project: {
        name: 1,
        Distance: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    unit,
    data: {
      data: distance
    }
  });
});

//Upload imgage Tour
// 2 dang là cập nhật luôn vào DB, hoặc lưu tạm vào memories dể chỉnh sửa bằng sharp
// const multerStorage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'public/img/tours');
//   },
//   filename: function(req, file, cb) {
//     const ext = file.mimetype.split[1];
//     cb(null, `tour-${req.params.idTour}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors('This is not a Image!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadImgTour = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeImgTour = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // 1. ImageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1300)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // 2. images
  req.body.images = [];
  // await Promise.all(
  //   req.files.images.map(async (file, i) => {
  //     const filename = `tour-${req.params.id}-${Date.now()} - ${i + 1}.jpeg`;
  //     await sharp(file.buffer)
  //       .resize(2000, 1333)
  //       .toFormat('jpeg')
  //       .jpeg({ quality: 90 })
  //       .toFile(`public/img/tours/${filename}`);
  //     req.body.images.push(filename);
  //   })
  // );
  const { images } = req.files;
  for (const [i, file] of images.entries()) {
    const filename = `tour-${req.params.id}-${Date.now()} - ${i + 1}.jpeg`;
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);
    req.body.images.push(filename);
  }

  next();
});
