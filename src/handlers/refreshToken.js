import jwt from "jsonwebtoken";

export const refreshTokenHandler = (config) => {
  return async (req, res) => {
    try {
      const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!incomingToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(incomingToken, config.jwtSecret);
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
      }

      const User = config.userModel;
      const Session = config.sessionModel;

      const session = await Session.findOne({ refreshToken: incomingToken });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Session not found. Please login again",
        });
      }

      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      // Old session delete, new session banao
      await Session.findOneAndDelete({ refreshToken: incomingToken });
      await Session.create({
        user: user._id,
        email: user.email,
        refreshToken: newRefreshToken,
        IP: req.ip,
        userAgent: req.headers["user-agent"],
        lastUsed: Date.now(),
      });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      return res
        .status(200)
        .cookie("accessToken", newAccessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json({
          success: true,
          message: "Token refreshed",
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
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
