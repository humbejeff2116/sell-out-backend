













function orderSocketEventsHandler(io, socket, socketOptions, OrderController) {
    // create order
    const productOrderController = new OrderController();
    productOrderController.mountSocket(socketOptions);

    socket.on('createOrder', function(data) {
        data.socketId = socket.id; 
        console.log("creating order", data);
        productOrderController.createOrder(data);
    });
    productOrderController.createOrderResponse(io);
    // confirm delivery
    socket.on('confirmDelivery', function(data) {
        data.socketId = socket.id; 
        console.log("confirming delivery", data);
        productOrderController.confirmDelivery(data);
    });
    productOrderController.confirmDeliveryResponse(io);
    
}
module.exports.orderSocketEventsHandler = orderSocketEventsHandler;