 require('dotenv').config();

 const config = {
     app: {
         port: parseInt(process.env.API_PORT) ,
         serverPort:parseInt(process.env.PORT),
         url:process.env.SITE_URL  
     },
     db: { 
         dbOptions: {
             useNewUrlParser: true, 
             useUnifiedTopology: true, 
             useCreateIndex: true, 
             useFindAndModify: false 
         },        
         prodURI: `mongodb://${process.env.HOST_PORT}:${process.env.PROD_MONGODB_PORT}/${process.env.PROD_DB_NAME}`, 
         devURI: process.env.DEV_DB_URI,
         testURI:  `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster1.wcmc9.mongodb.net/quickbuy?retryWrites=true&w=majority`,
     },
     secret: {
         cookieSecret: process.env.COOKIE_SECRET,
         sessionSecret: process.env.SESSION_SECRET,
         jwtSecret: process.env.JWT_SECRET,
          pssrptJwtSecret: process.env.PSSRPT_JWT_SECRET,
     },
     gmail: {
             user: process.env.GMAIL_USERNAME,
             password: process.env.GMAIL_PASSWORD
         },
         cloudinary: {
             cloudName: process.env.CLOUDINARY_CLOUD_NAME, 
             apiKey: process.env.CLOUDINARY_KEY, 
             secret: process.env.CLOUDINARY_SECRET,
             url: `cloudinary://${process.env.CLOUDINARY_KEY}:${process.env.CLOUDINARY_SECRET}@${process.env.CLOUDINARY_CLOUD_NAME}`
         }
 }

 module.exports = config;
