












/**
 * @class 
 *  user controller class 
 * @module UserController
 */
function UserController() {
    this.userClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client of the user controller class
 * @param {object} gatewayServerSocket - the socket.IO server socket of the gateway server
 * 
 */
UserController.prototype.mountSocket = function({ userClient, gatewayServerSocket}) {
    this.userClient = userClient ? userClient : null;
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
}

/**
 * @method signupUser
 ** used to signup user
 ** initiates a client server connection with signup/login service node
 ** collect user data from frontend and send to signup/login service node
 ** sends back user validation error to frontend/client if user alredy exist
 ** sends back created user response data recieved from signup/login service to frontend/cient
 * @param {object} data - the user data collected from the front end 
 */
UserController.prototype.signupUser = function(data = {}) {
    const self = this;

    this.userClient.emit('signUp',data);

    this.userClient.on('userAlreadyExist',function(response) {
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

/**
 * @method loginUser
 ** used to login user
 ** initiates a client server connection with signup/login service node
 ** collect user data from frontend and send to signup/login service node
 ** sends back user validation error to frontend/client if user is not found
 ** sends back password validation error to frontend/client if passwords dont match
 ** sends back logged in user response data recieved from signup/login service to frontend/cient
 * @param {object} data - the user data collected from the front end 
 */
UserController.prototype.loginUser = function(data = {}) {
    const self = this;

    this.userClient.emit('login', data);

    this.userClient.on('userNotFound', function(response) {
        self.gatewayServerSocket.emit('userNotFound', response)
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