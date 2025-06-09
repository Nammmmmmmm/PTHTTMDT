const express = require('express');
const { payosController } = require('../controller');
// const { authJwt } = require('../middleware');

const router = express.Router();

// Middleware để xử lý raw body cho webhook
const rawBodyMiddleware = (req, res, next) => {
  // Đặt timeout ngắn cho webhook để tránh treo server
  req.setTimeout(10000, () => {
    console.log('PayOS webhook timeout');
    if (!res.headersSent) {
      res.status(200).json({ success: true, message: 'timeout' });
    }
  });
  
  res.setTimeout(10000, () => {
    console.log('PayOS webhook response timeout');
  });
  
  next();
};

// Tạo link thanh toán - Cần đăng nhập
router.post('/create-payment',  payosController.createPayment);

// Kiểm tra trạng thái thanh toán - Cần đăng nhập
router.get('/check-status/:transactionCode', payosController.checkPaymentStatus);

// Manual check và update từ PayOS API - Cần đăng nhập
router.post('/manual-update/:transactionCode', payosController.manualCheckAndUpdate);

// Xử lý khi user hủy thanh toán từ PayOS - không cần xác thực
router.get('/cancel', payosController.handleCancel);

// Webhook từ PayOs - không cần xác thực JWT, có middleware xử lý timeout
router.post('/webhook', rawBodyMiddleware, payosController.handleWebhook);

module.exports = router;