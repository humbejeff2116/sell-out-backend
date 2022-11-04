
function productReviewSocketEventsHandler(io, socket, socketOptions, ProductReviewController) {
    const productReviewController = new ProductReviewController();
    productReviewController.mountSocket(socketOptions);

    socket.on('reviewProductSuccess', function (data) {
        productReviewController.addReviewProductNotification(data, io, socket);
    });
   
    socket.on('replyReviewProductSuccess', function (data) {
        productReviewController.addReplyReviewProductNotification(data, io, socket);
    });

    socket.on('likeCommentSuccess', function (data) {
        productReviewController.addLikeCommentNotification(data, io, socket); 
    });
   
    socket.on('unLikeCommentSuccess', function (data) {
        productReviewController.addDislikeCommentNotification(data, io, socket);
    });
}

module.exports.productReviewSocketEventsHandler = productReviewSocketEventsHandler;