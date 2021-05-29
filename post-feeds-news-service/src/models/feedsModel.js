











const mongoose = require('mongoose');






const FeedSchema =  mongoose.Schema({
    feedId: { type: String, required: true, unique: true },
    userName: { type: String , required: true },
    feedText: { type: String, required: true },
    stars: [{}],
    unstars: [{}],
    comments: [{}],
    createdAt: { type: Date, default: Date.now }
});

FeedSchema.methods.addStar = function(data = {}) {
    const star = parseInt(data.star);
    const userName = data.user.userName;
    const starData = {
        star,
        userName
    }
    this.stars.push(starData)
}

FeedSchema.methods.removeStar = function(data = {}) {
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

FeedSchema.methods.comment = function(data) {
    let comment = data.comment
    let user = data.user.username;
    let commentData = {
        comment,
        user
    }
    this.comments.push(commentData);
}

FeedSchema.static.getfeedById = function(feedId) {
    let feed = this.findOne({feedId});
    return feed;
}

FeedSchema.static.getUserPostedFeeds = function(user = {}) {
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