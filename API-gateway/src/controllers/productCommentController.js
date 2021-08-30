
/**
 * @class 
 *  user controller class 
 * @module ProductCommentController
 */
 function ProductCommentController() {
    this.userClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client of the user controller class
 * @param {object} gatewayServerSocket - the socket.IO server socket of the gateway server
 * 
 */
 ProductCommentController.prototype.mountSocket = function({ userClient, gatewayServerSocket}) {
    this.userClient = userClient ? userClient : null;
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
    this.userClient.emit('reviewProductOrService', data);   
}

ProductCommentController.prototype.reviewProductOrServiceResponse = function(io) {
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
    this.userClient.emit('replyReviewProductOrService', data);   
}

ProductCommentController.prototype.replyReviewProductOrServiceResponse = function(io) {
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

// like comment
ProductCommentController.prototype.likeComment = function(data = {}) {
    const { user } = data;
    if(!user) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to like a comment"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    this.userClient.emit('likeComment', data);   
}

ProductCommentController.prototype.likeCommentResponse = function(io) {
    
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
    this.userClient.emit('unLikeComment', data);   
}

ProductCommentController.prototype.unLikeCommentResponse = function(io) {
    
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
module.exports = ProductCommentController;