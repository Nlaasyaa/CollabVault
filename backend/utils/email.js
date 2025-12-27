import { Resend } from 'resend';
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Export verification for health checks
export const verifyConnection = async () => {
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "Missing RESEND_API_KEY" };
    }
    return { success: true };
};

export const sendVerificationEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`[EMAIL DEV] Sending verification email to ${email}`);
    console.log(`[EMAIL DEV] Link: ${verificationLink}`);

    if (!process.env.RESEND_API_KEY) {
        console.log("No RESEND_API_KEY defined, skipping actual email sending.");
        throw new Error("Server misconfiguration: No email credentials.");
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Default for free tier
            to: email, // Free tier only sends to the account owner's email. Did you verify didikadiscodancer@gmail.com on Resend?
            subject: 'Verify your email address - CollabVault',
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
            `
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw error;
        }

        console.log("Message sent:", data);
        return verificationLink;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`[EMAIL DEV] Sending password reset email to ${email}`);

    if (!process.env.RESEND_API_KEY) return;

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Reset your password - CollabVault',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #2563eb;">Password Reset Request</h1>
                <p>Click below to reset your password:</p>
                <p>
                    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </p>
                <p style="font-size: 12px; color: #999;">Expires in 1 hour.</p>
            </div>
            `
        });

        if (error) {
            console.error("Resend API Error:", error);
        } else {
            console.log("Password reset sent:", data);
        }
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


