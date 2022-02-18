




function feesSocketEventsHandler(io, socket, socketOptions, FeesController) {

    const ProductFeesController = new FeesController();
    ProductFeesController.mountSocket(socketOptions);
    ProductFeesController.createProductOrderPaymentResponse(io); 

    
    socket.on('getUserPayments', function(data) {
        data.socketId = socket.id; 
        ProductFeesController.getUserPayments(data);
    });
    ProductFeesController.getUserPaymentsResponse(io)
}

module.exports.feesSocketEventsHandler = feesSocketEventsHandler;