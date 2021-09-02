






const userClient = require('socket.io-client')('http://localhost:4001');
const feesClient = require('socket.io-client')('http://localhost:4005');

 const socketOptions = {
   serverSocket: null,
   userClient: userClient,
   feesClient: feesClient,
}

 module.exports = socketOptions