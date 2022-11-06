

// Note: this model is retired for managing product reviews...
// HINT... moved review functionality to product model
// TODO... remove module
const mongoose = require('mongoose');
const ReviewSchema =  mongoose.Schema({
    userId:{ type: String, required: true},
    userEmail: { type: String, required: true, },
    userName: {type: String, required: true},
    userProfileImage: { type: String }, 
    productId: { type: String, required: true },
    productName:{type:String},
    comment: {type: String, required: true},
    replies: [{}],
    likesReviewRecieved: [{}],
    dislikesReviewRecieved: [{}],
    createdAt: { type: Date, default: Date.now }
});

ReviewSchema.methods.setProductCommentDetails = function(data = {}) {
    const { product, user, reviewMessage } = data;
    
    this.userId = user.id;
    this.userName = user.fullName;
    this.userEmail = user.userEmail;
    this.userProfileImage = user.profileImage;
    this.productId = product.productId;
    this.productName = product.productName;  
    this.comment = reviewMessage;
}

ReviewSchema.statics.getAllComments = async function() {
    const comments = await this.find({});
    return comments;
}

ReviewSchema.statics.getUserComments = async function(userEmail) {
    const comments = await this.find({userEmail});
    return comments;
}

ReviewSchema.statics.getProductComments = async function(productId) {
    const productComments = await this.find({ productId: productId });
    return productComments;
}

ReviewSchema.statics.getCommentById = async function(commentId) {
    const comment = await this.findOne({ _id: commentId });
    return comment;
}

ReviewSchema.statics.addCommentLike = async function({likeCount, commentId, user}) {
    const like = likeCount ? parseInt(likeCount) : 1;
    const likeData = {
        like: like,
        userEmail: user.userEmail,
        userId: user.id,
        userFullName: user.fullName
    }
    const comment = await this.findOne({_id: commentId});
    const likesCommentRecieved = comment.likesCommentRecieved;

    if (!userLikedComment(user.userEmail, likesCommentRecieved)) {
       const addCommentLike = await this.updateOne({ _id: commentId }, { $push: { likesCommentRecieved: likeData } })

        return ({ status: 201, updated: true,  data: addCommentLike
        })
    }
    
    const removeCommentLike = await this.updateOne({_id: commentId}, { $pull: { likesCommentRecieved: { userEmail: user.userEmail } } })
    return ({status: 201, updated: true, data:removeCommentLike  });
}

ReviewSchema.statics.removeCommentLike = async function({ commentId, user}) {
    const comment = await this.findOne({_id: commentId})
    const likesCommentRecieved = comment.likesCommentRecieved;

    if (!userLikedComment(user.userEmail, likesCommentRecieved)) {
        return ({ status: 201, updated: false, data: null })
    }

    const updateComment = await this.updateOne({ _id: commentId }, { $pull: { likesCommentRecieved :{ userEmail: user.userEmail } } });
    return ({ status: 201, updated: true, data: updateComment });
}

ReviewSchema.statics.addCommentDislike = async function({dislikeCount, commentId, user}) {
    const dislike = dislikeCount ?  parseInt(dislikeCount) : 1;
    const dislikeData = {
        dislike: dislike,
        userEmail: user.userEmail,
        userId: user.id,
        userFullName: user.fullName
    }
    const comment = await this.findOne({_id: commentId})
    const dislikesCommentRecieved = comment.dislikesCommentRecieved;

    if (!userDislikedComment(user.userEmail, dislikesCommentRecieved)) {
        const addCommentDislike = await this.updateOne({ _id: commentId }, { $push: { dislikesCommentRecieved: dislikeData } })
        return ({ status: 201, updated: true, data: addCommentDislike });
    }

    const removeCommentDislike = await this.updateOne({ _id: commentId }, { $pull: { dislikesCommentRecieved: { userEmail: user.userEmail } } })
    return ({ status: 201, updated: true, data: removeCommentDislike });
}

ReviewSchema.statics.removeCommentDislike = async function({ commentId, user}) {
    const comment = await this.findOne({_id: commentId})
    const dislikesCommentRecieved = comment.dislikesCommentRecieved;

    if (!userDislikedComment(user.userEmail, dislikesCommentRecieved)) {
        return ({ status: 201, updated: false, data: null })
    }

    const updateComment = await this.updateOne({ _id: commentId }, { $pull: { dislikesCommentRecieved : { userEmail: user.userEmail } } });
    return ({ status: 201, updated: true, data: updateComment });
}


ReviewSchema.statics.addCommentReply = async function({ commentId, user,replyMessage, replyTime }) {
    const replyData = {
        userName: user.fullName,
        userId: user.id,
        userEmail: user.userEmail,
        commentId: commentId,
        replyMessage: replyMessage,
        replyTime: replyTime ? replyTime : Date.now() 
    }

    const updateComment = await this.updateOne({ _id: commentId }, {$push: { replies: replyData } });
    return ({ status: 201, updated: true, data: updateComment })  
}

function userLikedComment(userEmail, likesCommentRecieved) {
    const commentLikesLength = likesCommentRecieved.length;
    let i;
    
    for (i = 0; i < commentLikesLength; i++) {
        if (likesCommentRecieved[i].userEmail === userEmail) {
            return true ;
        }
    }

    return false;
}

function userDislikedComment(userEmail, dislikesCommentRecieved) {
    const commentDislikesLength = dislikesCommentRecieved.length;
    let i;
    
    for (i = 0; i < commentDislikesLength; i++) {
        if (dislikesCommentRecieved[i].userEmail === userEmail) {
            return true ;
        }
    }
    return false;
}

const Review = mongoose.model('comments', ReviewSchema);
module.exports = Review;