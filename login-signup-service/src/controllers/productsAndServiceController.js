







const User = require('../models/userModel');
const config = require('../config/config');

/**
 * product controller class
 * 
 */
function ProductsAndServiceController() {
    this.productClient;
    this.serverSocket;
}
/**
 * 
 * @param {*} param0 
 * @returns 
 */
ProductsAndServiceController.prototype.mountSocket = function({ productClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

ProductsAndServiceController.prototype.getSocketDetails = function() {
    return ({
        productClient: this.productClient,
        serverSocket: this.serverSocket,
    });
}

ProductsAndServiceController.prototype.createProductOrService = async function(data = {}) {
    const self = this;
    const userEmail = data.user.email;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
       const response = {
        status:401, 
        error : true, 
        message : 'user is not registerd on this site',
        data: data 
       }
       return this.serverSocket.emit('createProductUserError', response);
    }
    //    send to product service node
    this.productClient.emit('createProductOrService', data);
    // recieve from product service node
    this.productClient.on('productCreated', function(response) {
        // sends it from login nodd to gateway
        self.serverSocket.emit('productCreated', response);
        console.log(response);
    }); 
 
}

ProductsAndServiceController.prototype.starProductOrService = async function(data = {}) {
    const self = this;
    const userEmail = data.user.email;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
       const response = {
        status:401, 
        error : true, 
        message : 'user is not registerd on this site',
        data: data 
       }
       return this.serverSocket.emit('starProductUserError', response);
    }
    this.productClient.emit('starProductOrService', data);

    this.productClient.on('starProductOrServiceError', function(response) {
        self.serverSocket.emit('starProductOrServiceError', response);
    });

    this.productClient.on('starProductOrServiceSuccess', function(response) {
        self.serverSocket.emit('starProductOrServiceSuccess', response);
    });
}

ProductsAndServiceController.prototype.unStarProductOrService = async function(data = {}) {
    const self = this;
    const userEmail = data.user.email;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
       const response = {
        status:401, 
        error : true, 
        message : 'user is not registerd on this site',
        data: data 
       }
       return this.serverSocket.emit('unStarProductUserError', response);
    }
    this.productClient.emit('unStarProductOrService', data);

    this.productClient.on('unStarProductOrServiceError', function(response) {
        self.serverSocket.emit('unStarProductOrServiceError', response);
    });

    this.productClient.on('unStarProductOrServiceSuccess', function(response) {
        self.serverSocket.emit('unStarProductOrServiceSuccess', response);
    });
}

ProductsAndServiceController.prototype.reviewProductOrService = async function(data = {}) {
    const self = this;
    const userEmail = data.user.email;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
       const response = {
        status:401, 
        error : true, 
        message : 'user is not registerd on this site',
        data: data 
       }
       return this.serverSocket.emit('reviewProductUserError', response);
    }
    this.productClient.emit('reviewProductOrService', data);

    this.productClient.on('reviewProductOrServiceError', function(response) {
        self.serverSocket.emit('reviewProductOrServiceError', response);
    });

    this.productClient.on('reviewProductOrServiceSuccess', function(response) {
        self.serverSocket.emit('reviewProductOrServiceSuccess', response);
    });
}

module.exports = ProductsAndServiceController;