



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
const notFoundAndErrorRoutes = require('./src/routes/notFoundAndErrorCatchRoute');
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
const {
    userSocketEventsHandler, 
    productSocketEventsHandler,
    productCommentSocketEventsHandler,
    orderSocketEventsHandler
} = require('./src/libs/socketEventsHandlers/index');
const {
    UserController,
    ProductController,
    ProductCommentController,
    ProductOrderController,
    PostFeedsController,
} = require('./src/controllers/socketControllers/index');
const { attachSocketInstanceToApp } = require('./src/libs/attachSocketInstanceToApp');
const socketOptions = require('./src/utils/socketConnections');
const socketMessage = require('./src/libs/socketMessage')

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
app.use(notFoundAndErrorRoutes);
io.on('connection', function(socket) {
    socketMessage.socketConnectionMessage(socket);
    attachSocketInstanceToApp(app, io, socket)
    socketOptions.gatewayServerSocket = socket;
    userSocketEventsHandler(io, socket, socketOptions, UserController); 
    productSocketEventsHandler(io, socket, socketOptions,ProductController);
    productCommentSocketEventsHandler(io, socket, socketOptions, ProductCommentController);
    orderSocketEventsHandler(io, socket, socketOptions, ProductOrderController);
    socket.on("disconnect", () => {
        socketMessage.socketDisconnetionMessage(socket);
    });
});
http.listen(port, ()=> console.log(`gateway node started on port ${port}`));