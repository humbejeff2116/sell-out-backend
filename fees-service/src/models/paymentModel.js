
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

PaymentSchema.methods.setPaymentDetails = function(data, placedOrderId) {

    this.placedOrderId = placedOrderId;
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

PaymentSchema.statics.updatePaymentStatus = async function({ 

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

PaymentSchema.statics.getSellerPayment = function({ placedOrderId, sellerEmail, sellerId }) {

    let payment = this.findOne({

        $and:[
            {sellerEmail: sellerEmail}, { placedOrderId: placedOrderId }
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

PaymentSchema.statics.getSellerPaymentsByEmailOrId = async function({sellerEmail, sellerId}) {

    const payments = await this.find({

        $or:[
            {sellerEmail: sellerEmail}, { sellerId: sellerId }
        ]

    });

    return payments;

}

PaymentSchema.statics.getBuyerPaymentsByEmailOrId = async function({buyerEmail, buyerId}) {

    const payments = await this.find({

        $or:[
            {buyerEmail: buyerEmail}, { buyerId: buyerId }
        ]

    });

    return payments;

}

const Payment = mongoose.model('payments', PaymentSchema);

module.exports = Payment;