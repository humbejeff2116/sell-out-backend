







const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');





const UserSchema =  mongoose.Schema({
    fullName: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    profileImage: { type: String },
    isNewUser: { type: Boolean, default: true},
    contactEmail: { type: String },
    contactNumber: { type: String },
    country: { type: String },
    city: { type: String },
    address: { type: String },
    starsUserGave: [{}],
    starsUserRecieved: [{}],
    commentsUserMade: [{}],
    repliesUserMade: [{}],
    commentsUserLiked: [{}],
    commentsUserUnLiked: [{}],
    notifications: [{}],
    productsInterestedIn: [{}],
    interestRecived: [{}],
    productUserBought: [],
    productsUserSold: [{}],
    userConfirmations: [{}],
   createdAt: { type: Date, default: Date.now }
});
UserSchema.pre('save' , function(next) {
    let user = this;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
           return next(err);
        }
        bcrypt.hash(user.password, salt, function(err, hashedpassword) {
            if (err) {
                return next(err);
            }
            user.password = hashedpassword;
            next();
        });
    });
});

UserSchema.statics.getAllUsers = function() {
    let users = this.find({});
    return users;
}
UserSchema.statics.getUserByEmail = function(userEmail) {
    let user = this.findOne({userEmail});
    return user;
}
UserSchema.statics.getUserById = function(userId) {
    let user = this.findOne({ _id: userId });
    return user;
}

UserSchema.statics.getAllUserInterest = async function(userId, callback) {
    const user = await this.findOne({ _id: userId });
    if (!user) {
        return callback(true, null)
    }
    const interest = {
        interestRecived: user.interestRecived,
        productsInterestedIn: user.productsInterestedIn
    }
    return callback(null, interest);

}

UserSchema.statics.getAllUserConfirmations = async function(userId, callback) {
    const user = await this.findOne({ _id: userId });
    if (!user) {
        return callback(true, null)
    }
    const confirmations =  user.userConfirmations;  
    return callback(null, confirmations);
}
UserSchema.statics.updateSeenNotifications =  async function(user) {
    try {
        const appUser = await this.findOne({userEmail: user.userEmail});
        const notifications = appUser.notifications;
        for(let i = 0; i < notifications.length; i++) {
            if (notifications[i].seen) {
                await this.updateOne(
                    { userEmail: user.userEmail, "notifications.seen": false }, 
                    { "$set": { "notifications.$.seen": true } }
                );
            }
        }
        return true
    }catch(err) {
        throw err;
    }
}

UserSchema.methods.setUserDetails = function(user = {}) {

    this.fullName = user.fullname;
    this.userEmail = user.email;
    this.password = user.password;
}
UserSchema.methods.updateUser = function(userData = {}) {

    this.userEmail = userData.email;
    this.isNewUser = false;
    this.contactEmail = userData.contactEmail;
    this.contactNumber = userData.contactNumber;
    this.country = userData.country;
    this.city = userData.city
    this.address = userData.address;
}

UserSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};
UserSchema.methods.addStarUserRecieved = function(data) {
    const { user, starCount } = data;
    const self = this;
    const star = parseInt(starCount);
    const starData = {
        star: star,
        starGiverEmail: user.userEmail,
        starGiverId: user.id,
        starGiverFullName: user.fullName
    }
    function findUserPos(starGiverEmail) {
        for (let i = 0; i < self.starsUserRecieved.length; i++) {
            if (self.starsUserRecieved[i].starGiverEmail === starGiverEmail) {
                return i;
            }
        }
        return -1;
    }
    let starGiverPos = findUserPos(user.userEmail);
    if (starGiverPos > -1) {
        return this.starsUserRecieved;
    }
    return this.starsUserRecieved.push(starData);   
}

UserSchema.methods.addStarUserGave = function(data) {
    const { user, product, createdAt, starCount } = data;
    const self = this;
    const starUserGaveData = {
        sellerEmail: product.userEmail,
        sellerId: product.userId,
        createdAt: createdAt ? createdAt : Date.now()
    }

    function findUserPos(starRecieverEmail) {
        for (let i = 0; i < self.starsUserGave.length; i++) {
            if (self.starsUserGave[i].starGiverEmail === starRecieverEmail) {
                return i;
            }
        }
        return -1;
    }
    let starRecieverPos = findUserPos(product.userEmail);
    if (starRecieverPos > -1) {
        return this.starsUserGave;
    } 
    return this.starsUserGave.push(starUserGaveData);  
}

