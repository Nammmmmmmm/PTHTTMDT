import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    Search,
    User,
    Heart,
    ShoppingCart,
    Globe,
    PiggyBank,
    ChevronRight,
    LogOut,
    MessageSquare,
    Package,
    MapPin,
    Lock,
    UserCircle,
    Store
} from 'lucide-react';
import CartModal from '../pages/cart/CartModal';
import logo from '../assets/logo2hand.png';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';
// Import MessageEventBus từ Message.js
import { MessageEventBus } from '../pages/UserProfile/components/Message';
import { CartEventBus } from '../pages/cart/CartEventBus';
import ProductCategoriesSidebar from './ProductCategoriesSidebar';





// CSS Animation for the flashing promotion text
const flashingAnimation = `
@keyframes flash {
  0%, 100% { 
    color: #ff3333; 
    transform: scale(1);
  }
  25% { 
    color: #ff0000; 
    transform: scale(1.05);
  }
  50% { 
    color: #ffcc00; 
    transform: scale(1);
  }
  75% { 
    color: #ff3333; 
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes trainEffect {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  10% {
    transform: translateX(-70%);
    opacity: 1;
  }
  25% {
    transform: translateX(0%);
    opacity: 1;
  }
  /* Pause in the middle to give time for reading */
  45% {
    transform: translateX(0%);
    opacity: 1;
  }
  /* Then continue movement */
  65% {
    transform: translateX(70%);
    opacity: 1;
  }
  75% {
    transform: translateX(70%);
    opacity: 0;
  }
  90% {
    transform: translateX(-100%);
    opacity: 0;
  }
    100% { 
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Container to properly contain the animation */
.promotion-container {
  position: relative;
  overflow: hidden;
  width: 340px;
  margin-left: auto;
}

.flashing-text {
  animation: flash 2s infinite, bounce 1.5s infinite, trainEffect 10s linear infinite;
  font-weight: bold;
  background-size: 200% 200%;
  color: white;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: visible;
  position: relative;
  min-width: 340px; /* Ensure enough width for all text */
}

.flashing-text:hover {
  background-position: right center;
  transform: scale(1.05);
  animation-play-state: paused;
}

.piggy-bank-icon {
  animation: bounce 1.5s infinite;
  display: inline-block; /* Ensure icon is always visible */
}
`;

