import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const generate2FASecretHandler = (config) => {
  return async (req, res) => {
    try {
      const user = req.user;
      const secret = speakeasy.generateSecret({
        name: `${config.rpName}:${user.email}`,
      });

      const User = config.userModel;
      await User.findByIdAndUpdate(user._id, {
        twoFactorSecret: secret.base32,
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return res.status(200).json({
        success: true,
        data: { qrCode, secret: secret.base32 },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};

export const verifyAndEnable2FAHandler = (config) => {
  return async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is required" });
      }

      const User = config.userModel;
      const user = await User.findById(req.user._id).select("+twoFactorSecret");

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token.toString(),
        window: 6,
      });

      if (!verified) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid 2FA code" });
      }

      user.twoFactorEnabled = true;
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "2FA enabled successfully" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};

export const verify2FALoginHandler = (config) => {
  return async (req, res) => {
    try {
      const { userId, token } = req.body;
      if (!userId || !token) {
        return res
          .status(400)
          .json({ success: false, message: "userId and token are required" });
      }

      const User = config.userModel;
      const user = await User.findById(userId).select("+twoFactorSecret");

      if (!user || !user.twoFactorEnabled) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request" });
      }

      const ok = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token.toString(),
        window: 6,
      });

      if (!ok) {
        return res
          .status(400)
          .json({ success: false, message: "Wrong 2FA code" });
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      const Session = config.sessionModel;
      await Session.create({
        user: user._id,
        email: user.email,
        refreshToken: refreshToken,
        IP: req.ip,
        userAgent: req.headers["user-agent"],
        lastUsed: Date.now(),
      });

      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
          success: true,
          message: "2FA login successful",
          data: { accessToken, refreshToken },
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
