






const userClient = require('socket.io-client')('http://localhost:4001');

userClient.on('connect', function() {
  userClient.sendBuffer = [];
  console.log(`${"fees service"} ---> ${"account service"} status: ${"connected"}`)
});


const socketOptions = {
  serverSocket: null,
  userClient: userClient,
}

 module.exports = socketOptions