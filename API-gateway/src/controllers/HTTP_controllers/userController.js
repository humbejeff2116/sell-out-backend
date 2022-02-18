

const { getUserNotifications, signupUser, loginUser } = require('../../utils/http.services');


function UserController() {}


UserController.prototype.signupUser = async function(req, res) {

    try {
        const signupDetails = {
            email: req.body.email,
            fullName: req.body.fullname,
            password: req.body.password
        }
        const signupedUserResponse  = await signupUser(signupDetails);
        res.json(signupedUserResponse);   
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
        res.json(loggedinUserResponse);   
    } catch (err) {
        console.error(err.stack)   
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
        console.error(err.stack)   
    } 
}
module.exports = UserController;