






const userClient = require('socket.io-client')('http://localhost:4001');
const productClient = require('socket.io-client')('http://localhost:4003');
// const userClient = require('socket.io-client')('http://localhost:4001');
// userClient.on('connect', function() {
//    userClient.sendBuffer = [];
//    console.log("user client has connected from product service")
// });
 const socketOptions = {
   serverSocket: null,
   userClient: userClient,
   productClient: productClient,
}

 module.exports = socketOptions