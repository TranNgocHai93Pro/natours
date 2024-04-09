const catchAsync = require('../utils/catchAsync');
const cloudinary = require('../utils/uploadCloudary');

exports.uploadImages = catchAsync(async (req, res, next) => {
  const images = req.files.map(el => el.path);

  const urlImages = [];
  for (let image of images) {
    const result = await cloudinary.uploader.upload(image);
    urlImages.push({
      url: result.secure_url,
      publicId: result.public_id
    });
  }
  res.status(200).json({
    status: 'success',
    message: 'Upload successfull.',
    data: {
      urlImages
    }
  });
});
