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

        console.log('Login successful.');

        // Go to Twitter search page
        const searchUrl = `https://x.com/search?q=${query}&src=typed_query&f=live`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        const waitForAtLeastTenTweets = async (page, selector, timeout = 30000) => {
            const startTime = Date.now();

            while (Date.now() - startTime < 5000) {
                const tweetElements = await page.$$(selector); // Get all elements matching the selector
                console.log(selector);

                if (tweetElements.length >= 10) {
                    return; // Exit the loop if at least 10 items are found
                }

                // await page.evaluate(() => window.scrollBy(0, window.innerHeight)); // Scroll down to load more
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            // throw new Error('Timeout exceeded: Could not find at least 10 tweets.');
        };
        try {
            await waitForAtLeastTenTweets(page, 'article[data-testid="tweet"]');
            console.log('Found at least 10 tweets.');

            // Wait for tweets to load
            // await page.waitForSelector('.article', { timeout: 20000 });
            // await page.waitForSelector('article[data-testid="tweet"]', { timeout: 50000 });
            // try {
            //     await page.waitForSelector('article[data-testid="tweet"]', { timeout: 60000 });
            // } catch (e) {
            //     console.warn('Tweets not found. Continuing without them.');
            // }

            // Extract tweets from the page
            const tweets = await page.evaluate(() => {
                // Select all tweet articles
                const tweetElements = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
                return tweetElements.map(el => {
                    // Extract the tweet text using the appropriate selector
                    const tweetTextElement = el.querySelector('div[data-testid="tweetText"]');
                    const tweetText = tweetTextElement?.innerText.trim() || null;

                    // Extract the tweet link
                    const tweetLinkElement = el.querySelector('a[href*="/status/"]');
                    const tweetLink = tweetLinkElement ? `https://x.com${tweetLinkElement.getAttribute('href')}` : null;

                    // Extract the tweet date
                    const tweetDateElement = el.querySelector('time');
                    const tweetDate = tweetDateElement?.getAttribute('datetime') || null;

                    return {
                        text: tweetText,
                        link: tweetLink,
                        date: tweetDate,
                    };
                }).filter(tweet => tweet.text); // Filter out tweets with no text
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
            res.status(500).json({ success: false, message: 'Failed to fetch tweets.' });
        }
    } catch (error) {
        console.error('Error during scraping:', error);
        await browser.close();
        res.status(500).json({ success: false, message: 'Failed to fetch tweets. Please try again later.' });
    }
};