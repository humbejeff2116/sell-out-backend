











const mongoose = require('mongoose');






const FeedSchema =  mongoose.Schema({
    feedId: { type: String , required: true, unique: true },
    userName: { type: String , required: true },
    feedText: { type: String, required: true },
    createdAt: { type: Date , default: Date.now },
});


FeedSchema.static.getfeedById = function(feedId) {
    let feed = this.findOne({feedId});
    return feed;
}
FeedSchema.static.getUserPostedFeeds = function(user) {
    const userName = user.userName;
    let feeds = this.find({userName});
    return feeds;
}

FeedSchema.methods.setFeedDetails = function( postFeed = {}) {
    this.feedId = postFeed.feedId;
    this.userName = postFeed.userName;
    this. feedText = postFeed.feedText;
}

const Feed = mongoose.model('Feed', FeedSchema);
module.exports = Feed;