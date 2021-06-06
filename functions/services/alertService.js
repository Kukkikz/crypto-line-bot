const axios = require('axios');
const NodeCache = require("node-cache");

const priceService = require('./priceService');
const util = require('./utilService');
const outputService = require('./outputService');


const break24hrCache = new NodeCache({ stdTTL: 3600, checkperiod: 60, useClones: false, deleteOnExpire: true });

const handleBreak24hrRule = async (rule, LINE_MESSAGING_API, LINE_HEADER) => {
    rule.tokenWatchList.forEach(async token => {
        processAlert(token, rule.threshold, rule.userId, LINE_MESSAGING_API, LINE_HEADER);
    });
    return;
}

const processAlert = async (token, threshold, userId, LINE_MESSAGING_API, LINE_HEADER) => {
    const price = await priceService.getPrice(token)
    if (!price.success) return;
    const percent = util.calulateCurrentPricePercent(price.price, price.lowPrice, price.highPrice);
    let responseMsg;
    let payload;
    if (percent <= threshold) {
        if (break24hrCache.has(`${token}down`)) {
            console.log(`cooldown for ${token}down`);
            return;
        }
        console.log('sending Line message...');
        responseMsg = `Price ${token} = ${price.price} | Price of ${token} is below the threshold (${threshold}%)`;
        console.log(responseMsg);
        payload = outputService.setPriceAlertPayload(token, price, responseMsg, 'down', threshold, percent.toFixed(2));
        break24hrCache.set(`${token}down`, 'down');
        
    } else if (percent >= (100 - threshold)) {
        if (break24hrCache.has(`${token}up`)) {
            console.log(`cooldown for ${token}up`);
            return;
        }
        console.log('sending Line message...');
        responseMsg = `Price ${token} = ${price.price} | Price of ${token} is above the threshold (${100 - threshold}%)`;
        console.log(responseMsg);
        payload = outputService.setPriceAlertPayload(token, price, responseMsg, 'up', threshold, percent.toFixed(2));
        break24hrCache.set(`${token}up`, 'up');
    } else {
        console.log(`${token} is ${percent}%, not meet threshold (0 - ${threshold}% or ${100 - threshold} - 100%) yet.`);
        return;
    }

    return axios({
        method: 'post',
        url: `${LINE_MESSAGING_API}/push`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            to: userId,
            messages: payload
        })
    });

}

module.exports = {
    handleBreak24hrRule
}