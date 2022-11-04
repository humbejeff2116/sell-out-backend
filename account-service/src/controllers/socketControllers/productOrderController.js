
const User = require('../../models/userModel');

function ProductOrderController() {
    this.gatewayClient = null;
    this.serverSocket = null;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} serverSocket - the socket.IO server socket of the login server
 */
 ProductOrderController.prototype.mountSocket = function({ serverSocket, gatewayClient }) {
    this.gatewayClient = gatewayClient || null;
    this.serverSocket = serverSocket || null;
    return this;
}

/**
 * @method getSocket  
 ** Used to get the service node socket datesils
 */
 ProductOrderController.prototype.getSocket = function () {
    return this.serverSocket;
}

ProductOrderController.prototype.authenticateUser = async function (userdata, userModel) {
    if (!userdata) {
        throw new Error("userdata is not defined");
    }
    const userEmail = userdata.email;
    
    try {
        const appUser = await userModel.getUserByEmail(userEmail);
        return appUser;
    } catch (err) {
        console.error(err);
    }
}

// TODO... implement  error handling method
ProductOrderController.prototype.handleError = function (err) {

}

ProductOrderController.prototype.notifySellerAboutOrder = async function (data, io) {
    const self = this;
    const { user, recievedOrders, placedOrder, socketId } = data;
    let sellerNotification;
    let response;

    async function attachSellersNotification(recievedOrders) {
        const sellers = [];

        try {
            let i;
            const recievedOrdersLen = recievedOrders.length;

            for (i = 0; i < recievedOrdersLen; i++) {
                sellerNotification = {
                    type: "recieveOrder",
                    userId: appUser._id,
                    userName: appUser.fullName,
                    userEmail: appUser.userEmail,
                    userProfileImage: appUser.profileImage,
                    orderId: recievedOrders[i]._id,
                    message: "recieved a pre order",
                    seen: false
                } 
                const seller = await User.getUserByEmail(recievedOrders[i].sellerEmail);

                if (seller) {
                    const addSellerNotification = await User.addUserNotification({ userId: recievedOrders[i].sellerId , sellerNotification });
                    sellers.push(addSellerNotification);
                }
            } 
            return ({ sellers });  
        } catch (err) {
            console.error(err); 
        }   
    } 

    try {
        // get the user(buyer) document
        const appUser = await User.getUserByEmail(user.userEmail);
        // attach pre order notification to each seller document
        const attachedSellersNotifcation = await attachSellersNotification(recievedOrders);
        console.log("users after attaching notifications", attachedSellersNotifcation.sellers);

        response = {
            socketId: socketId,
            status: 201, 
            error : false, 
            message: 'pre order notification added successfully', 
        }
        this.gatewayClient.emit('userDataChange', response);
    } catch(err) {
        console.error(err);
    }     
}


ProductOrderController.prototype.notifySellerABoutPendingPayment = async function (data, io) {
    const { socketId, createdPayments, user } = data;
    let sellerNotification;
    let response;

    async function attachSellersNotification(createdPayments) {
        const sellers = [];

        try {
            let i;
            const createdPaymentsLen = createdPayments.length;

            for (i = 0; i < createdPaymentsLen; i++) {
                sellerNotification = {
                    type: "productPayment",
                    userId: appUser._id,
                    userName: appUser.fullName,
                    userEmail: appUser.userEmail,
                    userProfileImage: appUser.profileImage,
                    paymentId: createdPayments[i]._id,
                    placedOrderId: createdPayments[i].placedOrderId,
                    message: "Have a pending payment release for an order",
                    seen: false
                }
                const seller = await User.getUserByEmail(createdPayments[i].sellerEmail);

                if (seller) {
                   const addSellerNotification = await User.addUserNotification({ userId:createdPayments[i].sellerId, sellerNotification });
                    sellers.push(addSellerNotification);
                }
            }
            return ({ sellers: sellers }); 
        } catch (err) {
            console.error(err);  
        }           
    }

    try {
        // get the user(buyer) document
        const appUser = await User.getUserByEmail(user.userEmail);
        // attach pending payment notification to each seller document
        const attachedSellersNotifcation = await attachSellersNotification(createdPayments);
        console.log("users after attaching pending payment notification", attachedSellersNotifcation.sellers);
        response = {
            socketId: socketId,
            status:201, 
            error : false, 
            message : 'pending payment notification added successfully', 
        }
        this.gatewayClient.emit('userDataChange', response);
    } catch(err) {
        console.error(err);
    }     
}

