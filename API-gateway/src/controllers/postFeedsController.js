



















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

PostFeedController.prototype.starPostFeed = function(data = {}) {
    const self = this;
    // emit postfeed data from gateway to postfeed service
    this.postFeedClient.emit('starPostFeed', data);
    // send postfeed not found error to frontend
    this.postFeedClient.on('starFeedError', function(response) {
        self.gatewayServerSocket.emit('starFeedError', response)
    })
    // receieve posted feed after successfully placing a star from postfeed server node
    this.postFeedClient.on('starPostFeedSuccess', function(response) {
        // send postfeed after placing a star to frontend
        self.gatewayServerSocket.emit('starPostFeedSuccess', response);
        console.log(response);
    });   
}

PostFeedController.prototype.unStarPostFeed = function(data = {}) {
    const self = this;
    this.postFeedClient.emit('unStarPostFeed', data);
  
    this.postFeedClient.on('unStarFeedError', function(response) {
        return self.gatewayServerSocket.emit('unStarFeedError', response)
    })
   
    this.postFeedClient.on('unStarPostFeedSuccess', function(response) {
        console.log(response);
        return self.gatewayServerSocket.emit('unStarPostFeedSuccess', response);
    });   
}

PostFeedController.prototype.commentOnPostFeed = function(data ={}) {
    let d = {
        comment:'ddjfdjfhdj',
        user :{
            userName:'jeffrey'
        }
    }
    const self = this;

    this.postFeedClient.emit('commentOnPostFeed', data);

    this.postFeedClient.on('commentOnPostFeedError', function(response) {
        return self.gatewayServerSocket.emit('commentOnPostFeedError', response);
    })

    this.postFeedClient.on('postFeedCommetnSuccess', function(response) {
        return self.gatewayServerSocket.emit('postFeedCommentSuccess', response);
    })
}

module.exports = PostFeedController;