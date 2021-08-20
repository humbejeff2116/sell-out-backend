









const express = require('express');
const UserControllerClass = require('../controllers/userController');
const ProductControllerClass = require('../controllers/HTTP_controller/productController');
const ProductController = new ProductControllerClass()
const UserController = new UserControllerClass();

const router = express.Router();
router.post('/update-user', UserController.updateUser)
router.get('/products', ProductController.getProducts)
module.exports = router;