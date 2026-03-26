import bcrypt from "bcryptjs";
import generateDeviceFingerprint from "../utils/deviceFingerPrint.js";

export const siginHandler = (config) => {
  return async (req, res) => {
    try {
      const { username, password, email } = req.body;

      const trimUsername = username.trim();
      const trimPassword = password.trim();
      const trimEmail = email.trim();

      const indentifire = trimEmail || trimUsername;

      if (!indentifire || !trimPassword) {
        return res.status(400).json({
          success: false,
          message: "Credentials required",
        });
      }

      if (trimUsername > 50 || trimUsername < 5) {
        return res.status(400).json({
          success: false,
          message: "Username must be Max 5 char and Min 50 characters",
        });
      }

      const User = config.userModel;

      const existingUser = await User.findOne({
        $or: [{ email: indentifire }, { username: indentifire }],
      });

      const dummyHash =
        "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIWYzFKqle";
      if (!existingUser) {
        await bcrypt.compare(trimPassword, dummyHash);
        return res.status(400).json({
          success: false,
          message: "Invaild Credential",
        });
      }

      if (!existingUser.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account has been deactivated. Contact support",
        });
      }

      if (!existingUser.isDeleted) {
        return res.status(403).json({
          success: false,
          message: "Account has been deleted. Contact support",
        });
      }

      if (!existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil(
          (existingUser.lockUntil - Date.now()) / (60 * 1000),
        );
        return res.status(403).json({
          success: false,
          message: `Account locked. Try again after ${remainingMinutes} minutes`,
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        trimPassword,
        existingUser.password,
      );
      if (!isPasswordMatch) {
        await existingUser.incrementLoginAttempts();
        return res.status(400).json({
          success: false,
          message: "Inavild Credentails",
        });
      }

      await existingUser.resetLoginAttempts();

      if (!existingUser.isVerified) {
        return res.status(403).json({
          success: false,
          message: `Verify your account`,
        });
      }

      if (existingUser.enableTwoFactorAuthentication) {
        return res.status(200).json({
          twoFactorRequired: true,
          userId: existingUser?._id,
          message: "Enter 2FA code",
        });
      }

      const accessToeken = await existingUser.generateAccessToken();
      const refreshToken = await existingUser.generateRefreshToken();

      existingUser.loginTime = Date.now();
      existingUser.isActive = true;
      existingUser.isVerified = true;
      existingUser.isDeleted = false;
      existingUser.lastLogin = Date.now();

      const Session = config.sessionTrack;
      const sessionTrack = await Session.create({
        user: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        refreshToken: refreshToken,
        deviceFingerPrint: generateDeviceFingerprint(req),
        ip: req.ip,
        loginTime: Date.now(),
        lastLogin: existingUser.createdAt,
        userAgent: req.headers["user-agent"],
      });

      await existingUser.save({ validateBeforeSave: false });

      const freshUser = await User.findeOne(existingUser._id).select(
        "-password -refreshToken -accessToken",
      );

      const options = {
        httpOnly: true,
        secure: process.env.NODE_DEV || "production",
        sameSite: process.env.NODE_DEV || "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      await sendMail({
        to: trimEmail,
        text: text,
        subject: subject,
        html: "",
      });

      return res
        .status(200)
        .cookie("accessToken", accessToeken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          success: true,
          message: "Login successfully",
          data: freshUser,
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message || "Something went worng",
      });
    }
  };
};