ProductOrderController.prototype.addProductDeliveredNotification = async function (data, io) {
    const { socketId, order, user } = data;
    let sellerNotification;
    let response; 

    try {
        // get the user(buyer) document
        const appUser = await User.getUserByEmail(user.userEmail);
        // attach order deliverd notification to seller document
        const seller = await User.getUserByEmail(order.sellerEmail);

        if (seller) {
            sellerNotification = {
                type: "deliveredOrder",
                userId: appUser._id,
                userName: appUser.fullName,
                userEmail: appUser.userEmail,
                userProfileImage: appUser.profileImage,
                orderId: order._id,
                placedOrderId: order.placedOrderId,
                message: "Recieved your order",
                seen: false
            }
            const addUserNotification = await User.addUserNotification({ userId: order.sellerId, sellerNotification });

            if (addUserNotification.status === 201) {
                response = {
                    socketId: socketId,
                    status:201, 
                    error : false, 
                    message : 'order delivery notification added successfully', 
                }
                console.log("added product delivered notification")
                this.gatewayClient.emit('userDataChange', response);
            }         
        }

    } catch(err) {
        console.error(err.stack);
    } 
}

ProductOrderController.prototype.addPaymentFundReleasedNotification = async function (data, io) {
    const { socketId, order, user } = data;
    let sellerNotification;
    let response; 

    try {
        // get the user(buyer) document
        // attach order deliverd notification to seller document
        const [appUser, seller] = await Promise.all([
            User.getUserByEmail(user.userEmail),
            User.getUserByEmail(order.sellerEmail)
        ])

        if (seller) {
            sellerNotification = {
                type: "funds released",
                userId: appUser._id,
                userName: appUser.fullName,
                userEmail: appUser.userEmail,
                userProfileImage: appUser.profileImage,
                orderId: order._id,
                placedOrderId: order.placedOrderId,
                message: "Released your funds",
                seen: false
            }

            const addUserNotification = await User.addUserNotification({ userId: order.sellerId, sellerNotification });
            
            if (addUserNotification.status === 201) {
                response = {
                    socketId: socketId,
                    status:201, 
                    error : false, 
                    message : 'funds release notification added successfully', 
                }
                console.log("added release funds notification")
                this.gatewayClient.emit('userDataChange', response);
            }
        }
    } catch(err) {
        console.error(err.stack);
    } 
}

ProductOrderController.prototype.addConfirmOrderDeliveryRequestNotification = async function (data, io) {
    const { socketId, deliveryRequest} = data;
    let sellerNotification;
    let buyerNotification;
    let response; 

    try {
        // get the buyer and seller documents
        const [buyer, seller] = await Promise.all([
            User.getUserById(deliveryRequest.buyerId),
            User.getUserId(deliveryRequest.sellerId) 
        ])

        buyerNotification = {
            type: "delivery request",
            userId: seller._id,
            userName: seller.fullName,
            deliveryRequestId: deliveryRequest._id,
            orderId: deliveryRequest.orderId,
            message: "recieved delivery confirmation request",
            seen: false
        }

        sellerNotification = {
            type: "delivery request",
            userId: buyer._id,
            userName: buyer.fullName,
            deliveryRequestId: deliveryRequest._id,
            orderId: deliveryRequest.orderId,
            message: "sent delivery confirmation request",
            seen: false
        }

        const [addBuyerNotification, addSellerNotification] = await Promise.all([
            User.addUserNotification({ userId: deliveryRequest.buyerId, buyerNotification }),
            User.addUserNotification({ userId: deliveryRequest.sellerId, sellerNotification })
        ]);
        
        if (addBuyerNotification.status === 201 && addSellerNotification.status === 201) {
            response = {
                socketId: socketId,
                status:201, 
                error : false, 
                message : 'confirm order delivery notification added', 
            }
            console.log("added confirm order delivery notification")
            this.gatewayClient.emit('userDataChange', response);
        }
    } catch(err) {
        console.error(err);
    } 
}

module.exports = ProductOrderController;