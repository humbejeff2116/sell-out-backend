
const PlacedOrder = require('../../models/placedOrder');
const OrderDelivery = require('../../models/deliveries');
const  OrderDeliveryRequest = require('../../models/deliveryRequest');

/**
 * @class 
 *  products order controller class 
 * @module ProductOrderController
 */
function ProductOrderController() {
    this.feesClient = null;
    this.userClient = null;
    this.serverSocket = null;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} feesClient - the socket.IO client that connects to the fees service
 * @param {object} userClient - the socket.IO client that connects to the account service
 * @param {object} serverSocket - the socket.IO server socket that connects to this order service
 * 
 */
 ProductOrderController.prototype.mountSocket = function ({ feesClient, userClient, serverSocket}) {
    this.feesClient = feesClient || null;
    this.userClient = userClient || null;
    this.serverSocket = serverSocket || null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get product service socket details
 */
 ProductOrderController.prototype.getSocketDetails = function () {
    return ({
        feesClient: this.feesClient,
        serverSocket: this.serverSocket,
        userClient: this.userClient,
    });
}

// TODO... implement  error handling method
ProductOrderController.prototype.handleError = function (err) {

}

/**
 * 
 * @param {*} orders 
 * @param {*} user 
 * @returns
 ** used to save placed orders made by the user(buyer) 
 */
ProductOrderController.prototype._placeUserOrder = async function(orders = [], user = {}) {
    const { orderId, orderTime } = orders[0];
    const { id, userEmail, fullName } = user;
    const placeOrderdata = {
        orderId: orderId ,
        orderTime: orderTime,
        buyerId: id,
        buyerEmail: userEmail,
        buyerName: fullName,
        products: orders
    }

    try {
        const order = new PlacedOrder();
        order.setPlacedOrderDetails(placeOrderdata);
        const placedOrder = await order.save();

            return ({
                placedOrder: placedOrder,
                placedOrderSuccess: true,
                errorExist: false,
            })  
    } catch (err) {
        throw new Error(err);  
    } 
}

/**
 * 
 * @param {*} orders 
 * @param {*} user 
 * @returns
 ** used to save orders which are to be delivered by the seller
 */
ProductOrderController.prototype._createSellerOrderToDeliver = async function (orders = [], user = {}, placedOrderId = "") {
    try{
        // loop orders and save individual seller orders to db
        const saveSellerOrderToDeliver = async (receiveOrderModel, orders, user)  => {
            const recievedOrders = [];

            for (let i = 0; i < orders.length; i++) {
                const recievedOrder = new receiveOrderModel();

                await recievedOrder.setSellerOrderToDeliverDetails(orders[i], user, placedOrderId);
                await recievedOrder.save().then(receivedOrder => recievedOrders.push(receivedOrder));
            } 
            return recievedOrders;
        }
        const savedRecievedOrders = await saveSellerOrderToDeliver(OrderDelivery, orders, user);

        return ({
            recievedOrdersCreated: true,
            recievedOrders: savedRecievedOrders,
            errorExist: false,
            error: null,
        });            
    } catch (err) {
        throw new Error(err);
    } 
}

// most operations or actions occur synchronously on purpose for now 
ProductOrderController.prototype.createOrder =  async function (io, socket, data = {}, callback = f => f) {
    console.log("creating orders ----orderController--");
    const { socketId, user, order, payments } = data;
    const self = this;
    let response;
   
    try {
        const placedOrder = await this._placeUserOrder(order, user);
        // tag each recieve order with a placed order _id
        const placedOrderId = placedOrder.placedOrder._id
        // attach placedOrder id to each seller order to establish a relationship between each other
        const orderDeliveries = await this._createSellerOrderToDeliver(order, user, placedOrderId);

        if (!placedOrderId.errorExist && !orderDeliveries.errorExist) {
            response = {
                socketId: socketId,
                status: 200, 
                error: false, 
                message: 'order placed successfully', 
                placedOrder: placedOrder.placedOrder,
                recievedOrders: orderDeliveries.recievedOrders,
                user: user,
            }
            //send data to fees service to create payments for sellers after order is placed
            data.placedOrderId = placedOrderId 
            self.feesClient.emit("createPayment", data, (response) => {
               console.log("payments created sucessfully ---order-service---");
                callback(response);
            }); 

            // send data to account service to notify buyer/sellers of order made
            self.userClient.emit('orderCreated', response);
            // self.serverSocket.emit('orderCreated', response);           
        }
    } catch (err) {
        console.error(err);
        // TODO... set a state variable that tracks and returns true for each process completed( placedorder, deliveries and payment socket event sent) 
        // check which variable failed and continue operation from there when error occurs
        response = {
            socketId: socketId,
            status: 401, 
            error: true, 
            message: 'An error occured while placing order', 
        }
        callback(response);
        // self.serverSocket.emit('createOrderError', response);
        // TODO... try placing order again 
    }  
}

ProductOrderController.prototype.confirmDelivery = async function (io, socket, data = {}, callback = f => f) {
    const { socketId, order, user} = data;
    const { id } = user;
    const { orderId, sellerId, placedOrderId } = order;
    const sellerQueryData = {
        orderId: orderId,
        sellerId: sellerId,
        placedOrderId: placedOrderId,
        dileveryStatus: true,  
    }
    const buyerQueryData = {
        buyerId: id, 
        orderId: orderId, 
        sellerId: sellerId, 
        dileveryStatus: true,
        placedOrderId: placedOrderId 
    }

    if (sellerId !== id) {// update order and release funds if buyer confirms delivery
        try {  
            const [updateSellerOrder, updateBuyerOrder] = await Promise.all([
                OrderDelivery.updateDeliveryStatus(sellerQueryData), 
                PlacedOrder.updateDeliveryStatus(buyerQueryData)
            ]);
            const sellerOrder = await OrderDelivery.getSellerOrderByEmailAndPlaceOrderId(sellerQueryData);
    
            if ((updateSellerOrder.ok && updateSellerOrder.n)  && (updateBuyerOrder.ok && updateBuyerOrder.n)) {
                console.log("order deilvery confirmed, sending data to userClient and feesClient");
                 // emit data to account service to notify buyer/seller of deliverd product
                 data.order = sellerOrder;
                this.userClient.emit("productDelivered", data);
                // emit data to fees client to release funds to seller
                this.feesClient.emit("productDelivered", data, (response) => {
                    callback(response);   
                });
            }
            return;   
        } catch (err) {
            console.error(err);
        }
    } else {
        try {
            // send confirmation request to buyer if seller confirms delivery
            const deliveryRequest = await this._sendOrderDeliveryConfirmationRequest(order, user);
            const updateDeliveryRequestSent = await OrderDelivery.updateDeliveryRequestSent(sellerQueryData, true);
            data = { deliveryRequest }
            // emit to account service to notify seller/buyer of request
            this.userClient.emit("orderDeliveryConfirmationSent", data);
            const response = {
                error: false,
                status: 200,
                message: "order delivery confirmation request sent",
                data: null
            }
            callback(response);
        } catch (err) {
            console.error(err);
        }        
    }
}

ProductOrderController.prototype._sendOrderDeliveryConfirmationRequest = async function (order = [], user = {}) {
    const newDeliveryRequest = new OrderDeliveryRequest();
    newDeliveryRequest.setOrderDeliveryRequestDetails(order, user);

    try {
        const deliveryConfirmationRequest = await newDeliveryRequest.save();
        console.log("delivery request", deliveryConfirmationRequest);
        return deliveryConfirmationRequest;  
    } catch (err) {
        throw new Error(err);
    } 
}

ProductOrderController.prototype.acceptDeliveryConfirmationRequest = async function(order = [], user = {}) {

}

ProductOrderController.prototype.getUserProductPlacedOrders = async function (io, socket, data = {}, callback= f => f) {
    const { socketId, user } = data;
    let response;
    try {
        const placedOrders = await PlacedOrder.getOrdersByUserId(user.id);

        response = {
            status: 200,
            error: false,
            socketId: socketId,
            data: placedOrders,
            message: 'user placed orders gotten successfully',
        }  
        callback(response);
    } catch(err) {
        console.error(err);
    } 
}

ProductOrderController.prototype.getUserProductOrderDeliveries = async function (io, socket, data = {}, callback = f => f) {
    const { socketId, user } = data;
    const { userEmail, id } = user;
    let response;
    const queryData = {
        sellerEmail: userEmail,
        buyerEmail: userEmail,
        sellerId: id,
        buyerId: id
    }

    try {
        const [sellerOrderDeliveries, buyerOrderDeliveries, orderDeliveryRequests] = await Promise.all([
            OrderDelivery.getSellerOrderDeliveriesById(queryData),
            OrderDelivery.getBuyerOrderDeliveriesById(queryData),
            OrderDeliveryRequest.getOrderDeliveryRequestByBuyerId(id)
        ])
        buyerOrderDeliveries.orderDeliveryRequests = orderDeliveryRequests;
        const responseData = { sellerOrderDeliveries, buyerOrderDeliveries }

        response = {
            status: 200,
            error: false,
            socketId: socketId,
            data: responseData,
            message: 'user order deliveries gotten successfully',
        }  
        callback(response);
    } catch (err) {
        console.error(err);
    } 
}

ProductOrderController.prototype.getPlacedOrders = function (data = {}) {
    const { socketId, user} = data;
    const self = this;
    const userId = user.id; 
}

ProductOrderController.prototype.getRecievedOrders = function (data = {}) {
    const { socketId, user, order } = data;
    const self = this;
    const userId = user.id; 
}

module.exports = ProductOrderController;