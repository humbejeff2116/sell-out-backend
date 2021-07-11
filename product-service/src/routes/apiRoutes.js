







const express = require('express');
const productControllerClass = require('../controllers/productsAndServiceController');
const productController = new productControllerClass();
const { multerUploads } = require('./Multer/multer');
let router = express.Router();




router.post('/upload-product', multerUploads, productController.createProductHTTP);

module.exports = router;
