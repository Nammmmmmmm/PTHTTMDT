const httpErrors = require("http-errors");
const Order = require("../models/order.model");
const OrderDetail = require("../models/order-detail.model");
const PayOS = require("@payos/node");
require("dotenv").config();

// Khởi tạo instance của PayOS
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

class PayOsController {
  // Khởi tạo thanh toán và tạo payment link
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
      // Tạo mã giao dịch duy nhất
      function generateTransactionCodeFromOrderId(orderId) {
        // Lấy timestamp hiện tại (số giây)
        const timestamp = Math.floor(Date.now() / 1000);

        // Lấy 6 ký tự cuối của orderId
        const lastSixChars = orderId.toString().slice(-6);

        // Chuyển đổi các ký tự thành mã ASCII và lấy phần dư khi chia cho 10
        // để đảm bảo chỉ có các chữ số
        let numericCode = "";
        for (let i = 0; i < lastSixChars.length; i++) {
          numericCode += lastSixChars.charCodeAt(i) % 10;
        }

        // Lấy 6 chữ số đầu tiên
        numericCode = numericCode.slice(0, 6);

        // Tạo mã giao dịch bằng cách kết hợp timestamp với mã số từ orderId
        // Nhưng đảm bảo kết quả không vượt quá MAX_SAFE_INTEGER
        const maxSafePrefix = Math.floor(Number.MAX_SAFE_INTEGER / 1000000);
        const prefix = timestamp % maxSafePrefix;

        // Kết hợp prefix với numericCode để tạo thành transaction code
        const transactionCode = parseInt(prefix.toString() + numericCode);

        return transactionCode;
      }
      const transactionCode = generateTransactionCodeFromOrderId(orderId);
      console.log("Generated transaction code:", transactionCode);

      // Chuyển đổi dữ liệu chi tiết đơn hàng thành format yêu cầu của PayOS
      const items = orderDetails.map((detail) => {
        const productName =
          detail.product_id && detail.product_id.name
            ? detail.product_id.name.substring(0, 25) // Giới hạn tên sản phẩm
            : "San pham";

        return {
          name: productName,
          quantity: detail.quantity || 1,
          price: detail.price || 0,
        };
      });

      // Tạo dữ liệu thanh toán theo định dạng của PayOS
      const lastSevenDigits = transactionCode.toString().slice(-7);
      const paymentData = {
        orderCode: transactionCode,
        amount: order.total_price,
        description: `PAYOS${lastSevenDigits}`, // Mô tả ngắn gọn không quá 25 ký tự
        returnUrl: `${process.env.FRONTEND_URL}/order-confirmation?orderId=${orderId}`,
        cancelUrl: `${process.env.BE_API_URL || 'http://localhost:9999'}/api/payos/cancel?orderCode=${transactionCode}&orderId=${orderId}`,
        items: items,
      };

      // Nếu có thông tin khách hàng, thêm vào paymentData
      if (order.customer_id && order.customer_id.name) {
        paymentData.buyerInfo = {
          name: order.customer_id.name,
          email: order.customer_id.email || "",
          phone: order.customer_id.phone || "",
        };
      }

      // Gọi API PayOS để tạo payment link
      const paymentLinkResponse = await payOS.createPaymentLink(paymentData);

      // Cập nhật đơn hàng với thông tin thanh toán
      order.order_payment_id = transactionCode.toString(); // Lưu transactionCode vào order_payment_id
      order.payment_method = "payos";
      order.status_id = "pending";
      await order.save();

      // Chuyển hướng người dùng đến trang thanh toán của PayOS
      return res.status(200).json({
        success: true,
        message: "Tạo link thanh toán thành công",
        data: {
          paymentUrl: paymentLinkResponse.checkoutUrl,
          transactionCode: transactionCode,
          qrCode: paymentLinkResponse.qrCode, // Trả về mã QR code nếu có
        },
      });
    } catch (error) {
      console.error("PayOs payment error:", error);
      next(error.isJoi ? httpErrors.BadRequest(error.message) : error);
    }
  }
  
  // Xử lý webhook từ PayOS
  async handleWebhook(req, res, next) {
    // Trả về response ngay lập tức để PayOS ngừng polling
    res.status(200).json({ 
      success: true, 
      message: "Webhook received",
      timestamp: new Date().toISOString()
    });

    // Xử lý webhook trong background
    setImmediate(async () => {
      try {
        // Log dữ liệu webhook để debug
        console.log("=== PayOS Webhook Processing ===");
        console.log("Headers:", req.headers);
        console.log("Body:", JSON.stringify(req.body, null, 2));
        console.log("==============================");

        const webhookData = req.body;
        if (!webhookData) {
          console.error("Empty webhook data");
          return;
        }

        console.log("Webhook Code:", webhookData.code);
        console.log("Webhook Success:", webhookData.success);
        console.log("Webhook Description:", webhookData.desc);
        
        // Xử lý trường hợp webhook không có data
        if (!webhookData.data) {
          console.log("Webhook without data - possibly cancelled transaction");
          if (webhookData.code !== "00" || webhookData.success === false) {
            console.log("Transaction was cancelled or failed:", {
              code: webhookData.code,
              success: webhookData.success,
              desc: webhookData.desc
            });
          }
          return;
        }

        const {
          bin, accountNumber, accountName, amount, description,
          orderCode, paymentLinkId, status, qrCode,
          transactionDateTime, counterAccountName, reference,
        } = webhookData.data;

        console.log(`Processing payment for order: ${orderCode}, status: ${status}, amount: ${amount}`);

        // Tìm đơn hàng theo orderCode
        const order = await Order.findOne({
          order_payment_id: orderCode.toString(),
        });

        if (!order) {
          console.error(`Order not found for orderCode: ${orderCode}`);
          return;
        }

        console.log(`Found order: ${order._id} with current status: ${order.status_id}`);

        // Xử lý các trạng thái thanh toán
        if (webhookData.code === "00" && webhookData.success === true && status === "PAID") {
          // Thanh toán thành công
          order.status_id = "paid";
          order.order_status = "processing";
          order.updated_at = new Date();

          order.payment_details = {
            bin: bin || "", accountNumber: accountNumber || "", accountName: accountName || "",
            amount: amount || 0, description: description || "", orderCode: orderCode || "",
            currency: webhookData.data.currency || "VND", paymentLinkId: paymentLinkId || "",
            status: status || "", transactionTime: transactionDateTime || new Date(),
            paymentReference: reference || "", payerName: counterAccountName || accountName || "",
            qrCode: qrCode || ""
          };

          console.log(`✅ Payment successful - Order ${order._id} status updated to 'paid'`);
          
        } else if (
          status === "CANCELLED" || status === "EXPIRED" ||
          webhookData.code !== "00" || webhookData.success === false
        ) {
          // Thanh toán bị hủy, hết hạn hoặc thất bại
          order.status_id = "payment_failed";
          order.order_status = "cancelled";
          order.updated_at = new Date();
          
          order.payment_details = {
            orderCode: orderCode || "", amount: amount || 0, description: description || "",
            status: status || "FAILED", transactionTime: transactionDateTime || new Date(),
            error_code: webhookData.code, error_message: webhookData.desc || `Payment ${status || 'failed'}`
          };
          
          console.log(`❌ Payment ${status || 'failed'} - Order ${order._id} status updated to 'payment_failed'`);
          
        } else {
          console.log(`ℹ️ Payment status: ${status} - No action taken for order ${order._id}`);
          return;
        }

        // Lưu thay đổi vào database
        await order.save();
        console.log(`💾 Order ${order._id} updated successfully in database`);
        
      } catch (error) {
        console.error("❌ PayOS webhook background processing error:", error);
      }
    });
  }

  // Thêm phương thức processWebhookAsync vào class PayOsController
  async processWebhookAsync(headers, body) {
    try {
      console.log("Processing webhook. Headers:", headers);
      console.log("Webhook body:", JSON.stringify(body));

      // Bỏ qua bước xác thực webhook trong môi trường phát triển
      // Trong môi trường production, bạn nên tìm cách xác thực webhook đúng cách
      // let webhookIsValid = true;

      // Xử lý dữ liệu webhook
      const { orderCode, status, amount } = body;
      const transactionCode = orderCode;

      // Tìm đơn hàng theo transaction code (được lưu trong order_payment_id)
      const order = await Order.findOne({
        order_payment_id: transactionCode.toString(),
      });

      if (!order) {
        console.error(
          `Order not found for transaction code: ${transactionCode}`
        );
        return;
      }

      console.log(
        `Found order ${order._id} with current status ${order.status_id}`
      );

      // Nếu thanh toán thành công, cập nhật thêm thông tin
      if (status === "PAID") {
        order.status_id = "processing"; // Chuyển đơn hàng sang trạng thái đang xử lý
        order.updated_at = new Date();
        console.log(`Updated order ${order._id} status to processing`);
      } else if (status === "CANCELLED" || status === "FAILED") {
        order.status_id = "cancelled";
        order.updated_at = new Date();
        console.log(`Updated order ${order._id} status to cancelled`);
      }

      await order.save();
      console.log("Order saved successfully");
    } catch (error) {
      console.error("Background webhook processing error:", error);
    }
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(req, res, next) {
    try {
      const { transactionCode } = req.params;
      console.log("Checking payment status for transaction:", transactionCode);

      // Đặt timeout ngắn hơn để tránh treo server
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 3000)
      );

      // Tìm đơn hàng theo transaction_code (được lưu trong order_payment_id)
      const orderPromise = Order.findOne({
        order_payment_id: transactionCode.toString(),
      });

      // Sử dụng Promise.race để tránh treo nếu DB quá lâu
      const order = await Promise.race([orderPromise, timeoutPromise]);

      if (!order) {
        console.log("Order not found for transaction code:", transactionCode);
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng với mã giao dịch này"
        });
      }

      console.log("Found order:", order._id, "Status:", order.status_id);

      // Xác định trạng thái thanh toán dựa trên database
      let paymentStatus = "PENDING";
      
      switch (order.status_id) {
        case "paid":
        case "processing":
          paymentStatus = "PAID";
          break;
        case "payment_failed":
        case "cancelled":
          paymentStatus = "CANCELLED";
          break;
        case "pending":
        default:
          paymentStatus = "PENDING";
          break;
      }

      console.log("Determined payment status:", paymentStatus);

      // Lấy số lượng items từ chi tiết đơn hàng với timeout
      let itemCount = 0;
      try {
        const orderDetailsPromise = OrderDetail.find({ order_id: order._id });
        const orderDetailsTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("OrderDetail timeout")), 2000)
        );
        
        const orderDetails = await Promise.race([orderDetailsPromise, orderDetailsTimeout]);
        itemCount = orderDetails ? orderDetails.length : 0;
      } catch (error) {
        console.warn("Failed to get order details, using default count:", error.message);
        itemCount = 0;
      }

      const response = {
        success: true,
        data: {
          order: {
            id: order._id,
            status: order.status_id,
            total: order.total_price || 0,
            items: itemCount,
          },
          payment: {
            status: paymentStatus,
            transactionCode: transactionCode,
            updated_at: order.updated_at,
            // Thêm thông tin lỗi nếu có
            ...(order.payment_details && order.payment_details.error_message && {
              error_message: order.payment_details.error_message
            })
          },
        },
      };

      return res.status(200).json(response);
      
    } catch (error) {
      console.error("Check payment status error:", error);
      
      // Đảm bảo luôn trả về response
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Lỗi hệ thống khi kiểm tra trạng thái thanh toán",
          error: error.message
        });
      }
    }
  }

  // Phương thức mới: Manually check và update trạng thái từ PayOS
  async manualCheckAndUpdate(req, res, next) {
    try {
      const { transactionCode } = req.params;
      
      console.log(`[Manual Check] Checking transaction: ${transactionCode}`);
      
      // Tìm đơn hàng trong database
      const order = await Order.findOne({
        order_payment_id: transactionCode.toString(),
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng với mã giao dịch này"
        });
      }

      console.log(`[Manual Check] Found order: ${order._id}, current status: ${order.status_id}`);

      try {
        // Gọi API PayOS để lấy thông tin thanh toán mới nhất
        const paymentInfo = await payOS.getPaymentLinkInformation(parseInt(transactionCode));
        
        console.log(`[Manual Check] PayOS response:`, JSON.stringify(paymentInfo, null, 2));

        // Cập nhật trạng thái dựa trên response từ PayOS
        if (paymentInfo.status === "PAID") {
          // Thanh toán thành công
          order.status_id = "paid";
          order.order_status = "processing";
          order.updated_at = new Date();

          order.payment_details = {
            orderCode: transactionCode,
            amount: paymentInfo.amount || order.total_price,
            status: paymentInfo.status,
            transactionTime: new Date(),
            paymentReference: paymentInfo.reference || "",
            paymentMethod: "payos",
            updatedManually: true
          };

          await order.save();
          
          console.log(`[Manual Check] ✅ Order ${order._id} updated to PAID status`);

          return res.status(200).json({
            success: true,
            message: "Đã cập nhật trạng thái thanh toán thành công",
            data: {
              order: {
                id: order._id,
                status: order.status_id,
                total: order.total_price
              },
              payment: {
                status: "PAID",
                transactionCode: transactionCode,
                amount: paymentInfo.amount
              }
            }
          });
          
        } else if (paymentInfo.status === "CANCELLED" || paymentInfo.status === "EXPIRED") {
          // Thanh toán bị hủy hoặc hết hạn
          order.status_id = "payment_failed";
          order.order_status = "cancelled";
          order.updated_at = new Date();
          
          order.payment_details = {
            orderCode: transactionCode,
            amount: paymentInfo.amount || order.total_price,
            status: paymentInfo.status,
            transactionTime: new Date(),
            error_message: `Payment ${paymentInfo.status}`,
            paymentMethod: "payos",
            updatedManually: true
          };

          await order.save();
          
          console.log(`[Manual Check] ❌ Order ${order._id} updated to ${paymentInfo.status} status`);

          return res.status(200).json({
            success: true,
            message: `Trạng thái thanh toán: ${paymentInfo.status}`,
            data: {
              order: {
                id: order._id,
                status: order.status_id,
                total: order.total_price
              },
              payment: {
                status: paymentInfo.status,
                transactionCode: transactionCode,
                amount: paymentInfo.amount
              }
            }
          });
          
        } else {
          // Trạng thái khác (PENDING, etc.)
          console.log(`[Manual Check] ℹ️ Payment status: ${paymentInfo.status} - No update needed`);
          
          return res.status(200).json({
            success: true,
            message: `Trạng thái hiện tại: ${paymentInfo.status}`,
            data: {
              order: {
                id: order._id,
                status: order.status_id,
                total: order.total_price
              },
              payment: {
                status: paymentInfo.status,
                transactionCode: transactionCode,
                amount: paymentInfo.amount
              }
            }
          });
        }

      } catch (payosError) {
        console.error(`[Manual Check] PayOS API Error:`, payosError);
        
        return res.status(500).json({
          success: false,
          message: "Không thể kết nối với PayOS để kiểm tra trạng thái",
          error: payosError.message
        });
      }

    } catch (error) {
      console.error("[Manual Check] Error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi kiểm tra trạng thái thanh toán",
        error: error.message
      });
    }
  }

  // Xử lý khi user hủy thanh toán từ PayOS
  async handleCancel(req, res, next) {
    try {
      const { orderCode, orderId } = req.query;
      console.log("PayOS Cancel received:", { orderCode, orderId });

      if (orderCode) {
        // Tìm đơn hàng theo orderCode
        const order = await Order.findOne({
          order_payment_id: orderCode.toString(),
        });

        if (order) {
          // Cập nhật trạng thái đơn hàng thành cancelled
          order.status_id = "payment_failed";
          order.order_status = "cancelled";
          order.updated_at = new Date();
          
          // Lưu thông tin hủy
          order.payment_details = {
            orderCode: orderCode,
            status: "CANCELLED",
            transactionTime: new Date(),
            error_message: "User cancelled payment"
          };

          await order.save();
          console.log(`Order ${order._id} marked as cancelled due to user action`);
        }
      }

      // Redirect về frontend với thông báo hủy
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/checkout?cancelled=true${orderId ? `&orderId=${orderId}` : ''}${orderCode ? `&orderCode=${orderCode}` : ''}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("PayOS cancel handler error:", error);
      
      // Vẫn redirect về frontend ngay cả khi có lỗi
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/checkout?cancelled=true&error=true`);
    }
  }
}

module.exports = new PayOsController();
