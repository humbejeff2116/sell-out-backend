
const mongoose = require('mongoose');
const OrderDeliveryRequestSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    sellerId: { type: String, required: true },
    buyerId: { type: String, required: true },
    recievedOrder: { type: Boolean, default: false },
    products: [{}],
    createdAt: { type: Date, default: Date.now }
});


OrderDeliveryRequestSchema.methods.setOrderDeliveryRequestDetails = function(order, user) {
    const { orderId, buyerId, products  } = order;
    const { id } = user;

    this.orderId = orderId;
    this.sellerId = id;
    this.buyerId = buyerId;
    this.products = products; 
}

OrderDeliveryRequestSchema.statics.getOrderDeliveryRequestByBuyerId = async function (buyerId) {
    const recievedOrder = await this.find({buyerId: buyerId});
    return recievedOrder;
}

OrderDeliveryRequestSchema.statics.updateRecievedOrder = async function ({ orderId, buyerId, recievedOrderStatus }) {
    const recievedOrder = await this.updateOne(
        { $and: [{orderId: orderId}, {buyerId: buyerId}] }, 
        { "$set": {recievedOrder: recievedOrderStatus} } 
    );
    return recievedOrder;
}

const OrderDeliveryRequest = mongoose.model('deliveryRequests', OrderDeliveryRequestSchema);
module.exports = OrderDeliveryRequest;