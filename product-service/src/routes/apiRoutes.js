
const express = require('express');
const  ProductController   = require('../controllers/HTTP_controller/productController');
const { multerUploads } = require('./Multer/multer');
const router = express.Router();


router.post('/product', multerUploads, ProductController.createProduct);
router.get('/products', ProductController.getProducts);
router.get('/similar-products/:userId/:userEmail/:productCategory', ProductController.getSimilarProducts);
router.get('/product-likes/:productId', ProductController.getProductLikes);

module.exports = router;