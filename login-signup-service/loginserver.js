




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
require('dotenv').config();
const port = config.app.serverPort || 4001;
const mongoConfig = {
    devDbURI: config.db.testURI,
    dbOptions: config.db.dbOptions,
    dbURI: config.db.devURI
}
const corsOptions = {
    origin: 'http://localhost:4000',
    optionsSuccessStatus: 200 
}


const UserController = require('./src/controllers/userController');
const ProductController = require('./src/controllers/productsAndServiceController');


app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
connectToMongodb(mongoose, mongoConfig);
app.use(uncaughtExceptions);
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(compression());
app.use(cookie(config.secret.cookieSecret));
app.use(session({
    secret: config.secret.sessionSecret,
    resave:true,
    saveUninitialized:true   
}));
app.use(express.static(path.join(__dirname , 'public')));


io.on('connection', function(socket) {
    console.log('connection from gateway established');
    
    const socketOptions = {
        productClient: require('socket.io-client')('http://localhost:4003'),
        serverSocket: socket
    }

  

    socket.on('signUp', function(data) {  
        let signUpController = new UserController();
        return signUpController.mountSocket(socketOptions).signUp(data);
    })

    socket.on('login', function(data) {
        let loginController = new UserController();
        return loginController.mountSocket(socketOptions).login(data);
    }) 
    socket.on('getUserById', function(data) {
        const getuserController = new UserController();
        return getuserController.mountSocket(socketOptions).getUserById(data);
    })
    socket.on('starUser', function(data) {
        const starUserController = new UserController();
        starUserController.mountSocket(socketOptions).starUser(data)
    }) 
    
    
    // create an instance of the product controller class
    const product = new ProductController();
    product.mountSocket(socketOptions);

    socket.on('createProduct', function(data) {  
        product.createProduct(data);
    })
    product.createProductResponse();

    socket.on('getProducts', function(data) {  
        product.getProducts(data);
    });
    product.getProductsResponse();



    const service = new ProductController();
    service.mountSocket(socketOptions);
    socket.on('createService', function(data) {
        console.log('service data',data);
        return service.createService(data);
    })
    service.createServiceResponse();
    socket.on('getServices', function(data) {  
        service.getServices(data);
    });
    service.getServicesResponse();
    
    
    socket.on('starProductOrService', function(data) {
        let productOrServiceController = new ProductController();
        return productOrServiceController.mountSocket(socketOptions).starProductOrService(data);
    })

    socket.on('unStarproductOrService', function(data) {
        let productOrServiceController = new ProductController();
        return productOrServiceController.mountSocket(socketOptions).unStarProductOrService(data);
    })
    
    socket.on('reviewproductOrService', function(data) {
        let productOrServiceController = new ProductController();
        return productOrServiceController.mountSocket(socketOptions).reviewProductOrService(data);
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