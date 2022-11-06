
const Product = require('../../models/productModel');
const Collection = require('../../models/collection');
const elasticSearch = require('elasticsearch');
const saveProductToElasticSearch = require('../../utils/elasticSearch');

/**
 * @class 
 *  product controller class 
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
 * @param {object} serverSocket - the socket.IO server socket of this product service
 * 
 */
ProductsController.prototype.mountSocket = function ({ userClient, serverSocket }) {
    this.userClient = userClient || null;
    this.serverSocket =serverSocket || null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
ProductsController.prototype.getSocketDetails = function () {
    return ({
        productClient: this.userClient,
        serverSocket: this.serverSocket,
    });
}

ProductsController.prototype.likeProduct =  async function (data = {}, callback = f => f) {
    const { socketId, user, product, likeCount } = data;
    const self = this;

    try {
        const sellerProduct = await Product.getProductById(product.productId);
        
        if (!sellerProduct) {
            const response = {
                socketId: socketId,
                status: 401, 
                error: true, 
                message: 'seller product not found', 
            }
            return callback(response);
        }

        if (parseInt(likeCount) === 0) { 
            const updateProductLike = await Product.removeLike(data);

            if (updateProductLike.status === 201) {
                const response = {
                    status: 201, 
                    socketId: socketId, 
                    error: false,
                    likeCount: 0,
                    product: product,
                    user: user, 
                    message: 'like removed successfully', 
                }
                callback(response);
                return self.userClient.emit('likeProductSuccess', response);
            }
        }

        const updateProductLike = await Product.addLike(data);

        if (updateProductLike.status === 201) {
            const response = {
                status: 201,
                socketId: socketId, 
                error: false,
                likeCount: 1,
                product: product,
                user: user,  
                message: 'product liked successfully', 
            }
            callback(response);
            self.userClient.emit('likeProductSuccess', response); 
        }
    } catch(err) {
        console.error(err);
        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while placing like",
            data: null
        }
       callback(response);
    }
}


ProductsController.prototype.searchProducts =  async function (data = {}, callback = f => f) {
    const { socketId, user, query } = data;
    const self = this
    let response;

    try {
        // TODO... send query to account service and update user search model propety
        console.log("search query is", query);
        if (!query || typeof query !=="string" ) {
            response = {
                status: 401,
                error: true,
                socketId: socketId,
                message: "Inappropriate query parameter entered",
                data: null
            }
           callback(response);
           return;
        }

        const searchProducts = await Product.searchProducts(query.toString());
        data.searchProductsLength = searchProducts.length;
        self.userClient.emit('updateUserSearchData', data);

        if (searchProducts.length < 1) {
            response = {
                status: 400,
                error: false,
                socketId: socketId,
                message: 'No product matches your search',
                data: []
            }
           return callback(response);
        }

        response = {
            status: 200,
            error: false,
            socketId: socketId,
            message: "gotten products data successfully",
            data: searchProducts
        }
        callback(response);
    } catch (err) {
        console.error(err);
        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while making your search",
            data: null
        }
       callback(response);
    }
}

ProductsController.prototype.getUserProducts =  async function (data = {}, callback = f => f) {
    const { socketId, userId } = data;
    const self = this
    let response;

    try {
        const userProducts = await Product.getUserProductsById(userId);

        if (userProducts.length < 1) {
            response = {
                status: 400,
                error: false,
                socketId: socketId,
                message: 'No product found',
                data: []
            }
           return callback(response);
        }

        response = {
            status: 200,
            error: false,
            socketId: socketId,
            message: "gotten products successfully",
            data: userProducts
        }
        callback(response);
    } catch (err) {
        console.error(err);
        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while get products",
            data: []
        }
       callback(response);
    }
}

ProductsController.prototype.createCollection =  async function (data = {}, callback = f => f) {
    const { socketId } = data;
    let response;
    console.log("creating collection data", data);

    try {
        const userCollection = await Collection.getCollection(data);

        if (!userCollection || userCollection.length < 1) {
            const newUserCollection = new Collection();
            newUserCollection.setDetails(data);
            await newUserCollection.save();

            response = {
                socketId: socketId,
                status: 200,
                error: false, 
                message: 'Collection created successfully ',
                data: null, 
            }
            return callback(response);
        }

        const createCollection = await Collection.addCollection(data);

        if (createCollection.status === 201) {
            response = {
                socketId: socketId,
                status: 200,
                error: false, 
                message: 'Collection created successfully ',
                data: null, 
            }
            callback(response);
            // this.gatewayClient.emit('userDataChange', response);
        }   
    } catch (err) {
        console.error(err);
        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while creating collection",
            data: null
        }
       callback(response);
    }     
}

ProductsController.prototype.getUserCollectionsProducts =  async function (data = {}, callback = f => f) {
    const { socketId, userId } = data;
    const self = this;
    let response;

    console.log("collection data", data);

    try {
        const userCollections = await Collection.getUserCollections(data);
        console.log("collections are", userCollections);

        const userCollectionsProducts = await Product.getCollectionsProducts({ userId, collections: userCollections });
        console.log("collections products", userCollectionsProducts);

        if (userCollectionsProducts.length < 1) {
            response = {
                status: 400,
                error: false,
                socketId: socketId,
                message: 'No collection products found',
                data: []
            }
            return callback(response);
        }

        response = {
            status: 200,
            error: false,
            socketId: socketId,
            message: "gotten collections successfully",
            data: userCollectionsProducts
        }
        callback(response);
    } catch (err) {
        console.error(err);
        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while getting collections",
            data: []
        }
       callback(response);
    }
}


