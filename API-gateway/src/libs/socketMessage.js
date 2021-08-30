





const message = (function() {
    let numberOfOnlineUsers = 0;
    return({
        socketConnectionMessage,
        socketDisconnetionMessage
    });
    function socketConnectionMessage(socket) {
        ++numberOfOnlineUsers
        console.log("New client connected --> " + socket.id);
        let message;
        if (numberOfOnlineUsers < 2) {
            message = `${numberOfOnlineUsers} user online`
        } else {
        message = `${numberOfOnlineUsers} users online`
        }
        console.log(message);
    }
    function socketDisconnetionMessage(socket) {
        --numberOfOnlineUsers
        console.log("client disconnected --> " + socket.id);
        let message;
        if (numberOfOnlineUsers < 2) {
            message = `${numberOfOnlineUsers} user online`
        } else {
        message = `${numberOfOnlineUsers} users online`
        }
        console.log(message);
    }
})()

module.exports = message;