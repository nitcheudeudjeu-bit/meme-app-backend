const supabase = require('../config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Readable } = require('stream');

// Initialisation Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── 1. CONTEXT READER — Analyse de texte ─────────────────────────────────────
const processTextMeme = async (req, res) => {
  try {
    const { raw_text, device_model } = req.body;
    if (!raw_text) {
      return res.status(400).json({ error: 'Texte manquant. Fournis raw_text.' });
    }

    let ai_tone_analysis = 'Humoristique / Sarcastique (Fallback)';

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Tu es un expert en mèmes humoristiques. 
Analyse ce texte et génère une légende courte et drôle (max 10 mots) pour un mème.
Réponds UNIQUEMENT avec la légende, rien d'autre.
Texte : "${raw_text}"`;

      const result = await model.generateContent(prompt);
      ai_tone_analysis = result.response.text().trim();
    } catch (aiError) {
      console.error('Gemini Warning:', aiError.message);
    }

    // Sauvegarde dans Supabase
    const { data, error } = await supabase
      .from('memes')
      .insert([{
        raw_text,
        ai_tone_analysis,
        generated_meme_url: 'https://picsum.photos/800/600',
        device_model: device_model || 'Unknown',
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({
      message: 'Mème texte généré avec succès !',
      data: data[0],
    });
  } catch (error) {
    console.error('Erreur processTextMeme :', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ── 2. VOICE-TO-MEME — Transcription audio + génération ──────────────────────
const processAudioMeme = async (req, res) => {
  try {
    const { device_model } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Fichier audio manquant.' });
    }

    // A. Upload vers Supabase Storage
    const fileExt = req.file.originalname.split('.').pop() || 'mp3';
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `audio/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from('meme-media')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage
      .from('meme-media')
      .getPublicUrl(filePath);

    // B. Transcription avec Gemini Audio
    let audio_transcript = 'Transcription indisponible';
    let legende = 'Mème audio généré par IA';

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Convertir le buffer en base64 pour Gemini
      const audioBase64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'audio/mp4';

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64,
          },
        },
        {
          text: `Transcris cet audio en français. 
Réponds avec ce format JSON exact :
{"transcription": "le texte transcrit", "legende": "une légende drôle de max 10 mots pour un mème"}`,
        },
      ]);

      const responseText = result.response.text().trim();
      // Nettoie le JSON si Gemini ajoute des backticks
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      audio_transcript = parsed.transcription || audio_transcript;
      legende = parsed.legende || legende;
    } catch (geminiError) {
      console.error('Gemini Audio Warning:', geminiError.message);
    }

    // C. Sauvegarde dans Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('memes')
      .insert([{
        audio_url: publicUrl,
        audio_transcript,
        raw_text: `[Audio] ${audio_transcript.substring(0, 50)}...`,
        ai_tone_analysis: legende,
        generated_meme_url: 'https://picsum.photos/800/600',
        device_model: device_model || 'Unknown',
      }])
      .select();

    if (dbError) throw dbError;

    return res.status(201).json({
      message: 'Audio transcrit et mème généré !',
      data: dbData[0],
    });
  } catch (error) {
    console.error('Erreur processAudioMeme :', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ── 3. STATUS REMIXER — Analyse d'image ───────────────────────────────────────
const processImageMeme = async (req, res) => {
  try {
    const { device_model } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image manquante.' });
    }

    // A. Upload vers Supabase Storage
    const fileExt = req.file.originalname.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from('meme-media')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage
      .from('meme-media')
      .getPublicUrl(filePath);

    // B. Analyse de l'image avec Gemini Vision
    let ai_tone_analysis = 'Image analysée par IA';

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const imageBase64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        {
          text: `Regarde cette image et génère une légende drôle et courte (max 10 mots) 
pour en faire un mème. Réponds UNIQUEMENT avec la légende.`,
        },
      ]);

      ai_tone_analysis = result.response.text().trim();
    } catch (geminiError) {
      console.error('Gemini Vision Warning:', geminiError.message);
    }

    // C. Sauvegarde dans Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('memes')
      .insert([{
        original_image_url: publicUrl,
        ai_tone_analysis,
        generated_meme_url: publicUrl,
        raw_text: '[Image Mème]',
        device_model: device_model || 'Unknown',
      }])
      .select();

    if (dbError) throw dbError;

    return res.status(201).json({
      message: 'Image analysée et mème généré !',
      data: dbData[0],
    });
  } catch (error) {
    console.error('Erreur processImageMeme :', error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { processTextMeme, processAudioMeme, processImageMeme };