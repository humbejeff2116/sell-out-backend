function orderSocketEventsHandler(io, socket, socketOptions, OrderController) {
    // create order
    const productOrderController = new OrderController();
    productOrderController.mountSocket(socketOptions);
    
    socket.on('createOrder', function(data) {
        data.socketId = socket.id; 
        productOrderController.createOrder(io, socket, data);
    });

    // get product orders
    socket.on('getUserProductPlacedOrders', function(data) {
        data.socketId = socket.id; 
        console.log("getting product orders ---order socket events handler---");
        productOrderController.getUserProductPlacedOrders(io, socket, data);
    });

    socket.on('getUserProductOrderDeliveries', function(data) {
        data.socketId = socket.id; 
        console.log("getting product orders deliveries ---order socket events handler---");
        productOrderController.getUserProductOrderDeliveries(io, socket, data);
    });

    // confirm delivery
    socket.on('confirmDelivery', function(data) {
        data.socketId = socket.id; 
        console.log("confirming delivery ---order socket events handler---");
        productOrderController.confirmDelivery(io, socket, data);
    });
}

module.exports.orderSocketEventsHandler = orderSocketEventsHandler;