







function orderSocketEventsHandler(io, socket, socketOptions, ProductOrderController) {
    const productOrderController = new ProductOrderController();
    productOrderController.mountSocket(socketOptions);
    socket.on('createOrder', function(data) {
        productOrderController.createOrder(io, socket, data);
    });

    socket.on('confirmDelivery', function(data) {
        productOrderController.confirmDelivery(io, socket, data);
    });
}
module.exports.orderSocketEventsHandler = orderSocketEventsHandler;