
function orderSocketEventsHandler(io, socket, socketOptions, ProductOrderController) {

    const productOrderController = new ProductOrderController();

    productOrderController.mountSocket(socketOptions);

    socket.on('createOrder', function(data, callback= f =>f) {

        productOrderController.createOrder(io, socket, data, callback= f =>f);

    });

    socket.on('getUserProductOrders', function(data, callback= f =>f) {

        productOrderController.getUserProductOrders(io, socket, data, callback= f =>f);

    });

    socket.on('confirmDelivery', function(data, callback= f =>f) {

        productOrderController.confirmDelivery(io, socket, data, callback= f =>f);

    });

}

module.exports.orderSocketEventsHandler = orderSocketEventsHandler;