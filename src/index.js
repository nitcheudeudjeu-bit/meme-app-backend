const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// This imports your supabase initialization file and triggers the log!
const supabase = require('./config/supabase'); 
// Ensure this path matches where your routes are stored (e.g., ./routes/memeRoutes or ./routes/uploadRoutes)
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Main API Endpoints - Connects your /image, /text, and /audio routes
app.use('/api', uploadRoutes);

// Base sanity check route
app.get('/', (req, res) => {
  res.send('Meme App API Gateway running smoothly!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});