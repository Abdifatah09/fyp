const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST, 
//   port: Number(process.env.SMTP_PORT), 
//   secure: true, 
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// async function sendOtpEmail(to, code, purpose = "VERIFY_EMAIL") {
//   const subject =
//     purpose === "VERIFY_EMAIL"
//       ? "Your verification code"
//       : "Your password reset code";

//   const text =
//     purpose === "VERIFY_EMAIL"
//       ? `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`
//       : `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.`;

//   return transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to,
//     subject,
//     text,
//   });
// }

// async function sendWelcomeEmail(to, name = "") {
//   const safeName = String(name || "").trim();
//   const subject = "Welcome to the platform 🎉";

//   const text = [
//     safeName ? `Hi ${safeName},` : "Hi,",
//     "",
//     "Welcome! Your email is verified and your account is ready.",
//     "",
//     "Next steps:",
//     "• Go to your dashboard",
//     "• Pick a subject and start your first challenge",
//     "• Earn XP, badges, and achievements as you progress",
//     "",
//     "Good luck — and have fun coding!",
//   ].join("\n");

//   return transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to,
//     subject,
//     text,
//   });
// }

const postmark = require("postmark");

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

async function sendOtpEmail(to, code, purpose = "VERIFY_EMAIL") {
  const subject =
    purpose === "VERIFY_EMAIL"
      ? "Your verification code"
      : "Your password reset code";

  const text =
    purpose === "VERIFY_EMAIL"
      ? `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`
      : `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.`;

  return client.sendEmail({
    From: process.env.EMAIL_FROM,
    To: to,
    Subject: subject,
    TextBody: text,
  });
}

async function sendWelcomeEmail(to, name = "") {
  const safeName = String(name || "").trim();
  const subject = "Welcome to the platform 🎉";

  const text = [
    safeName ? `Hi ${safeName},` : "Hi,",
    "",
    "Welcome! Your email is verified and your account is ready.",
    "",
    "Next steps:",
    "• Go to your dashboard",
    "• Pick a subject and start your first challenge",
    "• Earn XP, badges, and achievements as you progress",
    "",
    "Good luck — and have fun coding!",
  ].join("\n");

  return client.sendEmail({
    From: process.env.EMAIL_FROM,
    To: to,
    Subject: subject,
    TextBody: text,
  });
}

module.exports = { sendOtpEmail, sendWelcomeEmail };
