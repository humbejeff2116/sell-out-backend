function orderSocketEventsHandler(io, socket, socketOptions, OrderController) {

    // create order
    const productOrderController = new OrderController();

    productOrderController.mountSocket(socketOptions);

    socket.on('createOrder', function(data) {

        data.socketId = socket.id; 

        productOrderController.createOrder(io, socket, data);

    });

    // get product orders
    socket.on('getUserProductOrders', function(data) {

        data.socketId = socket.id; 

        console.log("getting product orders ---order socket events handler---");

        productOrderController.getUserProductOrders(io, socket, data);

    });

    // confirm delivery
    socket.on('confirmDelivery', function(data) {

        data.socketId = socket.id; 

        console.log("confirming delivery ---order socket events handler---");

        productOrderController.confirmDelivery(io, socket, data);

    });
    
}

module.exports.orderSocketEventsHandler = orderSocketEventsHandler;