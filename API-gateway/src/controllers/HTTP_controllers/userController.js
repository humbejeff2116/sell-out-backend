
const formidable = require('formidable');
const path = require('path');
const fs = require('fs')
var FormData = require('form-data');
const { 
    getUserNotifications, 
    signupUser, 
    loginUser, 
    getUserStars, 
    updateUser, 
    authenticateUser,
    getDeliveryRegions 
} = require('../../utils/http.services');


function UserController() {}


UserController.prototype.signupUser = async function(req, res) {

    try {

        const signupDetails = {
            email: req.body.email,
            fullName: req.body.fullname,
            password: req.body.password
        }

        const signupedUserResponse  = await signupUser(signupDetails);

        res.status(200).json(signupedUserResponse); 

    } catch (err) {

        console.error(err.stack) 

    }

}

UserController.prototype.loginUser = async function(req, res) {

    try {

        const loginDetails = {
            email: req.body.email,
            password: req.body.password
        }

        const loggedinUserResponse  = await loginUser(loginDetails);

        res.status(200).json(loggedinUserResponse); 

    } catch (err) {

        console.error(err)

    } 

}

UserController.prototype.updateUser = async function(req, res) {

    try {

        const socketInstance = req.app.get("socketInstance") ? req.app.get("socketInstance") : null ;

        const socketId = socketInstance ? socketInstance.socket.id : null;

        const io = socketInstance ? socketInstance.io : null ;

        const form = formidable({ multiples: true, });

        const formData = new FormData();

        const formHeaders = formData.getHeaders();

        form.parse(req, async (err, fields, files) => {

            try {

                if (err) {

                    console.error(err);

                    res.status(400).json("An error occured while updating user details");

                    return;

                }

                const userData = {
                    id: fields.id,
                    userName: fields.fullName,
                    userEmail: fields.userEmail
                }

                // append create product data from client to server form-data
                for (let keys in fields) {

                    formData.append(keys, fields[keys])

                }

                for (let keys in files) {

                    formData.append(keys, fs.createReadStream(files[keys].path), {

                        filename: files[keys].name,

                    });

                }
            
                const authenticatedUserData = await authenticateUser(userData);

                if (!authenticatedUserData.userExist) {

                    return res.status(401).json(authenticatedUserData);

                }

                // send product details to product server
                sendUpdateUserData(formData, formHeaders, res);
            
                
            } catch (err) {

                console.error(err); 

            } 

        });

        async function sendUpdateUserData(data, headers, res) {

            try {

                const updateUserResponse = await updateUser(data, headers)

                if (updateUserResponse.error) {

                    return  sendJSONError(res, 500, true, "error occured while updating user")
        
                }
                
                if (io) {

                    io.sockets.emit('userDataChange');

                    return res.status(200).json(updateUserResponse);

                }

                return res.status(200).json(updateUserResponse);

            } catch (err) {

                console.error(err) 

            }

        }
    
    } catch (err) {

        console.error(err) 

    } 

}

UserController.prototype.getUserNotifications = async function(req, res) {

    try {

        const user = {
            id: req.params.id,
            userEmail: req.params.userEmail
        }

        const userNotifications  = await getUserNotifications(user);

        res.status(200).json(userNotifications);  

    } catch (err) {

        console.error(err) 

    }

}

UserController.prototype.getUserStars = async function(req, res) {

    try {

        const userStarsResponse  = await getUserStars(req.params.userId);

        if (userStarsResponse.error) {

            return  sendJSONError(res, 500, true, "error occured while getting user stars")

        }

        res.status(200).json(userStarsResponse);

    } catch (err) {

        sendJSONError(res, 500, true, "error occured while getting user stars")

    } 

}

UserController.prototype.getDeliveryRegions = async function(req, res) {

    try {

        const delieveryRegionsResponse  = await getDeliveryRegions(req.params.userId);

        if (delieveryRegionsResponse.error) {

            return  sendJSONError(res, 500, true, "error occured while getting delivery regions")

        }

        res.status(200).json(delieveryRegionsResponse);

    } catch (err) {

        sendJSONError(res, 500, true, "error occured while getting delievery regions")

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