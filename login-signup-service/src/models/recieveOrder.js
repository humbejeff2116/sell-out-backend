








const mongoose = require('mongoose');





const RecievedOrderSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    buyerId: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerUserName: { type: String, required: true },
    delivered: { type: Boolean, default: false },
    productsBuyerBought: [{}],
    createdAt: { type: Date, default: Date.now }
});
RecievedOrderSchema.methods.setRecievedOrderDetails = function(order, user) {

    this.orderId = order.orderId;
    this.orderTime = order.orderTime;
    this.buyerId = user.id;
    this.buyerUserName = user.fullName;
    this.buyerEmail = user.buyerEmail;
    this.sellerId = order.buyerId;
    this.sellerUserName = order.fullName;
    this.sellerEmail = order.buyerEmail;
    this.productsBuyerBought = order.productsUserBoughtFromSeller; 
}

RecievedOrderSchema.statics.getRecievedOrderOrders = function(data) {
    //TODO... find order with orderId and sellerEmail and buyer email
    const {orderId, sellerEmail, sellerId, buyerEmail, buyerId} = data;
    let recievedOrder = this.find({});
    return recievedOrder;
}
RecievedOrderSchema.methods.updateDeliveryStatus = function(status) {
    return this.delivered = status
}


const RecievedOrder = mongoose.model('reicevedOrders', RecievedOrderSchema);
module.exports = RecievedOrder;