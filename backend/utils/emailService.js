const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: Number(process.env.SMTP_PORT), 
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  });
}

module.exports = { sendOtpEmail };
