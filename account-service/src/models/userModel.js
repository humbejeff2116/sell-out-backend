
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema =  mongoose.Schema({

    fullName: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    profileImage: { type: String },
    isNewUser: { type: Boolean, default: true},
    allowedToSell: { type: Boolean, default: false },
    contactEmail: { type: String },
    contactNumber: { type: String },
    contactAddress: { type: String },
    country: { type: String },
    city: { type: String },
    brandName: { type: String },
    residentialAddress: { type: String },
    deliveryRegions: [String],
    starsUserGave: [{}],
    starsUserRecieved: [{}],
    commentsUserMade: [{}],
    repliesUserMade: [{}],
    commentsUserLiked: [{}],
    commentsUserDisliked: [{}],
    notifications: [{}],
    productsInterestedIn: [{}],
    interestRecived: [{}],
    productUserBought: [],
    productsUserSold: [{}],
    productsUserLiked: [{}],
    userConfirmations: [{}],
    searchData: [{}],
   createdAt: { type: Date, default: Date.now }

})

UserSchema.pre('save' , function(next) {

    const self = this;

    if (!self.isModified("password")) {

        return next();

    }

    bcrypt.genSalt(10, function(err, salt) {

        if (err) {

           return next(err);

        }

        bcrypt.hash(self.password, salt, function(err, hashedpassword) {

            if (err) {

                return next(err);

            }

            self.password = hashedpassword;

            next();

        })

    })

})

UserSchema.statics.getAllUsers = function() {

    let users = this.find({});
    
    return users;

}

UserSchema.statics.getUserByEmail = async function(userEmail) {

    const user = await this.findOne({userEmail});

    return user;

}

UserSchema.statics.getUserById = async function(userId) {

    try {

        const user = await this.findOne({ _id: userId });

        return user;
        
    } catch (err) {

        throw err
        
    } 

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

        const notifications = user.notifications;

        let i;

        notificationsLen = notifications.length;

        for(i = 0; i < notificationsLen; i++) {

            if (!notifications[i].seen) {

                await this.updateOne(
                    { userEmail: user.userEmail, "notifications.seen": false }, 
                    { "$set": { "notifications.$.seen": true } }
                );

            }

        }

        return true

    } catch(err) {

        throw err;

    }

}

UserSchema.statics.addStarUserGave = async function({ user, product, createdAt, starCount }) {

    const starUserGaveData = {
        userEmail: product.userEmail,
        userId: product.userId,
        createdAt: createdAt ? createdAt : Date.now()
    }
    const buyer = await this.findOne({_id: user.id});

    const starsUserGave = buyer.starsUserGave;

    // check if buyer gave seller a star
    // if buyer did, return
    if (gaveSellerStar(product.userEmail, starsUserGave)) {

        return({status: 201, updated: false, data: null});

    } 

    const updateStarsUserGave = await this.updateOne({ _id: user.id }, { $push: { starsUserGave: starUserGaveData } });

    return ({ status: 201, updated: true, data: updateStarsUserGave })

}

UserSchema.statics.removeStarUserGave = async function({ user, product, starCount }) {

    const buyer = await this.findOne({_id: user.id})

    const starsUserGave = buyer.starsUserGave;

    if (!gaveSellerStar(product.userEmail, starsUserGave)) {

        return ({status: 201, updated: false, data: null});

    } 

    const updateStarsUserGave = await this.updateOne({ _id: user.id }, { $pull: { starsUserGave: { userId: product.userId } } });

    return ({ status: 201, updated: true, data: updateStarsUserGave }); 
}

UserSchema.statics.addStarUserRecieved = async function({ user, product, starCount }) {

    const star = parseInt(starCount);

    const starData = {
        star: star,
        userEmail: user.userEmail,
        userId: user.id,
        userFullName: user.fullName
    }

    const seller = await this.findOne({_id: product.userId});

    const starsUserRecieved = seller.starsUserRecieved;
    //  check if seller recieved a star from buyer
    // if seller already recieved star form user  return  
    if (recievedBuyerStar(user.userEmail, starsUserRecieved)) {

        return ({status: 201, updated: false, data: null})

    }

    const updateStarsUserRecieved = await this.updateOne({_id: product.userId}, {$push: {starsUserRecieved: starData}})

    return ({status: 201, updated: true, data: updateStarsUserRecieved });

}

