
const mongoose = require('mongoose');
const PlacedOrderSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    buyerId: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerName: { type: String, required: true },
    products: [{}],
   createdAt: { type: Date, default: Date.now }
});

PlacedOrderSchema .methods.setPlacedOrderDetails = function (data) {
    const { 
        orderId, 
        orderTime, 
        buyerName, 
        buyerEmail, 
        buyerId, 
        products 
    } = data;

    this.orderId = orderId;
    this.orderTime = orderTime;
    this.buyerName = buyerName;
    this.buyerEmail = buyerEmail;
    this.buyerId = buyerId;
    this.products = products; 
}

PlacedOrderSchema.statics.getOrdersByUserEmail = async function (email) {
    const placedOrders = await this.find({buyerEmail: email});
    return placedOrders;
}

PlacedOrderSchema.statics.getBuyerOrderByEmailAndOrderId = async function ({ buyerEmail, orderId }) {
    const placedOrder = await this.find({
        $and: [{buyerEmail: buyerEmail }, {_id: orderId}]
    });
    return placedOrder;
}

PlacedOrderSchema.statics.getOrdersByUserId = async function (id) {
    const placedOrders = await this.find({buyerId: id});
    return placedOrders;
}
PlacedOrderSchema.statics.updateDeliveryStatus = async function ({ 
    buyerEmail, 
    buyerId, 
    orderId, 
    sellerEmail, 
    sellerId, 
    dileveryStatus, 
    placedOrderId
}) {
    const updatedOrderStatus =  await this.updateOne(
        { $and: [{buyerEmail: buyerEmail}, {_id: placedOrderId}], "products.sellerEmail": sellerEmail }, 
        { "$set": {"products.$.productsDelivered": dileveryStatus} }
    )
    return updatedOrderStatus;
}

const PlacedOrder = mongoose.model('placedOrders', PlacedOrderSchema);
module.exports = PlacedOrder;