









const Feed = require('../models/feedsModel');
const config = require('../config/config');


function FeedController() {
   this.serverSocket;
}

FeedController.prototype.mountSocket = function({ serverSocket }) {
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

FeedController.prototype.getSocket = function() {
    return this.serverSocket;
}

FeedController.prototype.postFeed = async function(data = {}) {
    const feedId = data.id;
    const feedText = data.text;
   
    let newFeed = new Feed();
    await newFeed.setFeedDetails(data);
    await newFeed.save()
    .then(feed => {
    const feedDetails = {
        feedId,
        feedText
    }
    const response = {
        status:201, 
        data: feedDetails, 
        error : false, 
        message: 'feed has been posted', 
    };
    return this.serverSocket.emit('feedPosted', response);
    });
}

FeedController.prototype.getUserPostedFeeds = async function(data = {}) {
    const user = data.user;
    const postedFeeds = await Feed.getUserPostedFeeds(user);
    const response = {
        status: 201, 
        data: postedFeeds, 
        error: false, 
        message: 'user feed gotten successfully', 
    }
    return this.serverSocket.emit('gottenUserPostedFeeds', response);
}
// TODO... work on update post feed controller
FeedController.prototype.updateFeed = async function(data = {}) {
    const feedId = data.id;
    const postedFeed = await Feed.getfeedById(feedId)
}

FeedController.prototype.starPostFeed = async function(data = {}) {
    const self = this;
    const feedId = data.id;
    const postedFeed = await Feed.getfeedById(feedId);
    if (!postedFeed) {
        const response = {
            status: 401, 
            error: true, 
            message: 'no user feed found', 

        }
        return this.serverSocket.emit('starFeedError', response);
    }
    await postedFeed.addStar(data);
    await postedFeed.save()
    .then(data => {
        const response = {
            status:201, 
            data, 
            error: false, 
            message: 'star placed successfully', 
        };
        self.serverSocket.emit('starPostFeedSuccess', response);
    });
}

FeedController.prototype.unStarPostFeed = async function(data = {}) {
    const self = this;
    const feedId = data.id;
    const postedFeed = await Feed.getfeedById(feedId);
    if (!postedFeed) {
        const response = {
            status: 401, 
            error: true, 
            message: 'no post feed found', 

        }
        return this.serverSocket.emit('unStarFeedError', response);
    }
    await postedFeed.removeStar(data);
    await postedFeed.save()
    .then(data => {
        const response = {
            status:201, 
            data, 
            error: false, 
            message: 'star removed successfully', 
        };
        self.serverSocket.emit('unStarPostFeedSuccess', response);
    });
}

FeedController.prototype.commentOnPostFeed = function(data = {}) {
    const self = this;
    const feedId = data.id;
    const postedFeed = await Feed.getfeedById(feedId);
    if (!postedFeed) {
        const response = {
            status: 401, 
            error: true, 
            message: 'no post feed found', 
        }
        return this.serverSocket.emit('commentOnPostFeedError', response);
    }
    await postedFeed.comment(data);
    await postedFeed.save()
    .then(data => {
        const response = {
            status:201, 
            data, 
            error: false, 
            message: 'commented successfully', 
        };
        self.serverSocket.emit('postFeedCommentSuccess', response)
    })
}

module.exports = FeedController;