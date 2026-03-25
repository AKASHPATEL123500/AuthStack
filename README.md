<div align="center">

<img src="https://raw.githubusercontent.com/AKASHPATEL123500/AuthStack/main/assets/logo.png" alt="AuthStack" width="120" />

<h1>🔐 AuthStack</h1>

<p><strong>The last auth library you'll ever need.</strong></p>

<p>
Production-ready authentication for Node.js & Express.<br/>
Bring your own models. We handle the rest.
</p>

<p>
  <a href="https://www.npmjs.com/package/authstack">
    <img src="https://img.shields.io/npm/v/authstack.svg?style=for-the-badge&color=cb3837&logo=npm" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/authstack">
    <img src="https://img.shields.io/npm/dm/authstack.svg?style=for-the-badge&color=blue" alt="downloads" />
  </a>
  <a href="https://github.com/AKASHPATEL123500/AuthStack/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/authstack.svg?style=for-the-badge&color=green" alt="license" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=nodedotjs" alt="node" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs welcome" />
  </a>
</p>

<p>
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-security">Security</a> •
  <a href="#-faq">FAQ</a>
</p>

</div>

<br/>

---

## 😩 The Problem

Every Node.js project needs auth. And every time, you write the same code:

```
❌ Signup validation
❌ Password hashing
❌ JWT tokens
❌ Refresh token rotation
❌ OTP via email
❌ Forgot password flow
❌ 2FA with QR codes
❌ Passkeys (WebAuthn)
❌ Session tracking
❌ Brute force protection
```

It works. But it takes days. And it's easy to get wrong.

---

## ✅ The Solution

```bash
npm install authstack
```

```js
const auth = new AuthStack({ userModel: User, ...config });

app.post("/signup", auth.signup()); // ✅ done
app.post("/signin", auth.signin()); // ✅ done
app.post("/signout", auth.signout()); // ✅ done
// + 13 more routes — all production-ready, all secure
```

**You bring your models. AuthStack brings everything else.**

---

## ✨ Features

<table>
<tr>
<td>

**Core Auth**

- ✅ Signup with full validation
- ✅ Signin with brute-force protection
- ✅ Signout
- ✅ Refresh token rotation
- ✅ Session tracking

</td>
<td>

**Email & OTP**

- ✅ Send OTP via email
- ✅ Verify email OTP
- ✅ Forgot password flow
- ✅ OTP-based password reset
- ✅ Redis-backed OTP storage

</td>
</tr>
<tr>
<td>

**Advanced Auth**

- ✅ TOTP 2FA (Google Authenticator)
- ✅ QR code generation
- ✅ 2FA login flow

</td>
<td>

**Passkeys (WebAuthn)**

- ✅ Passkey registration
- ✅ Passkey login
- ✅ FIDO2 / WebAuthn Level 2

</td>
</tr>
<tr>
<td colspan="2">

**Security**

- ✅ Timing-safe login (prevents user enumeration)
- ✅ HTTP-only + Secure + SameSite cookies
- ✅ Device fingerprinting on every session
- ✅ Zero hardcoded config — works with any project

</td>
</tr>
</table>

---

## 📦 Installation

```bash
npm install authstack
```

**Peer dependencies:**

```bash
npm install express mongoose ioredis
```

**Optional (for 2FA and Passkeys):**

```bash
npm install speakeasy qrcode @simplewebauthn/server
```

---

## 🚀 Quick Start

### Step 1 — Create your models

