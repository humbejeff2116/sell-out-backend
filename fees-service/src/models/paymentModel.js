
const mongoose = require('mongoose');
const PaymentSchema =  mongoose.Schema({
    placedOrderId: { type: String, required: true },
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerId: { type: String, required: true },
    paymentAmount: { type: String , required: true },
    paymentReleaseStatus: { type: String, default: "pending" },
    sellerRecievedPayment: { type: Boolean, default: false },
    productsSellerSold: [{}],
    createdAt: { type: Date, default: Date.now }
});

PaymentSchema.methods.setPaymentDetails = function (data, placedOrderId) {
    const {
        orderId, 
        orderTime, 
        sellerId, 
        sellerName, 
        sellerEmail, 
        buyerId, 
        buyerName, 
        buyerEmail, 
        totalAmount,
        productsSellerSold 
    } = data;

    this.placedOrderId = placedOrderId;
    this.orderId = orderId;
    this.orderTime = orderTime;
    this.sellerId = sellerId;
    this.sellerName = sellerName;
    this.sellerEmail = sellerEmail;
    this.buyerId = buyerId;
    this.buyerName = buyerName;
    this.buyerEmail = buyerEmail;
    this.paymentAmount = totalAmount;
    this.productsSellerSold = productsSellerSold; 
}

PaymentSchema.statics.updatePaymentStatus = async function ({ 
    placedOrderId, 
    sellerEmail, 
    sellerId,  
    paymentReleaseStatus = "released", 
    sellerRecievedPayment = true 
}) {
    const updatePaymentReleaseStatus = await this.updateOne(
        { $and: [{sellerEmail: sellerEmail}, { placedOrderId: placedOrderId }] },
        { "$set": {"paymentReleaseStatus":  paymentReleaseStatus, "sellerRecievedPayment": sellerRecievedPayment } }
    )
    return updatePaymentReleaseStatus;
}

PaymentSchema.statics.getSellerPayment = async function ({ placedOrderId, sellerEmail, sellerId }) {
    const payment = await this.findOne({
        $and: [{sellerEmail: sellerEmail}, {placedOrderId: placedOrderId}]
    });

    return payment;
}

PaymentSchema.statics.getSellerPayments = async function (data) {
    const { userEmail } = data
    const payments = await this.find({userEmail});

    return payments;
}

PaymentSchema.statics.getBuyerPayments = async function (data) {
    const { userEmail } = data
    const payments = await this.find({userEmail});

    return payments;
}

PaymentSchema.statics.getSellerPaymentsByEmailOrId = async function ({ sellerEmail, sellerId }) {
    const payments = await this.find({
        $or: [{sellerEmail: sellerEmail}, {sellerId: sellerId}]
    });

    return payments;
}

PaymentSchema.statics.getBuyerPaymentsByEmailOrId = async function ({ buyerEmail, buyerId }) {
    const payments = await this.find({
        $or: [{buyerEmail: buyerEmail}, {buyerId: buyerId}]
    });

    return payments;
}

PaymentSchema.statics.getSellerPaymentsById = async function ({ sellerId }) {
    try {
        const [pendingPayments, recievedPayments] = await Promise.all([
            this.find({
                $and: [{sellerId: sellerId}, {sellerRecievedPayment: false}]
            }),
            this.find({ 
                $and: [{ sellerId: sellerId }, {sellerRecievedPayment: true}]
            })
        ])
    
        return ({
            pending: pendingPayments,
            recieved: recievedPayments 
        })   
    } catch (err) {
        throw new Error(err);
    }
}

PaymentSchema.statics.getBuyerPaymentsById = async function ({ buyerId }) {
    try {
        const [unReleasedPayments, releasedPayments] = await Promise.all([
            this.find({
                $and: [{buyerId : buyerId}, {sellerRecievedPayment: false}]
            }),
            this.find({
                $and: [{buyerId : buyerId}, {sellerRecievedPayment: true}]
            })
        ])
    
        return ({
            unReleased: unReleasedPayments,
            released: releasedPayments 
        })
 
    } catch (err) {
        throw new Error(err);
    }
}

const Payment = mongoose.model('payments', PaymentSchema);
module.exports = Payment;