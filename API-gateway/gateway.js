



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
const ProductController = require('./src/controllers/productsAndServiceController')



app.disable('x-powered-by');
app.use(helmet( { contentSecurityPolicy: false } ));
connectToMongodb(mongoose, mongoConfig);
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');
app.use(uncaughtExceptions);
app.use(cors(corsOptions));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookie( config.secret.cookieSecret));
app.use(session({
    secret: config.secret.sessionSecret,
    resave:true,
    saveUninitialized:true   
}));

app.use(logger('dev'));
app.use(express.static(path.join(__dirname , 'public')));
app.get('/', (req, res) => res.render('index'));




 let onlineUsers = 0;
 io.on('connection', function(socket) {
    console.log("New client connected" + socket.id);
    console.log(`${++onlineUsers} users online`);

   
    const socketOptions = {
        userClient: require('socket.io-client')('http://localhost:4001'),
        postFeedClient: require('socket.io-client')('http://localhost:4002'),
        // productOrServiceClient: require('socket.io-client')('http://localhost:4003'),
        chatClient: require('socket.io-client')('http://localhost:4004'),
        accountActivityClient: require('socket.io-client')('http://localhost:4005'),
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
        console.log("responding to", socket.id);
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

    socket.on('getInitialReviewData', function(data) {  
        const socketId = socket.id;
        const reviewData = {
           productOrService: data,
            socketId
        }
        console.log("review data is",reviewData)
        productAndServiceController.getReviews(reviewData);
    });
    productAndServiceController.getReviewsResponse(io);

    socket.on('reviewProductOrService', function(data) {
        const { productOrService, reviewMessage } = data;
        const socketId = socket.id;
        const reviewData = {
           productOrService: productOrService,
           reviewMessage: reviewMessage,
            socketId :socketId
        }
         productAndServiceController.reviewProductOrService(reviewData);   
    });
    productAndServiceController.reviewProductOrServiceResponse(io);

    
  





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


app.use((req, res) => {
    res.status(404).json('route not found')
})
app.use((err, req, res, next) => {
    console.error(err)
    next(err)
})
app.use((err, req, res, next) => {
    res.status(500).json('internal sever error')
})
http.listen(port, ()=> console.log(`gateway node started on port ${port}`));