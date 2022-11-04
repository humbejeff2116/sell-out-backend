
const User = require('../../models/userModel');

/**
 * @class 
 *  products controller class 
 * @module ProductReviewController
 */
 function ProductReviewController() {
    this.productClient = null;
    this.gatewayClient = null;
    this.serverSocket = null;
    this.allConnectedSockets = null;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client of the product controller class
 * @param {object} serverSocket - the socket.IO server socket of the login server
 * @param {object} gatewayClient - the socket.IO client of the gateway server
 * 
 */
 ProductReviewController.prototype.mountSocket = function ({
    allConnectedSockets, 
    productClient, 
    gatewayClient, 
    serverSocket
}) {
    this.productClient =  productClient || null;
    this.gatewayClient = gatewayClient || null;
    this.serverSocket = serverSocket || null;
    this.allConnectedSockets = allConnectedSockets || null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
 ProductReviewController.prototype.getSocketDetails = function () {
    return ({
        productClient: this.productClient,
        gatewayClient: this.gatewayClient,
        serverSocket: this.serverSocket,
        allConnectedSockets: this.allConnectedSockets,
    });
}

/**
 * @method reviewProductOrService
 ** response from product service after reviewing product
 * @param {object} response- response from product service
 * @param {object} io- the socket-io connection
 */
ProductReviewController.prototype.addReviewProductNotification = async function (response, io, socket) {
    const { userId, productId, review, socketId } = response;
    
    try {
        const appUser = await User.getUserById(userId);
        const  notification = {
            type: "reviewProduct",
            userId: appUser._id,
            userName: appUser.fullName,
            userEmail: appUser.userEmail,
            userProfileImage: appUser.profileImage,
            productId: productId,
            message: "Reviewed your product",
            seen: false
        };

        const [updateCommentsBuyerMade, addSellerNotification] = await Promise.all([
            User.addCommentUserMade(response),
            User.addUserNotification({ userId, notification })
        ])

        if (updateCommentsBuyerMade.status === 201 && addSellerNotification === 201) {
            this.gatewayClient.emit('userDataChange', response);
        }
    } catch(err) {
        console.error(err);
        this.sendError(
            socketId, 
            500, 
            true, 
            "An error occured while adding product review notification", 
            "addReviewNotificationError", 
            socket
        )
    }
}

ProductReviewController.prototype.addReplyReviewProductNotification = async function (response, io, socket) {
    const { user, comment, socketId } = response;

    try {
        const appUser = await User.getUserByEmail(user.userEmail);
        const notification = {
            type: "replyReview",
            userId: appUser._id,
            userName: appUser.fullName,
            userEmail: appUser.userEmail,
            userProfileImage: appUser.profileImage,
            commentId: comment._id,
            name: comment.productOrServiceName,
            action: "replied to your review",
            seen: false
        }

        const [updateCommentReplyBuyerMade, addSellerNotification] = await Promise.all([
            User.addRepliesUserMade(response),
            User.addUserNotification({ userId: comment.userId, notification })
        ])

        if (updateCommentReplyBuyerMade.status === 201 && addSellerNotification === 201) {
            this.gatewayClient.emit('userDataChange', response);
        }
  
    } catch (err) {
        console.error(err); 
        this.sendError(
            socketId, 
            500, 
            true, 
            "An error occured while adding reply product review notification", 
            "replyReviewNotificationError", 
            socket
        )
    } 
}

// like comment
ProductReviewController.prototype.addLikeCommentNotification = async function (response, io, socket) {
    const { user, comment, socketId } = response;
   
    try {
        const appUser = await User.getUserByEmail(user.userEmail);
        const notification = {
            type: "likeComment",
            userId: appUser._id,
            userName: appUser.fullName,
            userEmail: appUser.userEmail,
            userProfileImage: appUser.profileImage,
            commentId: comment._id,
            name: comment.productOrServiceName,
            action: "liked your comment",
            seen: false
        }

        const [updateCommentBuyerLiked, addSellerNotification] = await Promise.all([
            User.addCommentUserLiked(response),
            User.addUserNotification({ userId: comment.userId, notification })
        ])

        if (updateCommentBuyerLiked.status === 201 && addSellerNotification === 201) {
            this.gatewayClient.emit('userDataChange', response);
        }
        
    } catch (err) {
        console.error(err);
        this.sendError(
            socketId, 
            500, 
            true, 
            "An error occured while adding like product review notification", 
            "likeReviewNotificationError", 
            socket
        )
    }  
}
// dislike comment
ProductReviewController.prototype.addDislikeCommentNotification = async function (response, io, socket) {
    const { user, comment, socketId } = response;
   
    try {
        const appUser = await User.getUserByEmail(user.userEmail);
        const notification = {
            type: "dislikeReview",
            userId: appUser._id,
            userName: appUser.fullName,
            userEmail: appUser.userEmail,
            userProfileImage: appUser.profileImage,
            commentId: comment._id,
            name: comment.productOrServiceName,
            action: "disliked your review",
            seen: false
        }

        const [updateCommentBuyerDisliked, addSellerNotification] = await Promise.all([
            User.addCommentUserDisliked(response),
            User.addUserNotification({ userId: comment.userId, notification })
        ])
        
        if (updateCommentBuyerDisliked.status === 201 && addSellerNotification === 201) {
            this.gatewayClient.emit('userDataChange', response);
        }
    } catch (err) {
        console.error(err); 
        this.sendError(
            socketId, 
            500, 
            true, 
            "An error occured while adding dislike product review notification", 
            "dislikeReviewNotificationError", 
            socket
        )
    } 
}

ProductReviewController.prototype.sendError = function (
    socketId, 
    status, 
    error, 
    message, 
    eventName, 
    serverSocket
) {
    const response = {
        socketId,
        status,
        error, 
        message, 
    }
    serverSocket.emit(eventName, response);
}

module.exports = ProductReviewController;