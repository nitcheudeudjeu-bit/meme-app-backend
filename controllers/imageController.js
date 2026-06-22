const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const remixImage = async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  try {
    if (!filePath) return res.status(400).json({ error: "Aucune image recue." });
    const base64Image = fs.readFileSync(filePath).toString("base64");
    const mimeType = req.file.mimetype;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es expert en memes visuels. Reponds UNIQUEMENT en JSON: imageDescription, humorAngle, memeCaptionTop, memeCaptionBottom, suggestedStyle, tags" },
        { role: "user", content: [
          { type: "text", text: "Genere un meme depuis cette image." },
          { type: "image_url", image_url: { url: "data:" + mimeType + ";base64," + base64Image, detail: "low" } }
        ]}
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    const memeData = JSON.parse(response.choices[0].message.content);
    res.json({ success: true, meme: memeData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

module.exports = { remixImage };
