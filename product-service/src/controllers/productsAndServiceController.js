








const Product = require('../models/productModel');
const elasticSearch = require('elasticsearch');
const saveProductToElasticSearch = require('../utils/elasticSearch');


function ProductsAndServiceController() {
    this.productClient;
    this.serverSocket;
}

ProductsAndServiceController.prototype.mountSocket = function({ productClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.serverSocket =serverSocket ? serverSocket : null;
    return this;
}

ProductsAndServiceController.prototype.getSocketDetails = function() {
    return ({
        productClient: this.productClient,
        serverSocket: this.serverSocket,
    });
}
// TODO... save product or service to elastice search data base
ProductsAndServiceController.prototype.createProductOrService = async function(data= {}) {
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