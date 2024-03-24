const mongoose = require('mongoose');
const crypto = require('crypto');

const validator = require('validator');
const bcrypt = require('bcrypt');

// SCHEMA
const userSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    require: [true, 'User must have a name.'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    require: [true, 'Please provide your email'],
    validate: [validator.isEmail, 'Please provide a vaild email.']
  },
  password: {
    type: String,
    require: [true, ' Please provide your password'],
    minlength: [3, 'Must be a least 3'],
    select: false
  },
  confirmPassword: {
    type: String,
    require: true,
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: `ConfirmPassword and password is not the same.`
    }
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  changePasswordAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

//Mã hoá Password trước khi lưu, ta sử dụng pre()
userSchema.pre('save', async function(next) {
  //Only run function if the password is mofified
  if (!this.isModified('password')) return next();
  //Hash password with salt=12
  this.password = await bcrypt.hash(this.password, 12);
  // confirmPassword is not nessesary the saving
  this.confirmPassword = undefined;
  next();
});

// Create a changePasswordAt when chaging your password
userSchema.pre('save', function(next) {
  if (!this.isModified('password' || this.isNew())) return next();
  this.changePasswordAt = Date.now() - 1000;
  next();
});

// Compare password
userSchema.methods.correctPassword = function(candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

// Change Password
userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.changePasswordAt) {
    const changeTimeStamp = this.changePasswordAt.getTime() / 1000;
    return JWTTimestamp < changeTimeStamp;
  }

  return false;
};

// Create resetToken
userSchema.methods.createResetPasswordToken = function() {
  // 1. Tạo resetToken
  const resetToken = crypto.randomBytes(32).toString('hex');
  // 2. Mã hoá resetToken, tạo thời gian hết hạn của resetToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  // console.log('resetPasswordExpire---', this.resetPasswordExpire);
  // console.log('resetPasswordToken---', this.resetPasswordToken);
  return resetToken;
};

// Hide User when accessing Url: /deleteMe
userSchema.pre(/^find/, async function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
