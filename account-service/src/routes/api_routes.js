
const express = require('express');
const { multerUploads } = require('./Multer/multer');
const UserControllerClass = require('../controllers/HTTP_controllers/userControllerHTTP');
const UserController = new UserControllerClass();
const router = express.Router();

router.post('/authenticate-user', UserController.authenticateUser);
router.post('/update-user', multerUploads, UserController.updateUser);
router.get('/users', UserController.getUsers);
router.get('/notifications/:id/:userEmail', UserController.getUserNotifications)
router.get('/stars/:userId', UserController.getUserStars)
router.post('/signup', UserController.signupUser);
router.post('/login', UserController.loginUser);
router.post('/delivery-regions/:userId', UserController.getDeliveryRegions);
router.get('/user-prev-search', UserController.getPreviousSearches);

module.exports = router;