const express = require("express");
const router = express.Router();
const { analyzeText } = require("../controllers/textController");

router.post("/analyze", analyzeText);

module.exports = router;
