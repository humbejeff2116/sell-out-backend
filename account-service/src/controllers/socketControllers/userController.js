




const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const cloudinary = require('cloudinary').v2;
const { imageDataUri } = require('../../routes/Multer/multer');
cloudinary.config({
    cloud_name:config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret:config.cloudinary.secret
});



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

UserController.prototype.authenticateUser = async function(userdata, userModel) {
    if (!userdata) {
        throw new Error("userdata is not defined");
    }
    const userEmail = userdata.email;
    const appUser = await userModel.getUserByEmail(userEmail);
    return appUser;
}
UserController.prototype.signUp = async function(data) {
    const self = this;
    const { socketId, user } = data;
    console.log("data is", data)
    
    const userEmail = user.email;
   
    
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
            isNewUser:user.isNewUser,
        }
        const response = {
            socketId,
            status:200, 
            data : userDetails, 
            error : false, 
            message : 'user signed up',     
        };
       return self.serverSocket.emit('userSignedUp', response)
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
            if (appUser.isNewUser) {
                const userDetails = {
                    id: appUser._id,
                    fullName: appUser.fullName,
                    userEmail: appUser.userEmail,
                    // isNewUser: appUser.isNewUser,
                } 
                const response = {
                    socketId,
                    status: 200,
                    data: userDetails,
                    error: false, 
                    message: 'new user found',    
                };
                return self.serverSocket.emit('userFound', response); 
            }
            const userDetails = {
                id: appUser._id,
                fullName: appUser.fullName,
                userEmail: appUser.userEmail,
                profileImage: appUser.profileImage ? appUser.profileImage : '',
                // isNewUser: appuser.isNewUser,
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

UserController.prototype.getAllUsers =  async function(io, socket, data) {
    console.log("getting all users")
    const appUsers = await User.getAllUsers();
    const response = {
        socketId: data,
        status: 200,
        data: appUsers,
        error: false, 
        message: 'users gotten successfully', 
    };
    return socket.emit('gottenAllUsers', response);          
}

UserController.prototype.starUser =  async function(data = {}) {
    const { socketId, user, product, starCount } = data;
    const seller = await User.getUserByEmail(product.userEmail);
    const appUser = await User.getUserByEmail(user.userEmail);
    const self = this;
   
    if (!appUser || !seller) {
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
                const response = {
                    status:201, 
                    socketId: socketId, 
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
        })
        .catch(e => console.error(e.stack));

        seller.removeStarUserRecieved(data);
        seller.save()
        .then(user => {
            const response = {
                status:201,
                socketId: socketId, 
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
    })
    .catch(e => console.error(e.stack))
    seller.addStarUserRecieved(data)
    seller.save()
    .then(data => {
        const response = {
            status:201,
            socketId: socketId, 
            error: false, 
            message: 'star placed successfully', 
        };
        self.serverSocket.emit('starUserSuccess', response);
    })
    .catch(e => console.error(e.stack))
      
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
        socketId: socketId,
        status: 200,
        data: starsUserRecieved,
        error: false, 
        message: 'user stars successfully gotten', 
    };
    this.serverSocket.emit('initialStarData', response);  
    console.log('sent initial star data');        
}

UserController.prototype.getNotifications =  async function(data = {}) {
    const { socketId, user} = data;
    const userEmail = user.userEmail;
    const appUser = await User.getUserByEmail(userEmail);
    if (!appUser) {
        const response = {
            socketId: socketId,
            status:401, 
            error : true, 
            message : 'no user found', 
        };

        return  this.serverSocket.emit('getNotificationsError', response);                      
    }
    const userNotifications = appUser.notifications;
    const response = {
        socketId: socketId,
        status: 201,
        data: userNotifications,
        error: false, 
        message: 'user notifications successfully gotten', 
    };
    this.serverSocket.emit('getNotificationsSuccess', response); 
    console.log('user notifications',userNotifications.length);        
}
UserController.prototype.seenNotifications =  async function(io, socket, data = {}) {
    try{
        const { socketId, user } = data;
        const userEmail = user.userEmail;
        const appUser = await User.getUserByEmail(userEmail);
        if (!appUser) {
            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            };
            return this.serverSocket.emit('seenNotificationsError', response);                      
        }
        const seenNotifications = await User.updateSeenNotifications(user);
        const response = {
            socketId: socketId,
            status:200, 
            error : false, 
            message : 'notifications seen', 
        };
        this.serverSocket.emit('seenNotificationsSuccess', response); 
        // io.to(socket.id).emit('seenNotificationsSuccess', response); 

    }catch(err) {
        console.error(err.stack);
    }
          
}


UserController.prototype.getUserInterests =  function(data = {}) {
    const { socketId, user} = data;
    const self = this;
    const userId = user.id;
    User.getAllUserInterest(userId, (err, result) => {
        if (err) {
            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            };
            return  self.serverSocket.emit('getInterestsError', response);                      
        }
        const response = {
            socketId: socketId,
            status: 201,
            data: result,
            error: false, 
            message: 'user interests successfully gotten', 
        };
        self.serverSocket.emit('getInterestsSuccess', response);  
        console.log('user interests',result);  

    });      
}


UserController.prototype.getUserConfirmations =  function(data = {}) {
    const { socketId, user} = data;
    const self = this;
    const userId = user.id;
    User.getAllUserConfirmations(userId, (err, result) => {
        if (err) {
            const response = {
                socketId: socketId,
                status:401, 
                error : true, 
                message : 'no user found', 
            };
            return  self.serverSocket.emit('getConfirmationsError', response);                      
        }
        const response = {
            socketId: socketId,
            status: 201,
            data: result,
            error: false, 
            message: 'user confirmations successfully gotten', 
        };
        self.serverSocket.emit('getConfirmationsSuccess', response);  
        console.log('user confirmations',result);  

    });      
}

module.exports = UserController;