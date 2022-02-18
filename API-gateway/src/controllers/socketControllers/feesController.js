












/**
 * @class 
 *  user controller class 
 * @module FeesController
 */
 function FeesController() {
    this.feesClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} feesClient - the socket.IO client which connects to the fees service
 * @param {object} gatewayServerSocket - clients connecting to the gateway service
 * 
 */
 FeesController.prototype.mountSocket = function({ feesClient, gatewayServerSocket}) {
    this.feesClient = feesClient ? feesClient : null;
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
}



FeesController.prototype.getUserPayments = function(data) {
    this.feesClient.emit('getUserPayments', data); 
}
FeesController.prototype.getUserPaymentsResponse = function(io) {

    this.feesClient.on('getUserPaymentsError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('getUserProductOrdersError', response);
        console.log(response);
    });
    this.feesClient.on('getUserPaymentsSuccess', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('getUserPaymentsSuccess', response);
    }); 
}

// response from fees sevice after  creating user order payment
FeesController.prototype.createProductOrderPaymentResponse = function(io) {
    
    this.feesClient.on('createPaymentSuccess', function(response) {
        const { socketId } = response;
        console.log("user data has changed ---feesController----")
        io.sockets.emit('paymentDataChange', response); 
    });   
}
module.exports = FeesController;