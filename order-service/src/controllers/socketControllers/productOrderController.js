


const PlacedOrder = require('../../models/placedOrder');
const RecievedOrder = require('../../models/recieveOrder');

/**
 * @class 
 *  products order controller class 
 * @module ProductOrderController
 */
function ProductOrderController() {
    this.feesClient;
    this.userClient;
    this.serverSocket; 
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} feesClient - the socket.IO client that connects to the fees service
 * @param {object} userClient - the socket.IO client that connects to the account service
 * @param {object} serverSocket - the socket.IO server socket that connects to the order service
 * 
 */
 ProductOrderController.prototype.mountSocket = function({ feesClient, userClient, serverSocket}) {
    this.feesClient = feesClient ? feesClient : null;
    this.userClient = userClient ? userClient : null;
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the order node socket datesils
 */
 ProductOrderController.prototype.getSocketDetails = function() {
    return ({
        feesClient: this.feesClient,
        serverSocket: this.serverSocket,
        userClient: this.userClient,
    });
}

// TODO... implement  error handling method
ProductOrderController.prototype.handleError = function(err) {

}
ProductOrderController.prototype.placeOrder = async function(orders = [], user = {}) {
    // collect order data and save in db as the user/buyers placed orders
    try{
        const placeOrderdata = {
            orderId: orders[0].orderId ,
            orderTime: orders[0].orderTime,
            buyerId: user.id,
            buyerEmail: user.userEmail,
            buyerUserName: user.fullName,
            productsSellerSold: orders
        }
        const order = new PlacedOrder();
        order.setPlacedOrderDetails(placeOrderdata)
        const placedOrder = await order.save();
        console.log("saved payments", placedOrder);
            return ({
                placedOrder: placedOrder,
                placedOrderSuccess: true,
                errorExist: false,
            })   
    }catch(err) {
        throw err  
    } 
}

ProductOrderController.prototype.receiveOrder = async function(orders = [], user = {}) {
    // loop orders and save individual seller orders to db
    try{

         function createReceiveOrderModelInstances(receiveOrderModel, orders, user) {
            const promise = new Promise(async (resolve, reject) => {
                const recievedOrders = [];
                for (let i = 0; i < orders.length; i++) {
                    recievedOrders.push(new receiveOrderModel())
                }
                for (let i = 0; i < recievedOrders.length; i++) {
                    await recievedOrders[i].setRecievedOrderDetails(orders[i], user)
                }
                resolve(recievedOrders);
            });
            return promise;
        }
        // save receivedOrders instances to db
        async function savePlacedOrders(receiveOrderModels) {
            const receivedOrders = [];
            for (let i = 0; i < receiveOrderModels.length; i++) {
                await receiveOrderModels[i].save().then(receivedOrder => receivedOrders.push(receivedOrder));  
            }
            return receivedOrders;
        }
        const createdRecieveOrderModels = await createReceiveOrderModelInstances(RecievedOrder, orders, user);
        const savedRecievedOrders = await savePlacedOrders(createdRecieveOrderModels);
        console.log("saved savedRecievedOrders", savedRecievedOrders);
        return ({
            recievedOrdersCreated: true,
            recievedOrders: savedRecievedOrders,
            errorExist: false,
            error: null,
        });     
              
    }catch(err) {
        throw err
    } 
}


ProductOrderController.prototype.createOrder =  async function(io, socket, data = {}) {
    console.log("creating orders ----orderController--")
    const { socketId, user, order, payments } = data;
    const self = this;
    let response;
   
    try {
        const createPlacedOrder = await this.placeOrder(order, user);
        const createRecievedOrder = await this.receiveOrder(order, user);
        response = {
            socketId: socketId,
            status:200, 
            error : false, 
            message : 'order placed successfully', 
        };
        self.serverSocket.emit('orderCreated', response);
        self.feesClient.emit("orderCreated", data)      
    } catch(err) {
        console.log(err.stack);
        response = {
            socketId: socketId,
            status:401, 
            error : true, 
            message : 'An error occured while placing order', 
        };
        self.serverSocket.emit('createOrderError', response); 
    } 
}
ProductOrderController.prototype.createOrderResponse =  async function(io, socket) {
    const self = this;
    this.feesClient.on('createPaymentSuccess',function(response) {
        // TODO... send data to account to update payment made
        self.serverSocket.emit('createPaymentSuccess', response);
    });
}

ProductOrderController.prototype.confirmDelivery = async function(io, socket, data = {}) {
    const { socketId, order, user} = data;
    const self = this;
    const userId = user.id;
    const sellerEmail = order.sellerEmail;
    const sellerId = order.sellerId;
    const orderId = order.orderId;
    const deliveredProduct = true;
    const orderData = {
        orderId,
        sellerEmail,
        sellerId,
    }
    const sellerOrder = await RecievedOrder.getSellerOrder(orderData);
   
    let response;
    try {       
        sellerOrder.updateDeliveryStatus(deliveredProduct);
        const updatedOrder = await sellerOrder.save();
        const feesData = {
            orderData,
            socketId
        }
        // emit product delivered to fees client
        this.feesClient.emit("productDelivered", feesData);
     
    } catch(err) {

    }    
}
ProductOrderController.prototype.confirmDeliveryResponse = async function(io, socket) {
    const self = this;
    this.feesClient.on('sellerPaymentSuccessfull',function(response) {
        // TODO... send data to account to update payment made
        self.serverSocket.emit('sellerPaymentSuccessfull', response);
    });
}

ProductOrderController.prototype.getPlacedOrders = function(data = {}) {
    const { socketId, user} = data;
    const self = this;
    const userId = user.id;    
}

ProductOrderController.prototype.getRecievedOrders = function(data = {}) {
    const { socketId, user, order} = data;
    const self = this;
    const userId = user.id;    
}
module.exports = ProductOrderController;