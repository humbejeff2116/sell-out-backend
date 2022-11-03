
function feesSocketEventsHandler(io, socket, socketOptions, FeesController) {
    const ProductFeesController = new FeesController();
    ProductFeesController.mountSocket(socketOptions);
    ProductFeesController.createProductOrderPaymentResponse(io); 

    socket.on('getUserProductOrderPayments', function (data) {
        data.socketId = socket.id; 
        ProductFeesController.getUserProductOrderPayments(io, socket, data); 
    });
}

module.exports.feesSocketEventsHandler = feesSocketEventsHandler;