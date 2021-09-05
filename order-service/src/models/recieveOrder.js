








const mongoose = require('mongoose');





const RecievedOrderSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    buyerId: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerUserName: { type: String, required: true },
    delivered: { type: Boolean, default: false },
    sellerId: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerUserName: { type: String, required: true },
    delivered: { type: Boolean, default: false },
    productsSold: [{}],
    createdAt: { type: Date, default: Date.now }
});
RecievedOrderSchema.methods.setRecievedOrderDetails = function(order, user) {

    this.orderId = order.orderId;
    this.orderTime = order.orderTime;
    this.buyerId = user.id;
    this.buyerUserName = user.fullName;
    this.buyerEmail = user.buyerEmail;
    this.sellerId = order.sellerId;
    this.sellerUserName = order.sellerName;
    this.sellerEmail = order.sellerEmail;
    this.productsBuyerBought = order.productsUserBoughtFromSeller; 
}

RecievedOrderSchema.statics.getSellerOrderByEmailAndOrderId = function({sellerEmail, orderId}) {
    //TODO... find order with orderId and sellerEmail and buyer email
    let recievedOrder = this.find({
        $and: [
            {sellerEmail: sellerEmail}, {orderId: orderId}
        ]
    });
    return recievedOrder;
}
RecievedOrderSchema.statics.getSellerOrdersByEmailOrId = function({sellerEmail, sellerId}) {
    let recievedOrder = this.find({
        $or: [
            {sellerEmail: sellerEmail}, {sellerId: sellerId}
        ]
    });
    return recievedOrder;
}
RecievedOrderSchema.statics.getBuyerOrdersByEmailOrId = function({buyerEmail, buyerId}) {
    let recievedOrder = this.find({
        $or: [
            {buyerEmail: buyerEmail}, {buyerId: buyerId}
        ]
    });
    return recievedOrder;
}
RecievedOrderSchema.methods.updateDeliveryStatus = function(status) {
    return this.delivered = status
}


const RecievedOrder = mongoose.model('reicevedOrders', RecievedOrderSchema);
module.exports = RecievedOrder;