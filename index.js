import {
  forgotPasswordHandler,
  resetPasswordHandler,
  verifyForgotOtpHandler,
} from "./src/handlers/forgotPassword.js";
import {
  sendOtpEmailHandler,
  verifyEmailOtpHandler,
} from "./src/handlers/otp.js";
import {
  startPasskeyLoginHandler,
  startPasskeyRegistrationHandler,
  verifyPasskeyLoginHandler,
  verifyPasskeyRegistrationHandler,
} from "./src/handlers/passkey.js";
import { refreshTokenHandler } from "./src/handlers/refreshToken.js";
import { siginHandler } from "./src/handlers/signin.js";
import { signoutHandler } from "./src/handlers/signout.js";
import { signupHandler } from "./src/handlers/signup.js";
import {
  generate2FASecretHandler,
  verify2FALoginHandler,
  verifyAndEnable2FAHandler,
} from "./src/handlers/twoFactor.js";

class AuthStack {
  constructor(config) {
    this.config = config;
  }

  signup() {
    return signupHandler(this.config);
  }
  signin() {
    return siginHandler(this.config);
  }
  signout() {
    return signoutHandler(this.config);
  }
  refreshTokenRotation() {
    return refreshTokenHandler(this.config);
  }
  sendOtpEmail() {
    return sendOtpEmailHandler(this.config);
  }
  verifyEmailOtp() {
    return verifyEmailOtpHandler(this.config);
  }
  forgotPassword() {
    return forgotPasswordHandler(this.config);
  }
  verifyOtp() {
    return verifyForgotOtpHandler(this.config);
  }
  resetPassword() {
    return resetPasswordHandler(this.config);
  }
  generate2FASecret() {
    return generate2FASecretHandler(this.config);
  }
  verifyAndEnable2FA() {
    return verifyAndEnable2FAHandler(this.config);
  }
  verify2FALogin() {
    return verify2FALoginHandler(this.config);
  }
  startPasskeyRegistration() {
    return startPasskeyRegistrationHandler(this.config);
  }
  verifyPasskeyRegistration() {
    return verifyPasskeyRegistrationHandler(this.config);
  }
  startPasskeyLogin() {
    return startPasskeyLoginHandler(this.config);
  }
  verifyPasskeyLogin() {
    return verifyPasskeyLoginHandler(this.config);
  }
}

export { AuthStack };
