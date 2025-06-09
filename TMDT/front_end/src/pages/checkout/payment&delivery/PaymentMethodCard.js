import React from 'react';
import { Truck, CreditCard, Wallet } from 'lucide-react';

/**
 * PaymentMethodCard Component
 * 
 * Displays a single payment method option with selection capability.
 * 
 * @param {Object} method - The payment method object with id, name and icon
 * @param {boolean} isSelected - Whether this method is currently selected
 * @param {Function} onSelect - Function to call when this method is selected
 */
const PaymentMethodCard = ({ method, isSelected, onSelect }) => {
    // Hàm để lấy icon phù hợp dựa trên tên phương thức thanh toán
    const getPaymentIcon = (paymentName) => {
        const name = paymentName.toLowerCase();
        
        if (name.includes('momo')) {
            // Icon MoMo đặc biệt
            return (
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    MM
                </div>
            );
        } else if (name.includes('cod') || name.includes('tiền mặt') || name.includes('cash')) {
            return <Truck className="w-6 h-6 text-green-600" />;
        } else if (name.includes('payos') || name.includes('banking') || name.includes('ngân hàng')) {
            return <CreditCard className="w-6 h-6 text-blue-600" />;
        } else if (name.includes('wallet') || name.includes('ví điện tử')) {
            return <Wallet className="w-6 h-6 text-purple-600" />;
        } else {
            // Default icon
            return <CreditCard className="w-6 h-6 text-gray-600" />;
        }
    };

    return (
        <div
            className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={onSelect}
        >
            <input
                type="radio"
                checked={isSelected}
                onChange={onSelect}
                className="mr-4 text-purple-600 focus:ring-purple-500"
                readOnly
            />
            
            <div className="mr-4">
                {method.icon || getPaymentIcon(method.name)}
            </div>
            
            <div className="flex-1">
                <span className="font-medium text-gray-900">{method.name}</span>
                {method.name.toLowerCase().includes('momo') && (
                    <p className="text-sm text-gray-500 mt-1">
                        Thanh toán nhanh chóng với ví điện tử MoMo
                    </p>
                )}
                {method.name.toLowerCase().includes('cod') && (
                    <p className="text-sm text-gray-500 mt-1">
                        Thanh toán khi nhận hàng
                    </p>
                )}
                {method.name.toLowerCase().includes('payos') && (
                    <p className="text-sm text-gray-500 mt-1">
                        Thanh toán trực tuyến an toàn
                    </p>
                )}
            </div>
            
            {isSelected && (
                <div className="ml-2">
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodCard;