/**
 * @class 
 *  products controller class 
 * @module ProductsController
 */
function ProductsController() {
    this.productClient = null;
    this.dataMergerClient = null;
    this.gatewayServerSocket = null;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client that connects to product service
 * * @param {object} dataMergerClient - the socket.IO client that connects to dataMerger service
 * @param {object} gatewayServerSocket - the socket.IO clients that connect to the gateway
 * 
 */
 ProductsController.prototype.mountSocket = function ({ 
    productClient, 
    dataMergerClient, 
    // userClient, 
    gatewayServerSocket 
}) {
    this.productClient =  productClient || null;
    this.dataMergerClient =  dataMergerClient || null;
    this.gatewayServerSocket =  gatewayServerSocket || null;
    return this;
}

ProductsController.prototype.likeProduct = function (io, socket, data = {}) {
    const { user } = data;

    if (!user) {
        const response = {
            error:true,
            status:401,
            message:"Hi! kindly log in to like product"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('likeProduct', data, (response) => {
        if (response.error) {
            const { socketId } = response;

            io.to(socketId).emit('likeProductError', response);
            return;
        }

        io.sockets.emit('likeProductDataChange');
    })
}

ProductsController.prototype.searchProducts = function (io, socket, data = {}) {
    const { user } = data;

    if (!user) {
        const response = {
            error:true,
            status:401,
            message:"Hi! kindly log in to search for products"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('searchProducts', data, (response) => {
        const { socketId } = response;
        
        if (response.error) {
            io.to(socketId).emit('searchProductsError', response);
            return;
        }

        io.to(socketId).emit('searchProductsSuccess', response);
    })
}

ProductsController.prototype.getUserProducts = function (io, socket, data = {}) {
    const { userId } = data;

    if (!userId) {
        const response = {
            error: true,
            status :401,
            message: "Un-authenticated user"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }
    console.log("getting user products");

    this.productClient.emit('getUserProducts', data, (response) => {
        const { socketId } = response;

        if (response.error) {
            io.to(socketId).emit('getUserProductsError', response);
            return;
        }

        io.to(socketId).emit('getUserProductsSuccess', response);
    })
}

ProductsController.prototype.createCollection = function (io, socket, data = {}) {
    const { userId } = data;

    if (!userId) {
        const response = {
            error:true,
            status:401,
            message:"Un-authenticated user"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('createCollection', data, (response) => {
        const { socketId } = response;
        
        if (response.error) {
            io.to(socketId).emit('createCollectionError', response);
            return;
        }

        io.to(socketId).emit('createCollectionSuccess', response);
        io.to(socketId).emit('userDataChange', response);
    })
}

ProductsController.prototype.getUserCollectionsProducts = function (io, socket, data = {}) {
    const { userId } = data;

    if (!userId) {
        const response = {
            error: true,
            status: 401,
            message: "Un-authenticated user"
        }

        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('getUserCollectionsProducts', data, (response) => {
        const { socketId } = response;

        if (response.error) {
            io.to(socketId).emit('getUserCollectionsProductsError', response);
            return;
        }

        io.to(socketId).emit('getUserCollectionsProductsSuccess', response);
    })
}


/** 
 * @method reviewProduct
 ** Collects user data from client (frontend),
 ** Initiates a client server connection with product service
 ** Sends user data from gateway to product service
 ** Listens to product service for response which may include product not found error or review product success
 ** Sends back response to frontend 
 * @param {object} data - collected from the front end which includes the user and product to review
 */
 ProductsController.prototype.reviewProduct = function(io, socket, data = {}) {
    const { userId } = data;
    let response = {};

    if (!userId) {
        response = {
            error: true,
            status: 403,
            message: "Please log in to review product"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('reviewProduct', data, (response) => {
        if (response.error) {
            const { socketId } = response;

            io.to(socketId).emit('reviewProductError', response);
            return;
        }

        io.emit('reviewDataChange');
    });

}

ProductsController.prototype.replyReview = function(io, socket, data = {}) {
    const { sellerId } = data;

    if (!sellerId) {
        const response = {
            error: true,
            status: 403,
            message:"Please log in and reply review"
        }
        return this.gatewayServerSocket.emit('unRegisteredUser', response);
    }

    this.productClient.emit('replyProductReview', data, (response) => {
        if (response.error ) {
            const { socketId, ...rest } = response;

            io.to(socketId).emit('replyReviewProductError', response);
            return;
        }
        io.emit('reviewDataChange');
    });
}

ProductsController.prototype.getProductReviews = function(io, socket, data = {}) {
    this.productClient.emit('getProductReviews', data, (response) => {
        const { socketId } = response;

        if (response.error) {
            io.to(socketId).emit('getProductReviewsError', response);
            return;
        }

        io.to(socketId).emit('getProductReviewsSuccess', response);
    })
}

ProductsController.prototype.getSellerReviews = function(io, socket, data = {}) {
    this.productClient.emit('getSellerReviews', data, (response) => {
        const { socketId } = response;

        if (response.error) {
            io.to(socketId).emit('getSellerReviewsError', response);
            return;
        }
        io.to(socketId).emit('getSellerReviewsSuccess', response);
    })
}

module.exports = ProductsController;