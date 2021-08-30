





let middlewares = {
    express: require('express'),
    app: require('express')(),
    bodyParser: require('body-parser'),
    session: require('express-session'),
    cookie: require('cookie-parser'),
    mongoose: require('mongoose'),
    logger: require('morgan'),
    http: require('http').createServer(app),
    io: require('socket.io')(http),
    path: require('path'),
    config: require('./src/config/config'),
    cors: require('cors'),
    helmet: require('helmet'),
    compression: require('compression'),
    uncaughtExceptions : require('./src/exceptions/uncaughtExceptions'),
    connectToMongodb : require('./src/utils/mongoDbConnection'),
    mongoConfig : {
        devDbURI: this.config.db.testURI,
        dbOptions: config.db.dbOptions
    },
    corsOptions : {
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200 
    },
}


function app(app) {
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
}


module.exports = function setUp() {
    this.middlewares;
    this.app;
    this.setUpMiddlewares = function({...data}) {
        this.middlewares = data;
        this.app = data.app;
        return this;
    }
    this.useMiddleWares = function(){
        this.app.disable('x-powered-by');
        app.use(this.middlewares.helmet( { contentSecurityPolicy: false } ));
        connectToMongodb(mongoose, mongoConfig);
        app.set('views', this.middlewares.path.join(__dirname, 'src', 'views'));
        app.set('view engine', 'ejs');
        app.use(this.middlewares.uncaughtExceptions);
        app.use(this.middlewares.cors(corsOptions));
        app.use(this.middlewares.compression());
        app.use(this.middlewares.bodyParser.json());
        app.use(this.middlewares.bodyParser.urlencoded({extended:true}));
        app.use(this.middlewares.cookie( config.secret.cookieSecret));
        app.use(this.middlewares.session({
            secret: config.secret.sessionSecret,
            resave:true,
            saveUninitialized:true   
        }));
    
        app.use(this.middlewares.logger('dev'));
        app.use(this.middlewares.express.static(path.join(__dirname , 'public')));
        app.get('/', (req, res) => res.render('index'));

    }
}