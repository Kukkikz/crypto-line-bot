const util = require('./utilService');


const setPricePayload = (token, priceData, altMessage) => {
    const colorCode = priceData.priceChange < 0 ? '#FF3D3D' : '#00FF00';
    const barPercent = util.calulateCurrentPricePercent(priceData.price, priceData.lowPrice, priceData.highPrice);
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

const setPriceAlertPayload = (token, priceData, altMessage, status, threshold, percent) => {
    let tagMessage = 'Not Defined';
    let color = '#000000';
    if (status === 'up') {
        tagMessage = `${token} near 24hr highest 📈`;
        color = '#1DB446';
    }
    if (status === 'down') {
        tagMessage = `${token} near 24hr lowest 📉`;
        color = '#FF3D3D';
    }

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
                        "type": "text",
                        "text": "Price Alert! 🚨🚨🚨",
                        "weight": "bold",
                        "color": color,
                        "size": "sm"
                    },
                    {
                        "type": "text",
                        "text": tagMessage,
                        "weight": "bold",
                        "size": "lg",
                        "margin": "none"
                    },
                    {
                        "type": "separator",
                        "margin": "lg",
                        "color": "#454545"
                    },
                    {
                        "type": "text",
                        "text": `${token} = $${priceData.price}`,
                        "size": "xs",
                        "margin": "lg"
                    },
                    {
                        "type": "text",
                        "text": `24hr low = $${priceData.lowPrice}`,
                        "size": "xs"
                    },
                    {
                        "type": "text",
                        "text": `24hr high = $${priceData.highPrice}`,
                        "size": "xs"
                    },
                    {
                        "type": "text",
                        "text": `Threshold ${threshold}% | Current ${percent}%`,
                        "size": "xs",
                        "margin": "xs"
                    }
                ]
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


module.exports = {
    setPricePayload,
    setPriceAlertPayload
}