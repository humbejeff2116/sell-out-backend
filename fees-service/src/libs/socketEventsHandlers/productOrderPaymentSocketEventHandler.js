
function productOrderPaymentSocketEventsHandler(io, socket, socketOptions, ProductOrderPaymentController) {

    const productOrderPaymentController = new ProductOrderPaymentController();

    productOrderPaymentController.mountSocket(socketOptions);
 
    socket.on('createPayment', function(data, callback) {

        productOrderPaymentController.createProductOrderPayment(io, socket, data, callback);

    });

    socket.on('productDelivered', function(data, callback) {

        productOrderPaymentController.paySellerAfterDelivery(io, socket, data, callback);

    });

    socket.on('getUserPayments', function(data) {

        productOrderPaymentController.getUserPayments(io, socket, data);

    })

}

module.exports.productOrderPaymentSocketEventsHandler = productOrderPaymentSocketEventsHandler;