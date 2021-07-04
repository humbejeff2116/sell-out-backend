








const Product = require('../models/productModel');
const Service = require('../models/serviceModel');
const Comment = require('../models/commentModel');
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
    console.log("creating product details", data)
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
        return self.serverSocket.emit('productCreated', response);
    });
    
}



ProductsAndServiceController.prototype.getProducts = async function(data) {
    console.log('getting products')
    const products = await Product.getProducts();
    const comments = await Comment.getAllComments();
    console.log("comments are", comments)
    if(products && comments) {
        for (let i = 0; i < products.length; i++) {
            for (let j = 0; j < comments.length; j++) {
                if(products[i]._id.toString() === comments[j].productOrServiceId.toString()) {
                    products[i].comments.push(comments[j])
                }
            }
        }
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
                    comments: product.comments,
            });
        });
    
        console.log("product response after merging comments")
        console.log(productsResponse);
        const response = {
            socketId: data,
            data: productsResponse,
            message:"gotten products data successfully"
        }
        this.serverSocket.emit('gottenProducts', response);

    }

 
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
    const comments = await Comment.getAllComments();
    for (let i = 0; i < services.length; i++) {
        for (let j = 0; j < comments.length; j++) {
            if(services[i]._id.toString() === comments[j].productOrServiceId.toString()) {
                services[i].comments.push(comments[j])
            }
        }
    }

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
                comments: service.comments,
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
ProductsAndServiceController.prototype.commentOnProductOrService =  async function(data ={}) {
    const { productOrService, socketId, user } = data;
    console.log(data)
    const self = this;

    if (productOrService.serviceId) {
        const service = await Service.getServiceById(productOrService.serviceId);
        if (!service) {
            const response = {
                status: 401,
                error: true, 
                socketId: socketId,
                message: 'service not found',    
            };
            this.serverSocket.emit('reviewProductOrServiceError', response);
            return; 
        }
        const newComment = new Comment();
        newComment.setServiceCommentDetails(data);
        newComment.save()
        .then( data => {
            const response = {
                status:201,
                error: false, 
                socketId: socketId,
                comment: data,
                user: user, 
                productOrService: productOrService, 
                message: 'service reviewed successfully', 
            };
            console.log("service after review", data)
           return self.serverSocket.emit('reviewProductOrServiceSuccess', response)

        });
        return;
    }
    const product = await Product.getProductById(productOrService.productId);
    if (!product) {
        const response = {
            status: 401,
            error: true, 
            socketId: socketId,
            message: 'product not found',    
        };
        this.serverSocket.emit('reviewProductOrServiceError', response);
        return; 
    }
    const newComment = new Comment();
    newComment.setProductCommentDetails(data);
    newComment.save()
    .then( comment => {
        const response = {
            status:201, 
            error: false,
            socketId: socketId,
            comment: comment,
            user: user, 
            productOrService: productOrService,
            message: 'product reviewed successfully', 
        };
        console.log("service after review", data)
       return self.serverSocket.emit('reviewProductOrServiceSuccess', response)

    });
    
}


ProductsAndServiceController.prototype.replyCommentOnProductOrService =  async function(data = {}) {
    const { commentId, user, socketId, replyMessage } = data;
    const self = this;
    const comment = Comment.getCommentById(commentId);
    if(!comment) {
        const response ={
            error:true,
            status:401,
            socketId: socketId,
            message: `comment with id: ""${commentId}"" not found`,
        }
        self.serverSocket.emit('replyReviewProductOrServiceError', response)
        console.error("no comment found");
        return;
    }
    const replyData = {
        userName: user.fullName,
        userId: user.id,
        userEmail: user.userEmail,
        commentId: commentId,
        replyMessage: replyMessage,
        replyTime: replyTime ? replyTime : Date.now() 
    }
    comment.addCommentReply(replyData)
    comment.save()
    .then( comment => {
        console.log("comment after replying")
        console.log(comment);
        const response ={
            error: false,
            status: 201,
            socketId: socketId,
            user: user, 
            comment: comment,
            message: 'reply on comment successfull', 

        }
        self.serverSocket.emit('replyReviewProductOrServiceSuccess', response) 
    })
    .catch(e => console.error(e.stack));
}
    
module.exports = ProductsAndServiceController;