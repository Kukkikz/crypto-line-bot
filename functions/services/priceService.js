const axios = require('axios');
const binanceUrl = 'https://api.binance.com/api/v3';
const coingeckoUrl = 'https://api.coingecko.com/api/v3';
const coingeckoList = require('../resources/coingeckoList.json');
const testToken = {
    "symbol": "XXXUSDT"
}

const getPriceFromBinance = async (token) => {
    const response = {};
    // const symbol = token.symbol;
    const symbol = token;
    try {
        const res = await axios.get(`${binanceUrl}/ticker/24hr?symbol=${symbol}USDT`);
        let price = res.data.lastPrice;
        price = parseFloat(price).toString();
        response.success = true;
        response.price = parseFloat(res.data.lastPrice);
        response.priceChange = parseFloat(res.data.priceChangePercent);
        response.lowPrice = parseFloat(res.data.lowPrice);
        response.highPrice = parseFloat(res.data.highPrice);
        return response;
    } catch (error) {
        response.success = false;
        return response;
    }
}

const getPriceFromCoingecko = async (token) => {
    const response = {};
    try {
        const res = await axios.get(`${coingeckoUrl}/coins/${coingeckoList[token].id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
        response.success = true;
        response.price = res.data.market_data.current_price.usd;
        response.priceChange = res.data.market_data.price_change_percentage_24h;
        response.lowPrice = res.data.market_data.low_24h.usd;
        response.highPrice = res.data.market_data.high_24h.usd;
        console.log(response);
        return response;
    } catch (error) {
        response.success = false;
        console.log(error);
        return response;
    }
}

const isInCoingecko = (token) => {
    return coingeckoList[token] !== undefined;
}



module.exports = {
    getPriceFromBinance,
    getPriceFromCoingecko,
    isInCoingecko
}
