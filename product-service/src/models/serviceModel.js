











const mongoose = require('mongoose');






const ServiceSchema =  mongoose.Schema({
    userName: { type: String, required: true },
    userId:{ type: String, required: true},
    userProfilePicture: { type: String }, 
    userEmail: { type: String, required: true, },

    serviceName: { type: String, required: true },
    serviceCategory: { type: String, required: true },
    serviceCountry: { type: String, required: true },
    serviceState: { type: String, required: true },
    serviceContactNumber: { type: String, required: true },
    serviceImages: [{}],
    stars: [{}],
    unstars: [{}],
    reviews: [{}],
    createdAt: { type: Date, default: Date.now }
});


ServiceSchema.statics.getServices= function( ) {
    let services = this.find({});
    return services;
}

ServiceSchema.statics.getUserServices = function(userName) {
    let services = this.find({userName});
    return services;
}
ServiceSchema.statics.getServicesById = function(userId) {
    let productOrService = this.find({userId});
    return productOrService;
}

ServiceSchema.methods.addStar = function(data) {
    const star = parseInt(data.star);
    const userName = data.user.userName;
    const starData = {
        star,
        userName
    }
    this.stars.push(starData);
}

ServiceSchema.methods.removeStar = function(data) {
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

ServiceSchema.methods.review = function(data) {
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

ServiceSchema.methods.setServiceDetails = function(data = {}) {
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

const Product = mongoose.model('services', ServiceSchema);
module.exports = Product;