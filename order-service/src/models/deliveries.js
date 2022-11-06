
const mongoose = require('mongoose');
const OrderDeliverySchema =  mongoose.Schema({
    placedOrderId: { type: String, required: true },
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    buyerId: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerName: { type: String, required: true },
    delivered: { type: Boolean, default: false },
    deliveryRequestSent: { type: Boolean, default: false }, 
    sellerId: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerName: { type: String, required: true },
    products: [{}],
    createdAt: { type: Date, default: Date.now }
});

OrderDeliverySchema.methods.setSellerOrderToDeliverDetails = function (order, user, placedOrderId) {
    const { id, fullName, userEmail } = user;
    const {
        orderId,
        orderTime,
        sellerId,  
        sellerName, 
        sellerEmail, 
        products
    } = order;

    this.placedOrderId = placedOrderId;
    this.orderId = orderId;
    this.orderTime = orderTime;
    this.buyerId = id;
    this.buyerName = fullName;
    this.buyerEmail = userEmail;
    this.sellerId = sellerId;
    this.sellerName = sellerName;
    this.sellerEmail = sellerEmail;
    this.products = products; 
}

OrderDeliverySchema.statics.getSellerOrderByEmailAndOrderId = async function ({ sellerEmail, orderId }) {
    const recievedOrder = await this.find({
        $and: [{sellerEmail: sellerEmail}, {orderId: orderId}]
    });
    return recievedOrder;
}

OrderDeliverySchema.statics.getSellerOrderByEmailAndPlaceOrderId = async function ({ sellerEmail, placedOrderId }) {
    const recievedOrder = await this.findOne({
        $and: [{sellerEmail: sellerEmail}, {placedOrderId: placedOrderId}]
    });
    return recievedOrder;
}

OrderDeliverySchema.statics.getSellerOrdersByEmailOrId = async function({ sellerEmail, sellerId }) {
    const recievedOrder = await this.find({
        $or: [{sellerEmail: sellerEmail}, {sellerId: sellerId}]
    });
    return recievedOrder;
}

OrderDeliverySchema.statics.getBuyerOrdersByEmailOrId = function({buyerEmail, buyerId}) {
    const recievedOrder = this.find({
        $or: [{buyerEmail: buyerEmail}, {buyerId: buyerId}]
    });
    return recievedOrder;
}

OrderDeliverySchema.statics.getSellerOrderDeliveriesById = async function ({ sellerId }) {
    try {
        const [sellerPendingOrderDeliveries, sellerDeliveredOrders] = await Promise.all([
            this.find({
                $and: [{ sellerId: sellerId}, { delivered: false }]
            }),
            this.find({  
                $and: [ { sellerId: sellerId}, { delivered: true } ]
            })
        ])

        return ({
            pending: sellerPendingOrderDeliveries,
            delivered: sellerDeliveredOrders 
        })

    } catch (err) {
        throw new Error(err);
    }
}

OrderDeliverySchema.statics.getBuyerOrderDeliveriesById = async function ({ buyerId }) {
    try {
        const [buyerPendingOrderDeliveries, buyerDeliveredOrders] = await Promise.all([
            this.find({
                $and: [{buyerId: buyerId}, {delivered: false}]
            }),
            this.find({   
                $and: [{buyerId: buyerId}, {delivered: true}]
            })
        ])
    
        return ({
            pending: buyerPendingOrderDeliveries,
            delivered: buyerDeliveredOrders 
        })  
    } catch (err) {
        throw new Error(err);
    }
}

OrderDeliverySchema.statics.updateDeliveryStatus = async function ({ sellerId, placedOrderId, dileveryStatus }) {
    const recievedOrder = await this.updateOne(
        { $and: [{sellerId: sellerId}, {placedOrderId: placedOrderId}] }, 
        { "$set": {delivered: dileveryStatus} } 
    );

    return recievedOrder;
}

OrderDeliverySchema.statics.updateDeliveryRequestSent = async function ({ orderId, sellerId }, deliveryRequestSent) {
    const recievedOrder = await this.updateOne(
        { $and: [{sellerId: sellerId}, {orderId: orderId}] }, 
        { "$set": {deliveryRequestSent: deliveryRequestSent} } 
    );
    return recievedOrder;
}

const OrderDelivery = mongoose.model('recievedOrders', OrderDeliverySchema);
module.exports = OrderDelivery;