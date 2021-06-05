const functions = require('firebase-functions');
const axios = require('axios');
const region = "asia-northeast1";
const coinMetadata = require('./resources/coinMetadata.json');
const priceService = require('./services/priceService');

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${functions.config().line.channelaccesstoken}`
};

exports.LineBot = functions.region(region).https.onRequest((req, res) => {
    if (req.body.events === undefined) {
        console.log('no line event');
        res.send('Hello World!');
    }
    else {
        console.log('have Line event');
        let event = req.body.events[0];
        console.log(event);
        reply(req.body);
        res.send('Hello World 2');
    }

});

const reply = async (bodyResponse) => {
    console.log('reply token =', bodyResponse.events[0].replyToken);
    console.log('text =', bodyResponse.events[0].message.text)
    let responseMsg;
    if (bodyResponse.events[0].message.type !== 'text') {
        console.log('not a text');
        responseMsg = 'Please use text message';
        return;
    } else {
        let inputMsg = bodyResponse.events[0].message.text;
        inputMsg = inputMsg.toLowerCase().trim();
        if (!inputMsg.startsWith('/')) {
            return;
            // responseMsg = 'Invalid command: Please use /<token-name>. For example, /btc';
        } else {
            let token = inputMsg.substring(1).toUpperCase();
            let priceData = {};

            if (priceService.isInCoingecko(token)) {
                console.log('Getting data from Coingecko');
                priceData = await priceService.getPriceFromCoingecko(token);

            } else {
                console.log('Getting data from Binance');
                console.log('UserId =', bodyResponse.events[0].source.userId);
                priceData = await priceService.getPriceFromBinance(token);
            }

            if (priceData.success) {
                responseMsg = `Price for ${token} = $${priceData.price} | Price change = ${priceData.priceChange}%`;
                const payload = setPricePayload(token, priceData, responseMsg);
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
        }

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

const calulateCurrentPricePercent = (currentPrice, low, high) => {
    const percent = ((currentPrice - low) / (high - low)) * 100;
    return percent;
}

const setPricePayload = (token, priceData, altMessage) => {
    const colorCode = priceData.priceChange < 0 ? '#FF3D3D' : '#00FF00';
    const barPercent = calulateCurrentPricePercent(priceData.price, priceData.lowPrice, priceData.highPrice);
    const payload = [{
        "type": "flex",
        "altText": `${altMessage}`,
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                            {
                                "type": "text",
                                "text": token,
                                "size": "xl",
                                "weight": "bold",
                                "flex": 2
                            },
                            {
                                "type": "text",
                                "text": `$${priceData.price}`,
                                "size": "xl",
                                "weight": "bold",
                                "align": "end",
                                "flex": 3
                            }
                        ],
                        "spacing": "none"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "xxl",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "ราคาเปลี่ยนแปลง (24hr)",
                                        "size": "sm",
                                        "color": "#555555",
                                        "flex": 0
                                    },
                                    {
                                        "type": "text",
                                        "text": `${priceData.priceChange}%`,
                                        "size": "sm",
                                        "color": "#111111",
                                        "align": "end"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "separator",
                        "margin": "xl",
                        "color": "#454545"
                    },
                    {
                        "type": "text",
                        "text": "24h low/high price",
                        "margin": "lg",
                        "size": "xs"
                    },
                    {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                            {
                                "type": "text",
                                "text": `$${priceData.lowPrice}`,
                                "size": "xs"
                            },
                            {
                                "type": "text",
                                "text": `$${priceData.highPrice}`,
                                "size": "xs",
                                "align": "end"
                            }
                        ],
                        "margin": "sm"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "filler"
                                    }
                                ],
                                "height": "6px",
                                "width": `${barPercent}%`,
                                "backgroundColor": "#454545"
                            }
                        ],
                        "height": "6px",
                        "backgroundColor": "#999999",
                        "margin": "sm"
                    }
                ],
                "background": {
                    "type": "linearGradient",
                    "angle": "45deg",
                    "startColor": colorCode,
                    "endColor": "#ffffff"
                }
            },
            "styles": {
                "footer": {
                    "separator": true
                }
            }
        }
    }];

    return payload;
}