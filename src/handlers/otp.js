import { generateOtp } from "../utils/generateOtp.js";
import { otpTemplate } from "../utils/emailTemplates.js";

export const sendOtpEmailHandler = (config) => {
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
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const otp = generateOtp();
      await config.redis.set(`otp:verify:${email}`, otp, "EX", 600);

      await config.sendMail({
        to: email,
        subject: "Verify Your Email — OTP",
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        html: otpTemplate(otp, "verification"),
      });

      return res
        .status(200)
        .json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};

export const verifyEmailOtpHandler = (config) => {
  return async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res
          .status(400)
          .json({ success: false, message: "Email and OTP are required" });
      }

      const storedOtp = await config.redis.get(`otp:verify:${email}`);
      if (!storedOtp || storedOtp !== otp.toString()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      const User = config.userModel;
      await User.findOneAndUpdate(
        { email: email.trim().toLowerCase() },
        { isVerified: true },
      );

      await config.redis.del(`otp:verify:${email}`);

      return res
        .status(200)
        .json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
