







const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');





const ProductSchema =  mongoose.Schema({
    productName: {type: String , required: true},
    productCategory: {type: String , required: true},
    userEmail: {type: String},
    productEmail: {type: String, required: true, unique: true},
    productPhoneNumber: {type: String , required: true, },
    productImage: {type: String},
    createdAt: { type: Date , default: Date.now},
});


ProductSchema.statics.getProducts = function( ) {
    let products = this.find({});
    return products;
}
ProductSchema.statics.getUserProduct = function(productEmail) {
    let products = this.find({productEmail});
    return products;
}



ProductSchema.methods.setProductDetails = function( product = {}) {
    this.productName = product.productName;
    this.productCategory = product.productCategory;
    this.userEmail = product.userEmail;
    this.productEmail = product.productEmail;
    this.productPhoneNumber = product.productPhoneNumber;
    this.productImage = product.productImage;
}


const Product = mongoose.model('User', ProductSchema);
module.exports = Product;