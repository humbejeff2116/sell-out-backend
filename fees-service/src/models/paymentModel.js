





const mongoose = require('mongoose');





const PaymentSchema =  mongoose.Schema({
    orderId: { type: String, required: true },
    orderTime: { type: String, required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    sellerId: { type: String, required: true },
    paymentAmount: { type: String , required: true },
    paymentStatus: { type: String, default: "pending" },
    sellerRecievedPayment: { type: Boolean, default: false },
    productsSellerSold: [{}],
    createdAt: { type: Date, default: Date.now }
});
PaymentSchema.methods.setPaymentDetails = function(data) {
    this.orderId = data.orderId;
    this.orderTime = data.orderTime;
    this.sellerId = data.sellerId;
    this.sellerName = data.sellerName;
    this.sellerEmail = data.sellerEmail;
    this.buyerId = data.buyerId;
    this.buyerName = data.buyerName;
    this.buyerEmail = data.buyerEmail;
    this.paymentAmount = data.totalAmount;
    this.productsSellerSold = data.productsSellerSold; 
}
PaymentSchema.statics.updatePaymentStatus = function(status) {
    return this.paymentStatus = status;
}

PaymentSchema.statics.getSellerPayment = function(data) {
    const {sellerEmail, orderId} = data
    let payment = this.findOne({
        $and:[
            {sellerEmail: sellerEmail}, {orderId: orderId}
        ]
    });
    return payment;
}
PaymentSchema.statics.getSellerPayments = function(data) {
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