import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; // Ensure you use .js extension if required by your configuration
import bcrypt from 'bcryptjs'; // Ensure bcrypt is imported
import { createUser } from '../controllers/authController.js';

const router = express.Router();

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);


// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',

    
    auth: {      

        
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Request Password Reset
router.post('/password-reset-request', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate Reset Token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${token}`;

        // Send Email
        const mailOptions = {
            to: email,
            from: process.env.EMAIL_USER, 
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Failed to send email.' });
            }
            res.status(200).json({ message: 'Reset link sent to your email.' });
        });
    } catch (error) {
        console.error('Error in password-reset-request:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Reset Password
router.post('/password-reset', async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash the password before saving
        user.password = await bcrypt.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).json({ message: 'Password has been successfully reset.' });
    } catch (error) {
        console.error('Error in password-reset:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Route to register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        await createUser(email, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

export default router;
