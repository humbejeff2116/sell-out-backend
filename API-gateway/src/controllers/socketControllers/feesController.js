
/**
 * @class 
 *  fees controller class 
 * @module FeesController
 */
 function FeesController() {
    this.feesClient = null;
    this.gatewayServerSocket = null;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} feesClient - the socket.IO client which connects to the fees service
 * @param {object} gatewayServerSocket - clients connecting to the gateway service
 * 
 */
 FeesController.prototype.mountSocket = function ({ feesClient, gatewayServerSocket }) {
    this.feesClient = feesClient || null;
    this.gatewayServerSocket = gatewayServerSocket || null;
    return this;
}

FeesController.prototype.getUserProductOrderPayments = function (io, socket, data) {
    this.feesClient.emit('getUserProductOrderPayments', data, (response) => {
        const { socketId } = response;

        if (response.error) {
            io.to(socketId).emit('getUserProductOrderPaymentsError', response);
            return;
        }

        io.to(socketId).emit('getUserProductOrderPaymentsSuccess', response);
    }); 
}

// response from fees service after creating user order payment
FeesController.prototype.createProductOrderPaymentResponse = function (io) {
    this.feesClient.on('createPaymentSuccess', function (response) {
        const { socketId } = response;

        console.log("user data has changed ---feesController----");
        io.sockets.emit('paymentDataChange', response); 
    });     
}

module.exports = FeesController;