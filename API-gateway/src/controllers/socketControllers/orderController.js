


/**
 * @class 
 *  user controller class 
 * @module OrderController
 */
 function ProductOrderController() {
    this.userClient;
    this.orderClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client that connects to account service
 * @param {object} orderlient - the socket.IO client that connects too order service
 * @param {object} gatewayServerSocket - the socket.IO clients that connect to the gateway
 * 
 */
 ProductOrderController.prototype.mountSocket = function({ userClient, orderClient, gatewayServerSocket}) {
    this.userClient = userClient ? userClient : null;
    this.orderClient = orderClient ? orderClient : null; 
    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;
    return this;
}

ProductOrderController.prototype.authenticateUser = function(data) {
    this.userClient.emit('authenticateUser', data); 
}
// post order
ProductOrderController.prototype.createOrder = function(data) {
    this.orderClient.emit('createOrder', data); 
}
ProductOrderController.prototype.createOrderResponse = function(io) {

    this.orderClient.on('createOrderError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('createOrderError', response);
        console.log(response);
    });
    this.orderClient.on('order created', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('createOrderSuccess', response);
    }); 
}
// get orders
ProductOrderController.prototype.getUserOrders = function(data) {
    this.orderClient.emit('getUserOrders', data); 
}
ProductOrderController.prototype.getUserOrdersResponse = function(io) {

    this.orderClient.on('getUserOrdersError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('getUserOrdersError', response);
        console.log(response);
    });
    this.orderClient.on('getUserOrdersSuccess', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('getUserOrdersSuccess', response);
    }); 
}

// confirmDelivery
ProductOrderController.prototype.confirmDelivery= function(data) {
    this.orderClient.emit('confirmDelivery', data); 
}
ProductOrderController.prototype.confirmDeliveryResponse = function(io) {

    this.orderClient.on('confirmDeliveryError', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('confirmDeliveryError', response);
        console.log(response);
    });
    this.orderClient.on('confirmDeliverySuccess', function (response) {
        const { socketId, ...rest } = response;
        io.to(socketId).emit('confirmDeliverySuccess', response);
    }); 
}
module.exports = ProductOrderController;