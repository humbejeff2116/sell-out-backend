









const express = require('express');
const UserControllerClass = require('../controllers/userController');
const UserController = new UserControllerClass();

const router = express.Router();
router.post('/update-user', UserController.updateUser)
module.exports = router;