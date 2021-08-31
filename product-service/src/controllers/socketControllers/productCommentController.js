

const Product = require('../../models/productModel');
const Service = require('../../models/serviceModel');
const Comment = require('../../models/commentModel');






/**
 * @class 
 *  comments controller class 
 * @module ProductCommentController
 */
 function  ProductCommentController() {
    this.userClient;
    this.serverSocket;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client of the product and service controller class
 * @param {object} serverSocket - the socket.IO server socket of the product-service server
 * 
 */
 ProductCommentController.prototype.mountSocket = function({ userClient, serverSocket}) {
    this.userClient = userClient ? userClient : null;
    this.serverSocket =serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
 ProductCommentController.prototype.getSocketDetails = function() {
    return ({
       userClient: this.userClient,
        serverSocket: this.serverSocket,
    });
}

/**
 * @method reviewProductOrService
 ** used to add review to a product or service
 ** initiates a server connection with login service node
 ** collects user data from login service
 ** emits a product or service not found error if ecountered
 ** add review to product or service
 ** sends back response to login service 
 * @param {object} data - the product data collected from login node 
 */
 ProductCommentController.prototype.commentOnProductOrService =  async function(data ={}) {
    const { productOrService, socketId, user } = data;
    const self = this;
    try {
        if (productOrService.serviceId) {
            const service = await Service.getServiceById(productOrService.serviceId);
            if (!service) {
                const response = {
                    status: 401,
                    error: true, 
                    socketId: socketId,
                    message: 'service not found',    
                };
                this.serverSocket.emit('reviewProductOrServiceError', response);
                return; 
            }
            const newComment = new Comment();
            newComment.setServiceCommentDetails(data);
            const savedComment = await newComment.save();
            const response = {
                status:201,
                error: false, 
                socketId: socketId,
                comment: savedComment,
                user: user, 
                productOrService: productOrService, 
                message: 'service reviewed successfully', 
            };
            console.log("service after review", savedComment)
            return self.userClient.emit('reviewProductOrServiceSuccess', response);
        }

        const product = await Product.getProductById(productOrService.productId);
        if (!product) {
            const response = {
                status: 401,
                error: true, 
                socketId: socketId,
                message: 'product not found',    
            };
            return this.serverSocket.emit('reviewProductOrServiceError', response);
        }
        const newComment = new Comment();
        newComment.setProductCommentDetails(data);
        const savedComment = await newComment.save();
        const response = {
            status:201, 
            error: false,
            socketId: socketId,
            comment: savedComment,
            user: user, 
            productOrService: productOrService,
            message: 'product reviewed successfully', 
        };
        return self.userClient.emit('reviewProductOrServiceSuccess', response);
        //return self.serverSocket.emit('reviewProductOrServiceSuccess', response);
    } catch(err) {
        console.error(err.stack)
    }
}


ProductCommentController.prototype.replyCommentOnProductOrService =  async function(data = {}) {
    
    try{
        const { commentId, user, socketId, replyMessage, replyTime } = data;
        const self = this;
        const comment = await Comment.getCommentById(commentId);
        if (!comment) {
            const response = {
                error:true,
                status:401,
                socketId: socketId,
                message: `comment with id: ""${commentId}"" not found`,
            }
            self.serverSocket.emit('replyReviewProductOrServiceError', response);
            console.error("no comment found");
            return;
        }
        const replyData = {
            userName: user.fullName,
            userId: user.id,
            userEmail: user.userEmail,
            commentId: commentId,
            replyMessage: replyMessage,
            replyTime: replyTime ? replyTime : Date.now() 
        }
        await comment.addCommentReply(replyData);
        const updatedComment = await comment.save();
        const response = {
            error: false,
            status: 201,
            socketId: socketId,
            user: user, 
            comment: updatedComment,
            message: 'reply on comment successfull', 
        }
        self.userClient.emit('replyReviewProductOrServiceSuccess', response);
    }catch(err){
        console.error(err.stack)
    }   
}
ProductCommentController.prototype.likeComment = async function(data= {}) {
    try {
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
        const updatedComment = await comment.save();
        const response = {
            socketId: socketId,
            user: user,
            comment: updatedComment,
            error: true,
            status: 201,
            message: "comment liked successfully"
        }
         self.userClient.emit('likeCommentSuccess', response);
    } catch (err) {
        console.error(err.stack)    
    } 
}


ProductCommentController.prototype.unLikeComment = async function(data= {}) {
    try {
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
        const updatedComment =  await comment.save();
        const response = {
            socketId: socketId,
            user: user,
            comment: updatedComment,
            error: true,
            status: 401,
            message: "comment unLiked successfully"
        }
        return self.userClient.emit('unLikeCommentSuccess', response);
    } catch (error) {
        console.error(err.stack)   
    }
}

module.exports = ProductCommentController;