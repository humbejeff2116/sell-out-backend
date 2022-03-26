
function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    
    const productController = new ProductController();
    productController.mountSocket(socketOptions);

    socket.on('likeProduct', function(data) {

        const socketId = socket.id;

        data.socketId = socketId;

        productController.likeProduct(io, socket, data);

    });

    socket.on('searchProducts', function(data) {

        const socketId = socket.id;

        data.socketId = socketId;

        productController.searchProducts(io, socket, data);

    });

}

module.exports.productSocketEventsHandler = productSocketEventsHandler;