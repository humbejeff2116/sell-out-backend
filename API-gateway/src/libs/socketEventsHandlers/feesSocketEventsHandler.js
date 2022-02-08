




function feesSocketEventsHandler(io, socket, socketOptions, FeesController) {

    const ProductFeesController = new FeesController();
    ProductFeesController.mountSocket(socketOptions);
    ProductFeesController.createProductOrderPaymentResponse(io);    
}

module.exports.feesSocketEventsHandler = feesSocketEventsHandler;