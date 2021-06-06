
const isValidInput = (msgObj) => {
    if (msgObj.message.type !== 'text') return false;
    let inputMsg = msgObj.message.text;
    inputMsg = inputMsg.toUpperCase().trim();
    if (!inputMsg.startsWith('/')) return false;
    return true;
}

const getCommand = (msg) => {
    return msg.substring(1).toUpperCase();
}

module.exports = {
    isValidInput,
    getCommand
}