const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transcribeAudio = async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  try {
    if (!filePath) return res.status(400).json({ error: "Aucun fichier audio recu." });
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      language: "fr",
      response_format: "text",
    });
    const memeResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Genere un meme depuis cette transcription. Reponds UNIQUEMENT en JSON: transcription, emotion, subtitle, memeCaptionTop, memeCaptionBottom, suggestedTemplate" },
        { role: "user", content: "Transcription : " + transcription }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    const memeData = JSON.parse(memeResponse.choices[0].message.content);
    memeData.transcription = transcription;
    res.json({ success: true, meme: memeData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

module.exports = { transcribeAudio };
