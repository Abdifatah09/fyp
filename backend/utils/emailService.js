const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verifySmtpConnection() {
  await transporter.verify();
  console.log("✅ SMTP ready: emails can be sent");
}

async function sendOtpEmail(to, code, purpose = "VERIFY_EMAIL") {
  const subject =
    purpose === "VERIFY_EMAIL"
      ? "Your verification code"
      : "Your password reset code";

  const text =
    purpose === "VERIFY_EMAIL"
      ? `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`
      : `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.`;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

module.exports = { sendOtpEmail, verifySmtpConnection };
