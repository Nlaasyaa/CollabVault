
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Export transporter for testing
export const verifyConnection = async () => {
    try {
        await transporter.verify();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const sendVerificationEmail = async (email, token) => {
    // Point to Frontend URL (port 3000) so the React page handles the verification UX
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`[EMAIL DEV] Sending verification email to ${email}`);
    console.log(`[EMAIL DEV] Link: ${verificationLink}`);

    if (!process.env.GMAIL_USER) {
        console.log("No GMAIL_USER defined, skipping actual email sending.");
        throw new Error("Server misconfiguration: No email credentials.");
    }

    try {
        const info = await transporter.sendMail({
            from: '"CollabVault Support" <no-reply@collabvault.com>',
            to: email,
            subject: "Verify your email address",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to CollabVault!</h1>
            <p>Please verify your email address to activate your account.</p>
            <p>
                <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </p>
            <p style="margin-top: 20px; color: #666;">Or copy this link:</p>
            <p style="color: #666;">${verificationLink}</p>
            <p style="font-size: 12px; color: #999;">This link expires in 1 hour.</p>
        </div>
      `,
        });
        console.log("Message sent: %s", info.messageId);
        return verificationLink;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Throw so backend knows it failed
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`[EMAIL DEV] Sending password reset email to ${email}`);
    console.log(`[EMAIL DEV] Link: ${resetLink}`);

    if (!process.env.GMAIL_USER) {
        console.log("No GMAIL_USER defined, skipping actual email sending.");
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"CollabVault Support" <no-reply@collabvault.com>',
            to: email,
            subject: "Reset your password",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2563eb;">Password Reset Request</h1>
            <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
            <p>
                <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </p>
            <p style="margin-top: 20px; color: #666;">Or copy this link:</p>
            <p style="color: #666;">${resetLink}</p>
            <p style="font-size: 12px; color: #999;">This link expires in 1 hour.</p>
        </div>
      `,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
