













function UserController() {
    this.userClient;
    this.gatewayServerSocket;
}

UserController.prototype.mountSocket = function({ userClient, gatewayServerSocket}) {
    this.userClient = userClient ? userClient : null;
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
}
UserController.prototype.useSignUpController = function(data = {}) {
    const self = this;
        // collect data from frontend and send to sign up node
        this.userClient.emit('signUp',data);
    
    this.userClient.on('userAlreadyExist',function(response) {
        // recieve response from sign up node
        // sent response back to frontend
        self.gatewayServerSocket.emit('userAlreadyExist',response)
        console.log(response);
    });

    this.userClient.on('userSignedUp', function(response) {
        // TODO... cache user response in database here(redis);
        self.gatewayServerSocket.emit('userSignedUp',response)
        console.log(response);

    });
     // TODO... complete function to cache user data
    function cacheUserData(data) {

    }   
}
UserController.prototype.useLoginController = function(data = {}) {
    const self = this;

    this.userClient.emit('login', data);

    this.userClient.on('userNotFound', function(response) {
        self.gatewayServerSocket.emit('userEmailNotFound', response)
        console.log(response)
    })

    this.userClient.on('passwordError', function(response) {
        self.gatewayServerSocket.emit('passwordError',response);
    });

    this.userClient.on('passwordMatchNotFound', function(response) {
        self.gatewayServerSocket.emit('passwordMatchNotFound',response);
    })

    this.userClient.on('userFound', function(response) {
        self.gatewayServerSocket.emit('userFound', response);
    })
}
module.exports = UserController;