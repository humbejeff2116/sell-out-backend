
function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    const productController = new ProductController();
    productController.mountSocket(socketOptions);

    socket.on('createProduct', function (data) {
        productController.createProduct(data);
    })

    socket.on('likeProduct', function (data, callback = f => f) {
        productController.likeProduct(data, callback); 
    });

    socket.on('searchProducts', function (data, callback = f => f) {
        productController.searchProducts(data, callback); 
    });

    socket.on('getUserProducts', function (data, callback = f => f) {
        productController.getUserProducts(data, callback); 
    });

    socket.on('createCollection', function (data, callback = f => f) {
        productController.createCollection(data, callback);
    });

    socket.on('getUserCollectionsProducts', function (data, callback = f => f) {
        productController.getUserCollectionsProducts(data, callback); 
    });

    socket.on('reviewProduct', function (data, callback = f => f) {
        productController.reviewProduct(data, callback);
    });

    socket.on('replyProductReview', function (data, callback = f => f) {
        productController.replyReview(data, callback);
    });

    socket.on('getProductReviews', function (data, callback = f => f) {
        productController.getProductReviews(data, callback);
    });

    socket.on('getSellerReviews', function (data, callback = f => f) {
        productController.getSellerReviews(data, callback);
    });
}

module.exports.productSocketEventsHandler = productSocketEventsHandler;