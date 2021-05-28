







const mongoose = require('mongoose');






const ProductSchema =  mongoose.Schema({
    productName: {type: String , required: true},
    productCategory: {type: String , required: true},
    userEmail: {type: String},
    productEmail: {type: String, required: true, unique: true},
    productPhoneNumber: {type: String , required: true, },
    productImage: {type: String},
    stars: { required: false},
    unstars: { required: false},
    comments: {},
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
ProductSchema.statics.getProductById = function(productOrServiceId) {
    let productOrService = this.find({productOrServiceId});
    return productOrService;
}

ProductSchema.methods.addStar = function(data) {
    const star = parseInt(data.star);
    const userName = data.user.userName;
    const starData = {
        star,
        userName
    }
    this.stars.push(starData)

}
ProductSchema.methods.removeStar = function(data) {
    const userName = data.user.userName;
    function findUserPos(userName) {
        for (let i = 0; i < this.stars.length; i++) {
            if (this.stars[i].userName === userName ) {
                return i;
            }
        }
        return -1;
    }
    let userPos = findUserPos(userName);
    if (userPos > -1) {
        return this.stars.splice(userPos, 1);
    }

}

ProductSchema.methods.review = function(data) {
    let comment = data.comment
    let user = data.user.username;
    let commentData = {
        comment,
        user
    }
    this.comments.push(commentData);
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