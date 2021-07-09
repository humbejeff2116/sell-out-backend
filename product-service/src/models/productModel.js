







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
    sold: { type: Boolean },
    productImages: [{}],
    stars: [{}],
    unstars: [{}],
    comments: [{}],
    interests: [{}],
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
ProductSchema.methods.addInterest = function(data) {
    const {user, productOrService } = data;
    const self = this;
    const interestData = {
        userId: user.id,
        userEmail: user.userEmail,
        productName: productOrService.productName,
        productId: productOrService.productId,
        time: Date.now()
    }
    function findUserPos(userEmail) {
        for (let i = 0; i < self.interests.length; i++) {
            if (self.interests[i].userEmail === userEmail ) {
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

ProductSchema.methods.removeInterest = function(data) {
    try {
        const {user, productOrService } = data;
        const self = this;
        function findUserPos(userEmail) {
            for (let i = 0; i < self.interests.length; i++) {
                if (self.interests[i].userEmail === userEmail ) {
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

    } catch(e) {
        console.error(e.stack);
    }
      
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