
const formidable = require('formidable');
const User = require('../../models/userModel');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const { sendJSONError } = require('../../libs/responses');
const cloudinary = require('cloudinary').v2;
const { imageDataUri } = require('../../routes/Multer/multer');
cloudinary.config({
    cloud_name:config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret:config.cloudinary.secret
});


function UserController() {}

function signJsonWebToken({userEmail, _id}) {
    const token_payload = { userEmail, id: _id };
    const token = jwt.sign(token_payload, config.secret.jwtSecret, { expiresIn: '1h' });
    return token;
}

function filterUser(user) {
    return({
        id: user._id,
        fullName: user.fullName,
        userEmail: user.userEmail,
        profileImage: user.profileImage,
        isNewUser: user.isNewUser,
        allowedToSell: user.allowedToSell,
        companyOrBusiness: user.companyOrBusiness,
        legalAddress: user.legalAddress,
        shippingAndOperations: user.shippingAndOperations,
        operationalRegions: user.operationalRegions,
        starsUserGave: user.starsUserGave,
        starsUserRecieved: user.starsUserRecieved,
        commentsUserMade: user.commentsUserMade,
        repliesUserMade: user.repliesUserMade,
        commentsUserLiked: user.commentsUserLiked,
        commentsUserDisliked: user.commentsUserDisliked,
        notifications: user.notifications,
        productsUserLiked: user.productsUserLiked,
    })
}

UserController.prototype.signupUser = async function (req, res) {
    const email = req.body.email;

    try {
        const appUser = await User.getUserByEmail(email);

        if (appUser) {
            const response = {
                status: 400,
                error : true,
                userAlreadyExist: true,
                message: "User account already exist",
            }
        
            res.json(response);
            return res.status(400);
        }

        const newUser = new User();
        await newUser.setUserDetails(req.body);
        const createUser = await newUser.save();
        const token = signJsonWebToken(createUser);
        const userDetails = filterUser(createUser);
        const response = {
            status: 200,
            userAlreadyExist: false,
            data: userDetails,
            token: token,
            error: false,
            message: 'user signed up',
        }
        
        return res.json(response);
    } catch(err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while creating account");
        
    }
}

UserController.prototype.loginUser = async function (req, res) {
    const userEmail = req.body.email;
    const password = req.body.password;

    try {
        const appUser = await User.getUserByEmail(userEmail);

        if (!appUser) {
            console.error('no user found'); 
            const response = {
                status:400, 
                error : true, 
                message : 'Incorrect email Address', 
            };

            res.json(response);  
            return res.status(400);
        }

        appUser.checkPassword(password, function (err, isMatch) {
            if (err) {
                return errorExist();
            }

            if (!isMatch) {
                return passwordMatchNotFound();
            } 
            return passwordMatchFound();

            function errorExist() {  
                const response = {
                    error: true,
                    status:400,
                    message:'an error occured while login in please wait an try again'
                }

                res.json(response); 
                return res.status(400);  
            }

            function passwordMatchNotFound() {
                const response = {
                    status: 400, 
                    error : true,
                    message: 'Incorrect password.'
                }  

                res.json(response); 
                return res.status(400);  
            }

            function passwordMatchFound() {
                const userDetails = filterUser(appUser);
                const token = signJsonWebToken(appUser);
                const response = {
                    status: 200,
                    error: false, 
                    data: userDetails,
                    token: token,
                    message: 'Login Successful'
                }

                return res.status(200).json(response);
            }
        })
    } catch(err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while login in");
    }
}

UserController.prototype.authenticateUser = async function (req, res) {
    let userId = req.body.id;
    let userName = req.body.userName;
    let userEmail = req.body.userEmail;

    try {
        const appUser = await User.getUserByEmail(userEmail);

        if (!appUser) {
            const response = {
                status: 400, 
                error : true,
                userExist: false, 
                message : "user not found", 
            }

           res.json(response);
           return res.status(400);
        }

        const response = {
            status: 200, 
            error : false,
            userExist: true, 
            message: "user found", 
        }

        res.status(200).json(response);   
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while authenticating user", err);  
    }
}

