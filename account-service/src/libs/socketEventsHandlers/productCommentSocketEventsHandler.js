

function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
   
    const productCommentController = new ProductCommentController();
    productCommentController.mountSocket(socketOptions);
    productCommentController.mountS
    socket.on('reviewProductOrService', function(data) {
        productCommentController.reviewProductOrService(data);
    });
    productCommentController.reviewProductOrServiceResponse();

    socket.on('replyReviewProductOrService', function(data) {
        productCommentController.replyReviewProductOrService(data);   
    });
    productCommentController.replyReviewProductOrServiceResponse();
    socket.on('likeComment', function(data) {
        productCommentController.likeComment(data);   
    });
    productCommentController.likeCommentResponse();

    socket.on('unLikeComment', function(data) {
        productCommentController.unLikeComment(data);   
    });
    productCommentController.unLikeCommentResponse();

}
module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;