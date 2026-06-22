const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Le texte est vide." });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un expert en memes. Reponds UNIQUEMENT en JSON avec les champs: tone, situation, memeCaptionTop, memeCaptionBottom, suggestedTemplate, emoji" },
        { role: "user", content: "Texte : " + text }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    const memeData = JSON.parse(response.choices[0].message.content);
    res.json({ success: true, meme: memeData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeText };
