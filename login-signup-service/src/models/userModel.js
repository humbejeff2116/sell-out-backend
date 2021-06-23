







const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');





const UserSchema =  mongoose.Schema({
    fullName: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    // userName: { type: String, required: true, unique: true },
    // phonenumber: { type: String, required: true },
    password: { type: String, required: true },
    // profileimage: { type: String },
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

UserSchema.methods.setUserDetails = function( user={}) {

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

UserSchema.methods.displayName = function() {
    return this.displayname || `${this.fullName}`;
} 

const User = mongoose.model('User',UserSchema );
module.exports = User;