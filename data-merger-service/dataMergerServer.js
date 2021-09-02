
const express = require('express');
const app = require('express')();
const logger = require('morgan');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookie = require('cookie-parser')
const session = require('express-session')
const mongoose = require('mongoose');
const compression = require('compression');
const uncaughtExceptions = require('./src/exceptions/uncaughtExceptions');
const config = require('./src/config/config');
const apiRoutes = require('./src/routes/apiRoutes');
const notFoundAndErrorRoutes = require('./src/routes/notFoundAndErrorCatchRoute');
require('dotenv').config();
const port = config.app.serverPort || 4002;
const corsOptions = {
    origin: 'http://localhost:4001',
    optionsSuccessStatus: 200 
}
const socketMessage = require('./src/libs/socketMessage');
const {
    ProductController,
} = require('./src/controllers/socketControllers/index');
const {
    productSocketEventsHandler,
} = require('./src/libs/socketEventsHandlers/index');
const socketOptions = require('./src/utils/socketConnections');


app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
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
app.use(express.static(path.join(__dirname , 'public')));
app.use('/api/v1', apiRoutes);
app.use(notFoundAndErrorRoutes);

io.on('connection', function(socket) {
    socketOptions.serverSocket = socket;
    socketMessage.socketConnectionMessage(socket)
    productSocketEventsHandler(io, socket, socketOptions, ProductController);
    socket.on('disconnect', function(){
        socketMessage.socketDisconnetionMessage(socket);
    }) 
});
http.listen(port, ()=> console.log(`data-merger service started on port ${port}`));