











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

const Comment = mongoose.model('comments', CommentSchema);
module.exports = Comment;