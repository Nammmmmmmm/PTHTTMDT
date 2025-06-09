const httpErrors = require("http-errors");
const Order = require("../models/order.model");
const OrderDetail = require("../models/order-detail.model");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

class MoMoController {
  // Khởi tạo thanh toán MoMo
  async createPayment(req, res, next) {
    try {
      const { orderId } = req.body;

      // Tìm thông tin đơn hàng từ database
      const order = await Order.findById(orderId).populate(
        "customer_id",
        "name email phone"
      );

      if (!order) {
        throw httpErrors.NotFound("Không tìm thấy đơn hàng");
      }

      // Tìm chi tiết đơn hàng từ bảng OrderDetail
      const orderDetails = await OrderDetail.find({
        order_id: orderId,
      }).populate("product_id", "name price");

      if (!orderDetails || orderDetails.length === 0) {
        throw httpErrors.NotFound("Không tìm thấy chi tiết đơn hàng");
      }

      // Tạo mã đơn hàng duy nhất cho MoMo
      const orderCode = `MOMO_${Date.now()}_${orderId.slice(-6)}`;
      
      // Thông tin cấu hình MoMo
      const partnerCode = process.env.MOMO_PARTNER_CODE;
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;
      const endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";

      if (!partnerCode || !accessKey || !secretKey) {
        throw httpErrors.BadRequest("Chưa cấu hình thông tin MoMo");
      }

      // Tạo request ID duy nhất
      const requestId = orderCode;
      const amount = order.total_price.toString();
      const orderInfo = `Thanh toán đơn hàng ${orderId}`;
      const redirectUrl = `${process.env.BACKEND_URL}/momo/return`;
      const ipnUrl = `${process.env.BACKEND_URL}/momo/webhook`;
      const extraData = JSON.stringify({ orderId: orderId });
      const requestType = "payWithATM"; // hoặc "captureWallet" cho ví MoMo

      // Tạo chữ ký
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderCode}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      // Tạo request body cho MoMo
      const requestBody = {
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderCode,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "vi"
      };

      console.log("MoMo Request Body:", JSON.stringify(requestBody, null, 2));

      // Gửi request đến MoMo
      const momoResponse = await axios.post(endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("MoMo Response:", momoResponse.data);

      if (momoResponse.data.resultCode === 0) {
        // Cập nhật đơn hàng với thông tin thanh toán MoMo
        order.order_payment_id = orderCode;
        order.payment_method = "momo";
        order.status_id = "pending";
        await order.save();

        // Trả về thông tin thanh toán thành công
        return res.status(200).json({
          success: true,
          message: "Tạo link thanh toán MoMo thành công",
          data: {
            paymentUrl: momoResponse.data.payUrl,
            orderCode: orderCode,
            qrCodeUrl: momoResponse.data.qrCodeUrl,
            deeplink: momoResponse.data.deeplink
          }
        });
      } else {
        throw httpErrors.BadRequest(`Lỗi từ MoMo: ${momoResponse.data.message}`);
      }

    } catch (error) {
      console.error("MoMo payment error:", error.response?.data || error.message);
      next(error.isJoi ? httpErrors.BadRequest(error.message) : error);
    }
  }

