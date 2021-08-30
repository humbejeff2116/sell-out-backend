













function productOrderSocketEventsHandler(io, socket, socketOptions, ProductOrderController) {
   
    const productOrderController = new ProductOrderController();
    productOrderController.mountSocket(socketOptions);
    socket.on('createOrder', function(data) {
        return productOrderController.createOrder(data);
    });
    socket.on('confirmDelivery', function(data) {
        return productOrderController.confirmDelivery(data);
    });
   
}
module.exports.productOrderSocketEventsHandler = productOrderSocketEventsHandler;