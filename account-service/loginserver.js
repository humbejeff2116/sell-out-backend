
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
const notFoundAndErrorRoutes = require('./src/routes/notFoundAndErrorCatchRoute');
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
    ProductCommentController,
    ProductOrderController,
} = require('./src/controllers/socketControllers/index');
const {
    userSocketEventsHandler, 
    productSocketEventsHandler,
    productCommentSocketEventsHandler,
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
    resave:true,
    saveUninitialized:true   
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1', api_routes);
app.use(notFoundAndErrorRoutes);

io.on('connection', function(socket) {
    socketMessage.socketConnectionMessage(socket)
    socketOptions.serverSocket = socket;
    socketOptions.allConnectedSockects = io.sockets;
    userSocketEventsHandler(io, socket, socketOptions, UserController);
    productSocketEventsHandler(io, socket, socketOptions, ProductController);
    productOrderSocketEventsHandler(io, socket, socketOptions, ProductOrderController);
    productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController);
    socket.on("disconnect", () => {
        socketMessage.socketDisconnetionMessage(socket);
    }); 
});
http.listen(port, ()=> console.log(`login node service started on port ${port}`));