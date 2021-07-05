











const mongoose = require('mongoose');






const CommentSchema =  mongoose.Schema({
    userId:{ type: String, required: true},
    userEmail: { type: String, required: true, },
    userName: {type: String, required: true},
    userProfileImage: { type: String }, 
    productOrServiceId: { type: String, required: true },
    productOrServiceName:{type:String},
    comment: {type: String, required: true},
    replies: [{}],
    likesCommentRecieved: [{}],
    unlikesCommentRecieved: [{}],
    createdAt: { type: Date, default: Date.now }
});


CommentSchema.statics.getAllComments = function( ) {
    let comments = this.find({});
    return comments;
}

CommentSchema.statics.getUserComments = function(userEmail) {
    let comments = this.find({userEmail});
    return comments;
}

CommentSchema.statics.getCommentById = function(commentId) {
    let comment = this.findOne({ _id: commentId });
    return comment;
}

CommentSchema.methods.setProductCommentDetails = function(data = {}) {
    const { productOrService, user, reviewMessage } = data;
    this.userId = user.id;
    this.userName = user.fullName;
    this.userEmail = user.userEmail;
    this.userProfileImage = user.profileImage;
    this.productOrServiceId = productOrService.productId
    this.productName = productOrService.productName;  
    this.comment = reviewMessage;
}

CommentSchema.methods.setServiceCommentDetails = function(data = {}) {
    const { productOrService, user, reviewMessage } = data;
    this.userId = user.id;
    this.userName = user.fullName;
    this.userEmail = user.userEmail;
    this.userProfileImage = user.profileImage;
    this.productOrServiceId = productOrService.serviceId
    this.productName = productOrService.serviceName; 
    this.comment = reviewMessage; 
}

CommentSchema.methods.addCommentReply = function(replyData) {
    this.replies.push(replyData);  
}


CommentSchema.methods.addLikeCommentRecieved = function(data) {
    const { user, likeCount } = data;
    const self = this;
    const like = parseInt(likeCount);
    const likeData = {
        like: like,
        likeGiverEmail: user.userEmail,
        likeGiverId: user.id,
        likeGiverFullName: user.fullName
    }
    function findUserPos(likeGiverEmail) {
        for (let i = 0; i < self.likesCommentRecieved.length; i++) {
            if (self.likesCommentRecieved[i].likeGiverEmail === likeGiverEmail) {
                return i;
            }
        }
        return -1;
    }
    let likeGiverPos = findUserPos(user.userEmail);
    if (likeGiverPos > -1) {
        return this.likesCommentRecieved;
    }
    return this.likesCommentRecieved.push(likeData);   
}
CommentSchema.methods.removeLikeCommentRecieved = function(data) {
    const { user } = data;
    const self = this;
    const likeGiverEmail = user.userEmail;
    function findUserPos(likeGiverEmail) {
        for (let i = 0; i < self.likesCommentRecieved.length; i++) {
            if (self.likesCommentRecieved[i].likeGiverEmail === likeGiverEmail) {
                return i;
            }
        }
        return -1;
    }
    const userPos = findUserPos(likeGiverEmail);
    console.log("user position", userPos);
    if (userPos > -1) {
        this.likesCommentRecieved.splice(userPos, 1);
        console.log(this.likesCommentRecieved);
        return this.likesCommentRecieved;  
    }
    return this.likesCommentRecieved;
}



CommentSchema.methods.addUnlikeCommentRecieved = function(data) {
    const { user, unlikeCount } = data;
    const self = this;
    const unlike = parseInt(unlikeCount);
    const likeData = {
        unlike: unlike,
        unlikeGiverEmail: user.userEmail,
        unlikeGiverId: user.id,
        unlikeGiverFullName: user.fullName
    }
    function findUserPos(unlikeGiverEmail) {
        for (let i = 0; i < self.unlikesCommentRecieved.length; i++) {
            if (self.unlikesCommentRecieved[i].unlikeGiverEmail === unlikeGiverEmail) {
                return i;
            }
        }
        return -1;
    }
    let unlikeGiverPos = findUserPos(user.userEmail);
    if (unlikeGiverPos > -1) {
        return this.unlikesCommentRecieved;
    }
    return this.unlikesCommentRecieved.push(likeData);   
}
CommentSchema.methods.removeUnlikeCommentRecieved = function(data) {
    const { user } = data;
    const self = this;
    const unlikeGiverEmail = user.userEmail;
    function findUserPos(unlikeGiverEmail) {
        for (let i = 0; i < self.unlikesCommentRecieved.length; i++) {
            if (self.unlikesCommentRecieved[i].unlikeGiverEmail === unlikeGiverEmail) {
                return i;
            }
        }
        return -1;
    }
    const userPos = findUserPos(unlikeGiverEmail);
    console.log("user position", userPos);
    if (userPos > -1) {
        this.unlikesCommentRecieved.splice(userPos, 1);
        console.log(this.unlikesCommentRecieved);
        return this.unlikesCommentRecieved;  
    }
    return this.unlikesCommentRecieved;
}

const Comment = mongoose.model('comments', CommentSchema);
module.exports = Comment;