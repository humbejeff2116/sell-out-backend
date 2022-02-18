





const message = (function() {

    let numberOfOnlineUsers = 0;
    
    return({ socketConnectionMessage, socketDisconnetionMessage })

    function socketConnectionMessage(socket) {

        let message;
        ++numberOfOnlineUsers
        console.log("New socket connection --> id:" + socket.id);
        
        if (numberOfOnlineUsers < 2) {

            message = `${numberOfOnlineUsers} user online`

        } else {

            message = `${numberOfOnlineUsers} users online`

        }

        console.log(message);

    }

    function socketDisconnetionMessage(socket) {

        let message;
        --numberOfOnlineUsers
        console.log("socket disconnected --> id:" + socket.id);
        
        if (numberOfOnlineUsers < 2) {

            message = `${numberOfOnlineUsers} user online`

        } else {

            message = `${numberOfOnlineUsers} users online`

        }

        console.log(message);
    }

})()

module.exports = message;