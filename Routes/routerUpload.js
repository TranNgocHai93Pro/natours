const express = require('express');
const multer = require('multer');

const { uploadImages } = require('../controllers/uploadController');
const AppErrors = require('../utils/appError');

const routerUpload = express.Router();

const multerStorage = multer.diskStorage({
  destination: (rep, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});

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

routerUpload.route('/upload').post(upload.array('photos', 12), uploadImages);

module.exports = routerUpload;
