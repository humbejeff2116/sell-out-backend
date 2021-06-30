







const User = require('../models/userModel');
const config = require('../config/config');

/**
 * @class 
 *  products and service controller class 
 * @module ProductsAndServiceController
 */
function ProductsAndServiceController() {
    this.productClient;
    this.serverSocket;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client of the product and service controller class
 * @param {object} serverSocket - the socket.IO server socket of the login server
 * 
 */
ProductsAndServiceController.prototype.mountSocket = function({ productClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
ProductsAndServiceController.prototype.getSocketDetails = function() {
    return ({
        productClient: this.productClient,
        serverSocket: this.serverSocket,
    });
}

/**
 * @method createProductOrService
 ** used to send product data to product or service node
 ** initiates a client server connection with product or service node
 ** emits a no user found error to gateway if ecountered
 ** collects product or service data from gateway service node and emits to product or service node
 ** recieves created product response from product or service node and emits to gateway
 * @param {object} data - the user data collected from gateway node which includes user and product/service 
 */
ProductsAndServiceController.prototype.createProduct = async function(data = {}) {
    const { user, product, socketId } = data;
    const networkErrorResponse = {
        status:401, 
        error : true, 
        type:"networkError",
        data: data,
        message:"network error please try again" 
    }
    console.log(user)
    const userEmail = user.userEmail;
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
    console.log(data);
    if (!this.productClient.connected) {
        console.log('sending network error')
        return this.serverSocket.emit('createProductNetworkError', networkErrorResponse);
    }
    appUser.password = '';
    data.user = appUser;
    return this.productClient.emit('createProduct', data);
}

ProductsAndServiceController.prototype.createProductResponse = function() {
    const self = this;
    this.productClient.on('productCreated', function(response) {
        self.serverSocket.emit('productCreated', response);
        console.log('product reated', response);
    }); 
}

ProductsAndServiceController.prototype.getProducts = function(data) {
    console.log('getting products')
    this.productClient.emit('getProducts', data);
}
ProductsAndServiceController.prototype.getProductsResponse = function() {
    const self = this;
    this.productClient.on('gottenProducts', async function(response) {
        console.log('sending products');
        const { data } = response;
        const users = await User.getAllUsers();
        const userStars = await users.map(user => ({ 
            userEmail: user.userEmail,
            starsUserRecieved: user.starsUserRecieved
        }));
        setStarsAndSendProducts(data, userStars, sendProducts);

        function  setStarsAndSendProducts(products, usersStars, callback) {
            for (i = 0; i < products.length; i++) {
                for (j = 0; j < usersStars.length; j++) {
                    if (products[i].userEmail === usersStars[j].userEmail) {
                        products[i].starsUserRecieved = usersStars[j];
                    }
                }
            }
            return callback(products);
        }

        function sendProducts(products) {
            response.data = products;
            console.log("products after merging star", products)
            self.serverSocket.emit('gottenProducts', response);
        }
    }); 
   
}

ProductsAndServiceController.prototype.createService = async function(data = {}) {
    const { user, product, socketId } = data;
    const networkErrorResponse = {
        status:401, 
        error : true, 
        type:"networkError",
        data: data,
        message:"network error please try again" 
    }
    const userEmail = user.userEmail;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
       const response = {
        status:401, 
        error : true, 
        message : 'user is not registerd on this site',
        data: data 
       }
       return this.serverSocket.emit('createServiceUserError', response);
    }
    if (!this.productClient.connected) {
        console.log('sending network error');
        return this.serverSocket.emit('createProductNetworkError', networkErrorResponse);
    }
    appUser.password = '';
    data.user = appUser;
    return this.productClient.emit('createService', data);  
}

ProductsAndServiceController.prototype.createServiceResponse = function() {
    const self = this;
    this.productClient.on('serviceCreated', function(response) {
        self.serverSocket.emit('serviceCreated', response);
        console.log(response);
    }); 
}

ProductsAndServiceController.prototype.getServices = function(data) {
    console.log('getting Services')
    this.productClient.emit('getServices', data);
}
ProductsAndServiceController.prototype.getServicesResponse = function() {
    const self = this;
    this.productClient.on('gottenServices', function(response) {
        console.log('sending products')
        self.serverSocket.emit('gottenServices', response);
    }); 
   
}

/**
 * @method starProductOrService
 ** used to send user/product data to product or service node to add a star 
 ** initiates a client server connection with product or service node
 ** emits a no user found error to gateway if ecountered
 ** collects product or service data from gateway service node and emits to product or service node
 ** recieves a no product found error from product or service node and emits to gateway if ecountered
 ** recieves star added success response from product or service node and emits to gateway
 * @param {object} data - the user data collected from gateway node which includes user and product/service 
 */
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

/**
 * @method unStarProductOrService
 ** used to send user/product data to product or service node to remove a star 
 ** initiates a client server connection with product or service node
 ** emits a no user found error to gateway if ecountered
 ** collects product or service data from gateway service node and emits to product or service node
 ** recieves a no product found error from product or service node and emits to gateway if ecountered
 ** recieves star removed success response from product or service node and emits to gateway
 * @param {object} data - the user data collected from gateway node which includes user and product/service 
 */
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

/**
 * @method reviewProductOrService
 ** used to send user/product data to product or service node to review a product/service 
 ** initiates a client server connection with product or service node
 ** emits a no user found error to gateway if ecountered
 ** collects product or service data from gateway service node and emits to product or service node
 ** recieves a no product found error from product or service node and emits to gateway if ecountered
 ** recieves review success response from product or service node and emits to gateway
 * @param {object} data - the user data collected from gateway node which includes user and product/service 
 */
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