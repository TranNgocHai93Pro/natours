const express = require('express');

const {
  getAllUser,
  createUser,
  getUser,
  updateMe,
  updateUser,
  deleteMe,
  deleteUser,
  uploadUserPhoto,
  resizeUserPhoto,
  getMe
} = require('../controllers/controllerUsers');
const {
  signUp,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout
} = require('../controllers/authController');

const routerUsers = express.Router();

routerUsers.route('/signUp').post(signUp);
routerUsers.route('/login').post(login);
routerUsers.route('/logout').get(logout);

// Tat ca duong dan sau protect đều yêu cầu phải login
routerUsers.use(protect);
routerUsers
  .route('/')
  .get(getAllUser)
  .post(createUser);

routerUsers.route('/forgetPassword').post(forgetPassword);
routerUsers.route('/resetPassword/:resettoken').patch(resetPassword);

routerUsers.route('/updateMyPassword').patch(updatePassword);
routerUsers
  .route('/updateMe')
  .patch(uploadUserPhoto, resizeUserPhoto, updateMe);
routerUsers.route('/deleteMe').delete(deleteMe);

// Tat ca duong dan sau RetricTo('admin') yêu cầu phải có là admin thì mới đc quyền thực thi
routerUsers.use(restrictTo('admin'));

routerUsers
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

routerUsers.route('/me').get(protect, getMe, getUser);

module.exports = routerUsers;
