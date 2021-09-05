





const Payment = require('../../../models/paymentModel');


/**
 * @class 
 *  products order payment controller class 
 * @module ProductOrderPaymentController
 */
function PaymentController() {
    this.userClient;
    this.serverSocket; 
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} userClient - the socket.IO client that connects to the account service
 * @param {object} serverSocket - the socket.IO server socket that connects to the order service
 * 
 */
 PaymentController.prototype.mountSocket = function({ userClient, serverSocket}) {
    this.userClient = userClient ? userClient : null;
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get socket details
 */
 PaymentController.prototype.getSocketDetails = function() {
    return ({
        serverSocket: this.serverSocket,
        userClient: this.userClient,
    });
}

PaymentController.prototype.createPayment = async function(payments = []) {
    try {
       // create sellers  payment model instances and save in an array
        async function createSellersPaymentModelInstances(PaymentModel, payments) {
            const paymentsModels = [];
            for (let i = 0; i < payments.length; i++) {
                paymentsModels.push(new PaymentModel())
            }
            for (let i = 0; i < paymentsModels.length; i++) {
               await paymentsModels[i].setPaymentDetails(payments[i])
            }
           return paymentsModels;
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

PaymentController.prototype.createProductOrderPayment =  async function(io, socket, data = {}) {
    const { socketId, user, payments } = data;
    const self = this;
    let response;
   
    try {
        const createSellersPayments = await this.createPayment(payments);
        response = {
            socketId: socketId,
            status:200, 
            error : false, 
            message : 'payments created successfully',
            data: createSellersPayments, 
        };
        self.serverSocket.emit('createPaymentSuccess', response);
        // TODO... emit notification to account service
              
    } catch(err) {
        console.log(err.stack);
        response = {
            socketId: socketId,
            status:401, 
            error : true, 
            message : 'An error occured while placing order', 
        };
        self.serverSocket.emit('createPaymentError', response); 
    } 
}

PaymentController.prototype.paySellerAfterDelivery = async function(io, socket, data = {}) {
    const { socketId, order, user} = data;
    const self = this;
    const userId = user.id;
    const sellerEmail = order.sellerEmail;
    const sellerId = order.sellerId;
    const orderId = order.orderId;
    let response;
    const orderData = {
        orderId,
        sellerEmail,
        sellerId,
    }
    
    try { 
        const sellerPayment = await Payment.getSellerPayment(orderData);      
        // TODO... use escrow account SDK to realease funds to seller
        // after releasing  funds, update the payment status 
        // also update sellerRecievedPayment on the payment document to true after sellers account have been credited
        await sellerPayment.updatePaymentStatus("Funds released");
        const updatedSellerPayment = await sellerPayment.save();
        self.serverSocket.emit('sellerPaymentSuccessfull', response); 
    } catch(err) {

    }       
}
module.exports = PaymentController;