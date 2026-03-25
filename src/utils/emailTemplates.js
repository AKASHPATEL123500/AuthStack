export const otpTemplate = (otp, type = "verification") => {
  const titles = {
    verification: "Verify Your Email",
    forgotPassword: "Reset Your Password",
  };
  const messages = {
    verification: "Use the OTP below to verify your email address.",
    forgotPassword: "Use the OTP below to reset your password.",
  };
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="margin: 0 0 8px; font-size: 20px; color: #111;">${titles[type]}</h2>
      <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">${messages[type]}</p>
      <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #111;">
        ${otp}
      </div>
      <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>
  `;
};

export const loginAlertTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="margin: 0 0 8px; font-size: 20px; color: #111;">New Login Detected</h2>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Hi <strong>${name}</strong>, a new login was detected on your account. If this was not you, please reset your password immediately.</p>
    </div>
  `;
};
