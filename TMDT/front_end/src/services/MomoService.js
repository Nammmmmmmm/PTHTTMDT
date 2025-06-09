import ApiService from './ApiService';

class MomoService {
  // Tạo thanh toán MoMo
  static async createPayment(orderId) {
    try {
      const response = await ApiService.post('/momo/create-payment', { orderId }, true);
      return response;
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái thanh toán MoMo
  static async checkPaymentStatus(orderCode) {
    try {
      const response = await ApiService.get(`/momo/check-status/${orderCode}`, true);
      return response;
    } catch (error) {
      console.error('Error checking MoMo payment status:', error);
      throw error;
    }
  }

  // Xử lý chuyển hướng đến MoMo
  static redirectToMomo(paymentUrl) {
    if (typeof window !== 'undefined') {
      window.location.href = paymentUrl;
    }
  }

  // Kiểm tra xem có phải là mobile device không
  static isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Mở MoMo app (cho mobile)
  static openMomoApp(deeplink, paymentUrl = null) {
    if (this.isMobileDevice() && deeplink) {
      // Thử mở MoMo app trước
      window.location.href = deeplink;
      
      // Nếu không mở được app sau 2 giây, chuyển đến web (nếu có paymentUrl)
      if (paymentUrl) {
        setTimeout(() => {
          if (document.hidden || document.webkitHidden) {
            // App đã mở thành công
            return;
          }
          // Không mở được app, chuyển đến web version
          this.redirectToMomo(paymentUrl);
        }, 2000);
      }
    }
  }

  // Format số tiền VND
  static formatAmount(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Kiểm tra tính hợp lệ của số tiền MoMo
  static isValidAmount(amount) {
    // MoMo yêu cầu số tiền tối thiểu là 1,000 VND và tối đa là 50,000,000 VND
    return amount >= 1000 && amount <= 50000000;
  }

  // Tạo QR code URL cho thanh toán
  static generateQRCode(qrCodeUrl, size = 256) {
    if (!qrCodeUrl) return null;
    
    // Nếu QR code URL đã được MoMo cung cấp, sử dụng trực tiếp
    return qrCodeUrl;
  }

  // Xử lý lỗi MoMo
  static handleMomoError(error) {
    const errorMessages = {
      1000: 'Giao dịch thành công',
      1001: 'Giao dịch thất bại',
      1002: 'Giao dịch đang được xử lý',
      1003: 'Giao dịch bị từ chối',
      1004: 'Giao dịch bị hủy',
      1005: 'Địa chỉ IP không hợp lệ',
      1006: 'Request ID không hợp lệ',
      1007: 'Chữ ký không hợp lệ',
      1008: 'Số tiền không hợp lệ',
      1009: 'Đơn hàng không tồn tại',
      1010: 'Đơn hàng đã được thanh toán',
      // Thêm các mã lỗi khác nếu cần
    };

    const errorCode = error.resultCode || error.code;
    const defaultMessage = 'Có lỗi xảy ra trong quá trình thanh toán';
    
    return errorMessages[errorCode] || error.message || defaultMessage;
  }

  // Lưu thông tin thanh toán vào localStorage (để xử lý callback)
  static savePaymentInfo(orderId, orderCode) {
    try {
      localStorage.setItem('currentOrderId', orderId);
      localStorage.setItem('momoOrderCode', orderCode);
      localStorage.setItem('paymentMethod', 'momo');
      localStorage.setItem('paymentStartTime', Date.now().toString());
    } catch (error) {
      console.warn('Could not save payment info to localStorage:', error);
    }
  }

  // Lấy thông tin thanh toán từ localStorage
  static getPaymentInfo() {
    try {
      return {
        orderId: localStorage.getItem('currentOrderId'),
        orderCode: localStorage.getItem('momoOrderCode'),
        paymentMethod: localStorage.getItem('paymentMethod'),
        startTime: localStorage.getItem('paymentStartTime')
      };
    } catch (error) {
      console.warn('Could not get payment info from localStorage:', error);
      return null;
    }
  }

  // Xóa thông tin thanh toán từ localStorage
  static clearPaymentInfo() {
    try {
      localStorage.removeItem('currentOrderId');
      localStorage.removeItem('momoOrderCode');
      localStorage.removeItem('paymentMethod');
      localStorage.removeItem('paymentStartTime');
    } catch (error) {
      console.warn('Could not clear payment info from localStorage:', error);
    }
  }

  // Tính thời gian timeout cho thanh toán (MoMo thường có thời hạn 15 phút)
  static getPaymentTimeout() {
    const paymentInfo = this.getPaymentInfo();
    if (!paymentInfo || !paymentInfo.startTime) return false;
    
    const startTime = parseInt(paymentInfo.startTime);
    const currentTime = Date.now();
    const timeoutDuration = 15 * 60 * 1000; // 15 phút
    
    return (currentTime - startTime) > timeoutDuration;
  }
}

export default MomoService; 