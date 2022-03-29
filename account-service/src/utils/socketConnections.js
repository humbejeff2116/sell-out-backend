
const socketOptions = {
    productClient: require('socket.io-client')('http://localhost:4003'),
    gatewayClient: require('socket.io-client')('http://localhost:4000'),
    serverSocket: null,
    allConnectedSockects: null,
}

socketOptions.productClient.on('connect', function() {

    socketOptions.productClient.sendBuffer = [];
    
    console.log(`${"account service"} ---> ${"product service"} status: ${"connected"}`)

});

socketOptions.gatewayClient.on('connect', function() {

    socketOptions.productClient.sendBuffer = [];

    console.log(`${"account service"} ---> ${"qateway service"} status: ${"connected"}`)

});

 module.exports = socketOptions