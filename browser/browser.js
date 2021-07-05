const puppeteer = require('puppeteer');
const errors = require('../errors/browser.errors')


async function startBrowser(){
        let browser;

        try {
            const args = [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--blink-settings=imagesEnabled=false",
            ];

            const options = {
                args,
                headless: true,
                ignoreHTTPSErrors: true,
            };

            browser = await puppeteer.launch(options);
        }catch (err){
            errors.browserCreationError(err);
        }

        return browser;
}

module.exports = {
        startBrowser
}
