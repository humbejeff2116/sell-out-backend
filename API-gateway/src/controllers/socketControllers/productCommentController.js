
/**
 * @class 
 *  user controller class 
 * @module ProductCommentController
 */
 function ProductCommentController() {

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
 ProductCommentController.prototype.reviewProduct = function(io, socket, data = {}) {

    const { user } = data;

    if (!user) {

        const response = {
            error:true,
            status:403,
            message:"you must log in to leave a review"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);

    }

    this.productClient.emit('reviewProduct', data, (response) => {
        
        if (response.error ) {

            const { socketId, ...rest } = response;

            io.to(socketId).emit('reviewProductError', response);

            return
        }

        io.emit('reviewDataChange');

    });

}

ProductCommentController.prototype.replyReviewProduct = function(io, socket, data = {}) {

    const { user } = data;

    if (!user) {

        const response = {
            error:true,
            status:403,
            message:"you must log in to reply a review"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);

    }

    this.productClient.emit('replyReviewProduct', data, (response) => {

        if (response.error ) {

            const { socketId, ...rest } = response;

            io.to(socketId).emit('replyReviewProductError', response);

            return
        }

        io.emit('reviewDataChange');

    });

}

// like comment
ProductCommentController.prototype.likeReview = function(io, socket, data = {}) {

    const { user } = data;

    if (!user) {

        const response = {
            error:true,
            status:403,
            message:"you must log in to like a comment"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('likeReview', data, (response) => {

        if (response.error ) {

            const { socketId, ...rest } = response;

            io.to(socketId).emit('likeReviewError', response);

            return
        }

        io.emit('reviewDataChange');

    });
       
}


// unlike comment
ProductCommentController.prototype.dislikeReview = function(io, socket, data = {}) {

    const { user } = data;

    if (!user) {

        const response = {
            error:true,
            status:403,
            message:"you must log in to dislike a comment"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);

    }

    this.productClient.emit('dislikeReview', data, (response) => {

        if (response.error ) {

            const { socketId, ...rest } = response;

            io.to(socketId).emit('dislikeReviewError', response);

            return;

        }

        io.emit('reviewDataChange');

    });

}

module.exports = ProductCommentController;