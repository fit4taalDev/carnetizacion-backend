import multer from 'multer';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new multer.MulterError(
      'LIMIT_UNEXPECTED_FILE',
      'Invalid format: JPG, JPEG or PNG only.'
    ));
  }
  cb(null, true);
};
const limits = { fileSize: 200 * 1024 }; // 200 KB

export function uploadImage(fieldName) {
  return multer({ storage, fileFilter, limits }).single(fieldName);
}
