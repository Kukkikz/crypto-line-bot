const admin = require("firebase-admin");
const functions = require('firebase-functions');
const axios = require('axios');
const region = "asia-northeast1";
const priceService = require('./services/priceService');
const inputService = require('./services/inputService');
const outputService = require('./services/outputService');
const alertService = require('./services/alertService');
const utilService = require('./services/utilService');

admin.initializeApp();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${functions.config().line.channelaccesstoken}`
};

exports.LineBot = functions.region(region).https.onRequest((req, res) => {
    if (req.body.events === undefined) {
        res.send('Hello World!');
        return;
    }
    console.log('Soruce = ', req.body.events[0].source);
    reply(req.body);
    res.send('Hello World 2');


});

exports.CheckForAlert = functions.region(region).https.onRequest((req, res) => {
    const store = admin.firestore();
    store.collection('alertRules').doc('break24hr').get().then(doc => {
        if (doc.exists) {
            const break24hrRule = doc.data();
            alertService.handleBreak24hrRule(break24hrRule, LINE_MESSAGING_API, LINE_HEADER);

            res.send(doc.data())
        }
        else {
            res.status(404).send("Nothing")
        }
    }).catch(reason => {
        console.log(reason)
        res.status(500).send(reason)
    })

});


const reply = async (bodyResponse) => {
    let responseMsg;

    if (!inputService.isValidInput(bodyResponse.events[0])) return;

    let command = inputService.getCommand(bodyResponse.events[0].message.text);
    if ((command.split(' '))[0] === 'CHART') {
        console.log('This is chart');
        await getChart((command.split(' '))[1], bodyResponse.events[0].replyToken);
        return;
    }

    let token = command;
    let priceData = {};

    if (priceService.isInCoingecko(token)) {
        console.log('Getting data from Coingecko');
        priceData = await priceService.getPriceFromCoingecko(token);
    } else {
        console.log('Getting data from Binance');
        priceData = await priceService.getPriceFromBinance(token);
    }

    if (priceData.success) {
        responseMsg = `Price for ${token} = $${priceData.price} | Price change = ${priceData.priceChange}%`;
        const payload = outputService.setPricePayload(token, priceData, responseMsg);
        return axios({
            method: 'post',
            url: `${LINE_MESSAGING_API}/reply`,
            headers: LINE_HEADER,
            data: JSON.stringify({
                replyToken: bodyResponse.events[0].replyToken,
                messages: payload
            })
        });
    } else {
        responseMsg = `Token ${token} is not found 😢`;
    }

    return axios({
        method: 'post',
        url: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            replyToken: bodyResponse.events[0].replyToken,
            messages: [
                {
                    type: 'text',
                    text: responseMsg
                }
            ]
        })
    });
};

const getChart = async (token, replyToken) => {
    console.log('Getting chart for ', token);
    const priceDataSet = await priceService.getChartDataSet(token);

    if (priceDataSet.success) {
        const chartUrl = await utilService.getChartUrl(priceDataSet);
        console.log('Chart URL =',chartUrl);
        return axios({
            method: 'post',
            url: `${LINE_MESSAGING_API}/reply`,
            headers: LINE_HEADER,
            data: JSON.stringify({
                replyToken: replyToken,
                messages: [
                    {
                        type: 'image',
                        originalContentUrl: chartUrl,
                        previewImageUrl: chartUrl
                    }
                ]
            })
        });

    } else {
        console.log('Error: Cannot get price from Binance');
        const responseMsg = `Error: Cannot get ${token} price from Binance 😢`;
        return axios({
            method: 'post',
            url: `${LINE_MESSAGING_API}/reply`,
            headers: LINE_HEADER,
            data: JSON.stringify({
                replyToken: replyToken,
                messages: [
                    {
                        type: 'text',
                        text: responseMsg
                    }
                ]
            })
        });
    }
}