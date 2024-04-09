const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const Users = require('../model/userModel');
const BookingTous = require('../model/bookingModel');
const catchAsync = require('../utils/catchAsync');
// const sendEmailClient = require('../utils/sendEmail');
const AppErrors = require('../utils/appError');
const Email = require('../utils/sendEmail');

// SIGN TOKEN
const signToken = function(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
// CREATE TOKEN FOR RES
const createTokenRes = function(user, statusCode, req, res) {
  const token = signToken(user._id);

  // Set cookies for res, attacked with jwt
  const optionCookies = {
    //secure: true, // Dữ liệu được mã hoá khi dùng https, nên chỉ được thực thi trong môi trường product
    httpOnly: true, // Không cho phép truy cập vào cookies thông qua JS mà phải là http
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  };
  if (process.env.NODE_ENV === 'production') optionCookies.secure = true;

  // Remove password to res
  user.password = undefined;
  res.cookie('jwt', token, optionCookies);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// CREATE USER
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await Users.create(req.body);
  let url = `${req.protocol}://${req.get('host')}/me`;
  // SendEmail
  await new Email(newUser, url).sendWelcome();
  // Create Token
  createTokenRes(newUser, 201, req, res);
});

// LOGIN USER
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppErrors('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await Users.findOne({ email }).select('+password');
  // sự khác nhau nếu dùng await trong này
  if (!user) {
    return next(new AppErrors('Incorrect email!', 401));
  }
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppErrors('Incorrect password', 401));
  }
  // let url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(user, url).sendWelcome();
  //3. Everthing is ok, send data to Client.
  createTokenRes(user, 200, req, res);
});

//CHECK LOGIN
exports.isLogging = async (req, res, next) => {
  if (req.cookies.jwt && req.cookies.jwt !== 'logout') {
    try {
      //1. Verfication token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //1. Check User Exsit
      const freshUser = await Users.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      //4. Change password after the token was issued
      const checkTokenExp = Date.now() / 1000 - decoded.exp;
      if (checkTokenExp > 0) return next();
      const checkPasswordChange = freshUser.changePasswordAfter(decoded.iat);
      if (checkPasswordChange) {
        return next();
      }
      //5. Booking of user
      const bookingTours = await BookingTous.find({ user: freshUser.id });
      const tourIds = bookingTours.map(el => el.tour._id);
      // Grant user next
      res.locals.user = freshUser;
      res.locals.tourIds = tourIds;
      return next();
    } catch (err) {
      console.log('loggin-107', err);
      return next();
    }
  }
  next();
};

// LOGOUT USER
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logout', {
    httpOnly: true, // Không cho phép truy cập vào cookies thông qua JS mà phải là http
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  });
  res.status(200).json({
    status: 'success'
  });
});

//  PROTECT ROUTE
exports.protect = catchAsync(async (req, res, next) => {
  //1. Getting token from the req
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  }
  if (!token || token === 'logout') {
    return next(
      new AppErrors('You is not login! Please to login to access.', 401)
    );
  }

  //2. Verfication token
  // console.log('token---', token);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. Check User Exsit
  const freshUser = await Users.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppErrors('The token is belonging to the user not exsit !', 401)
    );
  }

  //4. Change password after the token was issued
  const checkTokenExp = Date.now() / 1000 - decoded.exp;
  if (checkTokenExp > 0)
    return next(
      new AppErrors('This Token was expired. Please to login again.')
    );
  const checkPasswordChange = freshUser.changePasswordAfter(decoded.iat);
  if (checkPasswordChange) {
    return next(
      new AppErrors(
        'The password of this user was changed ! Please to login again.',
        401
      )
    );
  }
  // Grant user next
  req.user = freshUser;

  next();
});

// RESTRICTO USER
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log(roles);
    //roles['admin', 'lead-guide'] -- kiêm tra xem role có nằm trong mảng hạn chế kh
    // console.log(req.user);
    if (!roles.includes(req.user.role)) {
      next(new AppErrors('You dont permistion to resolve this action.'));
    }
    next();
  };
};

// FORGET PASSWORD
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. Get email from User
  const { email } = req.body;
  if (!email)
    return next(
      new AppErrors('You must provide your email to reset password.', 400)
    );
  const user = await Users.findOne({ email });
  if (!user) {
    return next(new AppErrors('User of this email is not found!', 404));
  }
  // 2. Generator reset token --> resetToken, resetPasswordToken, resetPasswordExp
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforSave: false });
  console.log('resetToken--', resetToken);

  // 3. Send to email's user
  // Có token --> gửi token về cho client thông qua email- trapMail: để giả emai vì gửi 500 email 1 lúc bị coi là spam
  // Tạo file cấu hình lưu thông tin name, password, host trong file env.
  // Toạ file sendEmail là 1 function để gửi mail trong file 'UTILS'
  // Tạo URL là đường dẫn để gửi cho người dùng kich và
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  // const message = `If you forgot your pasword. Please to press the below URL: ${resetURL} \n to get a new password
  // \n If you don't forget your password, Ignore this email.`;
  // console.log(user.email);
  try {
    // await sendEmailClient({
    //   email: user.email,
    //   subject: 'You reset your password (valid Token for 10m)',
    //   message
    // });
    await new Email(user, resetURL).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message:
        'A Token was sent to your email. Please to check again your email.'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforSave: false });
    // console.log('error sent token --', error);
    return next(
      new AppErrors(
        'The sending to your email was occupt the error. Try to reset late!',
        500
      )
    );
  }
});

// RESET PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get Token from url and crypto then finding user
  const { resettoken } = req.params;
  // console.log('resettoken-231', resettoken);
  const hashToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');
  // console.log('hashToken-231', hashToken);
  // 2. Find User and check Token is valid
  const user = await Users.findOne({
    resetPasswordToken: hashToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  console.log('authCon-231', user);
  if (!user)
    return next(new AppErrors('User or Token is not found or invalid.', 400));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // 3. Create resetPasswordChartAt : timestamp
  // 4. Log User and create token
  createTokenRes(user, 200, req, res);
});

//  UPDATE PASSWORD AFTER LOGINING APP
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Verification password , check exsit password
  const { passwordCurrent, passwordNew, passwordConfirm } = req.body;
  if (!passwordNew || !passwordConfirm || !passwordCurrent) {
    return next(
      new AppErrors(
        'You must provide both newPassword and confirmPassword, passwordCurrent.'
      )
    );
  }
  // 2. Get user ---> get Password userCurrent
  const user = await Users.findById(req.user._id).select('+password');
  // 3. Check passwordCurrent with password DB
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(
      new AppErrors('Your password is incorrect. Please to see again.')
    );
  }
  // 4. Update password
  user.password = passwordNew;
  user.confirmPassword = passwordConfirm;
  await user.save();
  // 5. Gửi phàn hồi update thành công
  createTokenRes(user, 200, req, res);
});
