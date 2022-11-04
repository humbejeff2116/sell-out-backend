// TODO... move remaining functionality into productSocketEventHandlker
function productReviewSocketEventsHandler(io, socket, socketOptions, ProductReviewController) {
    const productReviewController = new ProductReviewController();
    productReviewController.mountSocket(socketOptions);

    // like comment
    socket.on('likeReview', function (data) {
        const { commentId, user } = data;
        const socketId = socket.id;
        const likeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }

        productReviewController.likeReview(io, socket, likeCommentData);  
    });

    // unlike comment
     socket.on('dislikeReview', function (data) {
        const { commentId, user } = data;
        const socketId = socket.id;
        const unLikeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }

        productReviewController.dislikeReview(io, socket, unLikeCommentData); 
    });
}

module.exports.productReviewSocketEventsHandler = productReviewSocketEventsHandler;