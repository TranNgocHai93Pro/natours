const multer = require('multer');
const sharp = require('sharp');
// const { cloudinary } = require('../utils/uploadCloudary');

const Users = require('../model/userModel');
const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

// const multerStorage = multer.diskStorage({
//   destination: (rep, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage(); // Lưu vảo bộ nhớ đệm

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors('Not an image! Please only image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.fieldname = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.fieldname}`);
  next();
});

// Filter data to update user
const filterAllowed = (obj, ...allowedFilter) => {
  const resultFiter = {};
  Object.keys(obj).forEach(el => {
    if (allowedFilter.includes(el)) resultFiter[el] = obj[el];
  });
  return resultFiter;
};

exports.getAllUser = factory.getAll(Users);
exports.createUser = factory.createOne(Users);
exports.getUser = factory.getOne(Users);
exports.deleteUser = factory.deleteOne(Users);
exports.updateUser = catchAsync(async (req, res, next) => {
  // Update user from Admin
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // 1. Don't allow change the password with this route.
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm)
    return next(
      new AppErrors(
        'This Route dont support the changing your password. Please to redirect to Url:/updateMyPassword'
      ),
      401
    );
  // 2. Update data user with dataAllowed.

  const resultFilter = filterAllowed(req.body, 'name', 'email', 'photo'); // Update Image User

  // const result = await cloudinary.uploader.upload(
  //   `public/img/users/${req.file.fieldname}`,
  //   {
  //     upload_preset: 'user-photo'
  //   }
  // );
  // const result = await cloudinary.uploader.upload(req.body.photo, {
  //   upload_preset: 'user-photo'
  // });

  // if (req.file) resultFilter.photo = result.secure_url; // Save path Image to DB
  const newUser = await Users.findByIdAndUpdate(req.user.id, resultFilter, {
    new: true,
    runValidators: true
  });
  await newUser.save();
  // 3. Send response to client
  res.status(200).json({
    status: 'success',
    message: 'Update data userCurrent is successful.',
    newUser
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await Users.findByIdAndUpdate(req.user.id, { active: false });

  console.log('Delete UserCurrent successfull!', user);
  res.status(204).json({
    status: 'Delete success'
  });
});
