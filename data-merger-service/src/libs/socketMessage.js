





const message = (function() {
    return({
        socketConnectionMessage,
        socketDisconnetionMessage
    });
    function socketConnectionMessage(socket) {
        console.log("connection  established to (data merger service) --> " + socket.id);
    }
    function socketDisconnetionMessage(socket) {
        console.log("client disconnected from (data merger service) --> " + socket.id);
    }
})()

module.exports = message;