
const Payment = require('../../../models/paymentModel');
const Wallet = require('../../../models/walletModel');

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

PaymentController.prototype.savePayment = async function(payments = [], placedOrderId) {

    try {

       // loop payments and save individual seller payment to db
        async function saveSellerPayment(PaymentModel, payments, placedOrderId) {

            const savedPayments = [];

            for (let i = 0; i < payments.length; i++) {

                const payment = new PaymentModel();

                await payment.setPaymentDetails(payments[i], placedOrderId);

                await payment.save().then(savedPayment => savedPayments.push(savedPayment)); 

            }
            
           return savedPayments;

        }
      
        const savedPayments = await saveSellerPayment(Payment, payments, placedOrderId);

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

    const { socketId, user, payments, placedOrderId } = data;

    const self = this;

    let response;

    try {

        const savedSellersPayments = await self.savePayment(payments, placedOrderId);

        response = {
            socketId: socketId,
            status:200, 
            error : false, 
            message : 'payments created successfully',
            data: savedSellersPayments.createdPayments,
            user: user 
        }
        
        if (!savedSellersPayments.errorExist) {

            const paymentNotificationData = {
                socketId: socketId,
                status:200, 
                error : false, 
                createdPayments: savedSellersPayments.createdPayments,
                user: user 
            }

             // emit to account service for notification
            self.userClient.emit('productPaymentCreated', paymentNotificationData);

            // emit respone back to order service
            self.serverSocket.emit('createPaymentSuccess', response);

            // emit event to all connected services(sockets)
            io.emit('createPaymentSuccess', response);

        }
                    
    } catch(err) {

        console.log(err);

        response = {
            socketId: socketId,
            status:401, 
            error : true, 
            message : 'An error occured while placing order', 
        }

        self.serverSocket.emit('createPaymentError', response); 

    } 

}

PaymentController.prototype.paySellerAfterDelivery = async function(io, socket, data = {}) {

    const { socketId, order, user} = data;

    const self = this;

    let response;

    const orderData = {
        placedOrderId: order.placedOrderId,
        sellerEmail: order.sellerEmail,
        sellerId: order.sellerId,
        orderAmount: order.a,
        paymentReleaseStatus: "released",
        sellerRecievedPayment: true
    }
   
    try { 
        
        const sellerPayment = await Payment.getSellerPayment(orderData);

        console.log("gotten seller payment from db", sellerPayment) 

        if (!sellerPayment) {

            // TODO... return an error response
            response = {

            }

            returnErrorResponse(response);

            return;

        }

        if (sellerPayment && sellerPayment.paymentReleaseStatus === "released") {

            // TODO... return an error response as funds have been released
            console.log("funds released")

            response = {
                
            }

            returnErrorResponse(response);

           return

        }

        // pay seller to his/her wallet
        const paymentdata = {
            sellerId: sellerPayment.sellerId,
            sellerName: sellerPayment.sellerName,
            sellerEmail: sellerPayment.sellerEmail,
            paymentAmount: sellerPayment.paymentAmount, 
        }

        // check if seller has a wallet
        const sellerWallet = await Wallet.getUserWallet(paymentdata);

        if (!sellerWallet) {

            const sellerWallet =  new Wallet();

            sellerWallet.setWalletDetailsAndPaySeller(paymentdata);

           const savedSellerPayment = await sellerWallet.save();

           // update payment status after releasing funds to seller wallet
           updatePaymentStatusAndSendResponse(orderData, savedSellerPayment);

           return;

        }

        const makeSellerPayment = await Wallet.paySeller(paymentdata);

        if (!makeSellerPayment.error) {

             // update payment status after releasing funds to seller wallet
             updatePaymentStatusAndSendResponse(orderData);

        }

        async function updatePaymentStatusAndSendResponse(orderData, savedSellerPayment) {

            const updatedPaymentReleaseStatus = await Payment.updatePaymentStatus(orderData)

            if (updatedPaymentReleaseStatus.ok  && updatedPaymentReleaseStatus.n) {

                response = {
                    socketId: socketId,
                    status:200, 
                    error : false, 
                    message : 'payments released successfully',
                    // data: updatedSellerPayment,
                    order: order,
                    user: user 
                }

                //  send data to account service to notify buyer and seller
                self.userClient.emit('sellerPaymentFundsReleased', response);

                self.serverSocket.emit('sellerPaymentFundsReleased', response);

                return;

            }

        }

        function returnErrorResponse(response) {

            self.userClient.emit('sellerPaymentFundsReleaseError', response);

            self.serverSocket.emit('sellerPaymentFundsReleaseError', response);

            return;

        }
 
    } catch(err) {

    } 

}

PaymentController.prototype.getUserPayments =async function(io, socket, data = {}) {

    try {

        const { socketId, user } = data;

        const self = this;

        let response;

        const queryData = {
            sellerEmail: user.userEmail,
            buyerEmail:user.userEmail,
            sellerId: user.id,
            buyerId: user.id
        }

        const recievedPayments = await Payment.getSellerPaymentsByEmailOrId(queryData);

        const paymentsMade = await Payment.getBuyerPaymentsByEmailOrId(queryData);

        const responseData = { paymentsMade, recievedPayments }

        response = {
            status: 200,
            error: false,
            socketId: socketId,
            data: responseData,
            message: 'user payments gotten successfully',
        }  

        self.serverSocket.emit('getUserPaymentsSuccess', response);


    } catch(err) {

        console.error(err)

    }   

}

module.exports = PaymentController;