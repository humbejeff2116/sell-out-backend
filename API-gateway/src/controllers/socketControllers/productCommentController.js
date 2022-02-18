
/**
 * @class 
 *  user controller class 
 * @module ProductCommentController
 */
 function ProductCommentController() {
    this.userClient;
    this.productClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client which connects to the account service
 * @param {object} productClient - the socket.IO client which connects to the product service
 * @param {object} gatewayServerSocket - clients connecting to the gateway service
 * 
 */
 ProductCommentController.prototype.mountSocket = function({ userClient, productClient, gatewayServerSocket}) {
    this.userClient = userClient ? userClient : null;
    this.productClient = productClient ? productClient : null;
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
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
 ProductCommentController.prototype.reviewProductOrService = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to leave a review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.productClient.emit('reviewProductOrService', data);   
}

ProductCommentController.prototype.reviewProductOrServiceResponse = function(io) {
    const self = this;
    this.productClient.on('reviewProductUserError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('reviewProductUserError', response);
        console.log(response);
    })
    this.productClient.on('reviewProductOrServiceError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('reviewProductOrServiceError', response);
        console.log(response);
    });
    this.productClient.on('reviewProductOrServiceSuccess', function(response) {
        io.sockets.emit('productDataChange');
    });  
}

ProductCommentController.prototype.replyReviewProductOrService = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to reply a review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.productClient.emit('replyReviewProductOrService', data);   
}

ProductCommentController.prototype.replyReviewProductOrServiceResponse = function(io) {
    const self = this;
    
    this.productClient.on('replyReviewProductOrServiceError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('replyReviewProductOrServiceError', response);
        console.log(response);
    })
    this.productClient.on('replyReviewProductOrServiceSuccess', function(response) {
        console.log('response on review is', response)
        io.sockets.emit('productDataChange');
    });   
}

// like comment
ProductCommentController.prototype.likeComment = function(data = {}) {
    const { user } = data;
    if (!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to like a comment"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.productClient.emit('likeComment', data);   
}

ProductCommentController.prototype.likeCommentResponse = function(io) {
    
    this.productClient.on('likeCommentError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('likeCommentError', response);
    })
    this.productClient.on('likeCommentSuccess', function(response) {
        io.sockets.emit('productDataChange', response); 
    }); 
}

// unlike comment
ProductCommentController.prototype.unLikeComment = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to dislike a comment"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.productClient.emit('unLikeComment', data);   
}

ProductCommentController.prototype.unLikeCommentResponse = function(io) {
    
    this.productClient.on('unLikeCommentError', function(response) {
        const {socketId} = response;
        io.to(socketId).emit('unLikeCommentError', response);
    })
    this.productClient.on('unLikeCommentSuccess', function(response) {
        const {socketId} = response;
        io.sockets.emit('productDataChange', response); 
    });   
}

module.exports = ProductCommentController;