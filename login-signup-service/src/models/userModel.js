







const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');





const UserSchema =  mongoose.Schema({
    fullName: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    profileimage: { type: String },
    starsGiven : [{}],
    stars: [{}],
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save' , function(next) {
    let user = this;
    if(!user.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
        if(err){
            return next(err);
        }
        bcrypt.hash(user.password, salt,function(err, hashedpassword) {
            if(err) {
                return next(err);
            }
            user.password = hashedpassword;
            next();
        });
    });
});
UserSchema.statics.getUserByEmail = function(userEmail) {
    let user = this.findOne({userEmail});
    return user;
}
UserSchema.statics.getUserById = function(userId) {
    let user = this.findOne({ _id: userId });
    return user;
}

UserSchema.methods.setUserDetails = function(user = {}) {

    this.fullName = user.fullname;
    this.userEmail = user.email;
    // this.phonenumber = user.phonenumber;
    this.password = user.password;
    // this.profileimage = user.profileimage;
}

UserSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};
UserSchema.methods.addStarRecieved = function(data) {
    const { user, starCount } = data;
    const star = parseInt(starCount);
    const starData = {
        star: star,
        starGiverEmail: user.userEmail,
        starGiverId: user.id,
        starGiverFullName: user.fullName
    }
    this.stars.push(starData);
}

UserSchema.methods.removeStarRecieved = function(data) {
    const { user } = data;
    const starGiverEmail = user.userEmail;
    function findUserPos(starGiverEmail) {
        for (let i = 0; i < this.stars.length; i++) {
            if (this.stars[i].starGiverEmail === starGiverEmail) {
                return i;
            }
        }
        return -1;
    }
    let sellerPos = findUserPos(starGiverEmail);
    if (sellerPos > -1) {
        return this.stars.splice(sellerPos, 1);
    }
}

UserSchema.methods.addStarsGiven = function(data) {
    const { user, product, starCount } = data;
    const starGivenData = {
        sellerEmail: product.userEmail,
        sellerId: product.userId,
    }
    this.starsGiven.push(starGivenData)  
}

UserSchema.methods.removeStarsGiven = function(data) {
    const {  product } = data;
    const sellerEmail = product.userEmail;
    function findUserPos(sellerEmail) {
        for (let i = 0; i < this.stars.length; i++) {
            if (this.stars[i].sellerEmail === sellerEmail) {
                return i;
            }
        }
        return -1;
    }
    let sellerPos = findUserPos(sellerEmail);
    if (sellerPos > -1) {
        return this.starsGiven.splice(sellerPos, 1);
    }
    
}

UserSchema.methods.displayName = function() {
    return this.displayname || `${this.fullName}`;
} 

const User = mongoose.model('User',UserSchema );
module.exports = User;