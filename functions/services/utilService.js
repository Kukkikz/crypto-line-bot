const moment = require('moment');
const ChartJSImage = require('chart.js-image');
const TinyURL = require('tinyurl');


const calulateCurrentPricePercent = (currentPrice, low, high) => {
    const percent = ((currentPrice - low) / (high - low)) * 100;
    return percent;
}

const eprochToString = (eproc, offset) => {
    //offset 7 for TH time
    const day = moment(eproc).utcOffset(offset).format('D MMM h:mm a');
    console.log(day);
    return day
}

const getCurrentDate = (offset) => {
    const day = moment().utcOffset(offset).format('D MMM h:mm a');
    console.log(day);
    return day
}

const getChartUrl = async (priceDataSet) => {
    console.log('test');
    const line_chart = ChartJSImage().chart({
        "type": "line",
        "data": {
            "labels": priceDataSet.timeLabels,
            "datasets": [
                {
                    "label": priceDataSet.dataLabel,
                    "borderColor": "rgb(255,+99,+132)",
                    "backgroundColor": "rgba(255,+99,+132,+.5)",
                    "data": priceDataSet.priceDataSet
                }
            ]
        },
        "options": {
            "title": {
                "display": true,
                "text": priceDataSet.chartLabel
            },
            "scales": {
                "yAxes": [
                    {
                        "stacked": false,
                        "scaleLabel": {
                            "display": true,
                            "labelString": "Price ($)"
                        }
                    }
                ]
            }
        }
    }) // Line chart
        .backgroundColor('white')
        .width(500) // 500px
        .height(400); // 300px

    // console.log(line_chart.toURL());

    const url = await TinyURL.shorten(line_chart.toURL());

    return url;

    // TinyURL.shorten(line_chart.toURL()).then(function (res) {
    //     console.log(res);
    //     return res;
    // }, function (err) {
    //     console.log(err);
    //     return;
    // })
}

module.exports = {
    calulateCurrentPricePercent,
    eprochToString,
    getCurrentDate,
    getChartUrl
}