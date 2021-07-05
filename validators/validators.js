const _ = require('lodash');

function isUrl(link){
    const trimLink = _.trim(link);
    return (/^https:\/\//.test(trimLink) || /^http:\/\//.test(trimLink));
}

function isTimeLimit(timeLimit){
    return (timeLimit >= 0);
}

function isValidConfigs(configs){
    return (isUrl(configs.url) && isTimeLimit(configs.timeLimit));
}

module.exports = {
    isUrl,
    isTimeLimit,
    isValidConfigs
}
