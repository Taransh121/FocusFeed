const puppeteer = require('puppeteer');
const Tweet = require('../Models/tweet'); // Assuming you have a Tweet model for MongoDB

exports.scrapeTwitter = async (req, res) => {
    const query = req.query.query || 'Trump'; // Default to 'Trump' if no query parameter is passed
    const twitterUsername = 'TaranshChellani'; // Replace with your Twitter username
    const twitterPassword = 'Qwerty@123'; // Replace with your Twitter password

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Go to Twitter login page
        await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle2' });

        // Wait for the login form to load
        await page.waitForSelector('input[name="text"]', { timeout: 20000 });

        // Enter username
        await page.type('input[name="text"]', twitterUsername, { delay: 100 });
        await page.keyboard.press('Enter');
        // await page.waitForTimeout(2000);

        // Enter password
        await page.waitForSelector('input[name="password"]', { timeout: 20000 });
        await page.type('input[name="password"]', twitterPassword, { delay: 100 });
        await page.keyboard.press('Enter');
        // await page.waitForTimeout(5000);

        // Check if login was successful
        // if (page.url().includes('login')) {
        //     throw new Error('Login failed. Please check your credentials.');
        // }

        console.log('Login successful.');

        // Go to Twitter search page
        const searchUrl = `https://x.com/search?q=${query}&src=typed_query&f=live`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        // Wait for tweets to load
        await page.waitForSelector('article', { timeout: 20000 });

        // Extract tweets from the page
        const tweets = await page.evaluate(() => {
            const tweetElements = Array.from(document.querySelectorAll('article'));
            return tweetElements.map(el => {
                const tweetText = el.querySelector('div[lang]')?.innerText.trim();
                const tweetLink = el.querySelector('a[href^="/status/"]')?.href;
                const tweetDate = el.querySelector('time')?.getAttribute('datetime');

                return {
                    text: tweetText,
                    link: tweetLink,
                    date: tweetDate,
                };
            }).filter(tweet => tweet.text && tweet.link); // Filter out incomplete entries
        });

        await browser.close();

        // Log and handle cases where no tweets are found
        if (!tweets || tweets.length === 0) {
            console.warn('No tweets found for the query.');
            return res.status(200).json({ success: true, data: [] });
        }

        // Save tweets to the database
        if (tweets.length > 0) {
            await Tweet.insertMany(tweets, { ordered: false }).catch(err => {
                if (err.code !== 11000) throw err; // Ignore duplicates
            });
        }

        // Send the scraped tweets in the response
        res.status(200).json({ success: true, data: tweets });

    } catch (error) {
        console.error('Error during scraping:', error);
        await browser.close();
        res.status(500).json({ success: false, message: 'Failed to fetch tweets. Please try again later.' });
    }
};