const express = require('express');
const router = express.Router();
const { scrapeCNN } = require('../Controllers/scrapeController');

router.get('/', scrapeCNN);

module.exports = router;
