

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
                }else {
                    throw err
                }
            }
           
            return ({ sellers });
        }
       
    } catch(err) {
        console.error(err.stack);
    }     
}

module.exports = ProductOrderController;