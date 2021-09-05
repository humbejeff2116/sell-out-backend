








const mongoose = require('mongoose');





const PlacedOrderSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    buyerId: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerUserName: { type: String, required: true },
    productsBought: [{}],
   createdAt: { type: Date, default: Date.now }
});
PlacedOrderSchema .methods.setPlacedOrderDetails = function(data) {
    this.orderId = data.orderId;
    this.orderTime = data.orderTime;
    this.buyerUserName = data.fullName;
    this.buyerEmail = data.buyerEmail;
    this.buyerId = data.buyerId;
    this.productsBought = data.productsSellerSold; 
}

PlacedOrderSchema.statics.getOrdersByUserEmail = function(email) {
    let placedOrders = this.find({buyerEmail: email});
    return placedOrders;
}
PlacedOrderSchema.statics.getBuyerOrderByEmailAndOrderId = function({buyerEmail, orderId}) {
    let placedOrders = this.find({
        $and: [
            {buyerEmail: buyerEmail}, {orderId: orderId}
        ]
    });
    return placedOrders;
}

PlacedOrderSchema.statics.getOrdersByUserId = function(id) {
    let placedOrders = this.find({buyerId: id});
    return placedOrders;
}
PlacedOrderSchema.statics.updateDeliveryStatus =async function({buyerEmail, orderId, sellerEmail, dileveryStatus}) {
    const updatedOrderStatus =  await this.updateOne(
        { 
            $and: [
                {buyerEmail: buyerEmail}, { orderId: orderId }
            ], "productsBought.sellerEmail": sellerEmail 
        }, 
        { "$set": { "productsBought.$.productsDelivered": dileveryStatus} }
    );
    return updatedOrderStatus;
}

const PlacedOrder = mongoose.model('placedOrders', PlacedOrderSchema);
module.exports = PlacedOrder;