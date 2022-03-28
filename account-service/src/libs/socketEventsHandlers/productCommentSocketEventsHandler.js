
function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
   
    const productCommentController = new ProductCommentController();

    productCommentController.mountSocket(socketOptions);

    socket.on('reviewProductSuccess', function(data) {

        productCommentController.addReviewProductNotification(data, io, socket);

    });
   
    socket.on('replyReviewProductSuccess', function(data) {

        productCommentController.addReplyReviewProductNotification(data, io, socket);

    });

    socket.on('likeCommentSuccess', function(data) {

        productCommentController.addLikeCommentNotification(data, io, socket); 

    });
   
    socket.on('unLikeCommentSuccess', function(data) {

        productCommentController.addDislikeCommentNotification(data, io, socket);

    });
   
}

module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;