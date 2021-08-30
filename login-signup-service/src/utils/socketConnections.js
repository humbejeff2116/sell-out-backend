
const socketOptions = {
    productClient: require('socket.io-client')('http://localhost:4003'),
    serverSocket: null
}

socketOptions.productClient.on('connect', function() {
    socketOptions.productClient.sendBuffer = [];
    console.log("product client has connected")
});
 module.exports = socketOptions