




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
UserController.prototype.signUp = async function(data) {
    const self = this;
    const { socketId, user } = data;
    const fullName = user.fullname;
    const userEmail = user.email;
    console.log("user is", user)
    // const profileimage = user.profileimage;
   
    const appUser = await User.getUserByEmail(userEmail);

    if (appUser) {
        const response = {
            socketId,
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
            id: user._id,
            fullName: user.fullName,
            userEmail: user.userEmail,
            newUser:true,
            profileImage: user.profileImage ? user.profileImage : '',
            starsUserGave: user.starsUserGave,
        }
        function signJsonWebToken() {
            const token_payload = { fullName, userEmail };
            const token = jwt.sign(token_payload, config.secret.jwtSecret, { expiresIn: '1h' });
            const response = {
                socketId,
                status:200, 
                data : userDetails, 
                error : false, 
                message : 'you are now registered', 
                token: token,
            };
           return self.serverSocket.emit('userSignedUp', response)
        }
        return signJsonWebToken();
     })
     .catch(err => console.error(err.stack));
}

/**
 * @method login
 ** used to login a user
 ** initiates a server connection with gateway node
 ** emits user not found error to gateway if ecountered 
 ** creates a JSON web token and sends response to gateway node 
 * @param {object} user - the login user data collected from gateway node 
 */
UserController.prototype.login =  async function(data = {}) {
    const { socketId, user } = data;
    const userEmail = user.email;
    const password = user.password;
    const appUser = await User.getUserByEmail(userEmail);
    const self = this;

    if (!appUser) {
        console.error('no user found'); 
        const response = {
            socketId,
            status:401, 
            error : true, 
            message : 'Incorrect email Address', 
        };
        return this.serverSocket.emit('userNotFound', response)                       
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
            console.error('error while checking password');                  
            const response = {
                socketId,
                status:401, 
                error : true,
                message:'an error occured while getting details'
            }
            return self.serverSocket.emit('passwordError', response); 
        }

        function passwordMatchNotFound() {
            console.error('no match found');
            const response = {
                socketId,
                status: 401, 
                error : true,
                message: 'Incorrect password.'
            }                  
            return self.serverSocket.emit('passwordMatchNotFound', response);       
        }

        function passwordMatchFound() {
            const userDetails = {
                id: appUser._id,
                fullName: appUser.fullName,
                userEmail: appUser.userEmail,
                profileImage: appUser.profileImage ? appUser.profileImage : '',
                starsUserGave: appUser.starsUserGave,
            }           
            const token_payload = { name: appUser.name, id: appUser._id };
            const token = jwt.sign(token_payload,config.secret.jwtSecret , { expiresIn: '1h' });
            const response = {
                socketId,
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

UserController.prototype.getUserById =  async function(data = {}) {
    const { socketId, userId } = data;
    const appUser = await User.getUserById(userId);
   
    if (!appUser) {
        console.error('no user found'); 
        const response = {
            socketId: socketId,
            status:401, 
            error : true, 
            message : 'no user found', 
        };
        return this.serverSocket.emit('userByIdNotFound', response)                       
    }

    const userDetails = {
        id: appUser._id,
        fullName: appUser.fullName,
        userEmail: appUser.userEmail,
        profileImage: appUser.profileImage ? appUser.profileImage : '',
        starsUserGave: appUser.starsUserGave,
    }    

    const response = {
        socketId,
        status: 200,
        data: userDetails,
        error: false, 
        message: 'user successfully found', 
    };
    return this.serverSocket.emit('userByIdFound', response);          
}

UserController.prototype.starUser =  async function(data = {}) {
    const { socketId, user, product, starCount } = data;
    const seller = await User.getUserByEmail(product.userEmail);
    const appUser = await User.getUserByEmail(user.userEmail);
    
    console.log("user is",appUser)
    const self = this;
   
    if (!appUser || !seller) {
        console.error('no user found'); 
        const response = {
            socketId: socketId,
            status:401, 
            error : true, 
            message : 'no user found', 
        };
        return this.serverSocket.emit('staruserError', response);                       
    }

    if ((starCount === 0)) {

        if (seller.userEmail === appUser.userEmail) {
            appUser.removeStarUserGave(data);
            appUser.removeStarUserRecieved(data);
            appUser.save()
            .then(user => {
                console.log('logged in user data after removing star: ')
                console.log( user);
                const response = {
                    status:201, 
                    data: user, 
                    error: false, 
                    message: 'star removed successfully', 
                };
                return this.serverSocket.emit('starUserSuccess', response);
            })
            .catch(e => console.error(e.stack));
            return 
        }

        appUser.removeStarUserGave(data);
        appUser.save()
        .then(user => {
            console.log('logged in user data after removing star:')
            console.log( user);
        })
        .catch(e => console.error(e.stack));
        seller.removeStarUserRecieved(data);
        seller.save()
        .then(user => {
            console.log('seller data after removing star:')
            console.log(user);
            const response = {
                status:201, 
                data: user, 
                error: false, 
                message: 'star removed successfully', 
            };
            return this.serverSocket.emit('starUserSuccess', response);
        })
        .catch(e => console.error(e.stack));
        return
    }


    appUser.addStarUserGave(data)
    appUser.save()
    .then(data => {
        console.log('logged in user data after adding star: ')
        console.log( data)
    });
    seller.addStarUserRecieved(data)
    seller.save()
    .then(data => {
        console.log("seller user data after adding star")
            console.log( data)
        const response = {
            status:201, 
            data, 
            error: false, 
            message: 'star placed successfully', 
        };
        // self.serverSocket.emit('productDataChange');
        self.serverSocket.emit('starUserSuccess', response);
    })
      
}


UserController.prototype.getUserStars =  async function(data = {}) {
    const { socketId, product} = data;
    const userEmail = product.userEmail;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
        const response = {
            socketId: socketId,
            status:401, 
            error : true, 
            message : 'no user found', 
        };

        return  this.serverSocket.emit('getStarsError', response);                      
    }
    const stars = appUser.starsUserRecieved;
    const starsUserRecieved = stars.length;

    const response = {
        socketId,
        status: 200,
        data: starsUserRecieved,
        error: false, 
        message: 'user stars successfully gotten', 
    };
    this.serverSocket.emit('initialStarData', response);  
    console.log('sent initial star data');        
}

module.exports = UserController;