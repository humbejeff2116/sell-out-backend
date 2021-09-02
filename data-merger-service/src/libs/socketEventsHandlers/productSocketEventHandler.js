







function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    const productController = new ProductController();
    productController.mountSocket(socketOptions);
    socket.on('getProducts', function(data) {
        productController.getProducts(data);
    })
    productController.getProductsResponse(io)

}
module.exports.productSocketEventsHandler = productSocketEventsHandler;