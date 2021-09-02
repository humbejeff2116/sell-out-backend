







const express = require('express');
const productControllerClass = require('../controllers/HTTP_controller/productController');
const ProductController = new productControllerClass();
const router = express.Router();

router.get('/products', ProductController.getProducts);

module.exports = router;
