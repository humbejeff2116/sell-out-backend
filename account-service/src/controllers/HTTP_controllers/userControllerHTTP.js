
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

UserController.prototype.signupUser = async function(req, res) {

    const email = req.body.email;

    try {

        const appUser = await User.getUserByEmail(email);

        if (appUser) {

            const response = {
                status:400,
                error : true,
                userAlreadyExist: true,
                message : "Email has already been used for registration on this site",
            }
        
            res.json(response);

            return res.status(400);

        }

        const newUser = new User();

        await newUser.setUserDetails(req.body);

        const createUser = await newUser.save()

        const token_payload = { userEmail: createUser.userEmail, id: createUser._id }

        const token = jwt.sign(token_payload, config.secret.jwtSecret , { expiresIn: '1h' })

        const userDetails = {
            id: createUser._id,
            fullName: createUser.fullName,
            userEmail: createUser.userEmail,
            isNewUser: createUser.isNewUser,
        }

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

    }

}

UserController.prototype.loginUser = async function(req, res) {

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

        appUser.checkPassword(password, function(err, isMatch) {

            if(err) {

                return errorExist();

            }

            if(!isMatch) {

                return passwordMatchNotFound();

            }
            
            return passwordMatchFound();

            function errorExist() {  

                const response = {
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

                let userDetails;

                if (!appUser.allowedToSell) {

                    userDetails = {
                        id: appUser._id,
                        fullName: appUser.fullName,
                        userEmail: appUser.userEmail,
                        profileImage: appUser.profileImage ? appUser.profileImage : '',
                        isNewUser: appUser.isNewUser,
                        allowedToSell: appUser.isNewUser, 
                        starsUserGave: appUser.starsUserGave,
                    } 

                } else {

                    userDetails = {
                        id: appUser._id,
                        fullName: appUser.fullName,
                        userEmail: appUser.userEmail,
                        isNewUser: appUser.isNewUser,
                        profileImage: appUser.profileImage,
                        starsUserGave: appUser.starsUserGave,
                        phoneNumber: appUser.phoneNumber, 
                        allowedToSell: appUser.allowedToSell,
                        contactEmail: appUser.contactEmail,
                        contactNumber: appUser.contactNumber,
                        contactAddress: appUser.contactAddress,
                        country: appUser.country,
                        city: appUser.city,
                        brandName: appUser.brandName,
                        residentialAddress: appUser.residentialAddress,
                        deliveryRegions: appUser.deliveryRegions,
                    }

                }
                  

                const token_payload = { userEmail: appUser.userEmail, id: appUser._id };

                const token = jwt.sign(token_payload, config.secret.jwtSecret, { expiresIn: '1h' });

                const response = {
                    status: 200,
                    error: false, 
                    data: userDetails,
                    token: token,
                    message: 'Login Successful'
                }

                return res.json(response);

            }

        })

    } catch(err) {

        console.error(err.stack);

    }
    

}

UserController.prototype.authenticateUser = async function(req, res) {

    try {

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
            }

           res.json(response);

           return res.status(400);

        }

        const response = {
            status:200, 
            error : false,
            userExist: true, 
            message : "user found", 
        }

        res.json(response);

        return res.status(200);
        
    } catch (err) {

        console.error(err)
        
    }

}

