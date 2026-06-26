const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: 'Route image OK' });
});

module.exports = router;