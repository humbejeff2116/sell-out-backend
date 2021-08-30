





const message = (function() {
    return({
        socketConnectionMessage,
        socketDisconnetionMessage
    });
    function socketConnectionMessage(socket) {
        console.log("connection from login node established' --> " + socket.id);
    }
    function socketDisconnetionMessage(socket) {
        console.log("Login client disconnected' --> " + socket.id);
    }
})()

module.exports = message;