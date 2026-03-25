import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

export const startPasskeyRegistrationHandler = (config) => {
  return async (req, res) => {
    try {
      const user = req.user;

      const excludeCredentials = user.passkeys.map((pk) => ({
        id: pk.credentialID,
        type: "public-key",
      }));

      const options = await generateRegistrationOptions({
        rpName: config.rpName,
        rpID: config.rpID,
        userID: new TextEncoder().encode(user._id.toString()),
        userName: user.email,
        attestationType: "none",
        excludeCredentials,
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
      });

      const User = config.userModel;
      await User.findByIdAndUpdate(user._id, {
        currentChallenge: options.challenge,
      });

      return res.status(200).json({
        success: true,
        data: { options },
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

export const verifyPasskeyRegistrationHandler = (config) => {
  return async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res
          .status(400)
          .json({ success: false, message: "Credential is required" });
      }

      const User = config.userModel;
      const user = await User.findById(req.user._id).select(
        "+currentChallenge",
      );

      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: config.origin,
        expectedRPID: config.rpID,
        requireUserVerification: true,
      });

      if (!verification.verified) {
        return res
          .status(400)
          .json({ success: false, message: "Passkey verification failed" });
      }

      const { credential: cred } = verification.registrationInfo;

      user.passkeys.push({
        credentialID: cred.id,
        publicKey: Buffer.from(cred.publicKey).toString("base64url"),
        counter: cred.counter,
        deviceName: "User Device",
        transports: credential.response.transports || [],
      });

      user.currentChallenge = undefined;
      await user.save({ validateBeforeSave: false });

      return res
        .status(200)
        .json({ success: true, message: "Passkey registered successfully" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};

export const startPasskeyLoginHandler = (config) => {
  return async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const User = config.userModel;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user || user.passkeys.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No passkey registered for this account",
        });
      }

      const allowCredentials = user.passkeys.map((pk) => ({
        id: pk.credentialID,
        type: "public-key",
      }));

      const options = await generateAuthenticationOptions({
        rpID: config.rpID,
        allowCredentials,
        userVerification: "required",
      });

      user.currentChallenge = options.challenge;
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({ success: true, data: { options } });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};

export const verifyPasskeyLoginHandler = (config) => {
  return async (req, res) => {
    try {
      const { email, credential } = req.body;
      if (!email || !credential) {
        return res.status(400).json({
          success: false,
          message: "Email and credential are required",
        });
      }

      const User = config.userModel;
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+currentChallenge",
      );

      if (!user) throw { statusCode: 404, message: "User not found" };
      if (!user.currentChallenge)
        throw { statusCode: 400, message: "No login challenge found" };

      const passkey = user.passkeys.find(
        (pk) => pk.credentialID === credential.id,
      );
      if (!passkey) {
        return res
          .status(400)
          .json({ success: false, message: "Passkey not registered" });
      }

      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: config.origin,
        expectedRPID: config.rpID,
        credential: {
          id: passkey.credentialID,
          publicKey: Buffer.from(passkey.publicKey, "base64url"),
          counter: passkey.counter,
          transports: passkey.transports,
        },
      });

      if (!verification.verified) {
        return res
          .status(400)
          .json({ success: false, message: "Passkey login failed" });
      }

      passkey.counter = verification.authenticationInfo.newCounter;
      user.currentChallenge = undefined;

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

      const freshUser = await User.findById(user._id).select(
        "-password -refreshToken",
      );

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
          message: "Passkey login successful",
          data: { user: freshUser, accessToken, refreshToken },
        });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };
};
