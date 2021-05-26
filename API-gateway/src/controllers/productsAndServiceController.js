








/**
 * products controller class 
 */

function ProductsAndServiceController() {
    this.productorServiceClient;
    this.gatewayServerSocket;
}

ProductsAndServiceController.prototype.mountSocket = function({ productorServiceClient, gatewayServerSocket }) {
    this.productorServiceClient = productorServiceClient ? productorServiceClient : null;
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
}

    /**
     * product controller method used to create product or service
     * initiates a client server connection with the login service
     * method collects product data and sends to login service node
     * listens to login service node for user validation errors
     * sends back user validation error response back to frontend/client if ecountered
     * also listens to login service node for product or service created
     * sends back product created data recieved from login service to frontend/cient
     * method listens to login service node for responses
     * @param {}
     *  
     */
ProductsAndServiceController.prototype.createProductOrService = function(data = {}) {
    const self = this;
    this.productorServiceClient.emit('createProductOrService', data);

    this.productorServiceClient.on('createProductUserError', function(response) {
        self.gatewayServerSocket.emit('createProductUserError', response);
        console.log(response);
    });

    this.productorServiceClient.on('productCreated', function(response) {
        self.gatewayServerSocket.emit('productCreated', response);
        console.log(response);
    });   
}

/**
 * product controller method used too get a user product or service
 * method collects user data from frontend, initiates a client server connection with login node
 * sends user data from gateway to login node
 * listens to login node for products response
 * sends back response to frontend 
 * @param {object} data - the 
 *  
 * 
 */
ProductsAndServiceController.prototype.getUserProductOrService = function(data = {}) {
    const self = this;
    this.productorServiceClient.emit('getUserProductOrService', data);
    this.productorServiceClient.on('gottenUserProductOrService', function(response) {
        self.gatewayServerSocket.emit('gottenUserProductOrService', response);
        console.log(response);
    });   
}

module.exports = ProductsAndServiceController;