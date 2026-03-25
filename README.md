<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,50:302b63,100:24243e&height=200&section=header&text=AuthStack&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=The%20last%20auth%20library%20you%27ll%20ever%20need&descSize=18&descAlignY=58&descColor=a78bfa" width="100%" />

<br/>

<a href="https://www.npmjs.com/package/authstack">
  <img src="https://img.shields.io/npm/v/authstack?style=for-the-badge&logo=npm&logoColor=white&color=CC3534" />
</a>
<a href="https://www.npmjs.com/package/authstack">
  <img src="https://img.shields.io/npm/dm/authstack?style=for-the-badge&logo=npm&logoColor=white&color=4B5563" />
</a>
<a href="https://github.com/AKASHPATEL123500/AuthStack/stargazers">
  <img src="https://img.shields.io/github/stars/AKASHPATEL123500/AuthStack?style=for-the-badge&logo=github&logoColor=white&color=f59e0b" />
</a>
<a href="https://github.com/AKASHPATEL123500/AuthStack/blob/main/LICENSE">
  <img src="https://img.shields.io/npm/l/authstack?style=for-the-badge&color=22c55e" />
</a>
<a href="#">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
</a>
<a href="#">
  <img src="https://img.shields.io/badge/PRs-Welcome-a78bfa?style=for-the-badge" />
</a>

<br/><br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&lines=Signup+%E2%80%94+done+in+1+line;Signin+with+brute-force+protection;OTP+%2B+2FA+%2B+Passkeys+built-in;Zero+hardcoded+config;Production-ready+from+day+one" alt="Typing SVG" />

<br/><br/>

<a href="https://www.npmjs.com/package/authstack">
  <img src="https://img.shields.io/badge/View%20on%20NPM-%23CC3534?style=for-the-badge&logo=npm&logoColor=white" />
</a>
&nbsp;
<a href="https://github.com/AKASHPATEL123500/AuthStack">
  <img src="https://img.shields.io/badge/View%20on%20GitHub-%23181717?style=for-the-badge&logo=github&logoColor=white" />
</a>
&nbsp;
<a href="https://github.com/AKASHPATEL123500/AuthStack/issues">
  <img src="https://img.shields.io/badge/Report%20a%20Bug-%23EF4444?style=for-the-badge&logo=bugsnag&logoColor=white" />
</a>

</div>

<br/>

---

<div align="center">
<h2>😩 Building auth from scratch?</h2>
</div>

```diff
- Signup validation         → hours of work
- Password hashing          → easy to get wrong
- JWT + refresh tokens      → tricky to implement securely
- Refresh token rotation    → most devs skip this
- OTP via email             → another integration
- Forgot password flow      → more boilerplate
- 2FA with QR codes         → complex setup
- Passkeys (WebAuthn)       → days of work
- Brute force protection    → often forgotten
- Session tracking          → even more code
```

**Every project. Every time. Same code.**

<br/>

<div align="center">
<h2>✅ With AuthStack</h2>
</div>

```js
npm install authstack
```

```js
const auth = new AuthStack({ userModel: User, ...config });

app.post("/signup", auth.signup()); // ✅ validation, hashing, duplicate check
app.post("/signin", auth.signin()); // ✅ brute force, lockout, 2FA check
app.post("/signout", auth.signout()); // ✅ cookie clear, session remove

// + 13 more routes. All secure. All production-ready.
```

**You bring your models. AuthStack brings the rest.**

---

## 📦 What's Inside

<table>
<tr>
<td width="50%">

### 🔑 Core Auth

| Route                 | What it does                    |
| --------------------- | ------------------------------- |
| `POST /signup`        | Validate + hash + create user   |
| `POST /signin`        | Secure login + session tracking |
| `POST /signout`       | Clear cookies + remove session  |
| `POST /refresh-token` | Rotate tokens securely          |

</td>
<td width="50%">

### 📧 Email & OTP

| Route                   | What it does                 |
| ----------------------- | ---------------------------- |
| `POST /send-otp`        | 6-digit OTP via your mail fn |
| `POST /verify-email`    | Verify OTP → mark verified   |
| `POST /forget-password` | OTP for password reset       |
| `POST /verify-otp`      | Verify reset OTP             |
| `POST /reset-password`  | Set new password             |

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Two-Factor Auth

