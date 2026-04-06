const nodemailer = require("nodemailer");

// ── OUTLOOK SMTP TRANSPORTER ───────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,           // STARTTLS
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD
  },
  tls: {
    ciphers: "SSLv3"
  }
});

// ── SEND OTP EMAIL ─────────────────────────────────────────────
exports.sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"EduNexus" <${process.env.OUTLOOK_EMAIL}>`,
    to: toEmail,
    subject: "EduNexus — Your OTP for Registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #4F46E5;">EduNexus</h2>
        <p>Hi there,</p>
        <p>Use the OTP below to verify your account. It is valid for <strong>5 minutes</strong>.</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 12px;
          color: #4F46E5;
          text-align: center;
          padding: 20px;
          background: #F3F4F6;
          border-radius: 8px;
          margin: 24px 0;
        ">
          ${otp}
        </div>
        <p style="color: #6B7280; font-size: 13px;">
          If you did not register on EduNexus, please ignore this email.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