// product reviews controllers
ProductsController.prototype.reviewProduct =  async function ({ 
    productId,
    userId,
    sellerId, 
    socketId,  
    reviewMessage 
}, callback = f => f) {
    const self = this;
    let response = {};

    function userReviewedProduct(userId, product) {
        const reviews = product.reviews;

        if (reviews.length < 1) {
            return false;
        }
        const userIndex = reviews.findIndex(review => review.buyerId === userId);
        return userIndex > -1 ? true : false;
    }

    try {    
        const product = await Product.getProductById(productId);

        if (!product) {
            response = {
                status: 401,
                error: true, 
                socketId: socketId,
                message: 'product not found',    
            }
            return callback(response);
        }

        if (userReviewedProduct(userId, product)) {
            response = {
                status: 403, 
                error: false,
                socketId: socketId,
                message: 'You have already reviewed product', 
            }
            callback(response);
        }

        const reviewProduct = await Product.addReview({ 
            productId, 
            sellerId, 
            userId,  
            reviewMessage 
        });

        if (!reviewProduct.error) {
            response = {
                status: 201, 
                error: false,
                socketId: socketId,
                review: savedComment,
                userId: userId, 
                productId: productId,
                message: 'product review added successfully', 
            }
            callback(response);
            // TODO... rework functionality in account service
            self.userClient.emit('reviewProductSuccess', response);
        }
    } catch(err) {
        console.error(err);
        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while reviewing product",
            data: []
        }
       callback(response);
    }
}

ProductsController.prototype.replyReview = async function (data, callback = f => f) {
    const { socketId, productId, sellerId, buyerId, reply, replyTime } = data;
    let response;

    try {
        const product = await Product.getProductById(productId);
        const productReviews = product.reviews;

        if (!productReviews || productReviews.length < 1) {
            response = {
                socketId: socketId,
                error: false,
                status: 200,
                message: "no product reviews found",
                data: []
            }
            return callback(response);
        }

        const replyReview = await Product.replyReview(data); 
        // modified product reviews
        if (!replyReview.error && (replyReview.data.ok && replyReview.data.n)) {
            response = {
                socketId: socketId,
                error: false,
                status: 200,
                message: "successfully replied review",
                data: replyReview
            }
            return callback(response);
        }   
    } catch (err) {
        console.error(err);
        response = {
            status: 500,
            error: true,
            socketId: socketId,
            message: "An error occured while replying review",
            data: []
        }
       callback(response);   
    }     
}

ProductsController.prototype.getProductReviews =  async function (data = {}, callback = f => f) {
    const { socketId, productId, limit, skip } = data;
    console.log("product id",productId)
    console.log("getting  product reviews :socket (ProductsController) ---productService---")
    let response;

    try {
        const product = await Product.getProductById(productId);
        const productPatch = await product.patchReviews();

        if (!productPatch.reviews || productPatch.reviews.length < 1) {
            response = {
                socketId: socketId,
                error: false,
                status: 200,
                message: "Product has no reviews",
                data: productPatch
            }
            return callback(response);
        }

        response = {
            socketId: socketId,
            error: false,
            status: 200,
            message: "product reviews gotten successfully",
            data: productPatch
        }
        return callback(response);
    } catch (err) {
        console.error(err); 
        response = {
            socketId: socketId,
            error: true,
            status: 500,
            message: "Error occured while getting reviews",
            data: {}
        }
        return callback(response);  
    }     
}

ProductsController.prototype.getSellerReviews =  async function (data = {}, callback = f => f) {
    const { socketId, sellerId, limit, skip } = data;
    let response;

    // TODO... refactor to use parallel proccessing in updating product reviews;
    async function updateReviews(products) {
        if (!products || products.length < 1) {
            return null;
        }

        let allUpdatedReviews = [];
        let len = products.length;

        for (let i = 0; i < len; i++) {
            const updateProductReviews = await products[i].updateReviews(socketId, this.getUser);

            if (updateProductReviews) {
                allUpdatedReviews = [...allUpdatedReviews, ...updateProductReviews];
            }   
        }
        return allUpdatedReviews;
    }

    try {
        const userProducts = await Product.getUserProductsById(sellerId);
        const userReviews = await updateReviews(userProducts);
        
        if (!userReviews || userReviews.length < 1) {
            response = {
                socketId: socketId,
                error: false,
                status: 200,
                message: "no seller reviews found",
                data: []
            }
            return callback(response);
        }

        response = {
            socketId: socketId,
            error: false,
            status: 200,
            message: "user reviews gotten successfully",
            data: userReviews
        }
        return callback(response);
    } catch (err) {
        console.error(err);   
    }     
}

ProductsController.prototype.getUser = async function (data = {}) {
    this.userClient.emit('getUserById', data, (response) => {
        if (!response.error) {
            return response.data;
        }
    })
}
    
module.exports = ProductsController;