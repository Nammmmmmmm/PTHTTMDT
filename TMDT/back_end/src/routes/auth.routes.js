const express = require('express')
const bodyParser = require('body-parser')
const { authController } = require('../controller')
const VerifySignUp = require('../middlewares/verifySignUp')
const VerifyJwt = require('../middlewares/verifyJwt')

const AuthRouter = express.Router()
AuthRouter.use(bodyParser.json())

// Route đăng ký người dùng
AuthRouter.post("/signup", [VerifySignUp.checkExistUser, VerifySignUp.checkExistRoles], authController.signUp);

// Route đăng nhập người dùng
AuthRouter.post("/signin", authController.signIn);

// Route kiểm tra trạng thái đăng nhập (không bắt buộc token)
AuthRouter.get("/check", async (req, res) => {
  try {
    const tokenRequest = req.headers["x-access-token"];
    
    // Nếu không có token, trả về trạng thái chưa đăng nhập
    if (!tokenRequest) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        message: "Chưa đăng nhập"
      });
    }

    // Nếu có token, kiểm tra tính hợp lệ
    const jwt = require('jsonwebtoken');
    const config = require('../config/auth.config');
    const { user: User, role: Role } = require('../models');

    jwt.verify(tokenRequest, config.secret, async (err, decode) => {
      if (err) {
        // Token không hợp lệ hoặc hết hạn
        return res.status(200).json({
          success: true,
          authenticated: false,
          message: err instanceof jwt.TokenExpiredError ? "Token đã hết hạn" : "Token không hợp lệ"
        });
      }

      try {
        // Kiểm tra user và roles
        const existUser = await User.findById(decode.id).exec();
        if (!existUser) {
          return res.status(200).json({
            success: true,
            authenticated: false,
            message: "Người dùng không tồn tại"
          });
        }

        const roles = await Role.find({ _id: { $in: existUser.roles } });
        const userRoles = roles ? roles.map(role => role.name) : [];

        // Token hợp lệ, trả về thông tin user
        return res.status(200).json({
          success: true,
          authenticated: true,
          message: "Đã đăng nhập",
          user: {
            id: existUser._id,
            name: existUser.name,
            email: existUser.email,
            roles: userRoles
          }
        });

      } catch (error) {
        console.error("Error checking user:", error);
        return res.status(200).json({
          success: true,
          authenticated: false,
          message: "Lỗi kiểm tra thông tin người dùng"
        });
      }
    });

  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống"
    });
  }
});

// Route xác thực bằng Google
AuthRouter.get('/google', authController.googleAuth);

// Route callback sau khi xác thực Google
AuthRouter.get('/google/callback', authController.googleAuthCallback);

module.exports = AuthRouter; // Xuất AuthRouter để sử dụng ở nơi khác