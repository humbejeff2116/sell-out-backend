



const express = require('express');
const app = require('express')();
const uncaughtExceptions = require('./src/exceptions/uncaughtExceptions');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookie = require('cookie-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const api_routes = require('./src/routes/routes');
const path = require('path');
const config = require('./src/config/config');
const cors = require('cors');
const helmet = require('helmet');
const connectToMongodb = require('./src/utils/mongoDbConnection');
const compression = require('compression');
require('dotenv').config();
const port = config.app.serverPort || 4000;
const mongoConfig = {
    devDbURI: config.db.testURI,
    dbOptions: config.db.dbOptions,
    dbURI: config.db.devURI
}
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 
}



const UserController = require('./src/controllers/userController');
const postFeedsController = require('./src/controllers/postFeedsController');
const ProductController = require('./src/controllers/productsAndServiceController');



app.disable('x-powered-by');
app.use(helmet( { contentSecurityPolicy: false } ));
connectToMongodb(mongoose, mongoConfig);
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');
app.set('socketIo', io);
app.use(uncaughtExceptions);
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookie( config.secret.cookieSecret));
app.use(session({
    secret: config.secret.sessionSecret,
    resave:true,
    saveUninitialized:true   
}));

app.use(logger('dev'));
app.use(express.static(path.join(__dirname , 'public')));



app.use('/api/v1', api_routes);
app.use((req, res) => {
    console.log("route not found")
    res.status(404).json('route not found')
})
app.use((err, req, res, next) => {
    console.error(err)
    next(err)
})
app.use((err, req, res, next) => {
    res.status(500).json('internal sever error')
})

 let onlineUsers = 0;
 const userClient = require('socket.io-client')('http://localhost:4001');
 userClient.on('connect', function() {
    userClient.sendBuffer = [];
    console.log("user client has connected")
 });
 const postFeedClient = require('socket.io-client')('http://localhost:4002');
 const chatClient = require('socket.io-client')('http://localhost:4004');
 const accountActivityClient = require('socket.io-client')('http://localhost:4005');
 // const productOrServiceClient =  require('socket.io-client')('http://localhost:4003'),