| Route                | What it does             |
| -------------------- | ------------------------ |
| `POST /2fa/generate` | TOTP secret + QR code    |
| `POST /2fa/enable`   | Verify code + enable 2FA |
| `POST /2fa/login`    | Complete 2FA login       |

</td>
<td width="50%">

### 🪪 Passkeys (WebAuthn)

| Route                           | What it does                |
| ------------------------------- | --------------------------- |
| `POST /passkey/register/start`  | Start registration ceremony |
| `POST /passkey/register/verify` | Verify + store credential   |
| `POST /passkey/login/start`     | Start login ceremony        |
| `POST /passkey/login/verify`    | Verify + issue tokens       |

</td>
</tr>
</table>

---

## 🚀 Quick Start

### 1 — Install

```bash
npm install authstack
```

### 2 — Initialize

```js
// auth.config.js
import { AuthStack } from "authstack";
import User from "./models/User.js";
import Session from "./models/Session.js";
import redis from "./config/redis.js";
import { sendMail } from "./utils/sendMail.js";

const auth = new AuthStack({
  userModel: User, // your Mongoose User model
  sessionModel: Session, // your Session model
  redis: redis, // your Redis client
  jwtSecret: process.env.JWT_SECRET,
  allowedRoles: ["user", "admin"],
  sendMail: sendMail, // your mail function

  // Only needed for Passkeys ↓
  rpName: "MyApp",
  rpID: "myapp.com",
  origin: "https://myapp.com",
});

export default auth;
```

### 3 — Mount Routes

```js
// routes/auth.routes.js
import express from "express";
import auth from "../auth.config.js";

const router = express.Router();

// ── Core ──────────────────────────────────────────────────────
router.post("/signup", auth.signup());
router.post("/signin", auth.signin());
router.post("/signout", auth.signout());
router.post("/refresh-token", auth.refreshTokenRotation());

// ── Email Verification ────────────────────────────────────────
router.post("/send-otp", auth.sendOtpEmail());
router.post("/verify-email", auth.verifyEmailOtp());

// ── Password Reset ────────────────────────────────────────────
router.post("/forget-password", auth.forgotPassword());
router.post("/verify-otp", auth.verifyOtp());
router.post("/reset-password", auth.resetPassword());

// ── Two-Factor Auth ───────────────────────────────────────────
router.post("/2fa/generate", auth.generate2FASecret());
router.post("/2fa/enable", auth.verifyAndEnable2FA());
router.post("/2fa/login", auth.verify2FALogin());

// ── Passkeys (WebAuthn) ───────────────────────────────────────
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
app.listen(3000, () => console.log("🚀 Server ready"));
```

**Done. 16 auth routes. Zero boilerplate.**

---

## ⚙️ Configuration

| Option         | Type           | Required | Default    | Description                     |
| -------------- | -------------- | -------- | ---------- | ------------------------------- |
| `userModel`    | Mongoose Model | ✅       | —          | Your User model                 |
| `sessionModel` | Mongoose Model | ✅       | —          | Your Session model              |
| `redis`        | Redis Client   | ✅       | —          | ioredis or node-redis           |
| `jwtSecret`    | `string`       | ✅       | —          | JWT signing secret              |
| `allowedRoles` | `string[]`     | ❌       | `['user']` | Valid roles on signup           |
| `sendMail`     | `async fn`     | ✅       | —          | `({ to, subject, text, html })` |
| `rpName`       | `string`       | Passkeys | —          | App name for WebAuthn           |
| `rpID`         | `string`       | Passkeys | —          | Domain e.g. `myapp.com`         |
| `origin`       | `string`       | Passkeys | —          | Origin e.g. `https://myapp.com` |

### sendMail — works with any provider

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

// SendGrid
export const sendMail = async ({ to, subject, html }) => {
  await sgMail.send({ from: "no-reply@myapp.com", to, subject, html });
};
```

---

## 📖 API Reference

### `POST /auth/signup`

```jsonc
// Request
{
  "name":     "John Doe",
  "username": "johndoe",       // 5–20 chars, unique
  "email":    "john@mail.com",
  "password": "Secret@123",    // 8+ chars, upper+lower+number+special
  "role":     "user"           // must be in allowedRoles
}

// 201 — Success
{
  "success": true,
  "message": "Signup successful",
  "data": { "_id": "...", "name": "John Doe", "email": "john@mail.com" }
}

// Errors → 400 validation | 409 email/username exists
```

---

### `POST /auth/signin`

```jsonc
// Request
{ "email": "john@mail.com", "password": "Secret@123" }

