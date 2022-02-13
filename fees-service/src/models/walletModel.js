

const mongoose = require('mongoose');





const WalletSchema =  mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    transactions: [{}],
    createdAt: { type: Date, default: Date.now }
})

WalletSchema.methods.setWalletdetailsAnPaySeller = function({ 
    sellerId,
    sellerName,
    sellerEmail,
    paymentAmount, 
}) {
    this.userId = sellerId;
    this.userName = sellerName;
    this.userEmail = sellerEmail;
    this.totalAmount = paymentAmount;
   
}

WalletSchema.statics.getUserWallet = async function({ sellerId, sellerEmail}) {
    const userWallet = await this.findOne({ userEmail: sellerEmail });
    return userWallet;
}
WalletSchema.statics.paySeller = async function({
    sellerId,
    sellerName,
    sellerEmail,
    paymentAmount, 
}) {
    const userWallet = await this.updateOne(
        { $and: [{ userEmail: sellerEmail }, {userId : sellerId}] },
        { $inc: { totalAmount: paymentAmount } }
    );
    return userWallet;
}





const Wallet = mongoose.model('userwallets', WalletSchema);
module.exports = Wallet;