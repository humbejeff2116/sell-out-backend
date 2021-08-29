








const mongoose = require('mongoose');





const PlacedOrderSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    buyerId: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerUserName: { type: String, required: true },
    productsBuyerBought: [{}],
   createdAt: { type: Date, default: Date.now }
});
PlacedOrderSchema .methods.setPlacedOrderDetails = function(data) {
    this.orderId = data.orderId;
    this.orderTime = data.orderTime;
    this.buyerUserName = data.fullName;
    this.buyerEmail = data.buyerEmail;
    this.buyerId = data.buyerId;
    this.productsSellerSold = data.productsSellerSold; 
}

PlacedOrderSchema.statics.getPlacedOrders = function(data) {
    //TODO... find order with orderId and sellerEmail and buyer email
    const {orderId, sellerEmail, sellerId, buyerEmail, buyerId} = data;
    let placedOrder = this.find({});
    return placedOrder;
}


const PlacedOrder = mongoose.model('placedOrders', PlacedOrderSchema);
module.exports = PlacedOrder;