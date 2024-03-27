const AppErrors = require('../utils/appError');

// In development, send error to dev.
const sendErrorDev = (err, req, res) => {
  // 1. Áp dụng cho Dev
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
};

// In Production, send error to client.
const sendErrorProd = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // 1. isPersional = true : we send to client
    console.log(error.message);
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message
      });
    }
    console.error(`💥 Error occur ...`, error);
    // 2. error program or unknown error: something wrong

    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message || 'Something went very wrong'
    });
  } else {
    console.log(error.message);
    if (error.isOperational) {
      return res.status(error.statusCode).render('error', {
        title: 'Something went wrong',
        msg: error.message
      });
    }
    console.error(`💥 Error occur ...`, error);
    // 2. error program or unknown error: something wrong

    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later.'
    });
  }
};

// Error _id from DB
const handleCastErrorDB = err => {
  const message = `Invaid ${err.path} : ${err.value}`;
  return new AppErrors(message, 400);
};
// Error Duplicate DB
const handeDuplicateErrorDB = err => {
  const regex = /(?=["'])(?:"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*')/;
  const message = `Duplicate field value: ${err.message.match(
    regex
  )}, please use another field`;
  return new AppErrors(message, 400);
};
// Error Validation DB;
const handleVaidationErrorDB = err => {
  const valueErrors = Object.values(err.errors)
    .map((el, index) => `${index + 1}. ${el.message}`)
    .join('/ ');
  const message = `Invaid Input: ${valueErrors}`;
  return new AppErrors(message, 400);
};

// Error JWT
const handleJwtError = () => {
  return new AppErrors('Invalid Token! Please to login again.', 401);
};

const handleExpiredJwtError = () => {
  return new AppErrors('Your Token is expired! Please to login again.', 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log('err.name', err);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Error in database as mongoDB or mongoose
    //B1: tạo error mới nhận toàn bộ thuộc tính Error
    // B2: thay thế message lỗi từ thành lỗi dễ hiểu và thân thiện với người dùng
    let error = { ...err };
    error.message = err.message;
    console.log(err);
    // console.log('error---', error);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handeDuplicateErrorDB(err);
    if (err.name === 'ValidationError') error = handleVaidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJwtError(err);
    if (err.name === 'TokenExpiredError') error = handleExpiredJwtError(err);
    sendErrorProd(error, req, res);
  }

  next();
};

// 3 type of error : 1. operational, 2: progaming, 3: validation
