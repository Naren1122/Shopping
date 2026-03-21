import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Debug: log email user to verify it's loaded
console.log("Email User:", process.env.EMAIL_USER);
console.log(
  "Email Pass length:",
  process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
);

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Generate reset URL - using query parameter format
    const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your Bazar account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetURL}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetURL}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    return false;
  }
};

export default transporter;
