/**
 * @class 
 *  ProductReviewController controller class 
 * @module ProductReviewController
 */
 function ProductReviewController() {
    this.productClient = null;
    this.gatewayServerSocket = null;
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
 ProductReviewController.prototype.mountSocket = function ({ 
    userClient, 
    productClient, 
    gatewayServerSocket
}) {
    this.productClient = productClient || null;
    this.gatewayServerSocket = gatewayServerSocket || null;
    return this;
}

// like comment
ProductReviewController.prototype.likeReview = function (io, socket, data = {}) {
    const { userId } = data;

    if (!userId) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to like review"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('likeReview', data, (response) => {
        if (response.error ) {
            const { socketId } = response;

            io.to(socketId).emit('likeReviewError', response);
            return;
        }

        io.emit('reviewDataChange');
    });   
}

// unlike comment
ProductReviewController.prototype.dislikeReview = function (io, socket, data = {}) {
    const { userId } = data;

    if (!userId) {
        const response = {
            error:true,
            status:403,
            message:"you must log in to dislike review"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('dislikeReview', data, (response) => {
        if (response.error) {
            const { socketId } = response;

            io.to(socketId).emit('dislikeReviewError', response);
            return;
        }

        io.emit('reviewDataChange');
    });
}

module.exports = ProductReviewController;