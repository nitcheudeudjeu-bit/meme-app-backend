// ─────────────────────────────────────────────────────────────────────────────
// src/middlewares/upload.middleware.js
// ─────────────────────────────────────────────────────────────────────────────
const multer = require('multer');
const path = require('path');

// Stockage sur disque dans le dossier uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Filtre pour les fichiers audio
const audioFilter = (req, file, cb) => {
  const allowed = ['audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/webm', 'audio/ogg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format audio non supporté'), false);
};

// Filtre pour les images
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format image non supporté'), false);
};

// Upload audio — limite 10 Mo
const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('audio');

// Upload image — limite 5 Mo
const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

module.exports = { uploadAudio, uploadImage };
