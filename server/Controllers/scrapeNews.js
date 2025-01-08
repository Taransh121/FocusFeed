// const puppeteer = require('puppeteer');
// const Article = require('../Models/article'); // MongoDB Article model

// exports.scrapeCNN = async (req, res) => {
//     const query = req.query.query || 'Trump'; // Default query

//     const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//     const page = await browser.newPage();

//     try {
//         console.log(`Navigating to CNN search page for query: ${query}...`);
//         const searchUrl = `https://edition.cnn.com/search?q=${query}`;
//         await page.goto(searchUrl, { waitUntil: 'networkidle0' });

//         console.log("Waiting for search results to load...");
//         await page.waitForSelector('.search__results', { timeout: 60000 });

//         console.log("Scraping articles...");
//         const articles = await page.evaluate(() => {
//             return Array.from(document.querySelectorAll('.card')).map(el => {
//                 const title = el.querySelector('.container__headline-text')?.textContent.trim() || null;
//                 const link = el.querySelector('a.container__link')?.href || null;
//                 return { title, link, date: new Date().toISOString() }; // Add timestamp for each article
//             }).filter(article => article.title && article.link); // Ensure both title and link exist
//         });

//         if (!articles || articles.length === 0) {
//             console.warn("No articles found for the query.");
//             return res.status(200).json({ success: true, data: [] });
//         }

//         console.log("Storing articles in MongoDB...");
//         await Article.insertMany(articles, { ordered: false }).catch(err => {
//             if (err.code !== 11000) throw err; // Ignore duplicate entries
//         });

//         console.log(`Successfully stored ${articles.length} articles.`);
//         return res.status(200).json({ message: "Articles scraped and stored successfully", data: articles });
//     } catch (error) {
//         console.error("An error occurred during the CNN scraping process:", error);
//         await page.screenshot({ path: 'cnn_error_screenshot.png' }); // Save a screenshot for debugging
//         return res.status(500).json({ error: "Scraping failed. Check server logs and screenshot for details." });
//     } finally {
//         await browser.close();
//     }
// };

const puppeteer = require('puppeteer');
const Article = require('../Models/article'); // MongoDB Article model

exports.scrapeCNN = async (req, res) => {
    const query = req.query.query || 'both'; // Default query to scrape articles for both Trump and Biden

    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    try {
        console.log("Starting CNN scraping...");

        // Function to scrape articles based on the query
        const scrapeArticles = async (searchQuery) => {
            const searchUrl = `https://edition.cnn.com/search?q=${searchQuery}`;
            console.log(`Navigating to search page: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 60000 });

            console.log("Waiting for search results to load...");
            await page.waitForSelector('.search__results', { timeout: 60000 });

            console.log("Scraping articles...");
            return await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.card')).map(el => {
                    const title = el.querySelector('.container__headline-text')?.textContent.trim() || null;
                    const link = el.querySelector('a.container__link')?.href || null;
                    return { title, link, date: new Date().toISOString() }; // Add timestamp for each article
                }).filter(article => article.title && article.link); // Ensure both title and link exist
            });
        };

        let allArticles = [];

        // Handle "both" case where we scrape articles for both Trump and Biden
        if (query === 'both') {
            const trumpArticles = await scrapeArticles('Trump');
            const bidenArticles = await scrapeArticles('Biden');
            allArticles = [...trumpArticles, ...bidenArticles]; // Combine articles for both queries
        } else {
            allArticles = await scrapeArticles(query); // Scrape only for the specified query
        }

        if (!allArticles || allArticles.length === 0) {
            console.warn("No articles found for the query.");
            return res.status(200).json({ success: true, data: [] });
        }

        console.log("Storing articles in MongoDB...");
        await Article.insertMany(allArticles, { ordered: false }).catch(err => {
            if (err.code !== 11000) throw err; // Ignore duplicate entries
        });

        console.log(`Successfully stored ${allArticles.length} articles.`);
        return res.status(200).json({ message: "Articles scraped and stored successfully", data: allArticles });
    } catch (error) {
        console.error("An error occurred during the CNN scraping process:", error);
        await page.screenshot({ path: 'cnn_error_screenshot.png' }); // Save a screenshot for debugging
        return res.status(500).json({ error: "Scraping failed. Check server logs and screenshot for details." });
    } finally {
        await browser.close();
    }
};
