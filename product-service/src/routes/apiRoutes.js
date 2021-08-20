







const express = require('express');
const productControllerClass = require('../controllers/HTTP_controller/productController');
const ProductController = new productControllerClass();
const { multerUploads } = require('./Multer/multer');
const router = express.Router();




// router.post('/upload-product', multerUploads, ProductController.createProductHTTP);
router.get('/products', ProductController.getProducts);

module.exports = router;
