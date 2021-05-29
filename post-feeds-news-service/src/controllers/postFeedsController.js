









const Feed = require('../models/feedsModel');
const config = require('../config/config');

/**
 * @class 
 *  feeds controller class 
 * @module FeedController
 */
function FeedController() {
   this.serverSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} serverSocket - the socket.IO server socket of the post feed service node
 */
FeedController.prototype.mountSocket = function({ serverSocket }) {
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocket 
 * 
 ** Used to get the service node socket
 */
FeedController.prototype.getSocket = function() {
    return this.serverSocket;
}

/**
 * @method postFeed 
 ** used to create a post feed
 ** collects post feed data from gateway and save to database
 ** sends back created post feed response to gateway
 * @param {object} data - the postFeed data collected from the gateway 
 */
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

/**
 * @method getUserPostedFeeds 
 ** used to get  post feed/feeds of a user
 ** collects user data from gateway and get user post feeds from database 
 ** sends back user post feed response to gateway
 * @param {object} data - the user data collected from the gateway which includes the user and post feed 
 */
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
/**
 * @method updateFeed 
 ** used to update post feed of a user
 ** collects feed data from gateway and get user post feed from database 
 ** updates post feed and send updated post feed to gateway
 * @param {object} data - the user data collected from the gateway which includes the user and post feed 
 */
FeedController.prototype.updateFeed = async function(data = {}) {
    // TODO... work on update post feed controller
    const feedId = data.id;
    const postedFeed = await Feed.getfeedById(feedId)
}

/**
 * @method starPostFeed
 ** used to place a star on post feed of a user
 ** collects feed data from gateway and get user post feed from database 
 ** add a star to post feed and send response to gateway
 * @param {object} data - the user data collected from the gateway which includes the user and post feed 
 */
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

/**
 * @method unStarPostFeed
 ** used to remove a star on post feed of a user
 ** collects feed data from gateway and get user post feed from database 
 ** remove star from post feed and send response to gateway
 * @param {object} data - the user data collected from the gateway which includes the user and post feed 
 */
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

/**
 * @method commentOnPostFeed
 ** used to comment on post feed of a user
 ** collects feed data from gateway and get user post feed from database 
 ** comment on post feed and send response to gateway
 * @param {object} data - the user data collected from the gateway which includes the user and post feed 
 */
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