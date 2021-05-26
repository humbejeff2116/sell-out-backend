




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
const UserController = require('./src/controllers/userController');
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



app.disable('x-powered-by');
app.use(helmet( { contentSecurityPolicy: false } ));
connectToMongodb(mongoose, mongoConfig);
app.use(uncaughtExceptions);
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(compression());
app.use(cookie( config.secret.cookieSecret));
app.use(session({
    secret: config.secret.sessionSecret,
    resave:true,
    saveUninitialized:true   
}));
app.use(express.static(path.join(__dirname , 'public')));


io.on('connection', function(socket) {

    socket.on('signUp', function(data) {
        let signUpController = new UserController();
        signUpController.mountSocket(socket).signup(data);
    })

    socket.on('login', function(data) {
        let loginController = new UserController();
        loginController.mountSocket(socket).login(data);
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