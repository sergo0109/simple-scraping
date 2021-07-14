const browserErrors = require('../errors/browser.errors')
const validator = require('../validators/validators');
const configErrors = require('../errors/manual-configs.errors')
const configs = require('../manualConfigs')
const Browser = require('../browser/browser')
const _ = require('lodash')


async function getUrlsWithStatusCodes(browser,url,timeLimit) {
    const firstUrl = new URL(url)
    const hostName = firstUrl.hostname;
    const urlsWithStatusCodes = [];
    const urls = new Set();
    urls.add(firstUrl);
    let i = 0;
    const functions =[];
    let shiftFunctionsCount = 0;

    while(i < urls.size) {
        if (i < functions.length + shiftFunctionsCount && i === urls.size - 1) {
            await functions[0];
            functions.shift();
            shiftFunctionsCount++;
        } else {
            const url = [...urls.values()][i];

            let page;

            try {
                page = await browser.newPage();
            } catch (err) {
                browserErrors.newPageCreationError(err);
                break;
            }

            if (page) {
                functions.push(page.goto(url.href, {
                    waitUntil: 'networkidle2',
                    timeout: timeLimit
                }).then(httpResponse => {
                    if (httpResponse.status()) {
                        urlsWithStatusCodes.push({statusCode: httpResponse.status(), url: url.href});
                    }
                }).catch(err => {
                    browserErrors.openPageError(url.href, err);
                }).then(() => {
                    return page.$$eval('a', as => as.map(a => a.href)).catch(err => {
                        browserErrors.getValueError(url.href, err);
                    }).then(links => {
                        if (!_.isEmpty(links)) {
                            for (const link of links) {
                                if (validator.isUrl(link)) {
                                    const currentURL = new URL(link);
                                    if (currentURL.hostname === hostName) {
                                        urls.add(currentURL);
                                    }
                                }
                            }
                        }
                    });
                }).finally(() => {
                    page.close();
                    i++;
                }));
            }
        }
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


                console.log("ALL URLS WITH STATUS CODES : ", urlsWithStatusCodes,
                    "COUNT OF All URLS WITH STATUS CODES : ", urlsWithStatusCodes.length);

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

