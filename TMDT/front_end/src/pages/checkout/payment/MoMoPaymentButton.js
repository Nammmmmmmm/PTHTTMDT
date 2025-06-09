import React, { useState } from 'react';
import MomoService from '../../../services/MomoService';

const MoMoPaymentButton = ({ 
    orderId, 
    amount, 
    onSuccess, 
    onError, 
    disabled = false,
    className = "",
    size = "medium" 
}) => {
    const [loading, setLoading] = useState(false);

    const handleMoMoPayment = async () => {
        if (!orderId) {
            onError && onError('Order ID is required');
            return;
        }

        setLoading(true);
        try {
            const response = await MomoService.createPayment(orderId);
            
            if (response && response.success && response.data) {
                // Save payment info
                MomoService.savePaymentInfo(orderId, response.data.orderCode);
                
                // Call success callback
                onSuccess && onSuccess(response.data);
                
                // Redirect to MoMo
                if (MomoService.isMobileDevice() && response.data.deeplink) {
                    MomoService.openMomoApp(response.data.deeplink, response.data.paymentUrl);
                } else {
                    MomoService.redirectToMomo(response.data.paymentUrl);
                }
            } else {
                throw new Error('Không nhận được URL thanh toán từ MoMo');
            }
        } catch (error) {
            console.error('MoMo Payment Error:', error);
            const errorMessage = MomoService.handleMomoError(error);
            onError && onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Size variations
    const sizeClasses = {
        small: "px-4 py-2 text-sm",
        medium: "px-6 py-3 text-base", 
        large: "px-8 py-4 text-lg"
    };

    return (
        <button
            onClick={handleMoMoPayment}
            disabled={disabled || loading}
            className={`
                flex items-center justify-center
                bg-gradient-to-r from-pink-500 to-purple-600
                hover:from-pink-600 hover:to-purple-700
                text-white font-semibold rounded-lg
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg hover:shadow-xl
                transform hover:scale-105
                ${sizeClasses[size]}
                ${className}
            `}
        >
            {/* MoMo Icon */}
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-md flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xs">MM</span>
            </div>

            {/* Button Content */}
            {loading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                </>
            ) : (
                <>
                    Thanh toán với MoMo
                    {amount && (
                        <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                            {MomoService.formatAmount(amount)}
                        </span>
                    )}
                </>
            )}
        </button>
    );
};

// Standalone MoMo Payment Card Component
export const MoMoPaymentCard = ({ 
    orderId, 
    amount, 
    orderInfo = "Thanh toán đơn hàng",
    onSuccess, 
    onError 
}) => {
    return (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                    MM
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">MoMo Payment</h3>
                    <p className="text-gray-600 text-sm">Ví điện tử #1 Việt Nam</p>
                </div>
            </div>

            {/* Order Info */}
            <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{orderInfo}</p>
                {amount && (
                    <p className="text-lg font-bold text-gray-800">
                        {MomoService.formatAmount(amount)}
                    </p>
                )}
            </div>

            {/* Features */}
            <div className="mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Thanh toán nhanh chóng & an toàn
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Hỗ trợ QR Code & App MoMo
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Tích lũy điểm thưởng
                </div>
            </div>

            {/* Payment Button */}
            <MoMoPaymentButton
                orderId={orderId}
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
                size="large"
                className="w-full"
            />

            {/* Mobile Notice */}
            {MomoService.isMobileDevice() && (
                <p className="text-xs text-gray-500 text-center mt-3">
                    📱 Sẽ tự động mở ứng dụng MoMo nếu đã cài đặt
                </p>
            )}
        </div>
    );
};

export default MoMoPaymentButton; 