
const express = require('express');
const path = require('path');
const { multerUploads } = require('./Multer/multer');
const ProductControllerClass =  require('../controllers/HTTP_controllers/productController');
const UserControllerClass =  require('../controllers/HTTP_controllers/userController');
const ProductController = new ProductControllerClass();
const UserController = new UserControllerClass();
const router = express.Router();


router.post('/product', ProductController.createProduct);
router.get('/products', ProductController.getProducts);
router.get('/products/:userId', ProductController.getProducts);
router.get('/similar-products/:userId/:userEmail/:productCategory', ProductController.getSimilarProducts);
router.get('/search-products', ProductController.searchProducts);
router.get('/reviews/:productId', ProductController.getProductReviews);
router.get('/notifications/:id/:userEmail', UserController.getUserNotifications);
router.get('/stars/:userId', UserController.getUserStars);
router.get('/product-likes/:productId', ProductController.getProductLikes);
router.post('/signup', UserController.signupUser);
router.post('/login', UserController.loginUser);
router.post('/update-user', UserController.updateUser);
router.get('/delivery-regions', UserController.getDeliveryRegions);
router.get('/user-prev-search', UserController.getPreviousSearches);

module.exports = router;