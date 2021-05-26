



















function PostFeedController() {
    this.postFeedClient;
    this.gatewayServerSocket;
}

PostFeedController.prototype.mountSocket = function({ postFeedClient, gatewayServerSocket }) {
    this.postFeedClient = postFeedClient;
    this.gatewayServerSocket = gatewayServerSocket
    return this;
}

PostFeedController.prototype.postFeed = function(data = {}) {
    const self = this;
    // emit postfeed data from gateway to postfeed service
    this.postFeedClient.emit('postFeed', data);
    // receieve posted feed from postfeed server node
    this.postFeedClient.on('feedPosted', function(response) {
        // send postfeed to frontend
        self.gatewayServerSocket.emit('feedPosted', response);
        console.log(response);
    });   
}

PostFeedController.prototype.getUserPostedFeeds = function(data = {}) {
    const self = this;
    this.postFeedClient.emit('getUserPostedFeeds', data);
    this.postFeedClient.on('gottenUserPostedFeeds', function(response) {
        self.gatewayServerSocket.emit('gottenUserPostedFeeds', response);
        console.log(response);
    });   
}

module.exports = PostFeedController;