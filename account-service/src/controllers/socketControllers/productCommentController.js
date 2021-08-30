

const User = require('../../models/userModel');

/**
 * @class 
 *  products and service controller class 
 * @module ProductCommentController
 */
 function ProductCommentController() {
    this.productClient;
    this.serverSocket;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client of the product and service controller class
 * @param {object} serverSocket - the socket.IO server socket of the login server
 * 
 */
 ProductCommentController.prototype.mountSocket = function({ productClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
 ProductCommentController.prototype.getSocketDetails = function() {
    return ({
        productClient: this.productClient,
        serverSocket: this.serverSocket,
    });
}

/**
 * @method reviewProductOrService
 ** used to send user/product data to product or service node to review a product/service 
 ** initiates a client server connection with product or service node
 ** emits a no user found error to gateway if ecountered
 ** collects product or service data from gateway service node and emits to product or service node
 ** recieves a no product found error from product or service node and emits to gateway if ecountered
 ** recieves review success response from product or service node and emits to gateway
 * @param {object} data - the user data collected from gateway node which includes user and product/service 
 */
 ProductCommentController.prototype.reviewProductOrService = async function(data = {}) {

    this.productClient.emit('reviewProductOrService', data);
}

ProductCommentController.prototype.reviewProductOrServiceResponse = async function() {
    // TODO... add a notifications here
    const self = this;

    this.productClient.on('reviewProductOrServiceError', function(response) {
        self.serverSocket.emit('reviewProductOrServiceError', response);
    });

    this.productClient.on('reviewProductOrServiceSuccess', async function(response) {
        const {user, productOrService, comment } = response;
        const appUser = await User.getUserByEmail(user.userEmail);
        const seller = await User.getUserByEmail(productOrService.userEmail);
        let notification;
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
        if(appUser.userEmail === seller.userEmail) {
            appUser.addCommentsUserMade(response);
            appUser.addUserNotification(notification);
            appUser.save()
            .then( user => {
                console.log('user after attaching comments user made', user)
                self.serverSocket.emit('reviewProductOrServiceSuccess', response);
            })
            .catch(e => console.error(e.stack));
            return;
        }
        appUser.addCommentsUserMade(response);
        seller.addUserNotification(notification);
        seller.save()
        appUser.save()
        .then( user => {
            console.log('user after attaching comments user made', user)
            self.serverSocket.emit('reviewProductOrServiceSuccess', response);
        })
        .catch(e => console.error(e.stack)); 
    });
}




ProductCommentController.prototype.replyReviewProductOrService = async function(data = {}) {

    this.productClient.emit('replyReviewProductOrService', data);
}

ProductCommentController.prototype.replyReviewProductOrServiceResponse = async function() {
    // TODO... add a notifications here
    const self = this;

    this.productClient.on('replyReviewProductOrServiceError', function(response) {
        self.serverSocket.emit('replyReviewProductOrServiceError', response);
    });

    this.productClient.on('replyReviewProductOrServiceSuccess', async function(response) {
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
        if(appUser.userEmail === commentOwner.userEmail) {
            appUser.addRepliesUserMade(response);
            appUser.addUserNotification(notification);
            appUser.save()
            .then( user => {
                console.log('user after attaching replies user made', user)
                self.serverSocket.emit('replyReviewProductOrServiceSuccess', response);
            })
            .catch(e => console.error(e.stack));
            return;

        }
        
        commentOwner.addUserNotification(notification);
        commentOwner.save()
        appUser.addRepliesUserMade(response);
        appUser.save()
        .then( user => {
            console.log('user after attaching replies user made', user)
            self.serverSocket.emit('replyReviewProductOrServiceSuccess', response);
        })
        .catch(e => console.error(e.stack)); 
    });
}


// like comment
ProductCommentController.prototype.likeComment = async function(data = {}) {
    this.productClient.emit('likeComment', data);
}

ProductCommentController.prototype.likeCommentResponse = async function() {
    // TODO... add a notifications here
    const self = this;
    this.productClient.on('likeCommentError', function(response) {
        self.serverSocket.emit('likeCommentError', response);
    });

    this.productClient.on('likeCommentSuccess', async function(response) {
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
        if(appUser.userEmail === commentOwner.userEmail) {
            appUser.addCommentUserLiked(response);
            appUser.addUserNotification(notification);
            appUser.save()
            .then( user => {
                // console.log('user after attaching comments user liked ', user)
                self.serverSocket.emit('likeCommentSuccess', response);
            })
            .catch(e => console.error(e.stack));
            return;
        }
        
        commentOwner.addUserNotification(notification);
        commentOwner.save()
        appUser.addCommentUserLiked(response);
        appUser.save()
        .then( user => {
            // console.log('user after attaching comments user liked ', user)
            self.serverSocket.emit('likeCommentSuccess', response);
        })
        .catch(e => console.error(e.stack));
    });
}
// unlike comment
ProductCommentController.prototype.unLikeComment = async function(data = {}) {
    this.productClient.emit('unLikeComment', data);
}

ProductCommentController.prototype.unLikeCommentResponse = async function() {
    // TODO... add a notifications here
    const self = this;
    this.productClient.on('unLikeCommentError', function(response) {
        self.serverSocket.emit('unLikeCommentError', response);
    });

    this.productClient.on('unLikeCommentSuccess', async function(response) {
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
        if(appUser.userEmail === commentOwner.userEmail) {
            appUser.addCommentUserUnLiked(response);
            appUser.addUserNotification(notification);
            appUser.save()
            .then( user => {
                // console.log('user after attaching comments user unliked', user)
                self.serverSocket.emit('unLikeCommentSuccess', response);
            })
            .catch(e => console.error(e.stack));
            return;
        }
        
        commentOwner.addUserNotification(notification);
        commentOwner.save()
        
        appUser.addCommentUserUnLiked(response);
        appUser.save()
        .then( user => {
            // console.log('user after attaching comments user unliked', user)
            self.serverSocket.emit('unLikeCommentSuccess', response);
        })
        .catch(e => console.error(e.stack));
    });
}
module.exports = ProductCommentController;