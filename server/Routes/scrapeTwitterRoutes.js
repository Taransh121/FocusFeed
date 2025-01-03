const express = require('express');
const router = express.Router();
const { scrapeTwitter } = require('../Controllers/scrapeTwitter'); // Importing the controller function

// Route to scrape tweets based on the query (e.g., Trump or Biden)
router.get('/', scrapeTwitter);

module.exports = router;