AuthStack works with **your existing Mongoose models**. See [User Model Schema](#-user-model-schema) for the required fields and methods.

### Step 2 — Initialize

```js
// auth.config.js
import { AuthStack } from "authstack";
import User from "./models/User.js";
import Session from "./models/Session.js";
import redis from "./config/redis.js";
import { sendMail } from "./utils/sendMail.js";

const auth = new AuthStack({
  userModel: User,
  sessionModel: Session,
  redis: redis,
  jwtSecret: process.env.JWT_SECRET,
  allowedRoles: ["user", "admin"],
  sendMail: sendMail,

  // Only needed for Passkeys
  rpName: "MyApp",
  rpID: "myapp.com",
  origin: "https://myapp.com",
});

export default auth;
```

### Step 3 — Mount routes

```js
// routes/auth.routes.js
import express from "express";
import auth from "../auth.config.js";

const router = express.Router();

// ── Core ──────────────────────────────────────────
router.post("/signup", auth.signup());
router.post("/signin", auth.signin());
router.post("/signout", auth.signout());
router.post("/refresh-token", auth.refreshTokenRotation());

// ── Email Verification ────────────────────────────
router.post("/send-otp", auth.sendOtpEmail());
router.post("/verify-email", auth.verifyEmailOtp());

// ── Password Reset ────────────────────────────────
router.post("/forget-password", auth.forgotPassword());
router.post("/verify-otp", auth.verifyOtp());
router.post("/reset-password", auth.resetPassword());

// ── 2FA ───────────────────────────────────────────
router.post("/2fa/generate", auth.generate2FASecret());
router.post("/2fa/enable", auth.verifyAndEnable2FA());
router.post("/2fa/login", auth.verify2FALogin());

// ── Passkeys ──────────────────────────────────────
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
app.listen(3000);
```

**That's it. 16 auth routes. Zero boilerplate.**

---

## ⚙️ Configuration Reference

| Option         | Type             | Required | Default    | Description                                |
| -------------- | ---------------- | -------- | ---------- | ------------------------------------------ |
| `userModel`    | Mongoose Model   | ✅       | —          | Your User model                            |
| `sessionModel` | Mongoose Model   | ✅       | —          | Your Session model                         |
| `redis`        | Redis Client     | ✅       | —          | ioredis or node-redis client               |
| `jwtSecret`    | `string`         | ✅       | —          | JWT signing secret                         |
| `allowedRoles` | `string[]`       | ❌       | `['user']` | Valid roles on signup                      |
| `sendMail`     | `async Function` | ✅       | —          | `({ to, subject, text, html }) => Promise` |
| `rpName`       | `string`         | Passkeys | —          | Your app name                              |
| `rpID`         | `string`         | Passkeys | —          | Your domain e.g. `myapp.com`               |
| `origin`       | `string`         | Passkeys | —          | Full origin e.g. `https://myapp.com`       |

### sendMail signature

AuthStack calls your mail function with this shape:

```js
await sendMail({
  to: "user@example.com",
  subject: "Your OTP is 482910",
  text: "Your OTP is 482910. Expires in 10 minutes.",
  html: "<p>Your OTP is <strong>482910</strong></p>",
});
```

Works with any provider:

```js
// Nodemailer
export const sendMail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: "no-reply@myapp.com",
    to,
    subject,
    text,
    html,
  });
};

// Resend
export const sendMail = async ({ to, subject, html }) => {
  await resend.emails.send({ from: "no-reply@myapp.com", to, subject, html });
};
```

---

## 📖 API Reference

### `POST /auth/signup`

Registers a new user.

```json
// Request
{
  "name":     "John Doe",
  "username": "johndoe",
  "email":    "john@example.com",
  "password": "Secret@123",
  "role":     "user"
}

// Response 201
{
  "success": true,
  "message": "Signup successful",
  "data": { "_id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

| Rule     | Constraint                                              |
| -------- | ------------------------------------------------------- |
| name     | 2–50 characters                                         |
| username | 5–20 characters, unique                                 |
| password | 8+ chars, uppercase + lowercase + number + special char |
| role     | Must be in `allowedRoles`                               |

---

### `POST /auth/signin`

Authenticates user. Sets HTTP-only cookies. Tracks session.

```json
// Request
{ "email": "john@example.com", "password": "Secret@123" }

// Response 200
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken":  "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}

// Response 200 — if 2FA is enabled
{
  "success": true,
  "data": { "twoFactorRequired": true, "userId": "64abc..." }
}
```

**What happens internally:**

1. Timing-safe user lookup
2. Account status checks (active, deleted, locked)
3. Password compare → increment/reset login attempts
4. Email verification check
5. 2FA check → early return if enabled
6. Token generation + session creation + cookie set

---

### `POST /auth/signout`

Clears cookies. Removes session from DB.

```json
// Response 200
{ "success": true, "message": "Signed out successfully" }
```

---

### `POST /auth/refresh-token`

Rotates tokens. Old refresh token immediately invalidated.

```json
// Body (optional — reads from cookie automatically)
{ "refreshToken": "eyJhbGci..." }

