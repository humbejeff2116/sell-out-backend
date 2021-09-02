









const express = require('express');
const { multerUploads } = require('./Multer/multer');
const ProductControllerClass = require('../controllers/HTTP_controllers/productController');
const UserControllerClass = require('../controllers/HTTP_controllers/userControllerHTTP');
const ProductController = new ProductControllerClass();
const UserController = new UserControllerClass();

const router = express.Router();
router.post('/authenticate-user', UserController.authenticateUser);
router.post('/update-user', UserController.updateUser);
router.get('/products', ProductController.getProducts);
router.get('/users', UserController.getUsers);
router.get('/notifications/:id/:userEmail', UserController.getUserNotifications)
module.exports = router;