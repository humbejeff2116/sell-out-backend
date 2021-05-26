




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
require('dotenv').config();
const port = config.app.serverPort || 4003;
const mongoConfig = {
    devDbURI: config.db.testURI,
    dbOptions: config.db.dbOptions
}
const corsOptions = {
    origin: 'http://localhost:4001',
    optionsSuccessStatus: 200 
}



const ProductsAndServiceController = require('./src/controllers/productsAndServiceController');



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
        serverSocket: socket,
    }

    socket.on('createProductOrService', function(data) {
        let productController = new ProductsAndServiceController();
        productController.mountSocket(socketOptions).createProductOrService(data);
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