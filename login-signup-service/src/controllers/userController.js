




const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * @class 
 *  user controller class 
 * @module UserController
 */
function UserController() {
   this.serverSocket;
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} serverSocket - the socket.IO server socket of the login server
 */
UserController.prototype.mountSocket = function({ serverSocket }) {
    this.serverSocket = serverSocket ? serverSocket: null;
    return this;
}

/**
 * @method getSocket  
 ** Used to get the service node socket datesils
 */
UserController.prototype.getSocket = function() {
    return this.serverSocket;
}

/**
 * @method signUp
 ** used to sign up a user
 ** initiates a  server connection with gateway node
 ** emits a user found error to gateway if already registered
 ** collects user data from gateway node and saves to database
 ** creates a JSON web token and sends response to gateway node 
 * @param {object} user - the signup user data collected from gateway node 
 */
UserController.prototype.signUp = async function(user = {}) {
    const self = this;
    const firstname = user.firstname;
    const lastname = user.lastname;
    const userEmail = user.email;
    const phonenumber = user.phonenumber;
    const profileimage = user.profileimage;
    const appUser = await User.getUserByEmail(userEmail);

    if (appUser) {
        const response = {
            status:400, 
            error : true, 
            message : "Email has already been registered on this site", 
        };
       return this.serverSocket.emit('userAlreadyExist', response);
    }
     let newUser = new User();
     await newUser.setUserDetails(user);
     await newUser.save()
     .then(user => {
        const userDetails = {
            firstname,
            lastname,
            userEmail,
            profileimage
        }
        function signJsonWebToken() {
           const token_payload = { firstname, phonenumber };
           const token = jwt.sign(token_payload, config.secret.jwtSecret, { expiresIn: '1h' });
           const response = {
                status:200, 
                data : userDetails, 
                error : false, 
                message : 'you are now registered', 
                token: token 
            };
           return self.serverSocket.emit('userSignedUp', response)
        }
        return signJsonWebToken();
     });
}

/**
 * @method login
 ** used to login a user
 ** initiates a server connection with gateway node
 ** emits user not found error to gateway if ecountered 
 ** creates a JSON web token and sends response to gateway node 
 * @param {object} user - the login user data collected from gateway node 
 */
UserController.prototype.login =  async function(user = {}) {
    const userEmail = user.email;
    const password = user.password;
    const appUser = await User.getUserByEmail(userEmail);
    const self = this;

    if (!appUser) {
        console.error('no user found'); 
        const response = {
            status:401, 
            error : true, 
            message : 'Incorrect email Address', 
        };
        return this.serverSocket.emit('userNotFound', response)                       
    }
    appUser.checkPassword(password, function(err, isMatch) {
        errorExist();
        passwordMatchNotFound();
        passwordMatchFound();

        function errorExist() {
            if (err) {
                console.error('error while checking password');                  
                const response = {
                    status:401, 
                    error : true,
                    message:'an error occured while getting details'
                }
                return self.serverSocket.emit('passwordError', response);
            }
        }
        function passwordMatchNotFound() {
            if (!isMatch) {
                console.error('no match found');
                const response = {
                    status: 401, 
                    error : true,
                    message: 'Incorrect password.'
                }                  
                return self.serverSocket.emit('passwordMatchNotFound', response);       
            }
        }

        function passwordMatchFound() {
            const userDetails = {
                id: appUser._id,
                firstname: appUser.firstname,
                lastname: appUser.lastname,
                email: appUser.email,
                profileimage: appUser.profileimage
            }           
            const token_payload = { name: appUser.name, id: appUser._id };
            const token = jwt.sign(token_payload,config.secret.jwtSecret , { expiresIn: '1h' });
            const response = {
                status: 200,
                data: userDetails,
                error: false, 
                message: 'Token Created, Authentication Successful!', 
                token: token 
            };
            return self.serverSocket.emit('userFound', response);
        }           
    });
}

module.exports = UserController;