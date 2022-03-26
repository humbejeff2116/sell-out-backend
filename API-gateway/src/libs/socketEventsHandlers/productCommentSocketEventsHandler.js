

function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
   
    const productCommentController = new ProductCommentController();

    productCommentController.mountSocket(socketOptions);

    // comment/review product
    socket.on('reviewProduct', function(data) {
      
        const { product, reviewMessage, user } = data;

        const socketId = socket.id;

        const reviewData = {
            user: user,
            product: product,
            reviewMessage: reviewMessage,
            socketId :socketId
        }

        productCommentController.reviewProduct(io, socket, reviewData); 

    });

    // reply comment/review product
    socket.on('replyReviewProduct', function(data) {
      
        const { commentId, replyMessage, user } = data;

        const socketId = socket.id;

        const replyReviewData = {
            user: user,
            commentId: commentId,
            replyMessage:replyMessage,
            socketId :socketId
        }

        productCommentController.replyReviewProduct(io, socket, replyReviewData); 

    })

    // like comment
    socket.on('likeReview', function(data) {
      
        const { commentId, user } = data;

        const socketId = socket.id;
        
        const likeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }

        productCommentController.likeReview(io, socket, likeCommentData);  

    });

    // unlike comment
     socket.on('dislikeReview', function(data) {
      
        const { commentId, user } = data;

        const socketId = socket.id;

        const unLikeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }

        productCommentController.dislikeReview(io, socket, unLikeCommentData); 

    });

}

module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;