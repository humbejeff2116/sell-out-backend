
/**
 * @class 
 *  user controller class 
 * @module UserDataChangeController
 */
 function UserDataChangeController() {

    this.userClient;

    this.gatewayServerSocket;

}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client which connects to the account service
 * @param {object} gatewayServerSocket - clients connecting to the gateway service
 * 
 */
 UserDataChangeController.prototype.mountSocket = function({ userClient, gatewayServerSocket}) {

    this.userClient = userClient ? userClient : null;

    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;

    return this;

}

UserDataChangeController.prototype.userDataChangeResponse = function(io, response) {

    console.log("user data has changed ---UserDataChangeController----")
    
    const { emitOnlyToSelf, socketId  } = response;
    
    if (emitOnlyToSelf) {

        io.to(socketId).emit('userDataChange', response);

        return

    }

    io.sockets.emit('userDataChange', response); 
    
    // this.userClient.on('userDataChangee', function(response) {

    //     const { socketId } = response;

    //     console.log("user data has changed ---UserDataChangeController----")
       
    //     io.sockets.emit('userDataChangee', response); 

    // });   
}

module.exports = UserDataChangeController;