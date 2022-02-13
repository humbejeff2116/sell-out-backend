






const userClient = require('socket.io-client')('http://localhost:4001');
userClient.on('connect', function() {
    userClient.sendBuffer = [];
    console.log(`${"data merger service"} ---> ${"account service"} status: ${"connected"}`)
});

const productClient = require('socket.io-client')('http://localhost:4003');
 const socketOptions = {
   serverSocket: null,
   userClient: userClient,
   productClient: productClient,
}

 module.exports = socketOptions