/**
 * @class 
 *  user controller class 
 * @module UserController
 */
function UserController() {
    this.userClient = null;
    this.gatewayServerSocket = null;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client that connects to account service
 * @param {object} gatewayServerSocket - the socket.IO clients that connect to the gateway
 * 
 */
UserController.prototype.mountSocket = function ({ userClient, gatewayServerSocket }) {
    this.userClient = userClient || null;
    this.gatewayServerSocket = gatewayServerSocket || null;
    return this;
}

/**
 * @method signupUser
 ** used to signup user
 ** initiates a client server connection with account service
 ** collect data from frontend and send to account service
 ** sends back user validation error to frontend/client if user alredy exist
 ** sends back created user response data recieved from accoun service to frontend/cient
 * @param {object} data - the user data collected from the front end 
 */
UserController.prototype.signupUser = function (io, data = {}) {
    if (!data) {
        const response = {
            error: true,
            status:401,
            mesage:"sign up data not provided"
        }
       return this.gatewayServerSocket.emit('dataError', response);
    }

    return this.userClient.emit('signUp', data, (response) => {
        const { socketId } = response;

        console.log("seacrh response", response);

        if (response.error) {
            io.to(socketId).emit('signupError', response);
            return;
        }

        if (response.userAlreadyExist) {
            io.to(socketId).emit('userAlreadyExist', response);
            return;
        }
        io.to(socketId).emit('userSignedUp', response);
    })
}

/**
 * @method loginUser
 ** used to login user
 ** initiates a client server connection with account service node
 ** collect user data from frontend and send to account service node
 ** sends back user validation error to frontend/client if user is not found
 ** sends back password validation error to frontend/client if passwords dont match
 ** sends back logged in user response data recieved from account service to frontend/cient
 * @param {object} data - the user data collected from the front end 
 */
UserController.prototype.loginUser = function (io, data = {}) {
    this.userClient.emit('login', data, (response) => {
        const { socketId } = response;

        if (response.userNotFound) {
            io.to(socketId).emit('userNotFound', response);
            return;
        }

        if (response.passwordError) {
            io.to(socketId).emit('passwordError', response);
            return;
        }

        if (response.passwordMatchNotFound) {
            io.to(socketId).emit('passwordMatchNotFound', response);
            return;
        }

        if (response.error) {
            io.to(socketId).emit('error', response);
            return;
        }
        io.to(socketId).emit('userFound', response);
    });
}

UserController.prototype.getUser = function (io, data = {}) {
    this.userClient.emit('getUser', data, (response) => {
        const { socketId, error } = response;

        if (error) {
            io.to(socketId).emit('getUserError', response);
            return;
        }
        io.to(socketId).emit('getUserSuccess', response);  
    });
}

UserController.prototype.getUserById = function (io, data = {}) {
    this.userClient.emit('getUserById', data, (response) => {
        const { socketId } = response;

        if (response.error ) {
            io.to(socketId).emit('getUserByIdError', response);
            return;
        }
        io.to(socketId).emit('getUserByIdSuccess', response);  
    });
}

UserController.prototype.getReviewUser = function (io, socket, data = {}) {
    this.userClient.emit('getReviewUser', data, (response) => {
        const { socketId } = response;
        if (response.error ) {
            io.to(socketId).emit('getReviewUserError', response);
            return;
        }
        io.to(socketId).emit('getReviewUserSuccess', response);  
    });
}

UserController.prototype.starUser = function (io, data = {}) {
    const { user } = data;

    if (!user) {
        const response = {
            error:true,
            status:401,
            message:"Hi! kindly log in to place a star"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.userClient.emit('starUser', data, (response) => {
        if (response.error ) {
            const { socketId, ...rest } = response;
            io.to(socketId).emit('starUserError', response);
            return
        }
        console.log("user data has changed ---UserDataChangeController----")
        io.sockets.emit('starUserDataChange');
    })
}

UserController.prototype.getUserStars = function (io, data) {
    this.userClient.emit('getInitialStarData', data, (response) => {
        const { socketId } = response;

        if (response.error) {
            io.to(socketId).emit('getStarsError', response);
            return
        }
        io.to(socketId).emit('initialStarData', response);
    }); 
}

// get notifications
UserController.prototype.getNotifications = function (io, data) {
    console.log("getting user notifications");
    this.userClient.emit('getNotifications', data, (response)  => {
        const { socketId } = response;

        if (response.error) {
            io.to(socketId).emit('getNotificationsError', response);
            return
        }
        io.to(socketId).emit('getNotificationsSuccess', response);
    }); 
}

// seen notifications
UserController.prototype.seenNotifications = function (io,data) {

    this.userClient.emit('seenNotifications', data, (response) => {
        const { socketId } = response;
        if (response.error) {
            io.to(socketId).emit('seenNotificationsError', response);
            return
        }

        io.to(socketId).emit('seenNotificationsSuccess', response);
    }); 
}

UserController.prototype.getUserPreviousSearches = function (io, socket, data = {}) {
    this.userClient.emit('getUserPreviousSearches', data, (response) => {
        const { socketId } = response;
        
        if (response.error) {
            io.to(socketId).emit('getUserPreviousSearchesError', response);
            return
        }
        io.to(socketId).emit('getUserPreviousSearchesSuccess', response);
    })
}

UserController.prototype.removeUserSearch = function (io, socket, data = {}) {
    this.userClient.emit('removeUserSearch', data, (response) => {
        const { socketId } = response;
        
        if (response.error) {
            io.to(socketId).emit('removeUserSearchError', response);
            return
        }

        io.to(socketId).emit('removeUserSearchSuccess', response);
    })
}

module.exports = UserController;