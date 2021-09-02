





const message = (function() {
    return({
        socketConnectionMessage,
        socketDisconnetionMessage
    });
    function socketConnectionMessage(socket) {
        console.log("connection  established to (fees service) --> " + socket.id);
    }
    function socketDisconnetionMessage(socket) {
        console.log("client disconnected from (fees service) --> " + socket.id);
    }
})()

module.exports = message;