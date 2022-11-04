
const User = require('../../models/userModel');

/**
 * @class 
 *  products controller class 
 * @module ProductsController
 */
function ProductsController() {
    this.productClient = null;
    this.gatewayClient = null;
    this.serverSocket = null;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client of the product controller class
 * @param {object} serverSocket - the socket.IO server socket of the account service
 * 
 */
ProductsController.prototype.mountSocket = function ({ productClient, gatewayClient, serverSocket }) {
    this.productClient = productClient || null;
    this.gatewayClient = gatewayClient || null;
    this.serverSocket = serverSocket || null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
ProductsController.prototype.getSocketDetails = function () {
    return ({
        productClient: this.productClient,
        serverSocket: this.serverSocket,
        gatewayClient: this.gatewayClient
    });
}

ProductsController.prototype.addOrRemoveLikeProductNotification = async function (data, io) {
    const { socketId, product, likeCount, user } = data;
    let sellerNotification;
    let response; 

    try {
        // get the user(buyer) document
        const appUser = await User.getUserById(user.id);

        if (parseInt(likeCount) === 0) {
            sellerNotification = {
                type: "disliked product",
                userId: appUser._id,
                userName: appUser.fullName,
                userEmail: appUser.userEmail,
                userProfileImage: appUser.profileImage,
                productId: product.productId,
                message: "Disliked your product",
                seen: false
            }

            const addProductsBuyerLiked = await User.removeProductUserLiked({user, product});
            // TODO... remove user notification
            // const addSellerNotification = await User.removeUserNotification({ userId: product.userId, sellerNotification, type: "liked product" });
            
            if ( addProductsBuyerLiked.status === 201) {
                response = {
                    socketId: socketId,
                    status:201, 
                    error : false, 
                    message : 'product dislike notification added successfully', 
                }
                this.gatewayClient.emit('userDataChange', response);
                return;
            }
            return;
        }

        sellerNotification = {
            type: "liked product",
            userId: appUser._id,
            userName: appUser.fullName,
            userEmail: appUser.userEmail,
            userProfileImage: appUser.profileImage,
            productId: product.productId,
            message: "Liked your product",
            seen: false
        }

        const [addProductsBuyerLiked, addSellerNotification] = await Promise.all([
            User.addProductUserLiked({user, product}),
            User.addUserNotification({ userId: product.userId, sellerNotification })
        ])
        
        if (addSellerNotification.status === 201 && addProductsBuyerLiked.status === 201) {
            response = {
                socketId: socketId,
                status:201, 
                error : false, 
                message : 'product like notification added successfully', 
            }

            this.gatewayClient.emit('userDataChange', response);
        }
    } catch(err) {
        console.error(err);
    } 
}

module.exports = ProductsController;