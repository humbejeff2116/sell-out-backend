
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const cloudinary = require('cloudinary').v2;
const { imageDataUri } = require('../../routes/Multer/multer');

cloudinary.config({
    cloud_name:config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret:config.cloudinary.secret
});

/**
 * @class 
 *  user controller class 
 * @module UserController
 */
function UserController() {

    this.gatewayClient;

    this.serverSocket;

}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} serverSocket - the socket.IO server socket of the login server
 */
UserController.prototype.mountSocket = function({ serverSocket, gatewayClient }) {

    this.gatewayClient = gatewayClient ? gatewayClient : null;

    this.serverSocket = serverSocket ? serverSocket: null;

    return this;

}

/**
 * @method getSocket  
 ** Used to get the service node socket datesils
 */
UserController.prototype.getSocket = function() {

    return ({
        serverScket: this.serverSocket,
        gatewayClient: this.gatewayClient
    });

}

/**
 * @method signUp
 ** used to sign up a user
 ** initiates a  server connection with gateway node
 ** emits a user found error to gateway if already registered
 ** collects user data from gateway node and saves to database
 ** creates a JSON web token and sends response to gateway node 
 * @param {object} user - the signup user data collected from gateway node 
 */

UserController.prototype.authenticateUser = async function(userdata, userModel) {

    if (!userdata) {

        throw new Error("userdata is not defined");

    }

    const userEmail = userdata.email;

    const appUser = await userModel.getUserByEmail(userEmail);

    return appUser;

}

UserController.prototype.starUser =  async function(io, socket, data = {}, callback) {

    const { socketId, user, product, starCount } = data;

    try {

        const seller = await User.getUserByEmail(product.userEmail);

        const appUser = await User.getUserByEmail(user.userEmail);

        const self = this;
    
        if (!appUser || !seller) {

            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            }

            return callback(response)

        }

        if ((starCount === 0)) {

            const updateStarsBuyerGave = await User.removeStarUserGave(data)

            const updateStarsSellerRecieved = await User.removeStarUserRecieved(data)

            if (updateStarsBuyerGave.status === 201 && updateStarsSellerRecieved.status === 201) {

                const response = {
                    status:201, 
                    socketId: socketId, 
                    error: false, 
                    message: 'star removed successfully', 
                }
               
                return callback(response)

            }

        }

        const updateStarsBuyerGave = await User.addStarUserGave(data)

        const updateStarsSellerRecieved = await User.addStarUserRecieved(data)

        if (updateStarsBuyerGave.status === 201 && updateStarsSellerRecieved.status === 201) {

            const response = {
                status:201,
                socketId: socketId, 
                error: false, 
                message: 'star placed successfully', 
            }
           
            return callback(response)
           
        }

    } catch(err) {

        console.error(err)

    }
     
}

UserController.prototype.getUserStars =  async function(data = {}, callback) {

    const { socketId, product} = data;

    try {

        const userEmail = product.userEmail;
    
        const appUser = await User.getUserByEmail(userEmail);
    
        if (!appUser) {
    
            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            }
    
            return  callback(response)

        }
    
        const stars = appUser.starsUserRecieved;
    
        const starsUserRecieved = stars.length;
    
        const response = {
            socketId: socketId,
            status: 200,
            data: starsUserRecieved,
            error: false, 
            message: 'user stars successfully gotten', 
        }
    
        callback(response)  
        
    } catch (err) {

        console.error(err)
        
    }
         
}

UserController.prototype.seenNotifications =  async function(io, socket, data = {}) {

    const { socketId, user } = data;

    try{
        
        const userEmail = user.userEmail;

        const appUser = await User.getUserByEmail(userEmail);

        if (!appUser) {

            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            }

            return this.serverSocket.emit('seenNotificationsError', response); 

        }

        const seenNotifications = await User.updateSeenNotifications(appUser);

        const response = {
            socketId: socketId,
            status:200, 
            error : false, 
            message : 'notifications seen', 
        }

        this.serverSocket.emit('seenNotificationsSuccess', response); 

    }catch(err) {

        console.error(err);
        
    }
          
}

UserController.prototype.getUserConfirmations =  function(data = {}) {

    const { socketId, user} = data;

    const self = this;

    const userId = user.id;

    User.getAllUserConfirmations(userId, (err, result) => {

        if (err) {

            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            }

            return  self.serverSocket.emit('getConfirmationsError', response); 

        }

        const response = {
            socketId: socketId,
            status: 201,
            data: result,
            error: false, 
            message: 'user confirmations successfully gotten', 
        }

        self.serverSocket.emit('getConfirmationsSuccess', response);

        console.log('user confirmations', result);  

    });

}

UserController.prototype.getUserPreviousSearches = async function(io, socket, data, callback) {

    const { user, socketId } = data

    try {

        const appUser = await User.getUserById(user.id);
    
        if (!appUser) {
    
            const response = {
                status:401, 
                error : true,
                socketId: socketId, 
                message : 'no user found', 
            }
    
           callback(response) 

        }
    
        const response = {
            status: 200,
            error: false, 
            socketId: socketId,
            data: appUser.searchData,
            message: 'previous searches gotten successfully', 
        }
    
        callback(response)

    }  catch(err) {

        console.error(err)

        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while getting user searches",
            data: null
        }

       callback(response)

    }

}

UserController.prototype.updateUserSearchData = async function(io, socket, data) {

    const { socketId } = data;

    let response;

    try {

        const addUserSearch = await User.updateUserSearch(data);
    
        if (addUserSearch.status === 201) {

            response = {
                socketId: socketId,
                status:201,
                emitOnlyToSelf: true, 
                error : false, 
                message : 'search quer added successfully', 
            }

            this.gatewayClient.emit('userDataChange', response);

        }

    }  catch(err) {

        console.error(err)

        response = {
            status: 500,
            error: true,
            socketId: socketId,
            emitOnlyToSelf: true,
            message: "An error occured while adding user search query",
            data: null
        }

        this.gatewayClient.emit('userDataChange', response);

    }

}

UserController.prototype.removeUserSearch = async function(io, socket, data) {

    const { socketId } = data;

    let response;

    try {

        const removeUserSearch = await User.removeUserSearch(data);
    
        if (removeUserSearch.status === 201) {

            response = {
                socketId: socketId,
                status:201,
                emitOnlyToSelf: true, 
                error : false, 
                message : 'search query removed successfully', 
            }

            this.gatewayClient.emit('userDataChange', response);

        }

    }  catch(err) {

        console.error(err)

        response = {
            status: 500,
            error: true,
            socketId: socketId,
            emitOnlyToSelf: true,
            message: "An error occured while removing search query",
            data: null
        }

        this.gatewayClient.emit('userDataChange', response);

    }

}

module.exports = UserController;