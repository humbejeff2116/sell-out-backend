
function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    const productController = new ProductController();
    productController.mountSocket(socketOptions);

    socket.on('likeProductSuccess', function (data) {
        productController.addOrRemoveLikeProductNotification(data, io);
    });
}

module.exports.productSocketEventsHandler = productSocketEventsHandler;