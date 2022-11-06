
// NOTE: this controller module/class has been retired
// HINT: moved controller functionalities to product controller 
// TODO... remove/delete module
const Review = require('../../models/commentModel');

/**
 * @class 
 *  comments controller class 
 * @module ProductCommentController
 */
 function  ProductCommentController() {
    this.userClient = null;
    this.serverSocket = null;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client of the product controller class
 * @param {object} serverSocket - the socket.IO server socket of this product-service server
 * 
 */
 ProductCommentController.prototype.mountSocket = function ({ userClient, serverSocket }) {
    this.userClient = userClient || null;
    this.serverSocket = serverSocket || null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
 ProductCommentController.prototype.getSocketDetails = function () {
    return ({
       userClient: this.userClient,
        serverSocket: this.serverSocket,
    });
}


ProductCommentController.prototype.likeReview = async function (data= {}, callback = f => f) {
    const {socketId, commentId, user} = data;
    const self = this;

    try {
        const review = await Review.getCommentById(commentId);

        if (!review) {
            const response = {
                socketId: socketId,
                error: true,
                status: 401,
                message: "comment not found"
            }
            return callback(response);
        }
        
        const updateCommentLike = await Review.addCommentLike(data);
        const updateCommentDislike = await Review.removeCommentDislike(data);

        if ((updateCommentLike.status === 201) && (updateCommentDislike.status === 201)) {
            const response = {
                socketId: socketId,
                user: user,
                comment: comment,
                error: true,
                status: 201,
                message: "review liked successfully"
            }
            callback(response);
            self.userClient.emit('likeReviewSuccess', response);
        }
    } catch (err) {
        console.error(err)  
    } 
}

ProductCommentController.prototype.dislikeReview = async function(data= {}, callback = f =>f) {

    try {
        const {socketId, commentId, user} = data;
        const self = this;
        const comment = await Review.getCommentById(commentId);

        if (!comment) {
            const response = {
                socketId: socketId,
                error: true,
                status: 401,
                message: "comment not found"
            }
            return callback(response);
        }
        
        const addCommentDislike = await Review.addCommentDislike(data);
        const removeCommentDislike = await Review.removeCommentLike(data);

        if ((addCommentDislike.status === 201) &&(removeCommentDislike.status === 201)) {
            const response = {
                socketId: socketId,
                user: user,
                comment: comment,
                error: true,
                status: 401,
                message: "comment disliked successfully"
            }
            callback(response);
            self.userClient.emit('dislikeReviewSuccess', response);
        }

    } catch (err) {
        console.error(err) 
    }
}

module.exports = ProductCommentController;