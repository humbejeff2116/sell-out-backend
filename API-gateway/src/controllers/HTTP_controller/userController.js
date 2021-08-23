



const { getUserNotifications } = require('../../utils/http.services');


function UserController() {

}



UserController.prototype.getUserNotifications = function(req, res) {

    const user = {
        id: req.params.id,
        userEmail: req.params.userEmail
    }
    getUserNotifications(user)
    .then(userNotifications => {

        res.status(200).json(userNotifications);
    })
    .catch(err => console.error(err.stack));
}

module.exports = UserController;