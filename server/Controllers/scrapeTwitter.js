const puppeteer = require('puppeteer');
const Tweet = require('../Models/tweet'); // Assuming you have a Tweet model for MongoDB

exports.scrapeTwitter = async (req, res) => {
    const searchType = req.query.search || 'both';
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    try {
        console.log("Navigating to Twitter login page...");
        await page.goto('https://x.com/login', { waitUntil: 'networkidle2' });

        console.log("Entering login credentials...");
        await page.waitForSelector('input[name="text"]', { timeout: 20000 });
        await page.type('input[name="text"]', process.env.twitterUsername);
        await page.keyboard.press('Enter');

        console.log("Waiting for password input...");
        await page.waitForSelector('input[name="password"]', { timeout: 20000 });
        await page.type('input[name="password"]', process.env.twitterPassword);
        await page.keyboard.press('Enter');

        console.log("Waiting for successful login...");
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

        const loggedIn = await page.evaluate(() => document.querySelector('nav') !== null);
        if (!loggedIn) {
            return res.status(500).json({ error: "Login failed." });
        }

        // Helper function to scrape tweets from a specific search term
        const scrapeTweets = async (searchQuery) => {
            const searchUrl = `https://x.com/search?q=${searchQuery}&src=typed_query&f=live`;
            console.log(`Navigating to search page: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            return await page.evaluate(() => {
                return Array.from(document.querySelectorAll('article'))
                    .map(tweet => {
                        const contentElement = tweet.querySelector('div[lang]');
                        const tweetUrlElement = tweet.querySelector('a');
                        const tweetUrl = tweetUrlElement ? tweetUrlElement.href : null;
                        return {
                            content: contentElement ? contentElement.innerText.trim() : null,
                            url: tweetUrl,
                        };
                    })
                    .filter(tweet => tweet.content && tweet.url); // Ensure we have both content and URL
            });
        };

        let topTweets = [];

        // Handling "both" case where we scrape both Trump and Biden tweets
        if (searchType === 'both') {
            const trumpTweets = await scrapeTweets('trump');
            const bidenTweets = await scrapeTweets('biden');
            topTweets = [...trumpTweets, ...bidenTweets];  // Combine the tweets for both Trump and Biden
        } else {
            topTweets = await scrapeTweets(searchType);  // Scrape only the specified search type (Trump or Biden)
        }

        console.log("Latest Tweets:");
        topTweets.forEach((tweet, index) => {
            console.log(`${index + 1}. Content: ${tweet.content}`);
            console.log(`   URL: ${tweet.url}`);
        });
    } catch (error) {
        console.error("An error occurred during the scraping process:", error);
        await page.screenshot({ path: 'error_screenshot.png' });
        return res.status(500).json({ error: "Scraping failed. Check server logs and screenshot for details." });
    }
};
