

function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
   
    const productCommentController = new ProductCommentController();
    productCommentController.mountSocket(socketOptions);
    socket.on('reviewProductOrServiceSuccess', function(data) {
        productCommentController.reviewProductOrServiceResponse(data, io);
    });
   
    socket.on('replyReviewProductOrServiceSuccess', function(data) {
        productCommentController.replyReviewProductOrService(data, io);   
    });

    socket.on('likeCommentSuccess', function(data) {
        productCommentController.likeCommentResponse(data, io);   
    });
   
    socket.on('unLikeCommentSuccess', function(data) {
        productCommentController.unLikeCommentResponse(data, io);   
    });
   
}
module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;