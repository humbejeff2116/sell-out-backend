







const mongoose = require('mongoose');






const ProductSchema =  mongoose.Schema({
    userName: { type: String, required: true },
    userId:{ type: String, required: true},
    userProfileImage: { type: String }, 
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
    comments: [{}],
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
    let productOrService = this.findOne({ _id: userId });
    return productOrService;
}

ProductSchema.methods.addStar = function(data) {
    const star = parseInt(data.star);
    const userName = data.user.userName;
    const starData = {
        star,
        userName,
        time: Date.now()
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
    const {user, reviewMessage} = data;
   
    let userName = user.fullName;
    let userEmail = user.userEmail;
    let userId = user.id;
    let userProfilePicture = user.profileImage;
    let review = reviewMessage

    const reviewData = {
        userId,
        userName,
        userEmail,
        userProfilePicture,
        review,
        time: Date.now()
    }
    this.reviews.push(reviewData);
}

ProductSchema.methods.setProductDetails = function(data = {}) {
    const {product, user} = data;
    this.userName = user.fullName;
    this.userEmail = user.userEmail;
    this.userId = user._id;
    this.userProfileImage = user.profileImage;
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