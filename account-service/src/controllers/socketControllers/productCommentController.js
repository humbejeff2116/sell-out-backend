

const User = require('../../models/userModel');

/**
 * @class 
 *  products and service controller class 
 * @module ProductCommentController
 */
 function ProductCommentController() {
    this.productClient;
    this.gatewayClient;
    this.serverSocket;
    this.allConnectedSockets;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client of the product and service controller class
 * @param {object} serverSocket - the socket.IO server socket of the login server
 * @param {object} gatewayClient - the socket.IO client of the gateway server
 * 
 */
 ProductCommentController.prototype.mountSocket = function({allConnectedSockets, productClient, gatewayClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.gatewayClient = gatewayClient ? gatewayClient : null;
    this.serverSocket = serverSocket ? serverSocket : null;
    this.allConnectedSockets = allConnectedSockets ? allConnectedSockets : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
 ProductCommentController.prototype.getSocketDetails = function() {
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

ProductCommentController.prototype.reviewProductOrServiceResponse = async function(response, io) {
    const self = this;
    const {user, productOrService, comment } = response;
    const appUser = await User.getUserByEmail(user.userEmail);
    const seller = await User.getUserByEmail(productOrService.userEmail);
    let notification;
    try {
        if (productOrService.hasOwnProperty("serviceId")) {
            notification = {
                type: "reviewService",
                userId: appUser._id,
                userName: appUser.fullName,
                userEmail: appUser.userEmail,
                userProfileImage: appUser.profileImage,
                serviceId: productOrService.serviceId,
                name: productOrService.serviceName,
                action: "left a comment",
                seen: false
            }

        } else {
            notification = {
                type: "reviewProduct",
                userId: appUser._id,
                userName: appUser.fullName,
                userEmail: appUser.userEmail,
                userProfileImage: appUser.profileImage,
                productId: productOrService.productId,
                name: productOrService.productName,
                message: "left a comment",
                seen: false
            }
        }
        if (appUser.userEmail === seller.userEmail) {
            appUser.addCommentsUserMade(response);
            appUser.addUserNotification(notification);
            let updatedUser = await appUser.save();
            io.emit('reviewProductOrServiceSuccess', response);
            return;
        }
        appUser.addCommentsUserMade(response);
        seller.addUserNotification(notification);
        const updatedSeller = await seller.save()
        const updatedUser = await appUser.save();
        io.emit('reviewProductOrServiceSuccess', response);

    } catch(err) {
        console.error(err.stack);
    }     
}



ProductCommentController.prototype.replyReviewProductOrServiceResponse = async function(response, io) {
    // TODO... add a notifications here
    try {
        const self = this;
        const { user, comment } = response;
        const appUser = await User.getUserByEmail(user.userEmail);
        const commentOwner = await User.getUserByEmail(comment.userEmail);
        
        const notification = {
            type: "replyComment",
            userId: appUser._id,
            userName: appUser.fullName,
            userEmail: appUser.userEmail,
            userProfileImage: appUser.profileImage,
            commentId: comment._id,
            name: comment.productOrServiceName,
            action: "replied to your comment",
            seen: false
        }
        if (appUser.userEmail === commentOwner.userEmail) {
            appUser.addRepliesUserMade(response);
            appUser.addUserNotification(notification);
            const updatedUser = await appUser.save();
            appUser.save()
            console.log('user after attaching replies user made', updatedUser)
            return io.emit('replyReviewProductOrServiceSuccess', response);   
        }
        
        commentOwner.addUserNotification(notification);
        await commentOwner.save();
        appUser.addRepliesUserMade(response);
        const updatedUser = await appUser.save();
        console.log('user after attaching replies user made', updatedUser)
       io.emit('replyReviewProductOrServiceSuccess', response);      
    } catch (err) {
        console.error(err.stack)   
    }  
}


// like comment

ProductCommentController.prototype.likeCommentResponse = async function(response, io) {
    // TODO... add a notifications here
    try {
        const self = this;
        const { user, comment } = response;
        const appUser = await User.getUserByEmail(user.userEmail);
        const commentOwner = await User.getUserByEmail(comment.userEmail);
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
        if (appUser.userEmail === commentOwner.userEmail) {
            appUser.addCommentUserLiked(response);
            appUser.addUserNotification(notification);
            const updatedUser = await appUser.save();
            return io.emit('likeCommentSuccess', response);
        }
        
        commentOwner.addUserNotification(notification);
        await commentOwner.save();
        appUser.addCommentUserLiked(response);
        const updatedUser = await appUser.save();
        self.serverSocket.emit('likeCommentSuccess', response);  
    } catch (err) {
        console.error(err.stack)   
    }      
}
// unlike comment
ProductCommentController.prototype.unLikeCommentResponse = async function(response, io) {
    // TODO... add a notifications here
    try {
        const self = this;
        const { user, comment } = response;
        const appUser = await User.getUserByEmail(user.userEmail);
        const commentOwner = await User.getUserByEmail(comment.userEmail);
        const notification = {
            type: "unlikeComment",
            userId: appUser._id,
            userName: appUser.fullName,
            userEmail: appUser.userEmail,
            userProfileImage: appUser.profileImage,
            commentId: comment._id,
            name: comment.productOrServiceName,
            action: "unliked your comment",
            seen: false
        }
        if (appUser.userEmail === commentOwner.userEmail) {
            appUser.addCommentUserUnLiked(response);
            appUser.addUserNotification(notification);
            const updatedUser = await appUser.save();
            return io.emit('unLikeCommentSuccess', response); 
        } 
        commentOwner.addUserNotification(notification);
        await commentOwner.save()
        appUser.addCommentUserUnLiked(response);
        const updatedUser = await appUser.save();
        io.emit('unLikeCommentSuccess', response);
        
    } catch (err) {
        console.error(err.stack)  
    }  
}
module.exports = ProductCommentController;