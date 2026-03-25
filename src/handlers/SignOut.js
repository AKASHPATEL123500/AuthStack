export const signoutHandler = (config) => {
  return async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      const Session = config.sessionModel;
      if (refreshToken) {
        await Session.findOneAndDelete({ refreshToken });
      }

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 0,
      };

      return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({ success: true, message: "Signed out successfully" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
