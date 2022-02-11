





function productOrderPaymentSocketEventsHandler(io, socket, socketOptions, ProductOrderPaymentController) {
    const productOrderPaymentController = new ProductOrderPaymentController();
    productOrderPaymentController.mountSocket(socketOptions);
    
    socket.on('createPayment', function(data) {
        productOrderPaymentController.createProductOrderPayment(io, socket, data);
    });

    socket.on('productDelivered', function(data) {
        productOrderPaymentController.paySellerAfterDelivery(io, socket, data);
    });

}
module.exports.productOrderPaymentSocketEventsHandler = productOrderPaymentSocketEventsHandler;