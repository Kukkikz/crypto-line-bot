
const calulateCurrentPricePercent = (currentPrice, low, high) => {
    const percent = ((currentPrice - low) / (high - low)) * 100;
    return percent;
}

module.exports = {
    calulateCurrentPricePercent
}