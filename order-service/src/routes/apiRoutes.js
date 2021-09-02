







const express = require('express');
const OrderControllerClass = require('../controllers/HTTP_controller/orderController');
const OrderController = new OrderControllerClass();
const router = express.Router();

router.get('/paymennts', OrderController.getPayments);

module.exports = router;
