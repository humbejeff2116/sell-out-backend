








/**
 * @class 
 *  products and service controller class 
 * @module ProductsAndServiceController
 */
function ProductsAndServiceController() {
    this.productOrServiceClient;
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
ProductsAndServiceController.prototype.mountSocket = function({ productOrServiceClient, userClient, gatewayServerSocket }) {
    this.productOrServiceClient = productOrServiceClient ? productOrServiceClient : null;
    this.userClient = userClient ? userClient : null;
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
ProductsAndServiceController.prototype.createProduct = function(data = {}) {
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

ProductsAndServiceController.prototype.createProductResponse = function(io) {
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

ProductsAndServiceController.prototype.getProducts = function(socketId) {
    this.userClient.emit('getProducts', socketId);
    console.log("getting products"); 
}
ProductsAndServiceController.prototype.getProductsResponse = function(io) {
    const self = this;
    this.userClient.on('gottenProducts', function(response) {
        const { socketId } = response;
        console.log('sending products to', socketId);
        console.log("response data is",response.data)
        io.to(socketId).emit('gottenProducts', response);  
    });  
}


ProductsAndServiceController.prototype.createService = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to create service card"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('createService', data);
}

ProductsAndServiceController.prototype.createServiceResponse = function(io) {

    this.userClient.on('createServiceNetworkError',function(response) {
        self.gatewayServerSocket.emit('createServiceNetworkError', response);
        console.log('service create network eror');
    });
   
    this.userClient.on('createServiceUserError', function(response) {
        const { socketId, ...rest } = response.data;
        io.to(socketId).emit('createServiceUserError', response);
        console.log(response);
    });

    this.userClient.on('serviceCreated', function(response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('serviceCreated', response);
        console.log(response);
    });   
}

ProductsAndServiceController.prototype.getServices = function(socketId) {
    this.userClient.emit('getServices', socketId);
    console.log("getting Services"); 
}
ProductsAndServiceController.prototype.getServicesResponse = function(io) {
    const self = this;
    this.userClient.on('gottenServices', function(response) {
        const { socketId } = response;
        console.log('sending Services to', socketId);
        io.to(socketId).emit('gottenServices', response);  
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

/** 
 * @method starProductOrService
 ** Collects user data from frontend,
 ** Initiates a client server connection with login node
 ** Sends user data from gateway to login node
 ** Listens to login node for response which may include a user not found error, product not found error or star product success
 ** Sends back response to frontend 
 * @param {object} data - the user data collected from the front end which includes the user and product or service to star  
 */
ProductsAndServiceController.prototype.starProductOrService = function(data = {}) {
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
ProductsAndServiceController.prototype.unStarProductOrService = function(data = {}) {
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

/** 
 * @method reviewProductOrService
 ** Collects user data from frontend,
 ** Initiates a client server connection with login node
 ** Sends user data from gateway to login node
 ** Listens to login node for response which may include a user not found error, product not found error or review product success
 ** Sends back response to frontend 
 * @param {object} data - the user data collected from the front end which includes the user and product or service to review
 */
ProductsAndServiceController.prototype.reviewProductOrService = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to leave a review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('reviewProductOrService', data);   
}

ProductsAndServiceController.prototype.reviewProductOrServiceResponse = function(io) {
    const self = this;
    this.userClient.on('reviewProductUserError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('reviewProductUserError', response);
        console.log(response);
    })
    this.userClient.on('reviewProductOrServiceError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('reviewProductOrServiceError', response);
        console.log(response);
    })
    this.userClient.on('reviewProductOrServiceSuccess', function(response) {
        console.log('respone on review success is', response)
        io.sockets.emit('reviewDataChange');
        io.sockets.emit('productDataChange');
    });   
}




ProductsAndServiceController.prototype.replyReviewProductOrService = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to reply a review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('replyReviewProductOrService', data);   
}

ProductsAndServiceController.prototype.replyReviewProductOrServiceResponse = function(io) {
    const self = this;
    
    this.userClient.on('replyReviewProductOrServiceError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('replyReviewProductOrServiceError', response);
        console.log(response);
    })
    this.userClient.on('replyReviewProductOrServiceSuccess', function(response) {
        console.log('respone on review is', response)
        io.sockets.emit('productDataChange');
    });   
}


ProductsAndServiceController.prototype.getProductOrService = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to reply a review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('getProductOrService', data);   
}

ProductsAndServiceController.prototype.getProductOrServiceResponse = function(io) {
    
    this.userClient.on('getProductOrServiceError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('getProductOrServiceError', response);
        console.log(response);
    })
    this.userClient.on('getProductOrServiceSuccess', function(response) {
        const {socketId} = response;
        console.log('respone on get product or service is', response)
        io.to(socketId).emit('getProductOrServiceSuccess', response); 
    });   
}
// like comment
ProductsAndServiceController.prototype.likeComment = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to reply a review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('likeComment', data);   
}

ProductsAndServiceController.prototype.likeCommentResponse = function(io) {
    
    this.userClient.on('likeCommentError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('likeCommentError', response);
        console.log(response);
    })
    this.userClient.on('likeCommentSuccess', function(response) {
        console.log('respone on like comment is', response)
        io.sockets.emit('productDataChange', response); 
    });   
}

// unlike comment
ProductsAndServiceController.prototype.unLikeComment = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to reply a review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('unLikeComment', data);   
}

ProductsAndServiceController.prototype.unLikeCommentResponse = function(io) {
    
    this.userClient.on('unLikeCommentError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('unLikeCommentError', response);
        console.log(response);
    })
    this.userClient.on('unLikeCommentSuccess', function(response) {
        const {socketId} = response;
        console.log('respone on like comment is', response)
        io.sockets.emit('productDataChange', response); 
    });   
}
// show interest
ProductsAndServiceController.prototype.showInterest = function(data = {}) {
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
        return this.gatewayServerSocket.emit('sameUser', response);

    }
    this.userClient.emit('showInterest', data);   
}

ProductsAndServiceController.prototype.showInterestResponse = function(io) {
    
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


module.exports = ProductsAndServiceController;