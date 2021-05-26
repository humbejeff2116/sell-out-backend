









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

FeedController.prototype.updateFeed = async function(data = {}) {
    const feedId = data.id;
    const postedFeed = await Feed.getfeedById(feedId)
}

module.exports = FeedController;