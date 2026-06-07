const nodemailer = require("nodemailer");

/**
 * Creates a Nodemailer transporter using Gmail SMTP.
 * Credentials are read from environment variables.
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER || process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASS, // Use Gmail App Password, NOT your regular password
        },
        tls: {
            rejectUnauthorized: false
        },
        family: 4 // Force IPv4 routing to bypass Render's IPv6 issue
    });
};

/**
 * Sends a password reset email to the user.
 * @param {string} toEmail   - Recipient email address
 * @param {string} resetLink - Full reset URL with token
 * @param {string} userName  - User's display name for personalisation
 */
const sendPasswordResetEmail = async (toEmail, resetLink, userName) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"AI Interview Prep" <${process.env.EMAIL_USER || process.env.EMAIL_ID}>`,
        to: toEmail,
        subject: "Reset Your Password — AI Interview Prep",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;margin-bottom:16px;">
                <span style="font-size:28px;">⚡</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">AI Interview Prep</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#0f172a;">Hi, ${userName || "there"}!</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
                We received a request to reset the password for your account. Click the button below to create a new password. This link will expire in <strong style="color:#6366f1;">15 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${resetLink}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:14px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(99,102,241,0.35);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                  <strong style="color:#374151;">Didn't request this?</strong><br/>
                  You can safely ignore this email. Your password will remain unchanged and the link will expire automatically.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${resetLink}" style="color:#6366f1;word-break:break-all;font-size:12px;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:11px;color:#cbd5e1;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
                © ${new Date().getFullYear()} AI Interview Prep · Secure SSL Encryption
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
};

/**
 * Sends a verification OTP email to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp     - 6-digit verification code
 * @param {string} userName - User's display name
 */
const sendOTPEmail = async (toEmail, otp, userName) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"AI Interview Prep" <${process.env.EMAIL_USER || process.env.EMAIL_ID}>`,
        to: toEmail,
        subject: `${otp} is your verification code`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;margin-bottom:16px;">
                <span style="font-size:28px;">🔐</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">AI Interview Prep</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;">Email Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#0f172a;">Verify your identity</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
                Hi ${userName || "there"}, thank you for joining us! Please use the following code to verify your email address. This code will expire in <strong style="color:#6366f1;">10 minutes</strong>.
              </p>

              <!-- OTP Code Display -->
              <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
                <span style="display:block;font-family:'Courier New', Courier, monospace;font-size:42px;font-weight:800;letter-spacing:12px;color:#6366f1;margin-left:12px;">${otp}</span>
              </div>

              <!-- Security Note -->
              <div style="background:#fff7ed;border:1px solid #ffedd5;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.6;">
                  <strong>Security Reminder:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                </p>
              </div>

              <p style="margin:0;font-size:14px;color:#64748b;text-align:center;">
                Didn't create an account? You can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:11px;color:#cbd5e1;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
                © ${new Date().getFullYear()} AI Interview Prep · Empowering Careers
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail, sendOTPEmail };
