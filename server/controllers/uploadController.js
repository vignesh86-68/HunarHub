const cloudinary = require('../config/cloudinary');

// @desc    Upload a single image to Cloudinary
// @route   POST /api/upload
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'hunarhub' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await streamUpload();
    res.status(201).json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
};

module.exports = { uploadImage };
