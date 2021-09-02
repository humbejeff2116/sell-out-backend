





const message = (function() {
    return({
        socketConnectionMessage,
        socketDisconnetionMessage
    });
    function socketConnectionMessage(socket) {
        console.log("connection  established to (order service) --> " + socket.id);
    }
    function socketDisconnetionMessage(socket) {
        console.log("client disconnected from (order service) --> " + socket.id);
    }
})()

module.exports = message;