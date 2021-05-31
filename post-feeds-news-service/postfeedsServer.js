
const express = require('express');
const app = require('express')();
const logger = require('morgan');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const connectToMongodb = require('./src/library/mongoDbConnection');
const compression = require('compression');
const uncaughtExceptions = require('./src/exceptions/uncaughtExceptions');
const config = require('./src/config/config');
require('dotenv').config();
const port = config.app.serverPort || 4002;
const mongoConfig = {
    devDbURI: config.db.testURI,
    dbOptions: config.db.dbOptions,
    dbURI: config.db.devURI
}
const corsOptions = {
    origin: 'http://localhost:4000',
    optionsSuccessStatus: 200 
}

const PostFeedsController = require('./src/controllers/postFeedsController');



app.disable('x-powered-by');
app.use(helmet( { contentSecurityPolicy: false } ));
connectToMongodb(mongoose, mongoConfig);
app.use(uncaughtExceptions);
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(compression());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(cookie( config.secret.cookieSecret));
// app.use(session({
//     secret: config.secret.sessionSecret,
//     resave:true,
//     saveUninitialized:true   
// }));
app.use(express.static(path.join(__dirname , 'public')));















io.on('connection', function(socket) {

    console.log(`connection to gateway node established`);
    const socketOptions = {
        serverSocket: socket
    }

    socket.on('postFeed', function(data) {
        let PostFeed = new PostFeedsController();
        return PostFeed.mountSocket(socketOptions).postFeed(data);
    });

    socket.on('getUserPostedFeeds', function(data) {
        let PostFeeds = new PostFeedsController();
        return PostFeeds.mountSocket(socketOptions).getUserPostedFeeds(data);
    });
    socket.on('starPostFeed', function(data) {
        let PostFeeds = new PostFeedsController();
        return PostFeeds.mountSocket(socketOptions).starPostFeed(data);
    })
    socket.on('unStarPostFeed', function(data) {
        let PostFeeds = new PostFeedsController();
        return PostFeeds.mountSocket(socketOptions).unStarPostFeed(data);
    })
    socket.on('commentOnPostFeed', function(data) {
        let PostFeeds = new PostFeedsController();
        return PostFeeds.mountSocket(socketOptions).commentOnPostFeed(data);
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