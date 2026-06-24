const supabase = require('../config/supabase');
const openai = require('../config/openai');
const { Readable } = require('stream');

// Helper function to turn a Multer buffer into a readable stream for OpenAI
const bufferToStream = (buffer) => {
  return Readable.from(buffer);
};

// 1. Existing Text Controller
const processTextMeme = async (req, res) => {
  try {
    const { raw_text, device_model } = req.body;
    if (!raw_text) {
      return res.status(400).json({ error: 'Texte manquant. Please provide raw_text.' });
    }

    let ai_tone_analysis = "Humoristique / Sarcastique (Fallback)";

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-proj-YOUR_')) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a witty meme analyst. Describe its tone in French (max 7 words)." },
            { role: "user", content: raw_text }
          ],
          max_tokens: 20
        });
        ai_tone_analysis = completion.choices[0].message.content.trim();
      } catch (aiError) {
        console.error('AI Integration Warning:', aiError.message);
      }
    }

    const simulated_meme_url = "https://placeholder-ai-meme-generation.url";

    const { data, error } = await supabase
      .from('memes')
      .insert([{ raw_text, ai_tone_analysis, generated_meme_url: simulated_meme_url, device_model: device_model || 'Unknown Device' }])
      .select();

    if (error) throw error;
    return res.status(201).json({ message: 'Meme text record processed successfully!', data: data[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. NEW AUDIO CONTROLLER (Multer Upload + Whisper Transcription + DB Save)
const processAudioMeme = async (req, res) => {
  try {
    const { device_model } = req.body;

    // Validation: Check if Multer intercepted a file
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file missing. Please upload an audio file.' });
    }

    // A. Generate a unique filename for the audio storage folder
    const fileExt = req.file.originalname.split('.').pop() || 'mp3';
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `audio/${fileName}`;

    // B. Upload audio file binary buffer to Supabase Bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('meme-media')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (storageError) throw storageError;

    // C. Acquire the public link for the uploaded audio
    const { data: { publicUrl } } = supabase.storage
      .from('meme-media')
      .getPublicUrl(filePath);

    // D. WHISPER AI TRANSCRIPTION
    let audio_transcript = "Transcription Audio (Fallback: Key not active)";

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-proj-YOUR_')) {
      try {
        const audioStream = bufferToStream(req.file.buffer);
        audioStream.path = `speech.${fileExt}`; // Dummy path required for file type identification

        const transcription = await openai.audio.transcriptions.create({
          file: audioStream,
          model: "whisper-1",
        });
        audio_transcript = transcription.text;
      } catch (whisperError) {
        console.error('⚠️ Whisper AI Warning:', whisperError.message);
        audio_transcript = `[Transcription Fallback: ${whisperError.message}]`;
      }
    }

    // E. Create unified record inside your Supabase 'memes' table
    const { data: dbData, error: dbError } = await supabase
      .from('memes')
      .insert([
        {
          audio_url: publicUrl,
          audio_transcript: audio_transcript,
          raw_text: `[Audio Meme] ${audio_transcript.substring(0, 30)}...`,
          device_model: device_model || 'Unknown Device',
          ai_tone_analysis: 'Analyse audio en attente',
          generated_meme_url: "https://placeholder-ai-meme-generation.url"
        }
      ])
      .select();

    if (dbError) throw dbError;

    return res.status(201).json({
      message: 'Audio uploaded, transcribed, and logged successfully!',
      data: dbData[0]
    });

  } catch (error) {
    console.error('🔴 Audio Processing Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { processTextMeme, processAudioMeme };