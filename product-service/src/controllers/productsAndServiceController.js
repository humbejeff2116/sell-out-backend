








const Product = require('../models/productModel');
const Service = require('../models/serviceModel');
const elasticSearch = require('elasticsearch');
const saveProductToElasticSearch = require('../utils/elasticSearch');
const { contentSecurityPolicy } = require('helmet');

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
 * @param {object} serverSocket - the socket.IO server socket of the product-service server
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
ProductsAndServiceController.prototype.createProduct = async function(data= {}) {
    // TODO... save product or service to elastice search data base
    const {socketId} = data;
    const self = this;
    let newProduct = new Product();
    await newProduct.setProductDetails(data);
    await newProduct.save()
    .then( data => {
        console.log('saved product', data);
       const productDetails = data;
       
       
        const response = {
            status: 200, 
            data: productDetails, 
            error: false, 
            message: 'product uploaded successfully',
            socketId: socketId,    
        };
        console.log('ending response', response);
        // send to login node
        return self.serverSocket.emit('productCreated', response);
    });
    
}



ProductsAndServiceController.prototype.getProducts = async function(data) {
    console.log('getting products')
    const products = await Product.getProducts();
    const productsResponse = products.map( product => {
        return ({
                userId: product.userId,
                userName: product.userName,
                userEmail: product.userEmail,
                userProfilePicture: product.userProfilePicture,
                productId: product._id,
                productName: product.productName,
                productCategory: product.productCategory,
                productCountry: product.productCountry,
                productState: product.productState,
                productUsage: product.productUsage,
                productCurrency: product.productCurrency,
                productPrice: product.productPrice,
                productContactNumber: product.productContactNumber,
                productImages: product.productImages,
                stars: product.stars,
                unstars: product.unstars,
                reviews: product.reviews,
        });
    });
    const response = {
        socketId: data,
        data: productsResponse,
        message:"gotten products data successfully"
    }
    this.serverSocket.emit('gottenProducts', response);
}




ProductsAndServiceController.prototype.createService = async function(data= {}) {
    // TODO... save  service to elastice search data base
    const self = this;
    const {socketId} = data;
    let newService = new Service();
    await newService.setServiceDetails(data);
    await newService.save()
    .then( data => {
       const serviceDetails = {
       
       }
       console.log('saved service', data);
        const response = {
            status: 200, 
            data: serviceDetails, 
            error: false, 
            socketId: socketId,
            message: 'service uploaded successfully',    
        };
        return self.serverSocket.emit('serviceCreated', response);
    });
    
}
ProductsAndServiceController.prototype.getServices = async function(data) {
    console.log('getting Services ')
    const services  = await Service.getServices();

    const servicesResponse = services.map( service => {
        return ({ 
                userId: service.userId,
                userName: service.userName,
                userEmail: service.userEmail,
                userProfilePicture: service.userProfilePicture,
                serviceId: service._id,
                serviceName: service.serviceName,
                serviceCategory: service.serviceCategory,
                serviceCountry:service.serviceCountry,
                serviceState: service.serviceState,
                serviceContactNumber: service.serviceContactNumber,
                serviceImages: service.serviceImages,
                stars: service.stars,
                unstars: service.unstars,
                reviews: service.reviews,
        });
    });
    const response = {
        data: servicesResponse,
        socketId: data,
        message:"gotten products data successfully"
    }
    this.serverSocket.emit('gottenServices', response);
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
    const { productOrService, socketId , reviewMessage} = data;
    const self = this;
    if (productOrService.serviceId) {
        const service = await Service.getServiceById(productOrService.serviceId);
        if (!service) {
            const response = {
                status: 401,
                socketId: socketId,
                error: true, 
                message: 'service not found',    
            };
            this.serverSocket.emit('reviewProductOrServiceError', response);
            return; 
        }

        await service.review(reviewMessage);
        await service.save()
        .then(data => {
            const response = {
                status:201, 
                socketId: socketId,
                data, 
                error: false, 
                message: 'service reviewed successfully', 
            };
           return self.serverSocket.emit('reviewProductOrServiceSuccess', response)
        });
        return;
    }
    const product = await Product.getProductById(productOrService.productId);
    if (!product) {
        const response = {
            status: 401,
            socketId: socketId,
            error: true, 
            message: 'product not found',    
        };
        return this.serverSocket.emit('reviewProductOrServiceError', response);
    }
    await product.review(reviewMessage);
    await product.save()
    .then(data => {
        const response = {
            status:201, 
            socketId: socketId,
            error: false, 
            message: ' product reviewed successfully', 
        };
        self.serverSocket.emit('reviewProductOrServiceSuccess', response)
    });
   
}

ProductsAndServiceController.prototype.getReviews = async function(data) {
    const {socketId, productOrService } = data;
    
    console.log('getting reviews')
    if (productOrService.serviceId) {
        const service = await Service.getServiceById(productOrService.serviceId);
        if (!service) {
            console.error("service not found");
            return
        }
        const serviceResponse = service.reviews;
            const response = {
                socketId: socketId,
                data: serviceResponse,
                message: "gotten service review successfully"
            }
        return this.serverSocket.emit('gottenReviews', response);
    }

    const product = await Product.getProductById(productOrService.productId);
    const productResponse = product.reviews;
    const response = {
        socketId: socketId,
        data: productResponse,
        message: "gotten product review successfully"
    }
    return this.serverSocket.emit('gottenReviews', response);
}

module.exports = ProductsAndServiceController;