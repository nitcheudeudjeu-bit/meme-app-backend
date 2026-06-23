// ─────────────────────────────────────────────────────────────────────────────
// src/routes/audio.route.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { uploadAudio } = require('../middlewares/upload.middleware');
const { analyzeAudio } = require('../controllers/audio.controller');

// POST /api/audio
// Reçoit un fichier audio, retourne { transcription, legende, imageUrl }
router.post('/', uploadAudio, analyzeAudio);

module.exports = router;
