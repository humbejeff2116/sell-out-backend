



const socketio_client = require('socket.io-client')

const userClient = socketio_client('http://localhost:4001',{reconnection: true, reconnectionDelay: 10000});
userClient.on('connect', function() {
   userClient.sendBuffer = [];
   console.log(`${"gateway"} ---> ${"account service"} status: ${"connected"}`)
});


const dataMergerClient = socketio_client('http://localhost:4002',{reconnection: true, reconnectionDelay: 10000});
dataMergerClient.on('connect', function() {
    dataMergerClient.sendBuffer = [];
    console.log(`${"gateway"} ---> ${"data maerger service"} status: ${"connected"}`)
});


const postFeedClient = socketio_client('http://localhost:4006',{reconnection: true, reconnectionDelay: 10000});
postFeedClient.on('connect', function() {
    postFeedClient.sendBuffer = [];
    console.log(`${"gateway"} ---> ${"postFeed service"} status: ${"connected"}`)
});


const orderClient = socketio_client('http://localhost:4004',{reconnection: true, reconnectionDelay: 10000});
orderClient.on('connect', function() {
    orderClient.sendBuffer = [];
    console.log(`${"gateway"} ---> ${"order service"} status: ${"connected"}`)
});


const accountActivityClient = socketio_client('http://localhost:4005',{reconnection: true, reconnectionDelay: 10000});
accountActivityClient.on('connect', function() {
    accountActivityClient.sendBuffer = [];
    console.log(`${"gateway"} ---> ${"accountActivity service"} status: ${"connected"}`)
 });

 
const productClient =  socketio_client('http://localhost:4003',{reconnection: true, reconnectionDelay: 10000});
productClient.on('connect', function() {
    productClient.sendBuffer = [];
    console.log(`${"gateway"} ---> ${"product service"} status: ${"connected"}`)
 });

 const feesClient =  socketio_client('http://localhost:4005',{reconnection: true, reconnectionDelay: 10000});
 feesClient.on('connect', function() {
    feesClient.sendBuffer = [];
    console.log(`${"gateway"} ---> ${"fees service"} status: ${"connected"}`)
 });

const socketOptions = {
    userClient: userClient,
    postFeedClient: postFeedClient,
    dataMergerClient: dataMergerClient,
    productClient: productClient,
    orderClient:  orderClient,
    accountActivityClient: accountActivityClient,
    feesClient: feesClient,
    gatewayServerSocket: null,
}
module.exports = socketOptions