UserController.prototype.updateUser = async function(req, res) {

    try {

        const { 
            contactEmail, 
            contactNumber, 
            contactAddress, 
            brandName, 
            country, 
            city, 
            residentialAddress, 
            userEmail, 
            deliveryRegions,
            userId 
        } = req.body;

        const profileImage = (req.file) ? imageDataUri(req).content : 'no-image';

        const appUser = await User.getUserByEmail(userEmail);

        if (!appUser) {

            const response = {
                status:400, 
                error : true, 
                message : "No user found", 
            }

            res.json(response);

            return res.status(400);

        }

        if (profileImage === 'no-image') {

            req.body.userProfileImageURL = profileImage

        } else {

            const uploadUserImage = await cloudinary.uploader.upload(profileImage)

            req.body.userProfileImageURL = uploadUserImage.url

        }

        const { status, error, data } = await User.updateUser(req.body);

        if (status === 201) {

            const userDetails = {
                id: data._id,
                fullName: data.fullName,
                userEmail: data.userEmail,
                isNewUser: data.isNewUser,
                profileImage: data.profileImage,
                starsUserGave: data.starsUserGave,
                phoneNumber: data.phoneNumber, 
                allowedToSell: data.allowedToSell,
                contactEmail: data.contactEmail,
                contactNumber: data.contactNumber,
                contactAddress: data.contactAddress,
                country: data.country,
                city: data.city,
                brandName: data.brandName,
                residentialAddress: data.residentialAddress,
                deliveryRegions: data.deliveryRegions,
            }

            function signJsonWebToken() {

                const token_payload = { userEmail: data.userEmail, id: data._id }

                const token = jwt.sign(token_payload, config.secret.jwtSecret, { expiresIn: '1h' })

                const response = {
                    status:200, 
                    data : userDetails, 
                    error : false, 
                    message : 'Profile created successfully', 
                    token: token,
                }

                return res.status(200).json(response)

            }

            return signJsonWebToken();

        }

    } catch(err) {

        console.error(err)

        const response = {
            status: 500, 
            data : null, 
            error : true, 
            message : 'An Error occured while creating profile', 
        }

        res.status(500).json(response)

    }
     
}

UserController.prototype.getUserNotifications =  async function(req, res) {

    try {

        const userEmail = req.params.userEmail;

        const userId = req.params.id

        const appUser = await User.getUserByEmail(userEmail);

        if (!appUser) {

            const response = { 
                status:401, 
                error : true, 
                message : 'no user found', 
            }

            return  res.status(401).json( response); 

        }

        const userNotifications = appUser.notifications;

        const response = {
            status: 201,
            data: userNotifications,
            error: false, 
            message: 'user notifications successfully gotten', 
        }

        res.status(200).json( response);
         
    } catch (err) {
        
    }
    
          
}

UserController.prototype.getUsers =  async function(req, res) {

    try {
        const users = await User.getAllUsers();
        if (!users) {
            const response = { 
                status:401, 
                error : true, 
                message : 'no users found', 
            };
            return  res.status(401).json( response);                      
        }
        const response = {
            status: 201,
            error: false, 
            message: 'users gotten successfully',
            data: users, 
        };
        res.status(200).json( response);
        
    } catch (err) {

        console.error(err.stack)
         
    }
         
}

UserController.prototype.getUserStars = async function(req, res, next) {

    try {

        const userId = req.params.userId;

        const appUser = await User.getUserById(userId);
    
        if (!appUser) {
    
            const response = {
                status:401, 
                error : true, 
                message : 'no user found', 
            }
    
            res.json(response)
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
    
        res.status(200).json(response) 

    }  catch(err) {

        // console.log(err)

        sendJSONError(res, 500, true, "Error occured while getting user stars")

    }

}

UserController.prototype.getDeliveryRegions = async function(req, res, next) {

    try {

        const userId = req.params.userId;

        const appUser = await User.getUserById(userId);
    
        if (!appUser) {
    
            const response = {
                status:401, 
                error : true, 
                message : 'no user found', 
            }
    
            res.json(response)

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


        sendJSONError(res, 500, true, "Error occured while getting delivery region")

    }

}

UserController.prototype.getPreviousSearches = async function(req, res, next) {

    try {

        const userId = req.params.userId;

        const appUser = await User.getUserById(userId);
    
        if (!appUser) {
    
            const response = {
                status:401, 
                error : true, 
                message : 'no user found', 
            }
    
            res.json(response)

            return res.status(401);                      
        }
    
        const response = {
            status: 200,
            data: appUser.searchData,
            error: false, 
            message: 'previous searches gotten successfully', 
        }
    
        res.status(200).json(response) 

    }  catch(err) {


        sendJSONError(res, 500, true, "Error occured while getting previous searches")

    }

}

function sendJSONError(res, status, error, message) {

    const response = {
        status,
        error, 
        message, 
    }

    res.json(response) 

    return res.status(500)
}

module.exports = UserController;