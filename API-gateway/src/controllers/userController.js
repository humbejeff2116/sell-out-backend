












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
    this.userClient.emit('signUp',data);
}


UserController.prototype.signupUserResponse = function(io) {
    const self = this;
    this.userClient.on('userAlreadyExist',function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('userAlreadyExist', response);
        console.log(response);
    });

    this.userClient.on('userSignedUp', function(response) {
        // TODO... cache user response in database here(redis);
        const { socketId, ...rest } = response;
        io.to(socketId).emit('userSignedUp',response)
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
    this.userClient.emit('login', data);
}

UserController.prototype.loginUserResponse = function(io) {
 
    this.userClient.on('userNotFound', function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('userNotFound', response);
        console.log(response)
    })

    this.userClient.on('passwordError', function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('passwordError',response);
        console.log(response)
    });

    this.userClient.on('passwordMatchNotFound', function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('passwordMatchNotFound',response);
        console.log(response)
        
    })

    this.userClient.on('userFound', function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('userFound', response);
        console.log(response)
    })
}



UserController.prototype.getUserById = function(data = {}) {
    this.userClient.emit('getUserById', data);
}

UserController.prototype.getUserByIdResponse = function(io) {
 
    this.userClient.on('userByIdNotFound', function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('userByIdNotFound', response);
        console.log(response)
    })

    this.userClient.on('userByIdFound', function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('userByIdFound', response);
        console.log(response)
    })
}



UserController.prototype.starUser = function(data = {}) {
    const {user, star, seller} = data;
    if(!user) {
        const response = {
            error:true,
            status:401,
            message:"you must have an account on this site to perform action"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    console.log("star data user",data);
    this.userClient.emit('starUser', data); 
}
UserController.prototype.starUserResponse = function(io) {
    
    this.userClient.on('starUserError', function(response) {
        const { socketId, ...rest } = response.data;
        io.to(socketId).emit('starUserError', response);
        console.log(response);
    }); 

    this.userClient.on('starUserSuccess', function(response) {
        const { socketId, ...rest } = response.data;
        io.sockets.emit('productDataChange');
        console.log(response);
    });   
}



UserController.prototype.getUserStars = function(data) {
    this.userClient.emit('getInitialStarData', data); 
}
UserController.prototype.getUserStarsResponse = function(io) {


    
    this.userClient.on('getStarsError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('getStarsError', response);

        console.log(response);
    });
    this.userClient.on('initialStarData', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('initialStarData', response);

        console.log(response);
    }); 
}


module.exports = UserController;