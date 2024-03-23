const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tours = require('../../model/tourModel');
const Users = require('../../model/userModel');
const Reviews = require('../../model/reviewModel');

dotenv.config({
  path: path.join(__dirname, '../../config.env')
});

const DB = process.env.DATABASE_CLOUD.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// mongoose.connect(DB).then(() => console.log('DB connection successful!'));
const connectDB = async () => {
  try {
    await mongoose.connect(DB);
  } catch (error) {
    console.log(error);
  }
};
// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'tours.json'), 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'users.json'), 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'reviews.json'), 'utf-8')
);
console.log('length', tours.length);
// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await connectDB();
    await Tours.create(tours);
    await Users.create(users, { validateBeforeSave: false });
    await Reviews.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await connectDB();
    // const x = await Tours.find();
    // console.log(x);
    await Tours.deleteMany();
    await Users.deleteMany();
    await Reviews.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
