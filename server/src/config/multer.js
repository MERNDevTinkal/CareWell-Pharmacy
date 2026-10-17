const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getUploadPath = (folder) => {
  const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date();
    const dated = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dest = path.join(getUploadPath(folder), dated);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
};

const prescriptionFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) return cb(null, true);
  cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed'));
};

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

exports.uploadProductImages = multer({
  storage: createStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE, files: 10 }
});

exports.uploadPrescriptionFiles = multer({
  storage: createStorage('prescriptions'),
  fileFilter: prescriptionFilter,
  limits: { fileSize: MAX_SIZE, files: 5 }
});

exports.uploadGeneralMedia = multer({
  storage: createStorage('media'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE, files: 1 }
});

exports.uploadBlogImage = multer({
  storage: createStorage('blogs'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE, files: 1 }
});