// 200 — Success
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken":  "eyJhbGci...",   // 15 min expiry
    "refreshToken": "eyJhbGci..."    // 7 day expiry
  }
}

// 200 — if 2FA is enabled
{ "success": true, "data": { "twoFactorRequired": true, "userId": "..." } }

// Errors → 401 invalid creds | 403 locked/deactivated | 400 unverified
```

**Signin flow:**

```
Request → timing-safe lookup → active/deleted check → lockout check
→ password compare → attempt tracking → 2FA check
→ token generation → session create → cookie set → response
```

---

### `POST /auth/refresh-token`

```jsonc
// Reads from cookie automatically — or pass in body
{ "refreshToken": "eyJhbGci..." }

// 200 — new tokens issued, old token immediately invalidated
{ "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

---

### `POST /auth/2fa/generate`

> Requires authenticated user — set `req.user` via your `isAuth` middleware.

```jsonc
// 200
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...", // render as <img>
    "secret": "JBSWY3DPEHPK3PXP",
  },
}
```

---

### Passkey Routes

```
POST /passkey/register/start   → WebAuthn registration options
POST /passkey/register/verify  → { credential } from @simplewebauthn/browser
POST /passkey/login/start      → { email }
POST /passkey/login/verify     → { email, credential }
```

---

## 🗃️ Required Schemas

### User Model

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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ⚠️ These methods are required by AuthStack
userSchema.methods.isPasswordMatched = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
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

### Session Model

```js
import mongoose from "mongoose";

export default mongoose.model(
  "Session",
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      email: String,
      refreshToken: String,
      deviceFingerprint: String,
      IP: String,
      userAgent: String,
      lastUsed: { type: Date, default: Date.now },
    },
    { timestamps: true },
  ),
);
```

---

## 🛡️ Security

| Layer             | Protection                                           |
| ----------------- | ---------------------------------------------------- |
| 🔒 Passwords      | bcryptjs — 12 salt rounds                            |
| 🎭 Timing attacks | Dummy hash compare — no user enumeration             |
| 🔨 Brute force    | Attempt counter + 30 min auto lockout after 5 fails  |
| 🔄 Token rotation | Refresh token invalidated on every use               |
| 🍪 Cookies        | `httpOnly` + `secure` + `sameSite` — no XSS access   |
| 📱 2FA            | TOTP via speakeasy — Google Authenticator compatible |
| 🪪 Passkeys       | FIDO2 / WebAuthn Level 2 — phishing resistant        |
| 🖥️ Sessions       | Device fingerprint + IP + user agent per login       |
| 📧 Email enum     | Forgot password returns same response always         |

---

## ❓ FAQ

<details>
<summary><strong>Can I use my own User model schema?</strong></summary>
<br/>
Yes. AuthStack only requires certain fields and methods on your model — no forced schema structure. Copy the base schema above and extend it freely.
</details>

<details>
<summary><strong>Can I use it without Redis?</strong></summary>
<br/>
Redis is only needed for OTP storage. If you don't need OTP or forgot password, pass a mock Redis client — all other features work fine.
</details>

<details>
<summary><strong>Can I skip Passkeys?</strong></summary>
<br/>
Yes. Passkey routes are optional. Don't mount them. Skip rpName, rpID, and origin in config.
</details>

<details>
<summary><strong>TypeScript support?</strong></summary>
<br/>
Coming in the next release. For now use JSDoc annotations.
</details>

<details>
<summary><strong>What Node.js version?</strong></summary>
<br/>
Node.js 18 or higher — AuthStack uses ES modules and top-level await.
</details>

---

## 🤝 Contributing

PRs are welcome!

```bash
git clone https://github.com/AKASHPATEL123500/AuthStack
cd AuthStack
npm install
```

1. Fork → branch → commit → PR
2. Open an issue first for major changes
3. Follow existing code style

---

## 📄 License

MIT © [Akash Patel](https://github.com/AKASHPATEL123500)

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,50:302b63,100:24243e&height=120&section=footer&fontColor=ffffff" width="100%" />

<div align="center">

<strong>AuthStack</strong> — auth done right, the first time.

<br/><br/>

<a href="https://www.npmjs.com/package/authstack">npm</a> ·
<a href="https://github.com/AKASHPATEL123500/AuthStack">GitHub</a> ·
<a href="https://github.com/AKASHPATEL123500/AuthStack/issues">Issues</a>

</div>