UserController.prototype.updateUser = async function (req, res) {
    const {userEmail } = JSON.parse(req.body.user);
    const profileImage = (req.file) ? imageDataUri(req).content : null;
    let updatedUser = {};

    try {
        const appUser = await User.getUserByEmail(userEmail);

        if (!appUser) {
            const response = {
                status: 400, 
                error : true, 
                message: "No user found", 
            }
            res.json(response);
            return res.status(400);
        }

        if (!profileImage) {
            try {
                updatedUser = await User.updateUser(req.body, null);
            } catch(err) {
                throw new Error(err);
            }
        } else {
            try {
                const uploadUserImage = await cloudinary.uploader.upload(profileImage);
                updatedUser = await User.updateUser(req.body, uploadUserImage.url);
            } catch(err) {
                throw new Error(err);
            }
        }

        const { status, error, data } = updatedUser;
        if (status === 201) {
            const token = signJsonWebToken(data);
            const userDetails = filterUser(data);
            const response = {
                status:200, 
                data : userDetails, 
                error : false, 
                message : 'Profile created successfully', 
                token: token,
            }
            return res.status(200).json(response);
        }
    } catch(err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while creating profile");
    }  
}

UserController.prototype.getUserNotifications =  async function (req, res) {
    const userEmail = req.params.userEmail;
    const userId = req.params.id;

    try {
        const appUser = await User.getUserByEmail(userEmail);

        if (!appUser) {
            const response = { 
                status:401, 
                error : true, 
                message : 'no user found', 
            }
            return  res.status(401).json(response); 
        }

        const userNotifications = appUser.notifications;
        const response = {
            status: 201,
            data: userNotifications,
            error: false, 
            message: 'user notifications successfully gotten', 
        }

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while getting notifications");
    }       
}

UserController.prototype.getUsers =  async function (req, res) {
    try {
        const users = await User.getAllUsers();

        if (!users) {
            const response = { 
                status:401, 
                error : true, 
                message : 'no users found', 
            };
            return  res.status(401).json(response);                      
        }
        const response = {
            status: 201,
            error: false, 
            message: 'users gotten successfully',
            data: users, 
        };
        res.status(200).json(response);  
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while getting users", err);  
    }     
}

UserController.prototype.getUserStars = async function(req, res, next) {
    const userId = req.params.userId;

    try {
        const appUser = await User.getUserById(userId);

        if (!appUser) {
            const response = {
                status: 401, 
                error : true, 
                message: 'no user found', 
            }
            res.json(response);
            return res.status(401);                      
        }
    
        const userStars = {
            starsUserRecieved: appUser.starsUserRecieved,
            starsUserGave: appUser.starsUserGave
        }
    
        const response = {
            status: 200,
            data: userStars,
            error: false, 
            message: 'user stars successfully gotten', 
        }
    
        res.status(200).json(response); 
    } catch(err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while getting user stars");
    }
}

UserController.prototype.getDeliveryRegions = async function(req, res, next) {
    const userId = req.params.userId;

    try {
        const appUser = await User.getUserById(userId);
    
        if (!appUser) {
            const response = {
                status:401, 
                error : true, 
                message : 'no user found', 
            }
    
            res.json(response);
            return res.status(401);                      
        }
    
        const response = {
            status: 200,
            data: appUser.deliveryRegions,
            error: false, 
            message: 'Delivery regions gotten successfully', 
        }
    
        res.status(200).json(response) 
    }  catch(err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while getting delivery region");
    }
}

UserController.prototype.getPreviousSearches = async function (req, res, next) {
    const userId = req.params.userId;
    try {
        const appUser = await User.getUserById(userId);
    
        if (!appUser) {
            const response = {
                status:401, 
                error : true, 
                message : 'no user found', 
            }
            res.json(response);
            return res.status(401);                      
        }
    
        const response = {
            status: 200,
            data: appUser.searchData,
            error: false, 
            message: 'previous searches gotten successfully', 
        }
    
        res.status(200).json(response); 
    }  catch(err) {
        console.error(err);
        sendJSONError(res, 500, true, "Error occured while getting previous searches");
    }
}

module.exports = UserController;