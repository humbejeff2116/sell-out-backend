





const { getProducts, createProduct } = require('../../utils/http.services')
const formidable = require('formidable');
const User = require('../../models/userModel');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { imageDataUri } = require('../../routes/Multer/multer');
cloudinary.config({
    cloud_name:config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret:config.cloudinary.secret
});


function UserController() {
    
}


UserController.prototype.authenticateUser = async function(req, res) {
    let userId = req.body.id;
    let userName = req.body.userName;
    let userEmail = req.body.userEmail;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
        const response = {
            status:400, 
            error : true,
            userExist: false, 
            message : "user not found", 
        };
       res.json(response);
       return res.status(400);
    }
    const response = {
        status:200, 
        error : false,
        userExist: true, 
        message : "user found", 
    };
    res.json(response);
    return res.status(200);
}

UserController.prototype.updateUser = async function(req, res) {
    const self = this;
    const { contactEmail, contactNumber, country, city, address, userEmail, userId} = req.body;
    const userData ={contactEmail, contactNumber, country, city, address}
    const profileImage = (req.file) ? imageDataUri(req).content : 'no-image';
    
    console.log("body is", req.body)
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
        const response = {
            status:400, 
            error : true, 
            message : "No user found", 
        };
       res.json(response);
       return res.status(400);
    }
    await cloudinary.uploader.upload(profileImage)
    .then(image => {
        let profileImage = image.url;
        userData.profileImage = profileImage
        appUser.updateUser(userData);
        appUser.save()
        .then(user => {
            const userDetails = {
                id: user._id,
                fullName: user.fullName,
                userEmail: user.userEmail,
                isNewUser: user.isNewUser,
                profileImage: user.profileImage,
                starsUserGave: user.starsUserGave,
            }
            function signJsonWebToken() {
                const token_payload = { fullName, userEmail };
                const token = jwt.sign(token_payload, config.secret.jwtSecret, { expiresIn: '1h' });
                const response = {
                    status:200, 
                    data : userDetails, 
                    error : false, 
                    message : 'you are now registered', 
                    token: token,
                };
            return res.status(200).json(response)
            }
            return signJsonWebToken();
        })
        .catch(err => console.error(err.stack));
    })  
}

module.exports = UserController;