UserSchema.statics.removeStarUserRecieved = async function({ user, product, starCount }) {

    const seller = await this.findOne({_id: product.userId});

    const starsUserRecieved = seller.starsUserRecieved;

    if (!recievedBuyerStar(user.userEmail, starsUserRecieved)) {
       
        return ({ status: 201, updated: false, data: null });

    }

    const updateStarsUserRecieved = await this.updateOne({ _id: product.userId }, { $pull: { starsUserRecieved: { userId: user.id } } });

    return ({ status: 201, updated: true, data: updateStarsUserRecieved });

}


UserSchema.statics.addCommentUserMade = async function({ user, product, comment }) {

    const commentsUserMade = {
        sellerEmail: product.userEmail,
        sellerId: product.userId,
        commentId: comment._id,
        createdAt: comment.createdAt
    }

    const updateCommentsUserMade  = await this.updateOne({ _id: user.id }, { $push: { commentsUserMade: commentsUserMade } });

    return ({ status: 201, updated: true, data: updateCommentsUserMade })  
}

UserSchema.statics.addRepliesUserMade = async function({ user, comment }) {
   
    const replyUserMade = {
        commentId: comment._id,
        commentMakerName: comment.userName,
        createdAt: comment.createdAt
    }

    const updateRepliesUserMade = await this.updateOne({ _id: user.id }, { $push: { repliesUserMade: replyUserMade } })

    return ({ status: 201, updated: true, data: updateRepliesUserMade }); 

}

UserSchema.statics.addCommentUserLiked = async function({ comment, user }) {

    const commentUserLiked = {
        commentId: comment._id,
        commentMakerEmail: comment.userEmail,
        createdAt: comment.createdAt
    }

    const updateCommentsUserLiked = await this.updateOne({_id: user.id}, { $push: { commentsUserLiked: commentUserLiked } })

    return ({ status: 201, updated: true, data: updateCommentsUserLiked })  

}

UserSchema.statics.addCommentUserUnLiked = async function({ comment, user }) {

    const commentUserDisliked = {
        commentId: comment._id,
        commentMakerEmail: comment.userEmail,
        createdAt: comment.createdAt
    }

    const updateCommentsUserDisliked = await this.updateOne({ _id: user.id }, { $push: { commentsUserDisliked: commentUserDisliked } })

    return ({ status: 201, updated: true, data: updateCommentsUserDisliked })  

}

UserSchema.statics.addUserNotification = async function({userId, notificationData, type}) {

    const addUserNotification = this.updateOne({ _id: userId }, { $push: { notifications: notificationData } })

    return ({ status: 201, updated: true, data: addUserNotification })

}

UserSchema.statics.removeUserNotification = async function({userId, sellerId, }) {

    const addUserNotification = this.updateOne(
        { _id: sellerId }, 
        { $pull: { notifications: { $and: [ { userId: userId }, { type: type } ] } } }
    )

    return ({ status: 201, updated: true, data: addUserNotification })

}

// TODO... 
UserSchema.statics.updateUser = async function(userData = {}) {

    const { userId, key, value } = userData

    let updatedUser = await this.updateOne({ _id: userId }, { $set: { [ key ]: value } } )

}

UserSchema.statics.addProductUserLiked = async function({ product, user }) {

    const productUserLiked = {
        productId: product.productId,
        sellerId: product.userId,
    }

     const buyer = await this.findOne({_id: user.id});

    const productsUserLiked = buyer.productsUserLiked;

    // check if buyer gave seller a star
    // if buyer did, return
    if (gaveProductLike(product.productId, productsUserLiked)) {

        return({status: 201, updated: false, data: null});

    } 

    const updateProductsUserLiked = await this.updateOne({ _id: user.id }, { $push: { productsUserLiked: productUserLiked } });

    return ({ status: 201, updated: true, data: updateProductsUserLiked })  

}

UserSchema.statics.removeProductUserLiked = async function({ product, user }) {

     const buyer = await this.findOne({_id: user.id});

    const productsUserLiked = buyer.productsUserLiked;

    // check if buyer liked product
    // if buyer didnt, return
    if (!gaveProductLike(product.productId, productsUserLiked)) {

        return({status: 201, updated: false, data: null});

    } 

    const updateProductsUserLiked = await this.updateOne({ _id: user.id }, { $pull: { productsUserLiked: { productId: product.productId } } });

    return ({ status: 201, updated: true, data: updateProductsUserLiked })  

}

