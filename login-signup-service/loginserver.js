




const express = require('express');
const app = require('express')();
const logger = require('morgan');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const session = require('express-session');
const cookie = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const connectToMongodb = require('./src/utils/mongoDbConnection');
const compression = require('compression');
const uncaughtExceptions = require('./src/exceptions/uncaughtExceptions');
const config = require('./src/config/config');
const api_routes = require('./src/routes/api_routes');
require('dotenv').config();
const port = config.app.serverPort || 4001;
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
const ProductController = require('./src/controllers/productsAndServiceController');


app.disable('x-powered-by');
app.use(helmet());
connectToMongodb(mongoose, mongoConfig);
app.use(uncaughtExceptions);
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookie(config.secret.cookieSecret));
app.use(session({
    secret: config.secret.sessionSecret,
    resave:true,
    saveUninitialized:true   
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1', api_routes);


io.on('connection', function(socket) {
    console.log('connection from gateway established');
    
    const socketOptions = {
        productClient: require('socket.io-client')('http://localhost:4003'),
        serverSocket: socket
    }
    socketOptions.productClient.on('connect', function() {
        socketOptions.productClient.sendBuffer = [];
        console.log("product client has connected")
     });

  

    socket.on('signUp', function(data) {  
        let signUpController = new UserController();
        return signUpController.mountSocket(socketOptions).signUp(data);
    })

    socket.on('login', function(data) {
        let loginController = new UserController();
        return loginController.mountSocket(socketOptions).login(data);
    }) 
    socket.on('getUserById', function(data) {
        const getUserController = new UserController();
        return getUserController.mountSocket(socketOptions).getUserById(data);
    })
    socket.on('starUser', function(data) {
        const starUserController = new UserController();
        starUserController.mountSocket(socketOptions).starUser(data)
    })
     // get seller stars
     socket.on('getInitialStarData', function(data) {
        const getUserStarsController = new UserController();
        return getUserStarsController.mountSocket(socketOptions).getUserStars(data);
    });
    socket.on('getNotifications', function(data) {
        const getUserStarsController = new UserController();
        return getUserStarsController.mountSocket(socketOptions).getNotifications(data);
    });
    socket.on('getInterests', function(data) {
        const getUserStarsController = new UserController();
        return getUserStarsController.mountSocket(socketOptions).getUserInterests(data);
    });
    socket.on('getConfirmations', function(data) {
        const getUserStarsController = new UserController();
        return getUserStarsController.mountSocket(socketOptions).getUserConfirmations(data);
    });
    socket.on('createOrder', function(data) {
        const createOrderController = new UserController();
        return createOrderController.mountSocket(socketOptions).createUserOrder(data);
    });
   
    // create an instance of the product controller class
    const productOrService = new ProductController();
    productOrService.mountSocket(socketOptions);

    socket.on('createProduct', function(data) {  
        productOrService.createProduct(data);
    })
    productOrService.createProductResponse();

    socket.on('getProducts', function(data) {  
        productOrService.getProducts(data);
    });
    productOrService.getProductsResponse();
    // service controller
    socket.on('createService', function(data) {
        console.log('service data',data);
        return productOrService.createService(data);
    })
    productOrService.createServiceResponse();

    socket.on('getServices', function(data) {  
        productOrService.getServices(data);
    });
    productOrService.getServicesResponse();

    socket.on('reviewProductOrService', function(data) {
        productOrService.reviewProductOrService(data);
    });
    productOrService.reviewProductOrServiceResponse();

    socket.on('replyReviewProductOrService', function(data) {
        productOrService.replyReviewProductOrService(data);   
    });
    productOrService.replyReviewProductOrServiceResponse();

    socket.on('getProductOrService', function(data) {
        productOrService.getProductOrService(data);   
    });
    productOrService.getProductOrServiceResponse();

    socket.on('likeComment', function(data) {
        productOrService.likeComment(data);   
    });
    productOrService.likeCommentResponse();

    socket.on('unLikeComment', function(data) {
        productOrService.unLikeComment(data);   
    });
    productOrService.unLikeCommentResponse();

    socket.on('showInterest', function(data) {
        productOrService.showInterest(data);   
    });
    productOrService.showInterestResponse();

    
    











    socket.on('starProductOrService', function(data) {
        let productOrServiceController = new ProductController();
        return productOrServiceController.mountSocket(socketOptions).starProductOrService(data);
    })

    socket.on('unStarproductOrService', function(data) {
        let productOrServiceController = new ProductController();
        return productOrServiceController.mountSocket(socketOptions).unStarProductOrService(data);
    })
    

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
  http.listen(port, ()=> console.log(`login node service started on port ${port}`));