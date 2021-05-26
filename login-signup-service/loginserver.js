




const express = require('express');
const app = require('express')();
const logger = require('morgan');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
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
    dbOptions: config.db.dbOptions
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
    console.log('connection established');
    
    const socketOptions = {
        productClientSocket: require('socket.io-client')('server address'),
        serverSocket: socket
    }

  

    socket.on('signUp', function(data) {  
        let signUpController = new UserController();
        return signUpController.mountSocket(socketOptions).signup(data);
    })

    socket.on('login', function(data) {
        let loginController = new UserController();
        return loginController.mountSocket(socketOptions).login(data);
    }) 
    
    socket.on('createProductOrService', function(data) {
        let productOrServiceController = new ProductController();
        return productOrServiceController.mountSocket(socketOptions).createProductOrService(data);
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