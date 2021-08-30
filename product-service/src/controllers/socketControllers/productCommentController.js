

const Product = require('../../models/productModel');
const Service = require('../../models/serviceModel');
const Comment = require('../../models/commentModel');






/**
 * @class 
 *  comments controller class 
 * @module ProductCommentController
 */
 function  ProductCommentController() {
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
 ProductCommentController.prototype.mountSocket = function({ productClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.serverSocket =serverSocket ? serverSocket : null;
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
    console.log(data)
    const self = this;

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
        newComment.save()
        .then( data => {
            const response = {
                status:201,
                error: false, 
                socketId: socketId,
                comment: data,
                user: user, 
                productOrService: productOrService, 
                message: 'service reviewed successfully', 
            };
            console.log("service after review", data)
           return self.serverSocket.emit('reviewProductOrServiceSuccess', response);

        });
        return;
    }
    const product = await Product.getProductById(productOrService.productId);
    if (!product) {
        const response = {
            status: 401,
            error: true, 
            socketId: socketId,
            message: 'product not found',    
        };
        this.serverSocket.emit('reviewProductOrServiceError', response);
        return; 
    }
    const newComment = new Comment();
    newComment.setProductCommentDetails(data);
    newComment.save()
    .then( comment => {
        const response = {
            status:201, 
            error: false,
            socketId: socketId,
            comment: comment,
            user: user, 
            productOrService: productOrService,
            message: 'product reviewed successfully', 
        };
        console.log("service after review", data)
       return self.serverSocket.emit('reviewProductOrServiceSuccess', response);

    });
    
}


ProductCommentController.prototype.replyCommentOnProductOrService =  async function(data = {}) {
    const { commentId, user, socketId, replyMessage, replyTime } = data;
    const self = this;
    const comment = await Comment.getCommentById(commentId);
    if(!comment) {
        const response ={
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
    await comment.addCommentReply(replyData)
    await comment.save()
    .then( comment => {
        console.log("comment after replying")
        console.log(comment);
        const response ={
            error: false,
            status: 201,
            socketId: socketId,
            user: user, 
            comment: comment,
            message: 'reply on comment successfull', 

        }
        self.serverSocket.emit('replyReviewProductOrServiceSuccess', response); 
    })
    .catch(e => console.error(e.stack));
}



ProductCommentController.prototype.likeComment = async function(data= {}) {
   
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


ProductCommentController.prototype.unLikeComment = async function(data= {}) {
   
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

module.exports = ProductCommentController;