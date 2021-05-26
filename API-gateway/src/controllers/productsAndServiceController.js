








/**
 * @class 
 *  products and service controller class 
 * @module ProductsAndServiceController
 */
function ProductsAndServiceController() {
    this.productorServiceClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} productOrServiceClient - the socket.IO client of the product and service controller class
 * @param {object} gatewayServerSocket - the socket.IO server socket of the gateway server
 * 
 */
ProductsAndServiceController.prototype.mountSocket = function({ productOrServiceClient, gatewayServerSocket }) {
    this.productOrServiceClient = productOrServiceClient ? productOrServiceClient : null;
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
ProductsAndServiceController.prototype.createProductOrService = function(data = {}) {
    const self = this;
    this.productOrServiceClient.emit('createProductOrService', data);

    this.productOrServiceClient.on('createProductUserError', function(response) {
        self.gatewayServerSocket.emit('createProductUserError', response);
        console.log(response);
    });

    this.productOrServiceClient.on('productCreated', function(response) {
        self.gatewayServerSocket.emit('productCreated', response);
        console.log(response);
    });   
}

/** 
 * @method getUserProductOrService
 ** Collects user data from frontend,
 ** Initiates a client server connection with login node
 ** Sends user data from gateway to login node
 ** Listens to login node for products response
 ** Sends back response to frontend 
 * @param {object} data - the data collected from the frontend/client application sent by the user 
 */
ProductsAndServiceController.prototype.getUserProductOrService = function(data = {}) {
    const self = this;
    this.productOrServiceClient.emit('getUserProductOrService', data);
    this.productOrServiceClient.on('gottenUserProductOrService', function(response) {
        self.gatewayServerSocket.emit('gottenUserProductOrService', response);
        console.log(response);
    });   
}

module.exports = ProductsAndServiceController;