



const socketio_client = require('socket.io-client')

const userClient = socketio_client('http://localhost:4001',{reconnection: true, reconnectionDelay: 10000});
userClient.on('connect', function() {
   userClient.sendBuffer = [];
   console.log("user client has connected")
});
const dataMergerClient = socketio_client('http://localhost:4002',{reconnection: true, reconnectionDelay: 10000});
const postFeedClient = socketio_client('http://localhost:4006',{reconnection: true, reconnectionDelay: 10000});
const orderClient = socketio_client('http://localhost:4004',{reconnection: true, reconnectionDelay: 10000});
const accountActivityClient = socketio_client('http://localhost:4005',{reconnection: true, reconnectionDelay: 10000});
const productClient =  socketio_client('http://localhost:4003',{reconnection: true, reconnectionDelay: 10000});

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