const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const textRoute = require("./routes/textRoute");
const audioRoute = require("./routes/audioRoute");
const imageRoute = require("./routes/imageRoute");

app.use("/api/text", textRoute);
app.use("/api/audio", audioRoute);
app.use("/api/image", imageRoute);

app.get("/", (req, res) => {
  res.json({
    message: "Meme Generator API fonctionne !",
    routes: {
      textReader: "POST /api/text/analyze",
      voiceToMeme: "POST /api/audio/transcribe",
      statusRemixer: "POST /api/image/remix",
    },
  });
});

app.listen(PORT, () => {
  console.log("Serveur demarre sur http://localhost:" + PORT);
});
