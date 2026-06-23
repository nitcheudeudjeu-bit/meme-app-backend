// ─────────────────────────────────────────────────────────────────────────────
// src/controllers/audio.controller.js
// Reçoit un fichier audio, transcrit avec Whisper, génère un mème avec GPT-4o
// ─────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeAudio = async (req, res) => {
  // Vérifie qu'un fichier a bien été reçu
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier audio reçu.' });
  }

  const audioPath = req.file.path;

  try {
    // ── Étape 1 : Transcription avec Whisper ───────────────────────────────
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'fr',
    });

    const texteTranscrit = transcription.text;
    console.log('Transcription :', texteTranscrit);

    // ── Étape 2 : Génération du texte du mème avec GPT-4o ─────────────────
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un générateur de mèmes humoristiques. ' +
            'À partir d\'une transcription audio, génère une légende courte et drôle (max 12 mots) ' +
            'pour un mème. Réponds UNIQUEMENT avec la légende, rien d\'autre.',
        },
        {
          role: 'user',
          content: `Transcription : "${texteTranscrit}"`,
        },
      ],
    });

    const legendeMeme = completion.choices[0].message.content.trim();

    // ── Étape 3 : Génération de l'image avec DALL-E ───────────────────────
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Une image de mème humoristique illustrant : "${legendeMeme}". Style cartoon, fond simple, expressif.`,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = image.data[0].url;

    // ── Nettoyage du fichier temporaire ───────────────────────────────────
    fs.unlinkSync(audioPath);

    // ── Réponse au frontend ───────────────────────────────────────────────
    return res.status(200).json({
      transcription: texteTranscrit,
      legende: legendeMeme,
      imageUrl: imageUrl,
    });

  } catch (err) {
    // Nettoyage en cas d'erreur
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    console.error('Erreur audio controller :', err.message);
    return res.status(500).json({ error: 'Erreur lors du traitement audio.' });
  }
};

module.exports = { analyzeAudio };
