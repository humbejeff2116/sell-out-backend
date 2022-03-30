
const Product = require('../../models/productModel');
const elasticSearch = require('elasticsearch');
const saveProductToElasticSearch = require('../../utils/elasticSearch');

/**
 * @class 
 *  products  controller class 
 * @module ProductsController
 */
function ProductsController() {

    this.userClient = null;

    this.serverSocket = null;

}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client of the product controller class
 * @param {object} serverSocket - the socket.IO server socket of the product-service server
 * 
 */
ProductsController.prototype.mountSocket = function({ userClient, serverSocket}) {

    this.userClient = userClient ? userClient : null;

    this.serverSocket =serverSocket ? serverSocket : null;

    return this;

}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
ProductsController.prototype.getSocketDetails = function() {

    return ({
        productClient: this.userClient,
        serverSocket: this.serverSocket,
    });

}

ProductsController.prototype.likeProduct =  async function(data = {}, callback = f => f) {

    const { socketId, user, product, likeCount } = data;

    try {

        const sellerProduct = await Product.getProductById(product.productId);

        const self = this;
    
        if (!sellerProduct) {

            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'seller product not found', 
            }

            return callback(response)

        }

        if (parseInt(likeCount) === 0) {
           
            const updateProductLike = await Product.removeLike(data)

            if (updateProductLike.status === 201) {

                const response = {
                    status:201, 
                    socketId: socketId, 
                    error: false,
                    likeCount: 0,
                    product: product,
                    user: user, 
                    message: 'like removed successfully', 
                }
               
                callback(response)

                return self.userClient.emit('likeProductSuccess', response)

            }

        }

        const updateProductLike = await Product.addLike(data)


        if (updateProductLike.status === 201) {

            const response = {
                status:201,
                socketId: socketId, 
                error: false,
                likeCount: 1,
                product: product,
                user: user,  
                message: 'product liked successfully', 
            }
           
            callback(response);

            self.userClient.emit('likeProductSuccess', response)
           
        }

    } catch(err) {

        console.error(err)

    }

}


ProductsController.prototype.searchProducts =  async function(data = {}, callback = f => f) {

    const { socketId, user, query } = data;

    const self = this

    let response;

    try {


        // TODO... send query to account service and update user search model propety

        console.log("search query is", query);

        if(!query || typeof query !=="string" ) {

            response = {
                status: 401,
                error: true,
                socketId: socketId,
                message: "Inappropriate query parameter entered",
                data: null
            }
    
           callback(response)

           return;
        }

        const searchProducts = await Product.searchProducts(query.toString());

        console.log("search products", searchProducts)

        data.searchProductsLength = searchProducts.length;

        self.userClient.emit('updateUserSearchData', data)

        if (searchProducts.length < 1) {

            response = {
                status: 400,
                error: false,
                socketId: socketId,
                message: 'No product matches your search',
                data: []
            }

           return callback(response)

        }

        response = {
            status: 200,
            error: false,
            socketId: socketId,
            message: "gotten products data successfully",
            data: searchProducts
        }

        callback(response)

        

    } catch (err) {

        console.error(err);

        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while making your search",
            data: null
        }

       callback(response)

    }
 
}
    
module.exports = ProductsController;