

function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
   
    const productCommentController = new ProductCommentController();
    productCommentController.mountSocket(socketOptions);
    // comment/review product
    socket.on('reviewProductOrService', function(data) {
      
        const { productOrService, reviewMessage, user } = data;
        const socketId = socket.id;
        const reviewData = {
            user: user,
            productOrService: productOrService,
            reviewMessage: reviewMessage,
            socketId :socketId
        }
        productCommentController.reviewProductOrService(reviewData);   
    });
    productCommentController.reviewProductOrServiceResponse(io);
    // reply comment/review product
    socket.on('replyReviewProductOrService', function(data) {
      
        const { commentId, replyMessage, user } = data;
        const socketId = socket.id;
        const replyReviewData = {
            user: user,
            commentId: commentId,
            replyMessage:replyMessage,
            socketId :socketId
        }
        productCommentController.replyReviewProductOrService(replyReviewData);   
    });
    productCommentController.replyReviewProductOrServiceResponse(io);
    // like comment
    socket.on('likeComment', function(data) {
      
        const { commentId, user } = data;
        const socketId = socket.id;
        const likeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }
        productCommentController.likeComment(likeCommentData);   
    });
    productCommentController.likeCommentResponse(io);
    // unlike comment
     socket.on('unLikeComment', function(data) {
      
        const { commentId, user } = data;
        const socketId = socket.id;
        const unLikeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }
        productCommentController.unLikeComment(unLikeCommentData);   
    });
    productCommentController.unLikeCommentResponse(io);

}
module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;