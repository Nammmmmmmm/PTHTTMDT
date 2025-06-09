import React, { useState } from 'react';
import MomoService from '../../../services/MomoService';

const MoMoPaymentDemo = () => {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleCreatePayment = async () => {
        if (!orderId.trim()) {
            alert('Vui lòng nhập Order ID');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await MomoService.createPayment(orderId);
            setResult(response);
            
            if (response && response.success && response.data) {
                console.log('MoMo Payment Response:', response.data);
                
                // Save payment info
                MomoService.savePaymentInfo(orderId, response.data.orderCode);
                
                // Redirect to MoMo (cho demo, sẽ hỏi trước)
                const shouldRedirect = window.confirm('Chuyển hướng đến MoMo payment?');
                if (shouldRedirect) {
                    if (MomoService.isMobileDevice() && response.data.deeplink) {
                        MomoService.openMomoApp(response.data.deeplink, response.data.paymentUrl);
                    } else {
                        MomoService.redirectToMomo(response.data.paymentUrl);
                    }
                }
            }
        } catch (error) {
            console.error('MoMo Error:', error);
            const errorMessage = MomoService.handleMomoError(error);
            setResult({ 
                success: false, 
                error: errorMessage 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!orderId.trim()) {
            alert('Vui lòng nhập Order ID');
            return;
        }

        setLoading(true);
        try {
            const statusResponse = await MomoService.checkPaymentStatus(orderId);
            setResult(statusResponse);
        } catch (error) {
            console.error('Check Status Error:', error);
            setResult({ 
                success: false, 
                error: 'Không thể kiểm tra trạng thái thanh toán' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = () => {
        MomoService.clearPaymentInfo();
        localStorage.removeItem('allOrderIds');
        alert('Đã xóa dữ liệu payment!');
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                🧪 MoMo Payment Demo
            </h2>

            {/* MoMo Branding */}
            <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                    MM
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">MoMo Payment Gateway</h3>
                    <p className="text-sm text-gray-600">Thanh toán nhanh chóng với ví điện tử MoMo</p>
                </div>
            </div>

            {/* Input Section */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID để test:
                </label>
                <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Nhập Order ID (vd: 6734a8b2f1234567890abcdef)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={handleCreatePayment}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-md hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 font-medium"
                >
                    {loading ? '⏳ Đang xử lý...' : '💳 Tạo MoMo Payment'}
                </button>
                
                <button
                    onClick={handleCheckStatus}
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 font-medium"
                >
                    📊 Kiểm tra trạng thái
                </button>
                
                <button
                    onClick={handleClearData}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 font-medium"
                >
                    🗑️ Xóa dữ liệu
                </button>
            </div>

            {/* Device Info */}
            <div className="mb-6 p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Device Info:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>📱 Mobile Device: {MomoService.isMobileDevice() ? 'Yes' : 'No'}</li>
                    <li>🌐 User Agent: {navigator.userAgent.slice(0, 50)}...</li>
                    <li>⏰ Current Payment Info: {JSON.stringify(MomoService.getPaymentInfo())}</li>
                </ul>
            </div>

            {/* Result Display */}
            {result && (
                <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
                    <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.success ? '✅ Thành công!' : '❌ Có lỗi!'}
                    </h4>
                    <pre className="mt-2 text-sm text-gray-600 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">📋 Hướng dẫn test:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Nhập một Order ID có sẵn trong database</li>
                    <li>Click "Tạo MoMo Payment" để tạo link thanh toán</li>
                    <li>System sẽ tạo MoMo payment URL và có thể redirect</li>
                    <li>Sau khi thanh toán, kiểm tra trạng thái với "Kiểm tra trạng thái"</li>
                    <li>Test trên mobile để thấy deeplink MoMo app</li>
                </ol>
            </div>
        </div>
    );
};

export default MoMoPaymentDemo; 