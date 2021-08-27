





const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');





const PaymentSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    sellerId: { type: String, required: true },
    paymentAmount: {type: String},
    productsSellerSold: [{}],
   createdAt: { type: Date, default: Date.now }
});
PaymentSchema.methods.setPaymentDetails = function(data) {
    this.orderId = data.orderId;
    this.orderTime = data.orderTime;
    this.sellerName = data.sellerName;
    this.sellerEmail = data.sellerEmail;
    this.sellerId = data.sellerId;
    this.buyerName = data.buyerName;
    this.buyerEmail = data.buyerEmail;
    this.buyerId = data.buyerId;
    this.paymentAmount = data.paymentAmount
    this.productsSellerSold = data.productsSellerSold 
}

PaymentSchema.statics.getSellerPayment = function(data) {
    // find order with orderId and sellerEmail and buyer email
    const {orderId, sellerEmail, sellerId, buyerEmail, buyerId} = data;
    let payment = this.find({});
    return payment;
}
PaymentSchema.statics.getSellerPayments = function(data) {
    const {userEmail} = data
    let payments = this.find({userEmail});
    return payments;
}
PaymentSchema.statics.getAllSellerPayments = function(data) {
    const {userEmail} = data
    let payments = this.find({userEmail});
    return payments;
}
PaymentSchema.statics.getBuyerPayments = function(data) {
    const {userEmail} = data
    let payments = this.find({userEmail});
    return payments;
}





const Payment = mongoose.model('payments', PaymentSchema);
module.exports = Payment;