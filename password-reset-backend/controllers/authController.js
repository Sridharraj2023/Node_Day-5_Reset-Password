import bcrypt from 'bcryptjs'; // Missing import
import User from '../models/User.js'; // Adjust the path as needed
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Forgot Password Handler
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER, // Match with .env
                pass: process.env.EMAIL_PASS, // Match with .env
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER, // Use the email from the environment
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\nhttp://${req.headers.host}/reset-password/${resetToken}\n\nIf you did not request this, please ignore this email.\n`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password Handler
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Password reset token is invalid or has expired' });

        // Hash the password before saving
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to create a new user
export const createUser = async (email, password) => {
    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            email: email,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();

        console.log('User successfully created');
    } catch (error) {
        console.error('Error creating user:', error);
    }
};
