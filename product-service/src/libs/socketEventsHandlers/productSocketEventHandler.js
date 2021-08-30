







function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    const productController = new ProductController();
    productController.mountSocket(socketOptions);
    socket.on('createProduct', function(data) {
        productController.createProduct(data);
    })
    socket.on('getProducts', function(data) {
        productController.getProducts(data);
    })

    socket.on('getProductOrService', function(data) {
        productController.getProductOrService(data);  
    });
    socket.on('showInterest', function(data) {
        productController.showInterest(data);  
    });
}
module.exports.productSocketEventsHandler = productSocketEventsHandler;