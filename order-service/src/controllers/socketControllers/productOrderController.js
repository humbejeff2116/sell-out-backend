


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
 ** Used to get product service socket details
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
/**
 * 
 * @param {*} orders 
 * @param {*} user 
 * @returns
 ** used to save pre orders made by the user(buyer) 
 */
ProductOrderController.prototype.placeUserOrder = async function(orders = [], user = {}) {
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
        // console.log("saved placed orders --ProductOrderController--", placedOrder);
            return ({
                placedOrder: placedOrder,
                placedOrderSuccess: true,
                errorExist: false,
            })   
    }catch(err) {
        throw err  
    } 
}

/**
 * 
 * @param {*} orders 
 * @param {*} user 
 * @returns
 ** used to save orders which are to be delivered by the seller
 */
ProductOrderController.prototype.createSellerOrderToDeliver = async function(orders = [], user = {}, placedOrderId) {
   
    try{
         // loop orders and save individual seller orders to db
        async function saveSellerOrderToDeliver(receiveOrderModel, orders, user) {
            const recievedOrders = [];
            for (let i = 0; i < orders.length; i++) {
                const recievedOrder = new receiveOrderModel();
                await recievedOrder.setSellerOrderToDeliverDetails(orders[i], user, placedOrderId);
                await recievedOrder.save().then(receivedOrder => recievedOrders.push(receivedOrder));
            }               
            return recievedOrders;
        }
        
        const savedRecievedOrders = await saveSellerOrderToDeliver(RecievedOrder, orders, user);
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

// most operations or actions occur synchronously on purpose for now 
ProductOrderController.prototype.createOrder =  async function(io, socket, data = {}) {
    console.log("creating orders ----orderController--");
    const { socketId, user, order, payments } = data;
    const self = this;
    let response;
    // console.log("user order is", data);
   
    try {

        const createPlacedOrder = await this.placeUserOrder(order, user);
        // tag each recieve order with a placed order _id
        const placedOrderId = createPlacedOrder.placedOrder._id
        // attach placedOrder id to each seller order to establish a relationship between each other
        const createRecievedOrder = await this.createSellerOrderToDeliver(order, user, placedOrderId);
        if (!createPlacedOrder.errorExist && !createRecievedOrder.errorExist) {

            response = {
                socketId: socketId,
                status:200, 
                error : false, 
                message : 'order placed successfully', 
                placedOrder : createPlacedOrder.placedOrder,
                recievedOrders : createRecievedOrder.recievedOrders,
                user: user,
            };
            //send data to fees service to create payments for sellers after order is placed
            data.placedOrderId = placedOrderId 
            self.feesClient.emit("createPayment", data); 
            // send data to account service to notify buyer/sellers of order made
            self.userClient.emit('orderCreated', response)
            // self.serverSocket.emit('orderCreated', response);
                    
        }
    } catch(err) {
        console.log(err.stack);
        response = {
            socketId: socketId,
            status: 401, 
            error: true, 
            message: 'An error occured while placing order', 
        }
        self.serverSocket.emit('createOrderError', response);
        // TODO... try placing order again 
    }   
}
ProductOrderController.prototype.createOrderResponse =  async function(io, socket) {
    const self = this;
    this.feesClient.on('createPaymentSuccess',function(response) {
        self.serverSocket.emit('createPaymentSuccess', response);
    });
}

ProductOrderController.prototype.confirmDelivery = async function(io, socket, data = {}) {
    const { socketId, order, user} = data;
    const self = this;
    const sellerQueryData = {
        orderId: order.orderId,
        sellerEmail: order.sellerEmail,
        sellerId: order.sellerId,
        placedOrderId: order.placedOrderId,
        dileveryStatus: true,  
    }
    const buyerQueryData = {
        buyerEmail: user.userEmail,
        buyerId: user.id, 
        orderId: order.orderId, 
        sellerEmail: order.sellerEmail,
        sellerId: order.sellerId, 
        dileveryStatus: true,
        placedOrderId: order.placedOrderId 
    }
    try {       
        const updateSellerOrder = await RecievedOrder.updateDeliveryStatus(sellerQueryData);
        const updateBuyerOrder = await PlacedOrder.updateDeliveryStatus(buyerQueryData);
        const sellerOrder = await RecievedOrder.getSellerOrderByEmailAndPlaceOrderId(sellerQueryData)
        if ((updateSellerOrder.ok && updateSellerOrder.n)  && (updateBuyerOrder.ok && updateBuyerOrder.n)) {
            console.log("order deilvery confirmed, sending data to userClient and feesClient");
             // emit data to account service to notify buyer/seller of deliverd product
             data.order = sellerOrder;
            this.userClient.emit("productDelivered", data);
            // emit data to fees client to release funds to seller
            this.feesClient.emit("productDelivered", data);
        }
         
    } catch(err) {

    }    
}
ProductOrderController.prototype.confirmDeliveryResponse = async function(io, socket) {
    const self = this;
    this.feesClient.on('sellerPaymentFundsReleased',function(response) {
       
        self.serverSocket.emit('confirmDeliverySuccess', response);
    });
}
ProductOrderController.prototype.getUserProductOrders =async function(io, socket, data = {}) {
    try {
        const { socketId, user } = data;
        const self = this;
        let response;
        const userId = user.id;
        const queryData = {
            sellerEmail: user.userEmail,
            buyerEmail:user.userEmail,
            sellerId: user.id,
            buyerId: user.id
        }
        const sellerOrders = await RecievedOrder.getSellerOrdersByEmailOrId(queryData);
        const buyerOrders = await RecievedOrder.getBuyerOrdersByEmailOrId(queryData);
        const placedOrders = await PlacedOrder.getOrdersByUserEmail(user.userEmail);
        const responseData = { sellerOrders, buyerOrders, placedOrders }
        response = {
            status: 200,
            error: false,
            socketId: socketId,
            data: responseData,
            message: 'user orders gotten successfully',
        }  
        self.serverSocket.emit('getUserProductOrdersSuccess', response);

    } catch(err) {
        console.error(err.stack)
    }   
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