// removes star which the user recieved from the person logged in (user)
// collects the person logged in (user) and check in the starsUserRecieved array fro user
// 
UserSchema.methods.removeStarUserRecieved = function(data) {
    const { user } = data;
    const self = this;
    const starGiverEmail = user.userEmail;
    function findUserPos(starGiverEmail) {
        for (let i = 0; i < self.starsUserRecieved.length; i++) {
            if (self.starsUserRecieved[i].starGiverEmail === starGiverEmail) {
                return i;
            }
        }
        return -1;
    }
    let userPos = findUserPos(starGiverEmail);
    if (userPos > -1) {
        this.starsUserRecieved.splice(userPos, 1);
        return this.starsUserRecieved; 
    }
    return this.starsUserRecieved;
}

// removes star user gave to a product
// collects the product and check in the starsUserGave array for the product
// removes the star from the array if it finds it
UserSchema.methods.removeStarUserGave = function(data) {
    const {  product } = data;
    const self = this;
    const sellerEmail = product.userEmail;
    function findUserPos(sellerEmail) {
        for (let i = 0; i < self.starsUserGave.length; i++) {
            if (self.starsUserGave[i].sellerEmail === sellerEmail) {
                return i;
            }
        }
        return -1;
    }
    let sellerPos = findUserPos(sellerEmail);
    if (sellerPos > -1) {
        this.starsUserGave.splice(sellerPos, 1);
        return this.starsUserGave;
    } 
    return this.starsUserGave; 
}


UserSchema.methods.addCommentsUserMade = function(data) {
    const { productOrService, comment } = data;
    const commentsUserMade = {
        sellerEmail: productOrService.userEmail,
        sellerId: productOrService.userId,
        commentId: comment._id,
        createdAt: comment.createdAt
    }

    return this.commentsUserMade.push(commentsUserMade);  
}

UserSchema.methods.addRepliesUserMade = function(data) {
    const { user, comment } = data;
    const replyUserMade = {
        commentId: comment._id,
        commentMakerName: comment.userName,
        createdAt: comment.createdAt
    }

    return this.repliesUserMade.push(replyUserMade);  
}
UserSchema.methods.addCommentUserLiked = function(data) {
    const { comment } = data;
    const commentsUserLiked = {
        commentId: comment._id,
        commentMakerEmail: comment.userEmail,
        createdAt: comment.createdAt
    }
    return this.commentsUserLiked.push(commentsUserLiked);  
}

UserSchema.methods.addCommentUserUnLiked = function(data) {
    const { comment } = data;
    const commentsUserUnLiked = {
        commentId: comment._id,
        commentMakerEmail: comment.userEmail,
        createdAt: comment.createdAt
    }
    return this.commentsUserUnLiked.push(commentsUserUnLiked);  
}

UserSchema.methods.addUserNotification = function(notificationData) {
    return this.notifications.push(notificationData);  
}

UserSchema.methods.addInterestRecieved = function(data) {
    const {user, productOrService} = data;
    let interestData;
    if (productOrService.hasOwnProperty("serviceId")) {
        interestData = {
            userId : user.id,
            userName: user.fullName,
            userProfileImage: user.profileImage,
            productOrServiceId: productOrService.serviceId,
            productOrServiceName: productOrService.serviceName
        }
        return this.interestRecived.push(interestData); 
    }
    interestData = {
        userId : user.id,
        userName: user.fullName,
        userProfileImage: user.profileImage,
        productOrServiceId: productOrService.productId,
        productOrServiceName: productOrService.productName,
        productOrServiceImages: productOrService.productImages
    }
        return this.interestRecived.push(interestData); 
    
}
UserSchema.methods.addProductInterestedIn = function(data) {
    const {user, productOrService} = data;
    let interestData;
    if (productOrService.hasOwnProperty("serviceId")) {
        interestData = {
            productOrServiceId: productOrService.serviceId,
            productOrServiceName: productOrService.serviceName,
        }
        return this.productsInterestedIn.push(interestData); 
    }
    interestData = {
            productOrServiceId: productOrService.productId,
            productOrServiceName: productOrService.productName,
            productOrServiceImages: productOrService.productImages
    }
        return this.ProductsInterestedIn.push(interestData);
}

UserSchema.methods.addProductUserBought = function(data) {
    const {user, productOrService} = data;
    
}

UserSchema.methods.addProductUserSold = function(data) {
    const {user, productOrService} = data;
    
}

UserSchema.methods.addBuyRequest = function(data) {
    const {user, productOrService} = data;   
}


UserSchema.methods.displayName = function() {
    return this.displayname || `${this.fullName}`;
} 

const User = mongoose.model('User',UserSchema );
module.exports = User;