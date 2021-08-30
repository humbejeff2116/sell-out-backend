


/**
 * @class 
 *  user controller class 
 * @module OrderController
 */
 function ProductOrderController() {
    this.userClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client of the user controller class
 * @param {object} gatewayServerSocket - the socket.IO server socket of the gateway server
 * 
 */
 ProductOrderController.prototype.mountSocket = function({ userClient, gatewayServerSocket}) {
    this.userClient = userClient ? userClient : null;
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
}

ProductOrderController.prototype.authenticateUser = function(data) {
    this.userClient.emit('getUserOrders', data); 
}
// post order
ProductOrderController.prototype.createOrder = function(data) {
    this.userClient.emit('createOrder', data); 
}
ProductOrderController.prototype.createOrderResponse = function(io) {

    this.userClient.on('createOrderError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('createOrderError', response);
        console.log(response);
    });
    this.userClient.on('createOrderSuccess', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('createOrderSuccess', response);
    }); 
}
// get orders
ProductOrderController.prototype.getUserOrders = function(data) {
    this.userClient.emit('getUserOrders', data); 
}
ProductOrderController.prototype.getUserOrdersResponse = function(io) {

    this.userClient.on('getUserOrdersError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('getUserOrdersError', response);
        console.log(response);
    });
    this.userClient.on('getUserOrdersSuccess', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('getUserOrdersSuccess', response);
    }); 
}

// confirmDelivery
ProductOrderController.prototype.confirmDelivery= function(data) {
    this.userClient.emit('confirmDelivery', data); 
}
ProductOrderController.prototype.confirmDeliveryResponse = function(io) {

    this.userClient.on('confirmDeliveryError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('confirmDeliveryError', response);
        console.log(response);
    });
    this.userClient.on('confirmDeliverySuccess', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('confirmDeliverySuccess', response);
    }); 
}
module.exports = ProductOrderController;