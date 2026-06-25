const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadMedia } = require('../controllers/uploadController');
const { processTextMeme, processAudioMeme } = require('../controllers/memeController');

// Configure Multer memory storage with a 100MB limit to support larger media
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max limit
});

/**
 * 1. IMAGE ROUTE
 * Handles image upload to Supabase Storage -> 'original_image_url'
 */
router.post('/image', upload.single('file'), uploadMedia);

/**
 * 2. TEXT ROUTE
 * Receives text prompt -> 'raw_text' & 'ai_tone_analysis'
 */
router.post('/text', processTextMeme);

/**
 * 3. AUDIO ROUTE
 * Handles audio upload via Multer -> 'audio_url' & 'audio_transcript'
 */
router.post('/audio', upload.single('file'), processAudioMeme);

// ✅ Fixed line: Exporting the router cleanly
module.exports = router;