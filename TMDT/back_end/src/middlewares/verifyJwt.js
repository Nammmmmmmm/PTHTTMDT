const createHttpError = require("http-errors");
const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role, shop: Shop } = db;
const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
    try {
        const tokenRequest = req.headers["x-access-token"];
        
        // Log để debug
        console.log(`[verifyToken] Request to ${req.method} ${req.originalUrl}`);
        console.log(`[verifyToken] Headers:`, {
            'x-access-token': tokenRequest ? `${tokenRequest.substring(0, 20)}...` : 'undefined',
            'authorization': req.headers.authorization ? `${req.headers.authorization.substring(0, 20)}...` : 'undefined'
        });
        
        if (!tokenRequest) {
            console.log('[verifyToken] No token provided in x-access-token header');
            throw createHttpError.BadRequest("No token provided");
        }

        // Verify Token
        jwt.verify(tokenRequest, config.secret, async (err, decode) => {
            if (err) {
                console.log('[verifyToken] Token verification failed:', err.message);
                const message = err instanceof jwt.TokenExpiredError ? "This JWT token expired" : err.message;
                throw createHttpError.Unauthorized(message);
            }
            
            console.log(`[verifyToken] Token verified successfully for user: ${decode.id}`);
            
            // Update request
            req.userId = decode.id;
            
            // Kiểm tra và thiết lập isAdmin cùng với thông tin roles
            try {
                const existUser = await User.findById(decode.id).exec();
                if (existUser) {
                    const roles = await Role.find({ _id: { $in: existUser.roles } });
                    if (roles) {
                        // Lưu thông tin roles vào request
                        req.userRoles = roles.map(role => role.name);
                        
                        if (roles.some(role => role.name === "ADMIN")) {
                            req.isAdmin = true;
                        } else {
                            req.isAdmin = false;
                        }
                    } else {
                        req.userRoles = [];
                        req.isAdmin = false;
                    }
                } else {
                    console.log(`[verifyToken] User not found in database: ${decode.id}`);
                    req.userRoles = [];
                    req.isAdmin = false;
                }
            } catch (error) {
                console.error("Error checking user roles:", error);
                req.userRoles = [];
                req.isAdmin = false;
            }
            
            next();
        });
    } catch (error) {
        console.log('[verifyToken] Middleware error:', error.message);
        next(error);
    }
}

async function isSeller(req, res, next) {
    try {
        const existUser = await User.findById(req.userId).exec();
        if (!existUser) {
            throw createHttpError.Forbidden("User not found");
        }
        
        const roles = await Role.find({ _id: { $in: existUser.roles } });
        if (!roles) {
            throw createHttpError.Forbidden("Forbidden access");
        }
        
        if (roles.some(role => role.name === "SELLER")) {
            // Find the seller's shop and attach its ID to the request
            try {
                const shop = await Shop.findOne({ user_id: req.userId });
                if (shop) {
                    req.shop_id = shop._id.toString();
                    console.log(`Seller middleware: Found shop ID ${req.shop_id} for user ${req.userId}`);
                } else {
                    console.log(`Seller middleware: No shop found for user ${req.userId}`);
                }
            } catch (shopError) {
                console.error("Error finding seller's shop:", shopError);
            }
            
            return next(); 
        }
        
        throw createHttpError.Unauthorized("Require Seller role!");
    } catch (error) {
        next(error);
    }
}

async function isAdmin(req, res, next) {
    try {
        const existUser = await User.findById(req.userId).exec();
        if (!existUser) {
            throw createHttpError.Forbidden("User not found");
        }
        const roles = await Role.find({ _id: { $in: existUser.roles } });
        if (!roles) {
            throw createHttpError.Forbidden("Forbidden access");
        }
        if (roles.some(role => role.name === "ADMIN")) {
            req.isAdmin = true;
            return next(); 
        }
        throw createHttpError.Unauthorized("Require Admin role!");
    } catch (error) {
        next(error);
    }
}

async function isAdminOrSeller(req, res, next) {
    try {
        const existUser = await User.findById(req.userId).exec();
        if (!existUser) {
            throw createHttpError.Forbidden("User not found");
        }
        const roles = await Role.find({ _id: { $in: existUser.roles } });
        if (!roles) {
            throw createHttpError.Forbidden("Forbidden access");
        }
        if (roles.some(role => role.name === "ADMIN")) {
            req.isAdmin = true;
            return next(); 
        }
        if (roles.some(role => role.name === "SELLER")) {
            req.isSeller = true;
            return next(); 
        }
        throw createHttpError.Unauthorized("Require Admin or Seller role!");
    } catch (error) {
        next(error);
    }
}

// Mới: Kiểm tra chủ sở hữu shop
async function isShopOwner(req, res, next) {
    try {
        const shopId = req.params.id;
        const userId = req.userId;

        const shop = await Shop.findById(shopId);
        
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Shop not found");
        }

        if (shop.user_id.toString() === userId.toString()) {
            return next();
        }

        // Kiểm tra xem người dùng có phải là admin không
        const existUser = await User.findById(userId).exec();
        const roles = await Role.find({ _id: { $in: existUser.roles } });
        
        if (roles.some(role => role.name === "ADMIN")) {
            req.isAdmin = true;
            return next();
        }

        throw createHttpError.Forbidden("You are not the owner of this shop");
    } catch (error) {
        next(error);
    }
}

// Debug middleware để log tất cả headers
function debugHeaders(req, res, next) {
    console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
    console.log('[DEBUG] All Headers:', JSON.stringify(req.headers, null, 2));
    next();
}

const VerifyJwt = {
    verifyToken,
    isSeller,
    isAdmin,
    isAdminOrSeller,
    isShopOwner,
    debugHeaders
};

module.exports = VerifyJwt;