import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import MomoService from '../../../services/MomoService';

const MomoCallback = () => {
    const [status, setStatus] = useState('checking');
    const [message, setMessage] = useState('Đang kiểm tra thông tin thanh toán MoMo...');
    const [orderId, setOrderId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                // Lấy thông tin từ URL parameters
                const resultCode = searchParams.get('resultCode');
                const orderCode = searchParams.get('orderId');
                const transId = searchParams.get('transId');
                const amount = searchParams.get('amount');
                const momoMessage = searchParams.get('message');
                const extraData = searchParams.get('extraData');

                console.log('MoMo callback params:', {
                    resultCode,
                    orderCode,
                    transId,
                    amount,
                    momoMessage,
                    extraData
                });

                // Lấy thông tin từ localStorage nếu có
                const savedPaymentInfo = MomoService.getPaymentInfo();
                let realOrderId = null;

                // Thử parse extraData để lấy orderId thực
                try {
                    if (extraData) {
                        const parsedExtraData = JSON.parse(decodeURIComponent(extraData));
                        realOrderId = parsedExtraData.orderId;
                    }
                } catch (e) {
                    console.warn('Could not parse extraData:', e);
                }

                // Fallback đến saved info nếu không có trong extraData
                if (!realOrderId && savedPaymentInfo) {
                    realOrderId = savedPaymentInfo.orderId;
                }

                setOrderId(realOrderId);

                // Kiểm tra kết quả thanh toán
                if (resultCode === '0') {
                    // Thanh toán thành công
                    setStatus('success');
                    setMessage('Thanh toán MoMo thành công!');
                    
                    // Kiểm tra trạng thái từ server để đảm bảo
                    if (orderCode) {
                        try {
                            const statusResponse = await MomoService.checkPaymentStatus(orderCode);
                            console.log('Payment status from server:', statusResponse);
                        } catch (error) {
                            console.warn('Could not verify payment status from server:', error);
                        }
                    }

                    // Xóa thông tin thanh toán từ localStorage
                    MomoService.clearPaymentInfo();
                    
                    // Chuyển hướng sau 2 giây
                    setTimeout(() => {
                        if (realOrderId) {
                            navigate(`/order-confirmation?orderId=${realOrderId}&status=success`);
                        } else {
                            navigate('/user-profile/orders?status=success');
                        }
                    }, 2000);

                } else {
                    // Thanh toán thất bại
                    setStatus('failed');
                    const errorMessage = MomoService.handleMomoError({ 
                        resultCode: parseInt(resultCode), 
                        message: momoMessage 
                    });
                    setMessage(`Thanh toán thất bại: ${errorMessage}`);
                    
                    // Xóa thông tin thanh toán từ localStorage
                    MomoService.clearPaymentInfo();
                    
                    // Chuyển hướng sau 3 giây
                    setTimeout(() => {
                        if (realOrderId) {
                            navigate(`/checkout?orderId=${realOrderId}&error=${encodeURIComponent(errorMessage)}`);
                        } else {
                            navigate('/user-profile/orders?error=' + encodeURIComponent(errorMessage));
                        }
                    }, 3000);
                }

            } catch (error) {
                console.error('Error processing MoMo callback:', error);
                setStatus('error');
                setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng liên hệ bộ phận hỗ trợ.');
                
                // Xóa thông tin thanh toán từ localStorage
                MomoService.clearPaymentInfo();
                
                setTimeout(() => {
                    navigate('/user-profile/orders');
                }, 3000);
            }
        };

        processPaymentResult();
    }, [searchParams, navigate]);

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                );
            case 'failed':
                return (
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                );
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            case 'error':
                return 'text-orange-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    {getStatusIcon()}
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Kết quả thanh toán MoMo
                    </h2>
                    
                    <p className={`text-lg mb-6 ${getStatusColor()}`}>
                        {message}
                    </p>
                    
                    {orderId && (
                        <p className="text-sm text-gray-500 mb-4">
                            Mã đơn hàng: {orderId}
                        </p>
                    )}
                    
                    {status === 'checking' && (
                        <div className="text-sm text-gray-500">
                            Vui lòng đợi trong giây lát...
                        </div>
                    )}
                    
                    {status !== 'checking' && (
                        <div className="text-sm text-gray-500">
                            Bạn sẽ được chuyển hướng tự động trong giây lát...
                        </div>
                    )}
                    
                    {(status === 'failed' || status === 'error') && (
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    if (orderId) {
                                        navigate(`/checkout?orderId=${orderId}`);
                                    } else {
                                        navigate('/user-profile/orders');
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                            >
                                Thử lại thanh toán
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MomoCallback; 