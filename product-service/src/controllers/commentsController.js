

const Comment = require('../models/commentModel');






/**
 * @class 
 *  comments controller class 
 * @module CommentsController
 */
 function  CommentsController() {
    this.productClient;
    this.serverSocket;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client of the product and service controller class
 * @param {object} serverSocket - the socket.IO server socket of the product-service server
 * 
 */
 CommentsController.prototype.mountSocket = function({ productClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.serverSocket =serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
 CommentsController.prototype.getSocketDetails = function() {
    return ({
        productClient: this.productClient,
        serverSocket: this.serverSocket,
    });
}



CommentsController.prototype.likeComment = async function(data= {}) {
   
    console.log("", data)
    const {socketId, commentId, user} = data;
    const self = this;

    const comment = await Comment.getCommentById(commentId);
    if (!comment) {
        const response = {
            socketId: socketId,
            error: true,
            status: 401,
            message: "comment not found"
        }
        return self.serverSocket.emit('likeCommentError', response);
    }
    comment.addLikeCommentRecieved(data);
    comment.removeUnlikeCommentRecieved(data);
    await comment.save()
    .then( comment => {
        const response = {
            socketId: socketId,
            user: user,
            comment: comment,
            error: true,
            status: 201,
            message: "comment liked successfully"
        }
        return self.serverSocket.emit('likeCommentSuccess', response);

    })
    .catch(e => console.error(e.stack))

}


CommentsController.prototype.unLikeComment = async function(data= {}) {
   
    console.log("", data)
    const {socketId, commentId, user} = data;
    const self = this;

    const comment = await Comment.getCommentById(commentId);
    if (!comment) {
        const response = {
            socketId: socketId,
            error: true,
            status: 401,
            message: "comment not found"
        }
        return self.serverSocket.emit('unLikeCommentError', response);
    }
    comment.addUnlikeCommentRecieved(data);
    comment.removeLikeCommentRecieved(data);
    await comment.save()
    .then( comment => {
        const response = {
            socketId: socketId,
            user: user,
            comment: comment,
            error: true,
            status: 401,
            message: "comment unLiked successfully"
        }
        return self.serverSocket.emit('unLikeCommentSuccess', response);

    })
    .catch(e => console.error(e.stack))

}

module.exports = CommentsController;