
function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
    const productCommentController = new ProductCommentController();
    productCommentController.mountSocket(socketOptions);

    socket.on('likeReview', function(data, callback = f => f) {
        productCommentController.likeReview(data, callback);
    });

    socket.on('dislikeReview', function(data, callback = f => f) {
        productCommentController.dislikeReview(data, callback);
    });
}

module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;