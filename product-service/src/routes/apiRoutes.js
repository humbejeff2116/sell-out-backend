
const express = require('express');
const  ProductController   = require('../controllers/HTTP_controller/productController');
const { multerUploads } = require('./Multer/multer');
const router = express.Router();


router.post('/product', multerUploads, ProductController.createProduct);
router.get('/products', ProductController.getProducts);
router.get('/reviews/:productId', ProductController.getProductComments);
router.get('/search-products', ProductController.searchProducts);
router.get('/product-likes/:productId', ProductController.getProductLikes);

module.exports = router;