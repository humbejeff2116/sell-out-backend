
/**
 * @class 
 *  products and service controller class 
 * @module ProductsController
 */
function ProductsController() {
    this.productOrServiceClient;
    this.dataMergerClient;
    this.gatewayServerSocket;
    this.userClient
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} productOrServiceClient - the socket.IO client of the product and service controller class
 * @param {object} gatewayServerSocket - the socket.IO server socket of the gateway server
 * 
 */
 ProductsController.prototype.mountSocket = function({ productOrServiceClient, dataMergerClient, userClient, gatewayServerSocket }) {
    this.productOrServiceClient = productOrServiceClient ? productOrServiceClient : null;
    this.userClient = userClient ? userClient : null;
    this.dataMergerClient = dataMergerClient ? dataMergerClient : null;
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
}

/**
 * @method createProductOrService 
 ** used to create product or service
 ** initiates a client server connection with login service node
 ** collects product data from frontend/client and sends to login service node
 ** sends back user validation error to frontend/client if ecountered
 ** sends back created product data recieved from login service to frontend/cient
 * @param {object} data - the product data collected from the front end 
 */
 ProductsController.prototype.createProduct = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to create product card"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('createProduct', data);
    console.log("sent data", data);
    
}

ProductsController.prototype.createProductResponse = function(io) {
    const self = this;
    this.userClient.on('createProductNetworkError',function(response) {
        self.gatewayServerSocket.emit('createProductNetworkError', response);
        console.log('product create network eror');
    });
    
    this.userClient.on('createProductUserError', function(response) {
        const { socketId, ...rest } = response.data;
        console.log("recieved network error", response)
        io.to(socketId).emit('createProductUserError', response);
        console.log(response);
    });

    this.userClient.on('productCreated', function(response) {
        const { socketId, ...rest } = response;
        console.log('sending product to', socketId)
        io.to(socketId).emit('productCreated', response);
        console.log(response);
    });   
}

ProductsController.prototype.getProducts = function(socketId) {
    // this.userClient.emit('getProducts', socketId);
    this.dataMergerClient.emit('getProducts', socketId);
    console.log("getting products", socketId); 
}
ProductsController.prototype.getProductsResponse = function(io, socket) {
    const self = this;
    // this.userClient.on('gottenProducts', function(response) {
    //     const { socketId } = response;
    //     console.log('sending products to', socketId);
    //     io.to(socketId).emit('gottenProducts', response);  
    // }); 
    this.dataMergerClient.on('gottenProducts', function(response) {
        const { socketId } = response;
        console.log('sending products to', socketId);
        io.to(socketId).emit('gottenProducts', response);  
    });  
}


/** 
 * @method starProduct
 ** Collects user data from frontend,
 ** Initiates a client server connection with login node
 ** Sends user data from gateway to login node
 ** Listens to login node for response which may include a user not found error, product not found error or star product success
 ** Sends back response to frontend 
 * @param {object} data - the user data collected from the front end which includes the user and product or service to star  
 */
 ProductsController.prototype.starProduct = function(data = {}) {
    const { user } = data;
    if (!user) {
        const response = {
            error:true,
            status:403,
             message:"you must log in to place a star"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    const self = this;
    this.productOrServiceClient.emit('starProductOrService', data);

    this.productOrServiceClient.on('starProductUserError', function(response) {
        self.gatewayServerSocket.emit('starProductUserError', response);
        console.log(response);
    }); 

    this.productOrServiceClient.on('starProductOrServiceError', function(response) {
        self.gatewayServerSocket.emit('starProductOrServiceError', response);
        console.log(response);
    });  

    this.productOrServiceClient.on('starProductOrServiceSuccess', function(response) {
        self.gatewayServerSocket.emit('starProductOrServiceSuccess', response);
        console.log(response);
    });   
}

/** 
 * @method unStarProductOrService
 ** Collects user data from frontend,
 ** Initiates a client server connection with login node
 ** Sends user data from gateway to login node
 ** Listens to login node for response which may include a user not found error, product not found error or un star product success
 ** Sends back response to frontend 
 * @param {object} data - the user data collected from the front end which includes the user and product or service to un star 
 */
 ProductsController.prototype.unStarProduct = function(data = {}) {
    const self = this;
    this.productOrServiceClient.emit('unStarProductOrService', data);

    this.productOrServiceClient.on('unStarProductUserError', function(response) {
        self.gatewayServerSocket.emit('unStarProductUserError', response);
        console.log(response);
    });

    this.productOrServiceClient.on('unStarProductOrServiceError', function(response) {
        self.gatewayServerSocket.emit('unStarProductOrServiceError', response);
        console.log(response);
    });  

    this.productOrServiceClient.on('unStarProductOrServiceSuccess', function(response) {
        self.gatewayServerSocket.emit('unStarProductOrServiceSuccess', response);
        console.log(response);
    });   
}

// show interest
ProductsController.prototype.showInterest = function(data = {}) {
    const { user, productOrService } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to show interest"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    if(user.userEmail === productOrService.userEmail) {
        const response = {
            error:true,
            status:403,
            message:"cannot be intrested in a product that is yours"
        }
        console.log('cannot be interested in a product that is yours')
        return this.gatewayServerSocket.emit('showInterestError', response);

    }
    this.userClient.emit('showInterest', data);   
}

ProductsController.prototype.showInterestResponse = function(io) {
    
    this.userClient.on('showInterestError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('showInterestError', response);
        console.log("show interest response", response);
    })
    this.userClient.on('showInterestSuccess', function(response) {
        const {socketId} = response;
        console.log('respone on show Interest is', response)
        io.sockets.emit('productDataChange', response); 
    });   
}


module.exports = ProductsController;