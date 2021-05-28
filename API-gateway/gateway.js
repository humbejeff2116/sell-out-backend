



const express = require('express');
const app = require('express')();
const uncaughtExceptions = require('./src/exceptions/uncaughtExceptions');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookie = require('cookie-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
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
    dbOptions: config.db.dbOptions
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
    console.log('connection established');
    console.log(`${++onlineUsers} users online`);
    
    const socketOptions = {
        postFeedClient: require('socket.io-client')('server address'),
        productOrServiceClient: require('socket.io-client')('server address'),
        userClient: require('socket.io-client')('server address'),
        chatClient: require('socket.io-client')('server address'),
        accountActivityClient: require('socket.io-client')('server address'),
        gatewayServerSocket: socket,
    }

    socket.on('signUp', function(data) {
        let signUp = new UserController();
        return signUp.mountSocket(socketOptions).signpUser(data);
    });

    socket.on('login', function(data) {
        let login = new UserController();
        return login.mountSocket(socketOptions).loginUser(data);
    });

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

    socket.on('createProductOrService', function(data) {
        let productOrService = new ProductController();
        return productOrService.mountSocket(socketOptions).createProductOrService(data);
    })
//TODO... add rate product functionality inproduct controller  
    socket.on('starProductOrService', function(data) {
        let productOrService = new ProductController();
        return productOrService.mountSocket(socketOptions).starProductOrService(data);
    })

    socket.on('unStarProductOrService', function(data) {
        let productOrService = new ProductController();
        return productOrService.mountSocket(socketOptions).unstarProductOrService(data);
    })
    
    socket.on('reviewProductOrService', function(data) {
        let productOrService = new ProductController();
        return productOrService.mountSocket(socketOptions).reviewProductOrSrvice(data);
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
http.listen(port, ()=> console.log(`app started on port ${port}`));