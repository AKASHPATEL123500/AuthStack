import { generateOtp } from "../utils/generateOtp.js";
import { otpTemplate } from "../utils/emailTemplates.js";

export const forgotPasswordHandler = (config) => {
  return async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const User = config.userModel;
      const user = await User.findOne({ email: email.trim().toLowerCase() });

      // Security — hamesha same response do chahe user ho ya na ho
      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If this email exists, OTP has been sent",
        });
      }

      const otp = generateOtp();
      await config.redis.set(`otp:reset:${email}`, otp, "EX", 600);

      await config.sendMail({
        to: email,
        subject: "Reset Your Password — OTP",
        text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
        html: otpTemplate(otp, "forgotPassword"),
      });

      return res.status(200).json({
        success: true,
        message: "If this email exists, OTP has been sent",
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

export const verifyForgotOtpHandler = (config) => {
  return async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res
          .status(400)
          .json({ success: false, message: "Email and OTP are required" });
      }

      const storedOtp = await config.redis.get(`otp:reset:${email}`);
      if (!storedOtp || storedOtp !== otp.toString()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      // OTP verified — reset allow karne ke liye flag lagao
      await config.redis.set(`otp:reset:verified:${email}`, "true", "EX", 600);
      await config.redis.del(`otp:reset:${email}`);

      return res.status(200).json({
        success: true,
        message: "OTP verified. You can now reset your password",
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

export const resetPasswordHandler = (config) => {
  return async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email and new password are required",
        });
      }

      const verified = await config.redis.get(`otp:reset:verified:${email}`);
      if (!verified) {
        return res
          .status(400)
          .json({ success: false, message: "Please verify OTP first" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain uppercase, lowercase, number and special character",
        });
      }

      const User = config.userModel;
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.password = newPassword;
      await user.save();

      await config.redis.del(`otp:reset:verified:${email}`);

      return res
        .status(200)
        .json({ success: true, message: "Password reset successful" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
