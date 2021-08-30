

function productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController) {
    const productCommentController = new ProductCommentController();
    productCommentController.mountSocket(socketOptions);
    socket.on('reviewProductOrService', function(data) {
        productCommentController.commentOnProductOrService(data);    
    });

    socket.on('replyReviewProductOrService', function(data) {
        productCommentController.replyCommentOnProductOrService(data);  
    });
    socket.on('likeComment', function(data) {
        productCommentController.likeComment(data);  
    });

    socket.on('unLikeComment', function(data) {
        productCommentController.unLikeComment(data);  
    });
}
module.exports.productCommentSocketEventsHandler = productCommentSocketEventsHandler;