const Header = () => {
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [language, setLanguage] = useState('Vietnamese');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCategoriesSidebarOpen, setIsCategoriesSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    // State cho số lượng tin nhắn chưa đọc
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    // Use AuthService directly instead of AuthContext
    const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isLoggedIn());
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

    const categoriesButtonRef = useRef(null);
    const userDropdownRef = useRef(null);
    const userButtonRef = useRef(null);

    // Lắng nghe sự kiện thay đổi số lượng tin nhắn chưa đọc
    useEffect(() => {
        // Đăng ký lắng nghe sự kiện thay đổi số lượng tin nhắn chưa đọc
        const unsubscribe = MessageEventBus.subscribe('unreadCountChanged', (count) => {
            setUnreadMessageCount(count);
        });

        // Cleanup khi component unmount
        return () => {
            unsubscribe();
        };
    }, []);

    // Always check both id and _id for compatibility
    const userId = currentUser?.id || currentUser?._id || "";

    useEffect(() => {
        if (isLoggedIn) {
            fetchCartTotal();
        } else {
            setCartTotal(0);
        }
    }, [isLoggedIn, userId]);

    // Update cart total when cart modal opens or closes
    useEffect(() => {
        if (isLoggedIn && isCartOpen) {
            fetchCartTotal();
        }
    }, [isCartOpen]);

    useEffect(() => {
        // Đăng ký lắng nghe sự kiện khi giỏ hàng cập nhật
        const unsubscribe = CartEventBus.subscribe('cartUpdated', () => {
            console.log('Cart updated, refreshing total...');
            fetchCartTotal();
        });

        // Cleanup khi component unmount
        return () => {
            unsubscribe();
        };
    }, []);

    // Lắng nghe sự kiện localStorage thay đổi
    useEffect(() => {
        // Hàm này sẽ được gọi khi sự kiện storage được kích hoạt
        const handleStorageChange = () => {
            // Lấy thông tin user mới từ localStorage
            const user = AuthService.getCurrentUser();
            // Kiểm tra đăng nhập
            const loggedIn = AuthService.isLoggedIn();

            // Cập nhật state
            setIsLoggedIn(loggedIn);
            setCurrentUser(user);

            console.log('Header detected auth change:', { loggedIn, userRoles: user?.roles });
        };

        // Đăng ký lắng nghe sự kiện storage
        window.addEventListener('storage', handleStorageChange);

        // Cập nhật trạng thái ban đầu
        handleStorageChange();

        // Cleanup khi component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const checkIfUserIsSeller = () => {
        if (!isLoggedIn || !currentUser || !currentUser.roles) {
            return false;
        }

        return currentUser.roles.some(role => {
            // Check different role formats
            if (typeof role === 'object' && role !== null) {
                return role.name === "SELLER" || role.name === "ROLE_SELLER";
            }

            if (typeof role === 'string') {
                return role === "SELLER" || role === "ROLE_SELLER";
            }

            return false;
        });
    };

    const userIsSeller = checkIfUserIsSeller();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price).replace('₫', 'đ');
    };

    const fetchCartTotal = async () => {
        if (!userId) {
            setCartTotal(0);
            return;
        }

        try {
            const response = await ApiService.get(`/cart/user/${userId}`);
            if (response && response.items && response.items.length > 0) {
                // First ensure we have complete variant data
                const itemsWithCompleteVariants = await ensureCompleteVariantInfo(response.items);

                // Calculate total with proper variant pricing
                const total = itemsWithCompleteVariants.reduce((sum, item) => {
                    // First check for variant price
                    if (item.variant_id && typeof item.variant_id === 'object' && item.variant_id.price) {
                        return sum + (item.variant_id.price * item.quantity);
                    }

                    // Fall back to product price
                    const price = item.product_id && typeof item.product_id === 'object'
                        ? (item.product_id.discounted_price || item.product_id.price || 0)
                        : 0;
                    return sum + price * item.quantity;
                }, 0);

                setCartTotal(total);
            } else {
                setCartTotal(0);
            }
        } catch (error) {
            console.error('Error fetching cart total:', error);
            setCartTotal(0);
        }
    };

    const ensureCompleteVariantInfo = async (items) => {
        const updatedItems = [...items];

        for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];

            // If item has a variant_id but it's not a complete object
            if (item.variant_id && (typeof item.variant_id === 'string' || !item.variant_id.attributes)) {
                const productId = typeof item.product_id === 'object'
                    ? item.product_id._id
                    : item.product_id;

                const variantId = typeof item.variant_id === 'string'
                    ? item.variant_id
                    : item.variant_id._id;

                if (productId && variantId) {
                    try {
                        // Get full variant data
                        const variants = await ApiService.get(`/product-variant/product/${productId}`, false);
                        const fullVariant = variants.find(v => v._id === variantId);

                        if (fullVariant) {
                            updatedItems[i] = {
                                ...item,
                                variant_id: fullVariant
                            };
                        }
                    } catch (error) {
                        console.error(`Failed to fetch complete variant data for product ${productId}:`, error);
                    }
                }
            }
        }

        return updatedItems;
    };

    // Kiểm tra xem người dùng có role SELLER không - cải tiến phương pháp phát hiện role
    const isSeller = currentUser?.roles?.some(role => {
        // Kiểm tra nhiều dạng role có thể có
        if (typeof role === 'object' && role !== null) {
            return role.name === "SELLER" || role.name === "ROLE_SELLER";
        }

        if (typeof role === 'string') {
            return role === "SELLER" || role === "ROLE_SELLER";
        }

        return false;
    });

    const toggleCategoriesSidebar = () => {
        setIsCategoriesSidebarOpen(!isCategoriesSidebarOpen);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to categories page with search query
            navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Xử lý đăng xuất - sử dụng AuthService trực tiếp
    const handleLogout = () => {
        AuthService.logout();
        setIsUserDropdownOpen(false);
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/');
        window.location.reload();
    };

    // Xử lý click bên ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target) &&
                userButtonRef.current &&
                !userButtonRef.current.contains(event.target)
            ) {
                setIsUserDropdownOpen(false);
            }
        };

        if (isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserDropdownOpen]);

    return (
        <div className="bg-white shadow-sm relative">
            {/* Add the animation CSS */}
            <style>{flashingAnimation}</style>

            {/* Top Notification Bar */}
            <div className='border-b'>
                <div className="mx-auto max-w-7xl py-2 flex items-center justify-between flex ">
                    <div className="text-center py-4 text-sm px-4">
                        Đăng ký bán hàng cùng TMDT để có những ưu đãi hấp dẫn
                    </div>
                    {/* Language and Tracking */}
                    <div className="flex gap-3 items-center space-x-4 text-sm text-gray-600">
                        {/* <a href="#" className="hover:text-purple-600">Vị trí cửa hàng</a> */}
                        <a href="/user-profile/orders" className="hover:text-purple-600">Theo dõi đơn hàng</a>
                        {/* <a href="#" className="hover:text-purple-600">FAQs</a> */}
                        <div className="flex items-center space-x-2">
                            <Globe size={16} />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent outline-none"
                            >
                                <option value="Vietnamese">Vietnamese</option>
                                <option value="English">English</option>
                            </select>
                        </div>
                        {/* Currency */}
                        <div className="text-sm text-gray-600">
                            Việt Nam (VNĐ)
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo and Search Section */}
            <div className='border-b py-6'>
                <div href='/' className="mx-auto max-w-7xl px-4  flex items-center space-x-6">
                    {/* Logo */}
                    <a href='/' className="flex items-center">
                        <img
                            src={logo}
                            alt="TROOC Logo"
                            className="w-16 h-16"
                        />
                    </a>

                    {/* Category and Search */}
                    <div className="flex-grow flex items-center space-x-4">
                        {/* Search Input - Now takes full width */}
                        <form onSubmit={handleSearch} className="flex-grow relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm, thương hiệu, cửa hàng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 bottom-0 px-4 bg-purple-600 text-white rounded-r-md hover:bg-purple-700"
                            >
                                <Search size={20} />
                            </button>
                        </form>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-12">
                        {/* User Account Section - Conditional Rendering */}
                        <div className="relative">
                            {isLoggedIn ? (
                                // Nếu đã đăng nhập, hiển thị nút dropdown tài khoản
                                <button
                                    ref={userButtonRef}
                                    className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs relative"
                                    onClick={toggleUserDropdown}
                                >
                                    <User size={24} />
                                    <span>Tài khoản</span>
                                    {/* Hiển thị badge khi có tin nhắn chưa đọc */}
                                    {unreadMessageCount > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                        </div>
                                    )}
                                </button>
                            ) : (
                                // Nếu chưa đăng nhập, hiển thị nút chuyển đến trang login
                                <button
                                    className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs"
                                    onClick={() => navigate('/login')}
                                >
                                    <User size={24} />
                                    <span>Login</span>
                                </button>
                            )}

                            {/* User Dropdown Menu for Logged In Users */}
                            {isLoggedIn && isUserDropdownOpen && (
                                <div
                                    ref={userDropdownRef}
                                    className="absolute z-50 right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border"
                                >
                                    <div className="px-4 py-2 border-b">
                                        <div className="font-medium text-gray-900">
                                            {currentUser?.email}
                                        </div>
                                    </div>

                                    <a
                                        href="/user-profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <UserCircle size={16} className="mr-2" />
                                        Tài khoản của tôi
                                    </a>

                                    <a
                                        href="/user-profile/orders"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Package size={16} className="mr-2" />
                                        Đơn mua
                                    </a>

                                    <a
                                        href="/user-profile/messages"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center relative"
                                    >
                                        <MessageSquare size={16} className="mr-2" />
                                        Tin nhắn
                                        {/* Hiển thị badge trong dropdown khi có tin nhắn chưa đọc */}
                                        {unreadMessageCount > 0 && (
                                            <div className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                            </div>
                                        )}
                                    </a>

                                    <a
                                        href="/user-profile/addresses"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <MapPin size={16} className="mr-2" />
                                        Địa chỉ nhận hàng
                                    </a>

                                    <a
                                        href="/user-profile/followed-shops"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Store size={16} className="mr-2" />
                                        Cửa hàng đã theo dõi
                                    </a>

                                    <a
                                        href="/user-profile/password"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Lock size={16} className="mr-2" />
                                        Đổi mật khẩu
                                    </a>

                                    {/* Hiển thị nút truy cập vào SellerDashboard nếu người dùng có role SELLER */}
                                    {isSeller && (
                                        <a
                                            href="/seller-dashboard"
                                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center"
                                        >
                                            <Store size={16} className="mr-2" />
                                            Quản lý cửa hàng
                                        </a>
                                    )}

                                    <div className="border-t mt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs">
                            <Heart size={24} />
                        </button>

                        <div className='flex gap-2'>
                            <button id='cartbutton' className='cartbutton' onClick={() => setIsCartOpen(true)}>
                                <ShoppingCart size={24} />
                            </button>
                            <div className='flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs'>
                                <p>Giỏ hàng</p>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                        </div>

                        <CartModal
                            isOpen={isCartOpen}
                            onClose={() => setIsCartOpen(false)}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="">
                <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between space-x-6 text-sm">
                    <button
                        ref={categoriesButtonRef}
                        className="flex items-center space-x-2 font-semibold"
                        onClick={toggleCategoriesSidebar}
                    >
                        <Menu size={20} />
                        <span>Danh mục sản phẩm</span>
                    </button>

                    <a href="/" className="hover:text-purple-600">Trang chủ</a>
                    <a href="categories" className="hover:text-purple-600">Sản phẩm</a>
                    {/* <a href="#" className="hover:text-purple-600">Bài viết</a>
                    <a href="#" className="hover:text-purple-600">Hỗ trợ</a> */}

                    {/* Hide "Đăng ký bán hàng" link if user is already a seller */}
                    {!userIsSeller && (
                        <a href="shop-registration" className="text-red-500 font-semibold">Đăng ký bán hàng</a>
                    )}

                    {/* Updated flashing promotion text */}
                    <div className="promotion-container">
                        <div className="flashing-text cursor-pointer"
                            onClick={() => navigate('/categories')}>
                            <PiggyBank size={24} className="piggy-bank-icon" />
                            <span>Khuyến mại 20% cho đơn hàng đầu tiên</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Product Categories Sidebar */}
            <ProductCategoriesSidebar
                isOpen={isCategoriesSidebarOpen}
                onClose={() => setIsCategoriesSidebarOpen(false)}
                buttonRef={categoriesButtonRef}
            />
        </div>
    );
};

export default Header;