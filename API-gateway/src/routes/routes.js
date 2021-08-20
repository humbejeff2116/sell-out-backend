




const express = require('express')
const ProductControllerClass =  require('../controllers/HTTP_controller/productController')
const ProductController = new ProductControllerClass();


const router = express.Router();


router.get('/products', ProductController.getProducts)

module.exports = router;