




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
const port = config.app.serverPort || 4003;
const mongoConfig = {
    devDbURI: config.db.testURI,
    dbOptions: config.db.dbOptions,
    dbURI: config.db.devURI
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
// app.use(cookie(config.secret.cookieSecret));
// app.use(session({
//     secret: config.secret.sessionSecret,
//     resave:true,
//     saveUninitialized:true   
// }));
app.use(express.static(path.join(__dirname , 'public')));


io.on('connection', function(socket) {
    console.log('connection from login node established', socket.id);
    
    const socketOptions = {
        serverSocket: socket,
        // gatewayClient: require('socket.io-client')('http://localhost:4003'),
    }

    socket.on('createProduct', function(data) {
        let productController = new ProductsAndServiceController();
        productController.mountSocket(socketOptions).createProduct(data);
    })
    socket.on('getProducts', function(data) {
        let productController = new ProductsAndServiceController();
        productController.mountSocket(socketOptions).getProducts(data);
    })

    socket.on('createService', function(data) {
        let serviceController = new ProductsAndServiceController();
        serviceController.mountSocket(socketOptions).createService(data);
    })
    socket.on('getServices', function(data) {
        let serviceController = new ProductsAndServiceController();
        serviceController.mountSocket(socketOptions).getServices(data);
    })
    socket.on('reviewProductOrService', function(data) {
        let productOrServiceController = new ProductsAndServiceController();
        productOrServiceController.mountSocket(socketOptions).reviewProductOrService(data);    
    })


    socket.on('starProductOrService', function(data) {

    })
    socket.on('unStarProductOrService', function(data) {

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

http.listen(port, ()=> console.log(`product-or-service node started on port ${port}`));