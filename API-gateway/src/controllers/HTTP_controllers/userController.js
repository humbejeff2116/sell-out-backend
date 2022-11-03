
const formidable = require('formidable');
const fs = require('fs');
var FormData = require('form-data');
const { 
    getUserNotifications, 
    signupUser, 
    loginUser, 
    getUserStars, 
    updateUser, 
    authenticateUser,
    getDeliveryRegions,
    getPreviousSearches 
} = require('../../utils/http.services');
const  { 
    sendJSONError 
} = require('../../libs/responses');


function UserController() {}

UserController.prototype.signupUser = async function(req, res) {
    const signupDetails = {
        email: req.body.email,
        fullName: req.body.fullname,
        password: req.body.password
    }

    try {
        const signupedUserResponse  = await signupUser(signupDetails);

        res.status(200).json(signupedUserResponse); 
    } catch (err) {
        console.error(err) ;
        sendJSONError(res, 500, true, "error occured while creating account", err);
    }
}

UserController.prototype.loginUser = async function(req, res) {
    const loginDetails = {
        email: req.body.email,
        password: req.body.password
    }

    try {
        const loggedinUserResponse  = await loginUser(loginDetails);

        res.status(200).json(loggedinUserResponse); 
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while signing in", err);
    } 
}

UserController.prototype.updateUser = async function(req, res) {
    const socketInstance = req.app.get("socketInstance") ? req.app.get("socketInstance") : null;
    const socketId = socketInstance ? socketInstance.socket.id : null;
    const io = socketInstance ? socketInstance.io : null;
    const formData = new FormData();
    const formHeaders = formData.getHeaders();

    try {
        const form = formidable({ multiples: true, });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) {
                    console.error(err);
                    throw new Error(err);  
                }

                const fieldsEntries = Object.entries((fields));
                const filesEntries = Object.entries((files));
                const authenticatedUserData = await authenticateUser(JSON.parse(fields.user));

                if (!authenticatedUserData.userExist) {
                    return res.status(401).json(authenticatedUserData);
                }
                // append user data from client to server form-data
                for (let [key, value] of fieldsEntries) {
                    formData.append(key, value);
                }
    
                for (let [key, value] of filesEntries) {
                    formData.append(key, fs.createReadStream(value.path), {
                        filename: value.name,
                    });
                } 
                // send product details to account service
                sendUpdateUserData(formData, formHeaders, res);
            } catch(error) {
                console.error(error);
                throw new Error(error); 
            } 
        });
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while updating user", err); 
    }

    async function sendUpdateUserData(data, headers, res) {
        try {
            const updateUserResponse = await updateUser(data, headers);

            if (updateUserResponse.error) {
                throw new Error(updateUserResponse.error);
            }
            
            if (io) {
                io.sockets.emit('userDataChange');
            }
            return res.status(200).json(updateUserResponse);
        } catch (err) {
            console.error(err);
            throw new Error(err);  
        }
    } 
}

UserController.prototype.getUserNotifications = async function(req, res) {
    const user = {
        id: req.params.id,
        userEmail: req.params.userEmail
    }

    try {
        const userNotifications  = await getUserNotifications(user);

        res.status(200).json(userNotifications);  
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while getting notifications", err);   
    }
}

UserController.prototype.getUserStars = async function(req, res) {
    try {
        const userStarsResponse = await getUserStars(req.params.userId);

        if (userStarsResponse.error) {
            throw new Error(userStarsResponse.error);
        }
        res.status(200).json(userStarsResponse);
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while getting user stars", err);
    } 
}

UserController.prototype.getDeliveryRegions = async function(req, res) {
    try {
        const delieveryRegionsResponse = await getDeliveryRegions(req.params.userId);

        if (delieveryRegionsResponse.error) {
            throw new Error(delieveryRegionsResponse.error);
        }
        res.status(200).json(delieveryRegionsResponse);
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while getting delievery regions", err);
    } 
}

UserController.prototype.getPreviousSearches = async function(req, res) {
    try {
        const prevSearchResponse = await getPreviousSearches(req.params.userId);

        if (prevSearchResponse.error) {
            throw new Error(prevSearchResponse.error);
        }
        res.status(200).json(prevSearchResponse);
    } catch (err) {
        sendJSONError(res, 500, true, "error occured while getting previous searches", err);
    } 
}

module.exports = UserController;