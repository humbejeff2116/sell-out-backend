




const express = require('express')
const path = require('path')
const { multerUploads } = require('./Multer/multer');
const ProductControllerClass =  require('../controllers/HTTP_controllers/productController')
const UserControllerClass =  require('../controllers/HTTP_controllers/userController');
const ProductController = new ProductControllerClass();
const UserController = new UserControllerClass();


const router = express.Router();



router.post('/product', ProductController.createProduct)
router.get('/products', ProductController.getProducts)
router.get('/notifications/:id/:userEmail', UserController.getUserNotifications)

module.exports = router;