
/**
 * @class 
 *  user controller class 
 * @module OrderController
 */
 function ProductOrderController() {

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

    this.orderClient = orderClient ? orderClient : null; 

    this.gatewayServerSocket = gatewayServerSocket ? gatewayServerSocket : null;

    return this;
    
}

// post order
ProductOrderController.prototype.createOrder = function(io, socket, data) {
    
    this.orderClient.emit('createOrder', data, (response) => {

        console.log("order created")

        const { socketId, ...rest } = response;

        if (response.error ) {

            io.to(socketId).emit('createOrderError', response);

            return
        }

        io.to(socketId).emit('orderCreated', response);

    }); 
    
}

// get orders
ProductOrderController.prototype.getUserProductOrders = function(io, socket, data) {

    this.orderClient.emit('getUserProductOrders', data, (response) => {

        const { socketId, ...rest } = response;

        if (response.error ) {

            

            io.to(socketId).emit('getUserProductOrdersError', response);

            return
        }

        io.to(socketId).emit('getUserProductOrdersSuccess', response);

    }); 

}

// confirmDelivery
ProductOrderController.prototype.confirmDelivery= function(io, socket, data) {

    this.orderClient.emit('confirmDelivery', data, (response) => {

        const { socketId, ...rest } = response;

        if (response.error ) {

            io.to(socketId).emit('confirmDeliveryError', response);

            return

        }
       
        io.to(socketId).emit('confirmDeliverySuccess', response);

        io.sockets.emit('orderDataChange', response);

    }) 

}

module.exports = ProductOrderController;