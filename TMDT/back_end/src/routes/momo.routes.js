const express = require('express');
const bodyParser = require('body-parser');
const { momoController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const momoRouter = express.Router();

// Middleware cho JSON parsing
momoRouter.use(bodyParser.json());
momoRouter.use(bodyParser.urlencoded({ extended: true }));

// Tạo link thanh toán MoMo - Cần đăng nhập
momoRouter.post('/create-payment', [VerifyJwt.verifyToken], momoController.createPayment);

// Webhook từ MoMo (không cần token vì là từ MoMo gọi đến)
momoRouter.post('/webhook', momoController.handleWebhook);

// Return URL từ MoMo (không cần token vì là redirect từ MoMo)
momoRouter.get('/return', momoController.handleReturn);

// Kiểm tra trạng thái thanh toán - Cần đăng nhập
momoRouter.get('/check-status/:orderCode', [VerifyJwt.verifyToken], momoController.checkPaymentStatus);

module.exports = momoRouter; 