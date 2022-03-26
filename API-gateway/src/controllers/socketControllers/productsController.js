
/**
 * @class 
 *  products and service controller class 
 * @module ProductsController
 */
function ProductsController() {

    this.productClient;

    this.dataMergerClient;

    this.gatewayServerSocket;
    
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} productOrServiceClient - the socket.IO client of the product and service controller class
 * @param {object} gatewayServerSocket - the socket.IO server socket of the gateway server
 * 
 */
 ProductsController.prototype.mountSocket = function({ productClient, dataMergerClient, userClient, gatewayServerSocket }) {

    this.productClient = productClient ? productClient : null;

    this.dataMergerClient = dataMergerClient ? dataMergerClient : null;

    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;

    return this;

}

ProductsController.prototype.likeProduct = function(io, socket, data = {}) {

    const { user, likeCount, seller } = data;

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

            const { socketId, ...rest } = response;

            io.to(socketId).emit('likeProductError', response);

            return
        }

        io.sockets.emit('likeProductDataChange');

    })

}

ProductsController.prototype.searchProducts = function(io, socket, data = {}) {

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

        console.log("seacrh response", response)

        if (response.error) {

            io.to(socketId).emit('searchProductsError', response);

            return

        }

        io.to(socketId).emit('searchProductsSuccess', response);

    })

}

module.exports = ProductsController;