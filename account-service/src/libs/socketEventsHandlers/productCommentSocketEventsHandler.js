

function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
   
    const productCommentController = new ProductCommentController();
    productCommentController.mountSocket(socketOptions);
    socket.on('reviewProductOrServiceSuccess', function(data) {
        productCommentController.addReviewProductNotification(data, io);
    });
   
    socket.on('replyReviewProductOrServiceSuccess', function(data) {
        productCommentController.addReplyReviewProductNotification(data, io);   
    });

    socket.on('likeCommentSuccess', function(data) {
        productCommentController.addLikeCommentNotification(data, io);   
    });
   
    socket.on('unLikeCommentSuccess', function(data) {
        productCommentController.addDislikeCommentNotification(data, io);   
    });
   
}
module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;