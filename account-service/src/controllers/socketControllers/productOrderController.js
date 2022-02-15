

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

// TODO... implement  error handling method
ProductOrderController.prototype.handleError = function(err) {

}


ProductOrderController.prototype.notifySellerAboutOrder = async function(data, io) {
    const self = this;
    const { user, recievedOrders, placedOrder, socketId } = data;
    let sellerNotification;
    let response; 

    try {
        // get the user(buyer) document
        const appUser = await User.getUserByEmail(user.userEmail);
        // attach pre order notification to each seller document
        const attachedSellersNotifcation = await attachSellersNotification(recievedOrders);
        console.log("users after attaching notifications", attachedSellersNotifcation.sellers)
        response = {
            socketId: socketId,
            status:201, 
            error : false, 
            message : 'pre order notification added successfully', 
        };
        io.emit('userDataChange', response);

        async function attachSellersNotification(recievedOrders) {
            const sellers = [];
            try {
                for (let i = 0; i < recievedOrders.length; i++) {
                    sellerNotification = {
                        type: "recieveOrder",
                        userId: appUser._id,
                        userName: appUser.fullName,
                        userEmail: appUser.userEmail,
                        userProfileImage: appUser.profileImage,
                        orderId: recievedOrders[i]._id,
                        message: "recieved an order",
                        seen: false
                    }
                    
                    const seller = await User.getUserByEmail(recievedOrders[i].sellerEmail);
                    if (seller) {
                        await seller.addUserNotification(sellerNotification);
                        const updatedSeller = await seller.save();
                        sellers.push(updatedSeller);
                    }
                }
               
                return ({ sellers });
                
            } catch (err) {
                console.error(err)
                
            }
            
            
        }
       
    } catch(err) {
        console.error(err.stack);
    }     
}


ProductOrderController.prototype.notifySellerABoutPendingPayment = async function(data, io) {
    const { socketId, createdPayments, user } = data;
    let sellerNotification;
    let response; 

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
        };
        io.emit('userDataChange', response);

        async function attachSellersNotification(createdPayments) {
            const sellers = [];
            try {
                for (let i = 0; i < createdPayments.length; i++) {
                    sellerNotification = {
                        type: "productPayment",
                        userId: appUser._id,
                        userName: appUser.fullName,
                        userEmail: appUser.userEmail,
                        userProfileImage: appUser.profileImage,
                        paymentId: createdPayments[i]._id,
                        placedOrderId: createdPayments[i].placedOrderId,
                        message: "Have pending payment release for an order",
                        seen: false
                    }
                    
                    const seller = await User.getUserByEmail(createdPayments[i].sellerEmail);
                    if (seller) {
                        await seller.addUserNotification(sellerNotification);
                        const updatedSeller = await seller.save();
                        sellers.push(updatedSeller);
                    }
                }
                return ({ sellers: sellers })
                
            } catch (err) {
                console.error(err);
                
            }
            
            
        }
       
    } catch(err) {
        console.error(err);
    }     
   
}



ProductOrderController.prototype.addProductDeliveredNotification = async function(data, io) {
    const self = this;
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
            await seller.addUserNotification(sellerNotification);
            const updatedSeller = await seller.save();
            
            response = {
                socketId: socketId,
                status:201, 
                error : false, 
                message : 'order delivery notification added successfully', 
            }
            console.log("added product delivered notification")
            io.emit('userDataChange', response);
        }

    } catch(err) {
        console.error(err.stack);
    }  
}
module.exports = ProductOrderController;