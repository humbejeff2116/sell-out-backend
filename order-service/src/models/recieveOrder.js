








const mongoose = require('mongoose');





const RecievedOrderSchema =  mongoose.Schema({
    placedOrderId: { type: String, required: true },
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
RecievedOrderSchema.methods.setSellerOrderToDeliverDetails = function(order, user, placedOrderId) {
    this.placedOrderId = placedOrderId;
    this.orderId = order.orderId;
    this.orderTime = order.orderTime;
    this.buyerId = user.id;
    this.buyerUserName = user.fullName;
    this.buyerEmail = user.userEmail;
    this.sellerId = order.sellerId;
    this.sellerUserName = order.sellerName;
    this.sellerEmail = order.sellerEmail;
    this.productsSold = order.productsUserBoughtFromSeller; 
}

RecievedOrderSchema.statics.getSellerOrderByEmailAndOrderId = async function({sellerEmail, orderId}) {
    let recievedOrder = await this.find({
        $and: [
            {sellerEmail: sellerEmail}, {orderId: orderId}
        ]
    });
    return recievedOrder;
}

RecievedOrderSchema.statics.getSellerOrderByEmailAndPlaceOrderId = async function({sellerEmail, placedOrderId}) {
    let recievedOrder = await this.findOne({
        $and: [
            { sellerEmail: sellerEmail }, { placedOrderId: placedOrderId }
        ]
    });
    return recievedOrder;
}
RecievedOrderSchema.statics.getSellerOrdersByEmailOrId = async function({sellerEmail, sellerId}) {
    let recievedOrder = await this.find({
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

RecievedOrderSchema.statics.updateDeliveryStatus = async function({ orderId, sellerEmail, sellerId, placedOrderId, dileveryStatus }) {
    const recievedOrder = await this.updateOne(
        { $and: [ { sellerEmail: sellerEmail }, { placedOrderId: placedOrderId } ] }, 
        {"$set": {delivered: dileveryStatus}} 
    );
    return recievedOrder;
}



RecievedOrderSchema.methods.updateDeliveryStatus = function(status) {
    return this.delivered = status
}


const RecievedOrder = mongoose.model('recievedOrders', RecievedOrderSchema);
module.exports = RecievedOrder;