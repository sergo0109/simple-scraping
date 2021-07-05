const service = require('./scraping/service')

service.printUrlsWithStatusCodes().catch(err => console.log(err));


