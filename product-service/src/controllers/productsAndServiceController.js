








const Product = require('../models/productModel');
const elasticSearch = require('elasticsearch');
const saveProductToElasticSearch = require('../utils/elasticSearch');

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
 * @param {object} serverSocket - the socket.IO server socket of the gateway server
 * 
 */
ProductsAndServiceController.prototype.mountSocket = function({ productClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.serverSocket =serverSocket ? serverSocket : null;
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
 ** used to create product or service
 ** initiates a server connection with login service node
 ** collects product or service data from login service and saves to database
 ** sends back created product data response to login service 
 * @param {object} data - the product data collected from login node 
 */
ProductsAndServiceController.prototype.createProductOrService = async function(data= {}) {
    // TODO... save product or service to elastice search data base
    const self = this;
    let newProduct = new Product();
    await newProduct.setProductDetails(data);
    await newProduct.save()
    .then( data => {
       const productDetails = {
        //    TODO... include product details here
       }
        const response = {
            status: 200, 
            data: productDetails, 
            error: false, 
            message: 'you are now registered',    
        };
        // send to login node
        return self.serverSocket.emit('productCreated', response);
    });
    
}

/**
 * @method starProductOrService 
 ** used to add a star to product or service
 ** initiates a server connection with login service node
 ** collects user data from login service
 ** emits a product or service not found error if ecountered
 ** adds a star to product or service
 ** sends back response to login service 
 * @param {object} data - the product data collected from login node 
 */
ProductsAndServiceController.prototype.starProductOrService =  async function(data = {}) {
    const self = this;
    const productorServiceId = data.product.id;
    const productOrService = await Product.getProductById(productorServiceId);
    if (!productOrService) {
        const response = {
            status: 401 ,
            error: true, 
            message: 'product or service not found',    
        };
        return this.serverSocket.emit('starProductOrServiceError', response);
    }
    await productOrService.addStar(data)
    await productOrService.save()
    .then(data => {
        const response = {
            status:201, 
            data, 
            error: false, 
            message: 'star placed successfully', 
        };
        self.serverSocket.emit('starProductOrServiceSuccess', response);
    })
}

/**
 * @method unStarProductOrService 
 ** used to remove a star from product or service
 ** initiates a server connection with login service node
 ** collects user data from login service
 ** emits a product or service not found error if ecountered
 ** removes a star to product or service
 ** sends back response to login service 
 * @param {object} data - the product data collected from login node 
 */
ProductsAndServiceController.prototype.unStarProductOrService =  async function(data = {}) {
    const self = this;
    const productorServiceId = data.product.id;
    const productOrService = await Product.getProductById(productorServiceId);
    if (!productOrService) {
        const response = {
            status: 401 ,
            error: true, 
            message: 'product or service not found',    
        };
        return this.serverSocket.emit('unStarProductOrServiceError', response);
    }
    await productOrService.removeStar(data)
    await productOrService.save()
    .then(data => {
        const response = {
            status:201, 
            data, 
            error: false, 
            message: 'star removed successfully', 
        };
        self.serverSocket.emit('unStarProductOrServiceSuccess', response);
    })
}

/**
 * @method reviewProductOrService
 ** used to add review to a product or service
 ** initiates a server connection with login service node
 ** collects user data from login service
 ** emits a product or service not found error if ecountered
 ** add review to product or service
 ** sends back response to login service 
 * @param {object} data - the product data collected from login node 
 */
ProductsAndServiceController.prototype.reviewProductOrService =  async function(data ={}) {
    const self = this;
    const productorServiceId = data.product.id;
    const productOrService = await Product.getProductById(productorServiceId);
    if (!productOrService) {
        const response = {
            status: 401 ,
            error: true, 
            message: 'product or service not found',    
        };
        return this.serverSocket.emit('reviewProductOrServiceError', response);
    }
    await productOrService.comment(data);
    await productOrService.save()
    .then(data => {
        const response = {
            status:201, 
            data, 
            error: false, 
            message: 'reviewed successfully', 
        };
        self.serverSocket.emit('reviewProductOrServiceSuccess', response)
    })

}

module.exports = ProductsAndServiceController;