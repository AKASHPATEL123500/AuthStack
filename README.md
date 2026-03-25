# AuthStack

<div align="center">

<h1>🔐 AuthStack</h1>

<p><strong>Production-ready, plug-and-play authentication library for Node.js & Express.</strong></p>

<p>Signup · Signin · Signout · OTP · 2FA · Passkeys · Refresh Token Rotation · Session Tracking</p>

<p>
  <a href="https://www.npmjs.com/package/authstack"><img src="https://img.shields.io/npm/v/authstack.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/authstack"><img src="https://img.shields.io/npm/dm/authstack.svg?style=flat-square" alt="downloads" /></a>
  <a href="https://github.com/AKASHPATEL123500/AuthStack/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/authstack.svg?style=flat-square" alt="license" /></a>
  <a href="#"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square" alt="node" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs welcome" /></a>
</p>

</div>

---

## Why AuthStack?

Building auth from scratch is painful. JWT, OTP, 2FA, Passkeys, refresh token rotation, session tracking, brute-force protection — most projects need all of this, but implementing it correctly every time is repetitive and error-prone.

**AuthStack gives you all of it in one library.**

You bring your own Mongoose models, Redis client, and mail function. AuthStack handles every auth flow — securely, correctly, and with zero hardcoded config.

```js
const auth = new AuthStack({ userModel: User, ...config });

app.post("/signup", auth.signup());
app.post("/signin", auth.signin());
app.post("/signout", auth.signout());
// and 13 more routes — all production-ready
```

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Reference](#configuration-reference)
- [API Reference](#api-reference)
- [User Model Schema](#user-model-schema)
- [Session Model Schema](#session-model-schema)
- [Error Handling](#error-handling)
- [Security](#security)
- [FAQ](#faq)
- [License](#license)

---

## Features

| Feature                   | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| ✅ Signup                 | Full validation — name, username, email, password strength         |
| ✅ Signin                 | Brute-force protection, account lockout, timing-safe comparison    |
| ✅ Signout                | Clears cookies, removes session from DB                            |
| ✅ Refresh Token Rotation | Old token invalidated on every refresh — prevents token reuse      |
| ✅ Email OTP              | Send & verify OTP for email confirmation                           |
| ✅ Forget Password        | OTP-based password reset flow                                      |
| ✅ Reset Password         | Secure password update after OTP verification                      |
| ✅ TOTP 2FA               | Google Authenticator compatible — generate secret, QR code, verify |
| ✅ 2FA Login              | Separate flow for users with 2FA enabled                           |
| ✅ Passkey Registration   | WebAuthn / FIDO2 — register biometric credentials                  |
| ✅ Passkey Login          | Password-free login with registered passkeys                       |
| ✅ Session Tracking       | Every login tracked with device, IP, user agent                    |
| ✅ Device Fingerprinting  | Detects device info on every session creation                      |
| ✅ HTTP-only Cookies      | Secure, SameSite cookies — XSS safe                                |
| ✅ Zero Hardcoded Config  | Everything injected — works with any project                       |

---

## Requirements

- **Node.js** >= 18.0.0
- **Express.js** >= 4.x
- **Mongoose** >= 7.x
- **Redis** (for OTP and session storage)
- A mail sending function (Nodemailer, Resend, SendGrid — anything works)

---

## Installation

```bash
npm install authstack
```

---

## Quick Start

### 1. Setup your models

AuthStack works with your existing Mongoose models. See [User Model Schema](#user-model-schema) for required fields.

### 2. Initialize AuthStack

```js
// auth.config.js
import { AuthStack } from "authstack";
import User from "./models/User.js";
import Session from "./models/Session.js";
import redisClient from "./config/redis.js";
import { sendMail } from "./utils/sendMail.js";

const auth = new AuthStack({
  userModel: User,
  sessionModel: Session,
  redis: redisClient,
  jwtSecret: process.env.JWT_SECRET,
  allowedRoles: ["user", "admin"],
  sendMail: sendMail,
  rpName: "MyApp",
  rpID: "myapp.com",
  origin: "https://myapp.com",
});

export default auth;
```

### 3. Mount routes

```js
// routes/auth.routes.js
import express from "express";
import auth from "../auth.config.js";

const router = express.Router();

// Core auth
router.post("/signup", auth.signup());
router.post("/signin", auth.signin());
router.post("/signout", auth.signout());
router.post("/refresh-token", auth.refreshTokenRotation());

// Email verification
router.post("/send-otp", auth.sendOtpEmail());
router.post("/verify-email", auth.verifyEmailOtp());

// Password reset
router.post("/forget-password", auth.forgetPassword());
router.post("/verify-otp", auth.verifyOtp());
router.post("/reset-password", auth.resetPassword());

// 2FA (TOTP)
router.post("/2fa/generate", auth.generate2FASecret());
router.post("/2fa/enable", auth.verifyAndEnable2FA());
router.post("/2fa/login", auth.verify2FALogin());

// Passkeys (WebAuthn)
router.post("/passkey/register/start", auth.startPasskeyRegistration());
router.post("/passkey/register/verify", auth.verifyPasskeyRegistration());
router.post("/passkey/login/start", auth.startPasskeyLogin());
router.post("/passkey/login/verify", auth.verifyPasskeyLogin());

export default router;
```

```js
// app.js
import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## Configuration Reference

Pass these options to `new AuthStack(config)`:

| Option         | Type             | Required      | Default    | Description                                            |
| -------------- | ---------------- | ------------- | ---------- | ------------------------------------------------------ |
| `userModel`    | Mongoose Model   | ✅            | —          | Your User model                                        |
| `sessionModel` | Mongoose Model   | ✅            | —          | Your Session model                                     |
| `redis`        | Redis Client     | ✅            | —          | Connected ioredis or node-redis client                 |
| `jwtSecret`    | `string`         | ✅            | —          | Secret key for signing JWT tokens                      |
| `allowedRoles` | `string[]`       | ❌            | `['user']` | Valid roles for signup                                 |
| `sendMail`     | `async Function` | ✅            | —          | Mail function — receives `{ to, subject, text, html }` |
| `rpName`       | `string`         | Passkeys only | —          | Relying Party name — your app name                     |
| `rpID`         | `string`         | Passkeys only | —          | Your domain e.g. `myapp.com`                           |
| `origin`       | `string`         | Passkeys only | —          | Your full origin e.g. `https://myapp.com`              |

### sendMail function signature

AuthStack calls your mail function like this:

```js
await config.sendMail({
  to: "user@example.com",
  subject: "Your OTP Code",
  text: "Your OTP is 482910",
  html: "<p>Your OTP is <strong>482910</strong></p>",
});
```

You can use any mail provider:

```js
// Nodemailer example
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  /* your SMTP config */
});

export async function sendMail({ to, subject, text, html }) {
  await transporter.sendMail({
    from: "no-reply@myapp.com",
    to,
    subject,
    text,
    html,
  });
}
```

---

## API Reference

### Signup

Registers a new user with full validation.

```
POST /auth/signup
```

**Request Body:**

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Secret@123",
  "role": "user"
}
```

**Validations applied:**

- `name` — 2 to 50 characters
- `username` — 5 to 20 characters, must be unique
- `email` — must be unique
- `password` — minimum 8 characters, must contain uppercase, lowercase, number, and special character (`@$!%*?&#`)
- `role` — must be one of `allowedRoles` from your config

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "_id": "64abc123...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

| Status | Message                                                                  |
| ------ | ------------------------------------------------------------------------ |
| `400`  | All fields are required                                                  |
| `400`  | Name must be between 2-50 characters                                     |
| `400`  | Username must be between 5-20 characters                                 |
| `400`  | Password must contain uppercase, lowercase, number and special character |
| `400`  | Invalid role                                                             |
| `409`  | Email already exists                                                     |
| `409`  | Username already exists                                                  |

---

### Signin

Authenticates a user. Sets HTTP-only cookies. Tracks session with device fingerprint and IP.

```
POST /auth/signin
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "Secret@123"
}
```

**Signin flow (in order):**

1. Find user by email
2. If user not found — timing-safe dummy compare (prevents user enumeration)
3. Check account is active and not deleted
4. Check account is not locked
5. Compare password — if wrong, increment login attempts, lock after threshold
6. If correct — reset login attempts
7. Check email is verified
8. If 2FA enabled — return `twoFactorRequired: true` early
9. Generate access + refresh tokens
10. Create session in DB with device fingerprint, IP, user agent
11. Set HTTP-only cookies
12. Return user + tokens

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**2FA Required Response `200`:**

```json
{
  "success": true,
  "message": "Enter 2FA Code",
  "data": {
    "twoFactorRequired": true,
    "userId": "64abc123..."
  }
}
```

**Error Responses:**

| Status | Message                                       |
| ------ | --------------------------------------------- |
| `400`  | Email and password are required               |
| `400`  | Please verify your email first                |
| `401`  | Invalid credentials                           |
| `403`  | Account has been deactivated. Contact support |
| `403`  | Account locked. Try again after N minutes     |

---

### Signout

Clears access and refresh token cookies. Removes session from DB.

```
POST /auth/signout
```

> Reads `refreshToken` from cookie automatically.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

---

### Refresh Token Rotation

Issues a new access token + refresh token. Old refresh token is **immediately invalidated** on use — prevents replay attacks.

```
POST /auth/refresh-token
```

> Reads from cookie `refreshToken` — or pass in request body as fallback.

**Body (optional):**

```json
{ "refreshToken": "eyJhbGci..." }
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Error Responses:**

| Status | Message                          |
| ------ | -------------------------------- |
| `401`  | Refresh token is required        |
| `401`  | Invalid or expired refresh token |

---

### Send OTP Email

Sends a 6-digit OTP to the user's email for verification. OTP is stored in Redis with expiry.

```
POST /auth/send-otp
```

**Request Body:**

```json
{ "email": "john@example.com" }
```

**Success Response `200`:**

```json
{ "success": true, "message": "OTP sent successfully" }
```

---

### Verify Email OTP

Verifies the OTP and marks the user's email as `isVerified: true`.

```
POST /auth/verify-email
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "482910"
}
```

**Success Response `200`:**

```json
{ "success": true, "message": "Email verified successfully" }
```

**Error Responses:**

| Status | Message                |
| ------ | ---------------------- |
| `400`  | Invalid or expired OTP |
| `404`  | User not found         |

---

### Forget Password

Sends a password reset OTP to the user's registered email.

```
POST /auth/forget-password
```

**Request Body:**

```json
{ "email": "john@example.com" }
```

**Success Response `200`:**

```json
{ "success": true, "message": "Password reset OTP sent to your email" }
```

---

### Verify OTP (Password Reset)

Verifies the OTP sent via forget password before allowing the reset.

```
POST /auth/verify-otp
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "192837"
}
```

**Success Response `200`:**

```json
{ "success": true, "message": "OTP verified. You can now reset your password" }
```

---

### Reset Password

Sets a new password. Only works after OTP has been verified.

```
POST /auth/reset-password
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "newPassword": "NewSecret@456"
}
```

**Success Response `200`:**

```json
{ "success": true, "message": "Password reset successful" }
```

---

### Generate 2FA Secret

Generates a TOTP secret and returns a QR code image (base64) for the authenticated user.

```
POST /auth/2fa/generate
```

> Requires authenticated user — `req.user` must be set by your `isAuth` middleware before this route.

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw...",
    "secret": "JBSWY3DPEHPK3PXP"
  }
}
```

> Show the `qrCode` as an `<img>` tag — user scans it with Google Authenticator or Authy. 2FA is not enabled yet until `verify-and-enable` is called.

---

### Verify & Enable 2FA

Verifies the TOTP code from the authenticator app and permanently enables 2FA on the account.

```
POST /auth/2fa/enable
```

> Requires authenticated user.

**Request Body:**

```json
{ "token": "482910" }
```

**Success Response `200`:**

```json
{ "success": true, "message": "2FA enabled successfully" }
```

**Error Responses:**

| Status | Message          |
| ------ | ---------------- |
| `400`  | Invalid 2FA code |

---

### Verify 2FA Login

Called after signin returns `twoFactorRequired: true`. Completes the login using the TOTP code.

```
POST /auth/2fa/login
```

**Request Body:**

```json
{
  "userId": "64abc123...",
  "token": "192837"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### Start Passkey Registration

Initiates the WebAuthn passkey registration ceremony. Returns options to pass to the browser's `navigator.credentials.create()`.

```
POST /auth/passkey/register/start
```

> Requires authenticated user.

**Success Response `200`:**

```json
{
  "success": true,
  "data": { "options": { ... } }
}
```

> Pass `options` directly to `startRegistration()` from `@simplewebauthn/browser` on the frontend.

---

### Verify Passkey Registration

Verifies and stores the passkey credential returned by the browser after registration.

```
POST /auth/passkey/register/verify
```

**Request Body:**

```json
{ "credential": { ... } }
```

> `credential` is the full response object from `startRegistration()` on the frontend.

**Success Response `200`:**

```json
{ "success": true, "message": "Passkey registered successfully" }
```

---

### Start Passkey Login

Initiates the WebAuthn authentication ceremony.

```
POST /auth/passkey/login/start
```

**Request Body:**

```json
{ "email": "john@example.com" }
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": { "options": { ... } }
}
```

---

### Verify Passkey Login

Verifies the passkey authentication response and issues access + refresh tokens.

```
POST /auth/passkey/login/verify
```

**Request Body:**

```json
{
  "email":      "john@example.com",
  "credential": { ... }
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "user":          { ... },
    "accessToken":   "eyJhbGci...",
    "refreshToken":  "eyJhbGci..."
  }
}
```

---

## User Model Schema

Your Mongoose User model must include these fields and methods for full AuthStack compatibility:

```js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "user" },

    // Email verification
    isVerified: { type: Boolean, default: false },

    // Account status
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    // Brute force protection
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // 2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },

    // Passkeys (WebAuthn)
    passkeys: [
      {
        credentialID: String,
        publicKey: String,
        counter: Number,
        deviceName: String,
        transports: [String],
      },
    ],
    currentChallenge: { type: String, select: false },

    // Tokens & activity
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Required methods — AuthStack calls these internally
userSchema.methods.isPasswordMatched = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

userSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save({ validateBeforeSave: false });
};

export default mongoose.model("User", userSchema);
```

---

## Session Model Schema

Stores one record per login. Used for session tracking, device management, and refresh token invalidation.

```js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    refreshToken: { type: String, required: true },
    deviceFingerprint: { type: String },
    IP: { type: String },
    userAgent: { type: String },
    lastUsed: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
```

---

## Error Handling

All AuthStack handlers throw errors with a `statusCode` and `message`. Add a global error handler in Express to catch them:

```js
// app.js — add this after all routes
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message: message,
  });
});
```

---

## Security

AuthStack is built security-first. Here is what is handled for you:

| Protection                | Implementation                                          |
| ------------------------- | ------------------------------------------------------- |
| Password hashing          | bcryptjs — salt rounds 12                               |
| Timing-safe login         | Dummy hash compare prevents user enumeration            |
| Brute force protection    | Login attempt counter + automatic account lockout       |
| Short-lived access tokens | Default 15 minutes expiry                               |
| Refresh token rotation    | Old token invalidated immediately on every use          |
| HTTP-only cookies         | Tokens never accessible from JavaScript                 |
| Secure + SameSite cookies | Configured automatically based on NODE_ENV              |
| 2FA (TOTP)                | speakeasy — compatible with Google Authenticator, Authy |
| Passkeys                  | @simplewebauthn/server — FIDO2 / WebAuthn Level 2       |
| Session tracking          | Device fingerprint + IP + user agent per session        |
| XSS protection            | HTTP-only cookies — no token in localStorage            |

---

## FAQ

**Can I use my own User model schema?**

Yes. AuthStack only requires certain fields and methods on your model — it does not force any schema structure on you. See [User Model Schema](#user-model-schema).

**Can I use it without Redis?**

Redis is required for OTP storage. If you do not need OTP or forget-password features, you can pass a mock Redis client — other features will still work fine.

**Does it work with TypeScript?**

TypeScript types are coming in the next release. For now use JSDoc annotations.

**Can I use it without Passkeys?**

Yes. Passkey routes are completely optional. Just do not mount them. The `rpName`, `rpID`, and `origin` config fields are only needed if you use passkey routes.

**Can I customize validation rules?**

Custom validation hooks are on the roadmap. For now the built-in rules follow industry best practices.

**What Node.js version is required?**

Node.js 18 or higher. The library uses top-level await and native ES modules.

---

## Contributing

PRs are welcome. If you find a bug or want to request a feature, please open an issue on GitHub first so we can discuss it.

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a PR

---

## License

MIT © AuthStack

---

<div align="center">
  <p>Made with care for developers who want auth done right — the first time.</p>
</div>
