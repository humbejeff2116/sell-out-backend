





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

PaymentController.prototype.savePayment = async function(payments = []) {
    try {
       // loop payments and save individual seller payment to db
        async function saveSellerPayment(PaymentModel, payments) {
            const savedPayments = [];
            for (let i = 0; i < payments.length; i++) {
                const payment = new PaymentModel();
                await payment.setPaymentDetails(payments[i]);
                await payment.save().then(savedPayment => savedPayments.push(savedPayment));  
            }
            
           return savedPayments;
        }
      
        const savedPayments = await saveSellerPayment(Payment, payments);
        return ({
           paymentsCreated: true,
           errorExist: false,
           createdPayments: savedPayments
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
        const savedSellersPayments = await self.savePayment(payments);
        response = {
            socketId: socketId,
            status:200, 
            error : false, 
            message : 'payments created successfully',
            data: savedSellersPayments,
            user: user 
        }
        
        if (!savedSellersPayments.errorExist) {
             // emit to account service for notification
            self.userClient.emit('productPaymentCreated', response);
            // emit respone back to order service
            self.serverSocket.emit('createPaymentSuccess', response);
            // emit event to all connected services(sockets)
            io.emit('createPaymentSuccess', response);
        }
        
                  
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
        // TODO... get seller funds from db and release if payment status is pending
        // after releasing  funds to seller wallet, update the payment status 
        //TODO... implement seller wallet

       let makeSellerPayment = await Wallet.paySeller(sellerPayment);
        // also update sellerRecievedPayment on the payment document to true after sellers account have been credited
        if (!makeSellerPayment.error) {
            await sellerPayment.updatePaymentStatus("Funds released");
            const updatedSellerPayment = await sellerPayment.save();
    
            response = {
                socketId: socketId,
                status:200, 
                error : false, 
                message : 'payments released successfully',
                data: updatedSellerPayment,
                order: order,
                user: user 
            }
             //  send data to account service to notify buyer and seller
            self.userClient.emit('sellerPaymentFundsReleased', response);
            self.serverSocket.emit('sellerPaymentFundsReleased', response);
            return;
        }
        
    } catch(err) {

    }       
}
module.exports = PaymentController;