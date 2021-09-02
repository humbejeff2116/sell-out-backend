





const userClient = require('socket.io-client')('http://localhost:4001');
userClient.on('connect', function() {
   userClient.sendBuffer = [];
   console.log("user client has connected")
});
const dataMergerClient = require('socket.io-client')('http://localhost:4002');
const postFeedClient = require('socket.io-client')('http://localhost:4006');
const orderClient = require('socket.io-client')('http://localhost:4004');
const accountActivityClient = require('socket.io-client')('http://localhost:4005');
const productClient =  require('socket.io-client')('http://localhost:4003');

const socketOptions = {
    userClient: userClient,
    postFeedClient: postFeedClient,
    dataMergerClient: dataMergerClient,
    productClient: productClient,
    orderClient:  orderClient,
    accountActivityClient: accountActivityClient,
    gatewayServerSocket: null,
}
module.exports = socketOptions