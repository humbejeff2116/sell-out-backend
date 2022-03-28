
const message = (function() {

    return({
        socketConnectionMessage,
        socketDisconnetionMessage
    });

    function socketConnectionMessage(socket) {

        console.log("Gateway client connected --> " + socket.id);

    }

    function socketDisconnetionMessage(socket) {

        console.log("socket disconnected --> " + socket.id);

    }
    
})()

module.exports = message;