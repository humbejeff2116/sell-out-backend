




const express = require('express')
const path = require('path')
const { multerUploads } = require('./Multer/multer');
const ProductControllerClass =  require('../controllers/HTTP_controller/productController')
const ProductController = new ProductControllerClass();


const router = express.Router();



router.post('/product', ProductController.createProduct)
router.get('/products', ProductController.getProducts)

module.exports = router;