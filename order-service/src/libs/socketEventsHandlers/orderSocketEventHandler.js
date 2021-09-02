







function orderSocketEventsHandler(io, socket, socketOptions, ProductOrderController) {
    const productOrderController = new ProductOrderController();
    productOrderController.mountSocket(socketOptions);
    socket.on('createOrder', function(data) {
        productOrderController.createOrder(io, socket, data);
    });
    productOrderController.createOrderResponse(io, socket)

    socket.on('confirmDelivery', function(data) {
        productOrderController.confirmDelivery(io, socket, data);
    });
    productOrderController.confirmDeliveryResponse(io, socket)
}
module.exports.orderSocketEventsHandler = orderSocketEventsHandler;