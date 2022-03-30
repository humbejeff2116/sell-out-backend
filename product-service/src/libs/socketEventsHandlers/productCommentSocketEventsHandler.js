
function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {

    const productCommentController = new ProductCommentController();

    productCommentController.mountSocket(socketOptions);

    socket.on('reviewProduct', function(data, callback) {

        productCommentController.reviewProduct(data, callback = f =>f);

    });

    socket.on('replyReviewProduct', function(data, callback = f =>f) {

        productCommentController.replyProductReview(data, callback = f =>f);

    });

    socket.on('likeReview', function(data, callback = f =>f) {

        productCommentController.likeReview(data, callback = f =>f);

    });

    socket.on('dislikeReview', function(data, callback = f =>f) {

        productCommentController.dislikeReview(data, callback = f =>f);

    });

}

module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;