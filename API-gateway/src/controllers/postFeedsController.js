
/**
 * @class 
 *  post feed controller class 
 * @module PostFeedController
 */
function PostFeedController() {
    this.postFeedClient;
    this.gatewayServerSocket;
}

/**
 * @method mountSocket 
 * 
 ** Used to initialize the class instance variables
 * @param {object} postFeedClient - the socket.IO client of the postFeed controller class
 * @param {object} gatewayServerSocket - the socket.IO server socket of the gateway server
 * 
 */
PostFeedController.prototype.mountSocket = function({ postFeedClient, gatewayServerSocket }) {
    this.postFeedClient = postFeedClient;
    this.gatewayServerSocket = gatewayServerSocket
    return this;
}

/**
 * @method postFeed 
 ** used to create a post feed
 ** initiates a client server connection with post feed service node
 ** collects post feed data from frontend/client and sends to post feed service node
 ** sends back created post feed recieved from post feed service to frontend/cient
 * @param {object} data - the postFeed data collected from the front end 
 */
PostFeedController.prototype.postFeed = function(data = {}) {
    const self = this;
    this.postFeedClient.emit('postFeed', data);

    this.postFeedClient.on('feedPosted', function(response) {
        self.gatewayServerSocket.emit('feedPosted', response);
        console.log(response);
    });   
}

/**
 * @method getUserPostedFeeds
 ** used to get a user post feed
 ** initiates a client server connection with post feed service node
 ** collects user data from frontend/client and sends to post feed service node
 ** sends back user post feed recieved from post feed service to frontend/cient
 * @param {object} data - the user data collected from the front end
 */
PostFeedController.prototype.getUserPostedFeeds = function(data = {}) {
    const self = this;
    this.postFeedClient.emit('getUserPostedFeeds', data);
    
    this.postFeedClient.on('gottenUserPostedFeeds', function(response) {
        self.gatewayServerSocket.emit('gottenUserPostedFeeds', response);
        console.log(response);
    });   
}

/**
 * @method starPostFeed 
 ** used to give a star on a user post feed
 ** initiates a client server connection with post feed service node
 ** collects  data from frontend/client and sends to post feed service node
 ** sends back postfeed not found error if ecountered from post feed service to frontend/cient
 ** sends back response after successfully placing a star to frontend/cient
 * @param {object} data - the user data collected from the front end which includes the user and post feed 
 */
PostFeedController.prototype.starPostFeed = function(data = {}) {
    const self = this;
    this.postFeedClient.emit('starPostFeed', data);

    this.postFeedClient.on('starFeedError', function(response) {
        self.gatewayServerSocket.emit('starFeedError', response)
    })
   
    this.postFeedClient.on('starPostFeedSuccess', function(response) {
        self.gatewayServerSocket.emit('starPostFeedSuccess', response);
        console.log(response);
    });   
}

/**
 * @method unStarPostFeed
 ** used to remove a star on a user post feed
 ** initiates a client server connection with post feed service node
 ** collects  data from frontend/client and sends to post feed service node
 ** sends back postfeed not found error if ecountered from post feed service to frontend/cient
 ** sends back response after successfully removing a star from postfeed server node to frontend/cient
 * @param {object} data - the user data collected from the front end which includes the user and post feed  
 */
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

/**
 * @method commentOnPostFeed
 ** used to comment on a user post feed
 ** initiates a client server connection with post feed service node
 ** collects  data from frontend/client and sends to post feed service node
 ** sends back postfeed not found error if ecountered from post feed service to frontend/cient
 ** sends back response after successfully commenting on a user postfeed to frontend/cient
 * @param {object} data - the user data collected from the front end which includes the user and comment  
 */
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

    this.postFeedClient.on('postFeedCommentSuccess', function(response) {
        return self.gatewayServerSocket.emit('postFeedCommentSuccess', response);
    })
}

module.exports = PostFeedController;