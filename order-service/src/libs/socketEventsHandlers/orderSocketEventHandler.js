







function orderSocketEventsHandler(io, socket, socketOptions, ProductOrderController) {
    const productOrderController = new ProductOrderController();
    productOrderController.mountSocket(socketOptions);
    socket.on('createOrder', function(data) {
        productOrderController.createOrder(io, socket, data);
    });
    productOrderController.createOrderResponse(io, socket);
    // get product orders
    socket.on('getUserProductOrders', function(data) {
        productOrderController.getUserProductOrders(io, socket, data);
    });

    socket.on('confirmDelivery', function(data) {
        productOrderController.confirmDelivery(io, socket, data);
    });
    productOrderController.confirmDeliveryResponse(io, socket)
}
module.exports.orderSocketEventsHandler = orderSocketEventsHandler;