UserSchema.statics.updateUserSearch = async function({ query, user, searchProductsLength  }) {

    const appUser = await this.findOne({_id: user.id});

    let newUserQuery

    if (searchProductsLength) {

        newUserQuery = {
            query: query.toString().toLowerCase(),
            foundProducts: true,
            time: Date.now()
        }

    } else {

        newUserQuery = {
            query: query.toString().toLowerCase(),
            foundProducts: false,
            time: Date.now()
        }

    }

   const userSearchQueries = appUser.searchData;

   // check if query already exist
    if (userSearchQueryExist(query, userSearchQueries)) {

        return({ status: 201, updated: false, data: null });

    } 

   const updateSearchQueries = await this.updateOne({ _id: user.id }, { $push: { searchData: newUserQuery } });

   return ({ status: 201, updated: true, data: updateSearchQueries })  

}

UserSchema.statics.removeUserSearch = async function({ searchQuery, user  }) {

    const appUser = await this.findOne({_id: user.id});

    let newUserQuery

    

   const userSearchQueries = appUser.searchData;

   // check if query already exist
    if (!userSearchQueryExist(searchQuery.query, userSearchQueries)) {

        return({ status: 201, updated: false, data: null });

    } 

   const updateSearchQueries = await this.updateOne({ _id: user.id }, { $pull: { searchData: { query : searchQuery.query.toLowerCase()} } });

   return ({ status: 201, updated: true, data: updateSearchQueries })  

}

UserSchema.methods.setUserDetails = function(user = {}) {

    this.fullName = user.fullName;

    this.userEmail = user.email;

    this.password = user.password;

}

UserSchema.statics.updateUser = async function(userData = {}) {

    const { 
        contactEmail, 
        contactNumber, 
        contactAddress, 
        brandName, 
        country, 
        city, 
        residentialAddress, 
        userEmail, 
        deliveryRegions,
        userId ,
        userProfileImageURL
    } = userData;

    const updateUser = await this.updateOne(

        { _id: userId },

        { 
            $set: {
                userEmail: userEmail, 
                contactEmail: contactEmail,
                contactNumber: contactNumber,
                contactAddress: contactAddress,
                brandName: brandName,
                country: country,
                city: city, 
                residentialAddress: residentialAddress,
                // deliveryRegions: deliveryRegions,
                profileImage: userProfileImageURL,
                allowedToSell: true 
            }
        }

    )

    const updatedUser = await this.findOne({_id: userId});

    return ({status: 201, error: false, data: updatedUser});

}

UserSchema.methods.checkPassword = function(guess, done) {

    bcrypt.compare(guess, this.password, function(err, isMatch) {

        done(err, isMatch);

    });

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

function userSearchQueryExist(query, userSearchQueries) {

    let i;

    const userSearchQueriesLen = userSearchQueries.length;

    for (i = 0; i < userSearchQueriesLen; i++) {

        if (userSearchQueries[i].query.toLowerCase() === query.toLowerCase()) {

            return true

        }

    }

    return false;

}

 

function gaveSellerStar(sellerEmail, starsUserGave) {

    let i;

    const starsUserGaveLen = starsUserGave.length;

    for (i = 0; i < starsUserGaveLen; i++) {

        if (starsUserGave[i].userEmail === sellerEmail) {

            return true;

        }

    }

    return false;

}

function recievedBuyerStar(buyerEmail, starsUserRecieved) {

    let i;

    const starsUserRecievedLen = starsUserRecieved.length;

    for (i = 0; i < starsUserRecievedLen; i++) {

        if (starsUserRecieved[i].userEmail === buyerEmail) {

            return true;

        }

    }
    return false;
}

function gaveProductLike(productId, productsUserLiked) {

    let i;

    const productsUserLikedLen = productsUserLiked.length;

    for (i = 0; i < productsUserLikedLen; i++) {

        if (productsUserLiked[i].productId === productId) {

            return true;

        }

    }

    return false;

}

function dislikedProduct(productId, productsUserDisliked) {
    
    let i;

    const productsUserDislikedLen = productsUserDisliked.length;

    for (i = 0; i < productsUserDislikedLen; i++) {

        if (productsUserDisliked[i].productId === productId) {

            return true;

        }

    }
    
    return false;

}

const User = mongoose.model('User',UserSchema );

module.exports = User;