//  create a socket class to get the socket instance for http routes
class HTTPSocketManger {
    constructor() {
        this.io;
        this.Socket;
    }
    setSocketDetails(io, socket) {
        this.io = io;
        this.socket = socket;
    }
}
const HTTPSocketInstance = new HTTPSocketManger();

 io.on('connection', function(socket) {
    //  instantiate socket class and attach socket instance to app object
    HTTPSocketInstance.setSocketDetails(io, socket);
    app.set("socketInstance", HTTPSocketInstance)
    console.log("New client connected" + socket.id);
    console.log(`${++onlineUsers} users online`);

   
    const socketOptions = {
        userClient: userClient,
        postFeedClient: postFeedClient,
        // productOrServiceClient: productOrServiceClient,
        chatClient:  chatClient,
        accountActivityClient: accountActivityClient,
        gatewayServerSocket: socket,
    }


    const userController = new UserController();
    userController.mountSocket(socketOptions);
    socket.on('signUp', function(data) {
        console.log("responding to", socket.id)
        const signupData = {
            user: data,
            socketId: socket.id
        }
        return userController.signupUser(signupData);
    });
    userController.signupUserResponse(io);

    socket.on('login', function(data) {
        console.log("login in");
        const loginData = {
            user: data,
            socketId: socket.id
        }
        userController.loginUser(loginData);
    });
    userController.loginUserResponse(io);

    socket.on('getUserById', function(data) {
        console.log("getting user");
        console.log("responding to", socket.id);
        const userData = {
            userId: data,
            socketId: socket.id
        }
        userController.getUserById(userData);
    });
    userController.getUserByIdResponse(io);
    // star seller
    socket.on('starSeller', function(data) {
        
        const socketId = socket.id;
        data.socketId = socketId;
        console.log('givin seller star', data)
        userController.starUser(data);

    });
    userController.starUserResponse(io);
    // get seller stars
    socket.on('getInitialStarData', function(data) {
        const socketId = socket.id;
        const productData = { socketId, product:data };
        console.log("getting user stars");
        userController.getUserStars(productData);
    });
    userController.getUserStarsResponse(io);
    // get notifications
    socket.on('getNotifications', function(data) {
        const  user = data;
        const socketId = socket.id;
        const notificationData = {socketId, user};
        
        userController.getNotifications(notificationData);
    });
    userController.getNotificationsResponse(io);
    // get user interest
    socket.on('getInterests', function(data) {
        const  user = data;
        const socketId = socket.id;
        const interestData = {socketId, user};
        console.log("getting user interest", user);
        userController.getInterests(interestData);
    });
    userController.getInterestsResponse(io);
    // get confirmations
    socket.on('getConfirmations', function(data) {
        const  user = data;
        const socketId = socket.id;
        const interestData = {socketId, user};
        console.log("getting user confirmations", user);
        userController.getConfirmations(interestData);
    });
    userController.getConfirmationsResponse(io);
    // create order
    socket.on('createOrder', function(data) {
        data.socketId = socket.id; 
        console.log("creating order",data);
        userController.createOrder(data);
    });
    userController.createOrderResponse(io);





    const productAndServiceController = new ProductController();
    productAndServiceController.mountSocket(socketOptions);

    socket.on('createProduct', function(data) {
        console.log("creating product");
        console.log(data);
        const createProductData = data;
        createProductData.socketId = socket.id; 
        productAndServiceController.createProduct(createProductData);
    });
    productAndServiceController.createProductResponse(io);

    socket.on('getProducts', function() {
        const socketId = socket.id;
        productAndServiceController.getProducts(socketId);
    }); 
    productAndServiceController.getProductsResponse(io);

    socket.on('createService', function(data) {
        console.log('creating service', data);

        const createServiceData = data;
        createServiceData.socketId = socket.id; 
        return productAndServiceController.createService(createServiceData);
    });
    productAndServiceController.createServiceResponse(io)

    socket.on('getServices', function() {
        const socketId = socket.id;
        productAndServiceController.getServices(socketId);
    });
    productAndServiceController.getServicesResponse(io);
    socket.on('reviewProductOrService', function(data) {
      
        const { productOrService, reviewMessage, user } = data;
        const socketId = socket.id;
        const reviewData = {
            user: user,
            productOrService: productOrService,
            reviewMessage: reviewMessage,
            socketId :socketId
        }
         productAndServiceController.reviewProductOrService(reviewData);   
    });
    productAndServiceController.reviewProductOrServiceResponse(io);

    socket.on('replyReviewProductOrService', function(data) {
      
        const { commentId, replyMessage, user } = data;
        const socketId = socket.id;
        const replyReviewData = {
            user: user,
            commentId: commentId,
            replyMessage:replyMessage,
            socketId :socketId
        }
         productAndServiceController.replyReviewProductOrService(replyReviewData);   
    });
    productAndServiceController.replyReviewProductOrServiceResponse(io);


    // get product or service

     socket.on('getProductOrService', function(data) {
      
        const { productOrService, user } = data;
        const socketId = socket.id;
        const getProductOrServiceData = {
            user: user,
            productOrService: productOrService,
            socketId :socketId
        }
         productAndServiceController.getProductOrService(getProductOrServiceData);   
    });
    productAndServiceController.getProductOrServiceResponse(io);

    // like comment
    socket.on('likeComment', function(data) {
      
        const { commentId, user } = data;
        const socketId = socket.id;
        const likeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }
         productAndServiceController.likeComment(likeCommentData);   
    });
    productAndServiceController.likeCommentResponse(io);
// unlike comment
     socket.on('unLikeComment', function(data) {
      
        const { commentId, user } = data;
        const socketId = socket.id;
        const unLikeCommentData = {
            user: user,
            commentId: commentId,
            socketId :socketId
        }
         productAndServiceController.unLikeComment(unLikeCommentData);   
    });
    productAndServiceController.unLikeCommentResponse(io);

    // show interest
    socket.on('showInterest', function(data) {
        console.log("show interest data", data)
      
        const { product, user, interested } = data;
        const socketId = socket.id;
        const showInterestData = {
            user: user,
            productOrService: product,
            socketId :socketId,
            interested: interested,
        }
         productAndServiceController.showInterest(showInterestData);   
    });
    productAndServiceController.showInterestResponse(io);


    
  





    socket.on('starProductOrService', function(data) {
        let productOrService = new ProductController();
        return productOrService.mountSocket(socketOptions).starProductOrService(data);
    });

    socket.on('unStarProductOrService', function(data) {
        let productOrService = new ProductController();
        return productOrService.mountSocket(socketOptions).unStarProductOrService(data);
    })

 
    socket.on('postFeed', function(data) {
        let feed = new postFeedsController();
        return feed.mountSocket(socketOptions).postFeed(data);
    })

    socket.on('starPostFeed', function(data) {
        let feed = new postFeedsController();
        return feed.mountSocket(socketOptions).starPostFeed(data);
    })

    socket.on('unStarPostFeed', function(data) {
        let feed = new postFeedsController();
        return feed.mountSocket(socketOptions).unStarPostFeed(data);
    })

    socket.on('commentOnPostFeed', function(data) {
        let feed = new postFeedsController();
        return feed.mountSocket(socketOptions).commentOnPostFeed(data);
    })

    socket.on('getUserPostedFeeds', function(data) {
        let feed = new postFeedsController();
        return feed.mountSocket(socketOptions).getUserPostedFeeds(data);
    })


    socket.on("disconnect", () => {
        onlineUsers
        console.log(`${--onlineUsers} users online`);
        console.log("user disconnected");
        // socket.disconnect();

    });

});



module.exports = app;

http.listen(port, ()=> console.log(`gateway node started on port ${port}`));