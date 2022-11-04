
function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    const productController = new ProductController();
    productController.mountSocket(socketOptions);

    socket.on('likeProduct', function (data) {
        const socketId = socket.id;

        data.socketId = socketId;
        productController.likeProduct(io, socket, data);
    });

    socket.on('searchProducts', function (data) {
        const socketId = socket.id;

        data.socketId = socketId;
        productController.searchProducts(io, socket, data);
    });

    socket.on('getUserProducts', function (data) {
        const socketId = socket.id;

        data.socketId = socketId;
        productController.getUserProducts(io, socket, data);
    });

    socket.on('createCollection', function (data) {
        data.socketId = socket.id;
        productController.createCollection(io, socket, data);
    });

    socket.on('getUserCollectionsProducts', function (data) {
        const socketId = socket.id;
        data.socketId = socketId;

        productController.getUserCollectionsProducts(io, socket, data);
    });

     socket.on('reviewProduct', function (data) {
        const socketId = socket.id;
        data.socketId = socketId;

        productController.reviewProduct(io, socket, data); 
    });

    socket.on('replyProductReview', function (data) {
        const socketId = socket.id;
        data.socketId = socketId;

        productController.replyReview(io, socket, data); 
    })

    socket.on('getProductReviews', function (data) {
        const socketId = socket.id;
        data.socketId = socketId;

        productController.getProductReviews(io, socket, data);
    });

    socket.on('getSellerReviews', function (data) {
        const socketId = socket.id;
        data.socketId = socketId;

        productController.getSellerReviews(io, socket, data);
    });
}

module.exports.productSocketEventsHandler = productSocketEventsHandler;