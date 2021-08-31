
const socketOptions = {
    productClient: require('socket.io-client')('http://localhost:4003'),
    // gatewayClient: require('socket.io-client')('http://localhost:4000'),
    serverSocket: null,
    allConnectedSockects: null,
}

socketOptions.productClient.on('connect', function() {
    socketOptions.productClient.sendBuffer = [];
    console.log("product client has connected inside account service")
});
 module.exports = socketOptions