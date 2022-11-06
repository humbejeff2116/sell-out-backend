
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
const socketMessage = require('./src/libs/socketMessage');
const {
    UserController,
    ProductController,
    ProductReviewController,
    ProductOrderController,
} = require('./src/controllers/socketControllers/index');
const {
    userSocketEventsHandler, 
    productSocketEventsHandler,
    productReviewSocketEventsHandler,
    productOrderSocketEventsHandler
} = require('./src/libs/socketEventsHandlers/index');
const socketOptions = require('./src/utils/socketConnections');

app.disable('x-powered-by');
app.use(helmet());
connectToMongodb(mongoose, mongoConfig);
app.use(uncaughtExceptions);
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(cookie(config.secret.cookieSecret));
app.use(session({
    secret: config.secret.sessionSecret,
    resave: true,
    saveUninitialized: true 

}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1', api_routes);
app.use((req, res)=> {
    console.log("route not found");
    res.status(404).json('route not found');
});
app.use((err, req, res, next) => {
    console.error( err);
    next(err);
})
app.use((err, req, res, next) => {
    res.status(500).json('internal sever error');
})

io.on('connection', function (socket) {
    socketMessage.socketConnectionMessage(socket)
    socketOptions.serverSocket = socket;
    socketOptions.allConnectedSockects = io.sockets;

    userSocketEventsHandler(io, socket, socketOptions, UserController);
    productSocketEventsHandler(io, socket, socketOptions, ProductController);
    productOrderSocketEventsHandler(io, socket, socketOptions, ProductOrderController);
    productReviewSocketEventsHandler(io, socket, socketOptions, ProductReviewController);
    socket.on("disconnect", () => {
        socketMessage.socketDisconnetionMessage(socket);
    });
});

http.listen(port, ()=> console.log(`login service running on port ${port}`));