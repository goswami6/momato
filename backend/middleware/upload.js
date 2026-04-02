const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const makeStorage = (subFolder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads', subFolder)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  });

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  cb(null, extOk && mimeOk);
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5 MB

const uploadReviewPhotos = multer({ storage: makeStorage('reviews'), fileFilter, limits }).array('photos', 5);
const uploadRestaurantImage = multer({ storage: makeStorage('restaurants'), fileFilter, limits }).single('image');
const uploadMenuImage = multer({ storage: makeStorage('menu'), fileFilter, limits }).single('image');

module.exports = { uploadReviewPhotos, uploadRestaurantImage, uploadMenuImage };
