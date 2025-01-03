const puppeteer = require('puppeteer');
const Article = require('../Models/article');

exports.scrapeCNN = async (req, res) => {
    try {
        const query = req.query.query || 'Trump'; // Default to 'Trump' if no query parameter is passed

        // const browser = await puppeteer.launch({ headless: false });
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Go to CNN search page with the query parameter
        await page.goto(`https://edition.cnn.com/search?q=${query}`, { waitUntil: 'networkidle2' });
        // await page.goto(`https://edition.cnn.com/search?q=${query}`, { waitUntil: 'domcontentloaded' });

        // Ensure the page has enough time to load dynamic content
        // await page.waitForTimeout(3000);

        // Wait for the results list to load using the correct selector
        await page.waitForSelector('.search__results', { timeout: 20000 });
        // await page.waitForSelector('.search__results', { timeout: 2000 });

        // Extract articles using the correct selectors
        const articleElementsCount = await page.evaluate(() => {
            const a = document.querySelectorAll('.card').innerHTML;
            console.log(a);
            return a;
        });
        console.log('Article Elements Count:', articleElementsCount);
        const articles = await page.evaluate(() => {
            const articleElements = Array.from(document.querySelectorAll('.card'));
            return articleElements.map(el => ({
                title: el.querySelector('.container__headline-text')?.textContent.trim(),
                link: el.querySelector('a.container__link')?.href,
            })).filter(article => article.title && article.link); // Filter out incomplete entries
        });

        await browser.close();
        // Log and handle cases where no articles are found
        if (!articles || articles.length === 0) {
            console.warn('No articles found for the query.');
            return res.status(200).json({ success: true, data: [] });
        }
        // Check if there are articles and save them to the database
        if (articles.length > 0) {
            await Article.insertMany(articles, { ordered: false }).catch(err => {
                if (err.code !== 11000) throw err; // Ignore duplicates
            });
        }

        // Send the scraped articles in the response
        res.status(200).json({ success: true, data: articles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch articles. Please try again later.' });
    }
};
