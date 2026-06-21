const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configurations
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test route to check if server works
app.get('/', (req, res) => {
  res.json({ 
    status: "success", 
    message: "Multimodal Meme Generator API is running smoothly! 🚀" 
  });
});

// Start the server listening to all local network interfaces ('0.0.0.0')
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running globally on network port ${PORT}`);
});