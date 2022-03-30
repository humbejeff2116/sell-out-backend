
function productSocketEventsHandler(io, socket, socketOptions, ProductController) {

    const productController = new ProductController();

    productController.mountSocket(socketOptions);

    socket.on('createProduct', function(data) {

        productController.createProduct(data);

    })

    socket.on('likeProduct', function(data, callback = f =>f) {

        productController.likeProduct(data, callback = f =>f); 

    });

    socket.on('searchProducts', function(data, callback = f =>f) {

        productController.searchProducts(data, callback = f =>f); 

    });
}

module.exports.productSocketEventsHandler = productSocketEventsHandler;