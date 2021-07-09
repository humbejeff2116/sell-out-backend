











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
    comments: [{}],
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
ServiceSchema.statics.getServiceById = function(userId) {
    let productOrService = this.findOne({ _id: userId });
    return productOrService;
}

ServiceSchema.methods.addStar = function(data) {
    const star = parseInt(data.star);
    const userName = data.user.userName;
    const starData = {
        star,
        userName,
        time: Date.now()
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
    const {user, reviewMessage} = data;
    const reviewData = {
        userId: user.id,
        userName: user.fullName,
        userEmail: user.userEmail,
        userProfilePicture: user.profileImage,
        review: reviewMessage,
        time: Date.now()
    }
    this.reviews.push(reviewData);
}

ServiceSchema.methods.addInterest = function(data) {
    const { user, productOrService } = data;
    const interestData = {
        userId: user.id,
        userEmail: user.userEmail,
        intrested: true,
        time: Date.now()
    }
    function findUserPos(userEmail) {
        for (let i = 0; i < this.interests.length; i++) {
            if (this.interests[i].userEmail === userEmail ) {
                return i;
            }
        }
        return -1;
    }
    const userPos = findUserPos(user.userEmail);
    if(userPos > -1) {
        return this.interests;
    }
    return this.interests.push(interestData);
}

ServiceSchema.methods.removeInterest = function(data) {
    const { user } = data;
    function findUserPos(userEmail) {
        for (let i = 0; i < this.interests.length; i++) {
            if (this.interests[i].userEmail === userEmail ) {
                return i;
            }
        }
        return -1;
    }
    const userPos = findUserPos(user.userEmail); 
    if(userPos > -1) {
        this.interests.splice(userPos, 1);
        return this.interests;
    }
    return this.interests;   
}

ServiceSchema.methods.setServiceDetails = function(data = {}) {
    const {service, user} = data;
    this.userName = user.fullName;
    this.userEmail = user.userEmail;
    this.userId = user._id;
    this.userProfilePicture = user.profileimage;

    this.serviceName = service.serviceName;
    this.serviceCategory = service.serviceCategory;
    this.serviceImages = service.serviceImages;
    this.serviceCountry = service.serviceCountry;
    this.serviceState = service.serviceState;
    this.serviceContactNumber = service.serviceContactNumber;
}

const Product = mongoose.model('services', ServiceSchema);
module.exports = Product;