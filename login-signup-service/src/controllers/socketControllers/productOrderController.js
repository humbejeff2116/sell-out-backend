






const Payment = require('../../models/paymentModel');
const PlacedOrder = require('../../models/placedOrder');
const RecievedOrder = require('../../models/recieveOrder');
const User = require('../../models/userModel');






function ProductOrderController() {
    this.serverSocket;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} serverSocket - the socket.IO server socket of the login server
 */
 ProductOrderController.prototype.mountSocket = function({ serverSocket }) {
    this.serverSocket = serverSocket ? serverSocket: null;
    return this;
}

/**
 * @method getSocket  
 ** Used to get the service node socket datesils
 */
 ProductOrderController.prototype.getSocket = function() {
    return this.serverSocket;
}


ProductOrderController.prototype.authenticateUser = async function(userdata, userModel) {
    if (!userdata) {
        throw new Error("userdata is not defined");
    }
    const userEmail = userdata.email;
    const appUser = await userModel.getUserByEmail(userEmail);
    return appUser;
}
ProductOrderController.prototype.createPayment = async function(payments = []) {
    try {
       
       // create sellers  payment model instances and save in an array
        function createSellersPaymentModelInstances(PaymentModel, payments) {
           const promise = new Promise((resolve, reject) => {
               const paymentsModels = [];
               for (let i = 0; i < payments.length; i++) {
                   paymentsModels.push(new PaymentModel())
               }
               for (let i = 0; i < paymentsModels.length; i++) {
                   paymentsModels[i].setPaymentDetails(payments[i])
               }
               resolve(paymentsModels)
           });
           return promise;
        }
       // save payment model instances to db
        async function savePayments(paymentsModels) {
           const savedPayments = [];
           for (let i = 0; i < paymentsModels.length; i++) {
               await paymentsModels[i].save().then(savedPayment => savedPayments.push(savedPayment));  
           }
           return savedPayments;
        }
        const createdPaymentModels = await createSellersPaymentModelInstances(Payment, payments);
        const savedPayments = await savePayments(createdPaymentModels);
        console.log("saved payments", savedPayments);
        return ({
           paymentsCreated: true,
           errorExist: false,
           savePayments: savedPayments
        })     
    } catch (err) {
       throw err
    }

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


ProductOrderController.prototype.createOrder =  async function(data = {}) {
    const { socketId, user, order, payments } = data;
    const self = this;
    const appUser = await this.authenticateUser(user, User);
    let response;
   
    try {
        if (!appUser) {
             response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            };
            return  self.serverSocket.emit('createOrderError', response);                      
        }
        const createSellersPayments = await this.createPayment(payments);
        const createPlacedOrder = await this.placeOrder(order, user);
        const createRecievedOrder = await this.receiveOrder(order, user);
        response = {
            socketId: socketId,
            status:200, 
            error : false, 
            message : 'order placed successfully', 
        };
        self.serverSocket.emit('createOrderSuccess', response);      
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

ProductOrderController.prototype.confirmDelivery = async function(data = {}) {
    const { socketId, order, user} = data;
    const self = this;
    const userId = user.id;
    const sellerEmail = order.sellerEmail;
    const sellerId = order.sellerId;
    const orderId = order.orderId;
    const deliveredProduct = true
    const orderData = {
        orderId,
        sellerEmail,
        sellerId,
    }
    const appUser = await this.authenticateUser(user, User);
    const sellerPayment = await Payment.getSellerPayment(orderData);
    const sellerOrder = await RecievedOrder.getSellerOrder(orderData);
   
    let response;
    try {       
        if (!appUser) {
            response = {
               socketId: socketId,
               status:401, 
               error : true, 
               message : 'no user found', 
            };
           return  self.serverSocket.emit('confirmDeliveryError', response);                      
        }
        sellerOrder.updateDeliveryStatus(deliveredProduct);
        const updatedOrder = await sellerOrder.save();
        // TODO... use escrow account SDK to realease funds to seller
        // after releasing  funds, update the payment status 
        // also update sellerRecievedPayment on the payment document to true after sellers account have been credited
        await sellerPayment.updatePaymentStatus("Funds released");
        const updatedSellerPayment = await sellerPayment.save();
     

    } catch(err) {

    }
   
    
        
}
module.exports = ProductOrderController;