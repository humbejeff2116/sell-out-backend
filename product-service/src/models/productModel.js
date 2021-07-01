







const mongoose = require('mongoose');






const ProductSchema =  mongoose.Schema({
    userName: { type: String, required: true },
    userId:{ type: String, required: true},
    userProfilePicture: { type: String }, 
    userEmail: { type: String, required: true, },
    productName: { type: String, required: true },
    productCategory: { type: String, required: true },
    productCountry: { type: String, required: true },
    productState: { type: String, required: true },
    productUsage: { type: String },
    productCurrency: { type: String, required: true },
    productPrice: { type: String, required: true },
    productContactNumber: { type: String, required: true },
    productImages: [{}],
    stars: [{}],
    unstars: [{}],
    reviews: [{}],
    createdAt: { type: Date, default: Date.now }
});


ProductSchema.statics.getProducts = function( ) {
    let products = this.find({});
    return products;
}

ProductSchema.statics.getUserProducts = function(userName) {
    let products = this.find({userName});
    return products;
}
ProductSchema.statics.getProductById = function(userId) {
    let productOrService = this.find({ _id: userId });
    return productOrService;
}

ProductSchema.methods.addStar = function(data) {
    const star = parseInt(data.star);
    const userName = data.user.userName;
    const starData = {
        star,
        userName
    }
    this.stars.push(starData);
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
    const {user, review, ...rest } = data;
    let comment = review
    let userName = user.username;
    let userId = user.userId;
    let userProfilePicture = user.userProfilePicture;

    const reviewData = {
        comment,
        userName,
        userId,
        userProfilePicture
    }
    this.reviews.push(reviewData);
}

ProductSchema.methods.setProductDetails = function(data = {}) {
    const {product, user} = data;
    console.log(data);
    this.userName = user.fullName;
    this.userEmail = user.userEmail;
    this.userId = user._id;
    this.userProfilePicture = user.profileimage;
    this.productName = product.productName;
    this.productCategory = product.productCategory;
    this.productImages = product.productImages;
    this.productCountry = product.productCountry;
    this.productState = product.productState;
    this.productUsage = product.productUsage;
    this.productCurrency = product.productCurrency;
    this.productPrice = product.productPrice;
    this.productContactNumber = product.productContactNumber;
}

const Product = mongoose.model('Products', ProductSchema);
module.exports = Product;