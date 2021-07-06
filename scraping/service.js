const browserErrors = require('../errors/browser.errors')
const validator = require('../validators/validators');
const configErrors = require('../errors/manual-configs.errors')
const configs = require('../manualConfigs')
const Browser = require('../browser/browser')

async function getUrlsWithStatusCodes(browser,url,timeLimit) {
    const hostName = (new URL(url)).hostname;
    const urlsWithStatusCodes = [];
    let page;

    try {
        page = await browser.newPage();
    } catch (err) {
        browserErrors.newPageCreationError(err)
    }

    if (page) {
        const urls = new Set();
        urls.add(url);

        while (urls.size > 0){
            const url = [...urls.values()][0];
            let httpResponse;

            try {
                httpResponse = await page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: timeLimit
                });
            } catch (err) {
                browserErrors.openPageError(url, err)
            }

            let statusCode;

            if(httpResponse){
                statusCode = httpResponse.status();
            }

            if (statusCode) {
                urlsWithStatusCodes.push({ statusCode: statusCode, url: url });
            }

            urls.delete(url);

            const links = await page.$$eval('a', as => as.map(a => a.href));

            for (const link of links) {
                if (validator.isUrl(link)) {
                    const currentURL = new URL(link);
                    if(currentURL.hostname === hostName) {
                        urls.add(currentURL);
                    }
                }
            }
        }
           await page.close();
    }

    return urlsWithStatusCodes;
}

async function printUrlsWithStatusCodes(){
    if(validator.isValidConfigs(configs)) {
        const browser = await Browser.startBrowser();

        if (browser) {
            try {
                const url = configs.url;
                const timeLimit = configs.timeLimit;

                const urlsWithStatusCodes = await getUrlsWithStatusCodes(browser, url, timeLimit);

                if (urlsWithStatusCodes.length !== 0) {
                    console.log("ALL URLS WITH STATUS CODES : ", urlsWithStatusCodes,
                        "COUNT OF All URLS WITH STATUS CODES : ", urlsWithStatusCodes.length);

                }
            } catch (err) {
                console.log(err)
            }

            await browser.close();
        }
        return;
    }

    let urlErrMessage = "";
    let timeLimitErrMessage = "";

    if (!validator.isUrl(configs.url)) {
        urlErrMessage = "InvalidUrl";
    }

    if (!validator.isTimeLimit(configs.timeLimit)) {
        timeLimitErrMessage = "InvalidTimeLimit"
    }

    configErrors.invalidConfigsError(urlErrMessage,timeLimitErrMessage);
}

module.exports = {
    printUrlsWithStatusCodes
}

