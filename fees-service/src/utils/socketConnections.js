






const userClient = require('socket.io-client')('http://localhost:4001');


 const socketOptions = {
   serverSocket: null,
   userClient: userClient,
}

 module.exports = socketOptions