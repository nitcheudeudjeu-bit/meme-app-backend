const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/text', require('./routes/text.route'));
app.use('/api/audio', require('./routes/audio.route'));
app.use('/api/image', require('./routes/image.route'));

// Test
app.get('/', (req, res) => {
  res.send('Backend meme-app OK ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});