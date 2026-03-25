import bcrypt from "bcryptjs";
export const signupHandler = (config) => {
  return async (req, res) => {
    const { name, username, email, password } = req.body;

    const trimName = name?.trim();
    const trimUserName = username?.trim();
    const trimEmail = email?.trim();
    const trimPassword = password?.trim();

    if (!trimName || !trimUserName || !trimEmail || !trimPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (trimName > 50 || trimName < 5) {
      return res.status(400).json({
        success: false,
        message: "Name must be Max 5 char and Min 50 characters",
      });
    }

    if (trimUserName > 50 || trimUserName < 5) {
      return res.status(400).json({
        success: false,
        message: "Username must be Max 5 char and Min 50 characters",
      });
    }

    if (trimPassword <= 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be Max 8 char and Min 50 characters",
      });
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(trimPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number and special character",
      });
    }

    const User = config.userModel;

    const existingUser = await User.findOne({
      $or: [{ email: trimEmail }, { username: trimUserName }],
    });

    if (existingUser) {
      if (existingUser.email === trimEmail) {
        return res
          .status(400)
          .json({ success: false, message: "Email Already Exist" });
      }
      if (existingUser.username === trimUserName) {
        return res
          .status(400)
          .json({ success: false, message: "username Already Exist" });
      }
    }

    const hashPassword = await bcrypt.hash(trimPassword, 10);

    const user = await User.create({
      name: trimName,
      username: trimUserName,
      email: trimEmail,
      password: hashPassword,
    });

    return res.status(201).json({
      success: true,
      message: "SigUp successfully",
      data: user,
    });
  };
};
