
function productOrderSocketEventsHandler(io, socket, socketOptions, ProductOrderController) {
   
    const productOrderController = new ProductOrderController();

    productOrderController.mountSocket(socketOptions);

    socket.on('confirmDelivery', function(data) {

        return productOrderController.confirmDelivery(data);

    });

    socket.on('orderCreated', function(data) {

        return productOrderController.notifySellerAboutOrder(data, io);

    })

    socket.on('productPaymentCreated', function(data) {

        return productOrderController.notifySellerABoutPendingPayment(data, io);

    })

    socket.on('productDelivered', function(data) {

        return productOrderController.addProductDeliveredNotification(data, io);

    })
    
    socket.on('sellerPaymentFundsReleased', function(data) {

        return productOrderController.addPaymentFundReleasedNotification(data, io);

    })
  
}

module.exports.productOrderSocketEventsHandler = productOrderSocketEventsHandler;