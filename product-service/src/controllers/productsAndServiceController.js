








const Product = require('../models/productModel');


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

ProductsAndServiceController.prototype.getProducts =  async function() {

}

ProductsAndServiceController.prototype.getUserProducts =  async function(user = {}) {

}

module.exports = ProductsAndServiceController;