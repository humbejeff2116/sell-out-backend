

const { getUserNotifications } = require('../../utils/http.services');


function UserController() {}

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