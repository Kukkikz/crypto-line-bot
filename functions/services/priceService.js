const axios = require('axios');
const coingeckoList = require('../resources/coingeckoList.json');
const utilService = require('./utilService');

const thTimeOffset = 7;
const binanceUrl = 'https://api.binance.com/api/v3';
const coingeckoUrl = 'https://api.coingecko.com/api/v3';

const getPriceFromBinance = async (token) => {
    const response = {};
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

const getPrice = async (token) => {
    if (isInCoingecko(token)) return await getPriceFromCoingecko(token);
    return await getPriceFromBinance(token);
}

const getChartDataSet = async (token) => {
    const response = {};
    const symbol = token;
    try {
        const res = await axios.get(`${binanceUrl}/klines?symbol=${symbol}USDT&interval=1h&limit=24`);
        response.success = true;
        response.timeLabels = [];
        response.priceDataSet = [];

        const dataSet = res.data;
        for (const [index, data] of dataSet.entries()) {
            console.log(index, data);

            response.timeLabels[index] = utilService.eprochToString(data[0], thTimeOffset);
            response.priceDataSet[index] = parseFloat(data[1]);
        }
        response.timeLabels[dataSet.length] = utilService.getCurrentDate(thTimeOffset);
        response.priceDataSet[dataSet.length] = parseFloat(dataSet[dataSet.length - 1][4]);

        response.chartLabel = `${token} price = $${response.priceDataSet[dataSet.length]}`;
        response.dataLabel = `${token} price from ${response.timeLabels[0]} to ${response.timeLabels[response.timeLabels.length - 1]}`

        return response;
    } catch (error) {
        response.success = false;
        return response;
    }
}



module.exports = {
    getPriceFromBinance,
    getPriceFromCoingecko,
    isInCoingecko,
    getPrice,
    getChartDataSet
}
