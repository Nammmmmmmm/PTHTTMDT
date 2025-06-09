import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Home, ShoppingCart, RefreshCw } from 'lucide-react';

const PaymentError = () => {
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Lấy thông tin lỗi từ URL parameters
        const errorMessage = searchParams.get('message');
        const orderIdParam = searchParams.get('orderId');

        setMessage(errorMessage || 'Có lỗi xảy ra trong quá trình thanh toán');
        setOrderId(orderIdParam);
    }, [searchParams]);

    const handleRetryPayment = () => {
        if (orderId) {
            navigate(`/checkout?orderId=${orderId}`);
        } else {
            navigate('/cart');
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/user-profile/orders');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    {/* Error Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Thanh toán thất bại
                    </h2>
                    
                    <p className="text-lg mb-6 text-red-600">
                        {message}
                    </p>
                    
                    {orderId && (
                        <p className="text-sm text-gray-500 mb-6">
                            Mã đơn hàng: {orderId}
                        </p>
                    )}
                    
                    <div className="space-y-4">
                        {/* Retry Payment Button */}
                        <button
                            onClick={handleRetryPayment}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Thử lại thanh toán
                        </button>
                        
                        {/* View Orders Button */}
                        <button
                            onClick={handleViewOrders}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Xem đơn hàng của tôi
                        </button>
                        
                        {/* Go to Home Button */}
                        <button
                            onClick={handleGoHome}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Về trang chủ
                        </button>
                    </div>
                    
                    {/* Help Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Cần hỗ trợ?
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                            Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ bộ phận hỗ trợ khách hàng
                        </p>
                        <div className="text-xs text-gray-400">
                            <p>Email: support@yourstore.com</p>
                            <p>Hotline: 1900 xxxx xxx</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentError; 