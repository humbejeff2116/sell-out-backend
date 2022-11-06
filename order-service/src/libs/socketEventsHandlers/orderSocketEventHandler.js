
function orderSocketEventsHandler(io, socket, socketOptions, ProductOrderController) {
    const productOrderController = new ProductOrderController();
    productOrderController.mountSocket(socketOptions);

    socket.on('createOrder', function (data, callback= f => f) {
        productOrderController.createOrder(io, socket, data, callback);
    });

    socket.on('getUserProductPlacedOrders', function (data, callback= f => f) {
        productOrderController.getUserProductPlacedOrders(io, socket, data, callback);
    });

    socket.on('getUserProductOrderDeliveries', function (data, callback= f => f) {
        productOrderController.getUserProductOrderDeliveries(io, socket, data, callback);
    });

    socket.on('confirmDelivery', function (data, callback= f => f) {
        productOrderController.confirmDelivery(io, socket, data, callback);
    });
}
module.exports.orderSocketEventsHandler = orderSocketEventsHandler;