
const Product = require('../../models/productModel');
const Comment = require('../../models/commentModel');

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
 * @param {object} userClient - the socket.IO client of the product and service controller class
 * @param {object} serverSocket - the socket.IO server socket of the product-service server
 * 
 */
 ProductCommentController.prototype.mountSocket = function({ userClient, serverSocket}) {

    this.userClient = userClient ? userClient : null;

    this.serverSocket = serverSocket ? serverSocket : null;

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
 ProductCommentController.prototype.reviewProduct =  async function({ product, socketId, user,  reviewMessage }, callback = f =>f) {

    const self = this;

    try {
        
        const sellerProduct = await Product.getProductById(product.productId);

        if (!sellerProduct) {

            const response = {
                status: 401,
                error: true, 
                socketId: socketId,
                message: 'product not found',    
            }

            return callback(response);

        }

        const newComment = new Comment();

        newComment.setProductCommentDetails({ product, socketId, user,  reviewMessage });

        const savedComment = await newComment.save();

        const response = {
            status:201, 
            error: false,
            socketId: socketId,
            comment: savedComment,
            user: user, 
            productOrService: sellerProduct,
            product: sellerProduct,
            message: 'product reviewed successfully', 
        }

        callback(response);

        self.userClient.emit('reviewProductSuccess', response);

    } catch(err) {

        console.error(err)

    }

}

ProductCommentController.prototype.replyProductReview =  async function({ commentId, user, socketId, replyMessage, replyTime }, callback = f =>f) {
    
    try {

        const self = this;

        const comment = await Comment.getCommentById(commentId);

        if (!comment) {

            const response = {
                error:true,
                status:401,
                socketId: socketId,
                message: `comment with id: ""${commentId}"" not found`,
            }

            callback(response);

            console.error("no comment found");

            return;

        }
       
        const updatedComment = await Comment.addCommentReply({ commentId, user, socketId, replyMessage, replyTime });

        if (updatedComment.status === 201 ) {

            const response = {
                error: false,
                status: 201,
                socketId: socketId,
                user: user, 
                comment: comment,
                message: 'reply on comment successfull', 
            }

            callback(response);

            self.userClient.emit('replyReviewProductSuccess', response);

        }
        
    } catch(err) {

        console.error(err)

    }

}

ProductCommentController.prototype.likeReview = async function(data= {}, callback = f =>f) {

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

            return callback(response);

        }
        
        const updateCommentLike = await Comment.addCommentLike(data);

        const updateCommentDislike = await Comment.removeCommentDislike(data);

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

        const comment = await Comment.getCommentById(commentId);

        if (!comment) {

            const response = {
                socketId: socketId,
                error: true,
                status: 401,
                message: "comment not found"
            }

            return callback(response);

        }
        
        const addCommentDislike = await Comment.addCommentDislike(data);

        const removeCommentDislike = await Comment.removeCommentLike(data);

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