// Response 200
{
  "success": true,
  "data": { "accessToken": "...", "refreshToken": "..." }
}
```

---

### `POST /auth/send-otp`

Sends a 6-digit OTP to the user's email. Stored in Redis with 10 minute expiry.

```json
{ "email": "john@example.com" }
```

---

### `POST /auth/verify-email`

Verifies OTP and marks email as verified.

```json
{ "email": "john@example.com", "otp": "482910" }
```

---

### `POST /auth/forget-password`

Sends password reset OTP. Always returns same response (prevents email enumeration).

```json
{ "email": "john@example.com" }
```

---

### `POST /auth/verify-otp`

Verifies the forget-password OTP.

```json
{ "email": "john@example.com", "otp": "192837" }
```

---

### `POST /auth/reset-password`

Resets password after OTP verification.

```json
{ "email": "john@example.com", "newPassword": "NewSecret@456" }
```

---

### `POST /auth/2fa/generate`

Generates TOTP secret + QR code. Requires authenticated user (`req.user`).

```json
// Response 200
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "secret": "JBSWY3DPEHPK3PXP"
  }
}
```

> Render `qrCode` as `<img src={qrCode} />` — user scans with Google Authenticator.

---

### `POST /auth/2fa/enable`

Verifies TOTP code and enables 2FA permanently.

```json
{ "token": "482910" }
```

---

### `POST /auth/2fa/login`

Completes login after `twoFactorRequired: true` from signin.

```json
{ "userId": "64abc...", "token": "192837" }
```

---

### Passkey Routes

```
POST /auth/passkey/register/start   → returns WebAuthn registration options
POST /auth/passkey/register/verify  → body: { credential }
POST /auth/passkey/login/start      → body: { email }
POST /auth/passkey/login/verify     → body: { email, credential }
```

> Use `@simplewebauthn/browser` on the frontend to handle `credential` generation.

---

## 🗃️ User Model Schema

Copy-paste this as your base. Extend as needed.

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

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },

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
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Required methods — AuthStack calls these
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
  if (this.loginAttempts >= 5)
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
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

## 🗃️ Session Model Schema

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

## 🛡️ Security

| Protection        | How                                                  |
| ----------------- | ---------------------------------------------------- |
| Password hashing  | bcryptjs — 12 salt rounds                            |
| Timing-safe login | Dummy hash compare on user-not-found                 |
| Brute force       | Login attempt counter + 30 min auto lockout          |
| Token expiry      | Access token 15m · Refresh token 7d                  |
| Token rotation    | Old refresh token invalidated on every use           |
| Cookie security   | `httpOnly` + `secure` + `sameSite` per environment   |
| XSS               | HTTP-only cookies — tokens never in `localStorage`   |
| 2FA               | TOTP via speakeasy — Google Authenticator compatible |
| Passkeys          | FIDO2 / WebAuthn Level 2 via @simplewebauthn/server  |
| Session tracking  | Device fingerprint + IP + user agent per login       |
| Email enumeration | Forgot password always returns same response         |

---

## ❓ FAQ

<details>
<summary><strong>Can I use my own User model?</strong></summary>

Yes. AuthStack requires certain fields and methods on your model but does not force any schema structure. See [User Model Schema](#-user-model-schema) for the full list.

</details>

<details>
<summary><strong>Can I use it without Redis?</strong></summary>

Redis is required for OTP storage only. If you don't need OTP or forgot password features, pass a mock Redis client — all other features will work fine.

</details>

<details>
<summary><strong>Can I use it without Passkeys?</strong></summary>

Yes. Passkey routes are optional — just don't mount them. The `rpName`, `rpID`, and `origin` config fields are only needed if you use passkey routes.

</details>

<details>
<summary><strong>Does it work with TypeScript?</strong></summary>

TypeScript types are coming in the next release. For now use JSDoc annotations or cast manually.

</details>

<details>
<summary><strong>What Node.js version is required?</strong></summary>

Node.js 18 or higher. AuthStack uses ES modules and top-level await.

</details>

<details>
<summary><strong>Can I customize validation rules?</strong></summary>

Custom validation hooks are on the roadmap. Current rules follow industry best practices and cover 99% of use cases.

</details>

---

## 🤝 Contributing

PRs are welcome!

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push and open a PR

Please open an issue first for major changes.

---

## 📄 License

MIT © [Akash Patel](https://github.com/AKASHPATEL123500)

---

<div align="center">

**[npm](https://www.npmjs.com/package/authstack) · [GitHub](https://github.com/AKASHPATEL123500/AuthStack) · [Issues](https://github.com/AKASHPATEL123500/AuthStack/issues)**

<br/>

<sub>Made with ❤️ — auth done right, the first time.</sub>

</div>