  // Xử lý webhook từ MoMo
  async handleWebhook(req, res, next) {
    try {
      console.log("MoMo Webhook received:", JSON.stringify(req.body, null, 2));

      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
      } = req.body;

      // Xác thực chữ ký từ MoMo
      const secretKey = process.env.MOMO_SECRET_KEY;
      const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      
      const expectedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid signature from MoMo webhook");
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Tìm đơn hàng theo orderId
      const order = await Order.findOne({
        order_payment_id: orderId
      });

      if (!order) {
        console.error(`Order not found for orderId: ${orderId}`);
        return res.status(200).json({ message: "Order not found" });
      }

      let parsedExtraData = {};
      try {
        parsedExtraData = JSON.parse(extraData || '{}');
      } catch (e) {
        console.warn("Could not parse extraData:", extraData);
      }

      // Xử lý kết quả thanh toán
      if (resultCode === 0) {
        // Thanh toán thành công
        order.status_id = "paid";
        order.order_status = "processing";
        order.updated_at = new Date();

        // Lưu thông tin chi tiết thanh toán
        order.payment_details = {
          transactionId: transId,
          amount: parseInt(amount),
          payType: payType,
          responseTime: responseTime,
          message: message,
          orderInfo: orderInfo,
          resultCode: resultCode,
          partnerCode: partnerCode,
          paymentMethod: "momo"
        };

        console.log(`Order ${order._id} payment successful`);
      } else {
        // Thanh toán thất bại
        order.status_id = "payment_failed";
        order.updated_at = new Date();

        order.payment_details = {
          transactionId: transId || "",
          amount: parseInt(amount),
          payType: payType || "",
          responseTime: responseTime,
          message: message,
          orderInfo: orderInfo,
          resultCode: resultCode,
          partnerCode: partnerCode,
          paymentMethod: "momo",
          error: message
        };

        console.log(`Order ${order._id} payment failed: ${message}`);
      }

      // Lưu thay đổi vào database
      await order.save();

      // Trả về response cho MoMo
      return res.status(200).json({
        partnerCode: partnerCode,
        requestId: requestId,
        orderId: orderId,
        resultCode: 0,
        message: "success",
        responseTime: Date.now()
      });

    } catch (error) {
      console.error("MoMo webhook processing error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Kiểm tra trạng thái thanh toán MoMo
  async checkPaymentStatus(req, res, next) {
    try {
      const { orderCode } = req.params;

      // Tìm đơn hàng theo orderCode
      const order = await Order.findOne({
        order_payment_id: orderCode
      });

      if (!order) {
        throw httpErrors.NotFound("Không tìm thấy đơn hàng");
      }

      // Tạo request để kiểm tra trạng thái từ MoMo
      const partnerCode = process.env.MOMO_PARTNER_CODE;
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;
      const requestId = `STATUS_${Date.now()}_${orderCode}`;

      const rawSignature = `accessKey=${accessKey}&orderId=${orderCode}&partnerCode=${partnerCode}&requestId=${requestId}`;
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      const requestBody = {
        partnerCode: partnerCode,
        requestId: requestId,
        orderId: orderCode,
        signature: signature,
        lang: "vi"
      };

      const endpoint = process.env.MOMO_QUERY_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/query";
      
      const momoResponse = await axios.post(endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          payment: order.payment_details || {},
          status: order.status_id,
          momoStatus: momoResponse.data
        }
      });

    } catch (error) {
      console.error("Check MoMo payment status error:", error);
      next(error.isJoi ? httpErrors.BadRequest(error.message) : error);
    }
  }

  // Xử lý return URL từ MoMo (người dùng quay lại từ MoMo)
  async handleReturn(req, res, next) {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
      } = req.query;

      console.log("MoMo Return URL params:", req.query);

      // Tìm đơn hàng
      const order = await Order.findOne({
        order_payment_id: orderId
      });

      if (!order) {
        return res.redirect(`${process.env.FRONTEND_URL}/payment/error?message=Không tìm thấy đơn hàng`);
      }

      let parsedExtraData = {};
      try {
        parsedExtraData = JSON.parse(extraData || '{}');
      } catch (e) {
        console.warn("Could not parse extraData:", extraData);
      }

      const realOrderId = parsedExtraData.orderId || order._id;

      if (resultCode === "0") {
        // Thanh toán thành công - chuyển hướng đến trang xác nhận
        return res.redirect(`${process.env.FRONTEND_URL}/order-confirmation?orderId=${realOrderId}&status=success`);
      } else {
        // Thanh toán thất bại - chuyển hướng đến trang thất bại
        return res.redirect(`${process.env.FRONTEND_URL}/payment/error?orderId=${realOrderId}&message=${encodeURIComponent(message || "Thanh toán thất bại")}`);
      }

    } catch (error) {
      console.error("MoMo return URL error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/error?message=Có lỗi xảy ra`);
    }
  }
}

module.exports = new MoMoController(); 