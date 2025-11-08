import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';
import { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail } from '../services/emailService';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate role
    if (!['guru', 'murid'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either guru or murid' });
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, verification_token, verification_expires) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id',
      [name, email, hashedPassword, role, verificationToken, verificationExpires]
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(email, name, verificationToken);
    
    if (!emailSent) {
      // If email failed, still return success but log the error
      console.error('Failed to send verification email to:', email);
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      user_id: result.rows[0].user_id,
      email_sent: emailSent
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user by verification token
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    const user = result.rows[0];

    // Update user as verified
    await pool.query(
      'UPDATE users SET email_verified = true, verification_token = NULL, verification_expires = NULL WHERE user_id = $1',
      [user.user_id]
    );

    // Send welcome email
    const welcomeEmailSent = await sendWelcomeEmail(user.email, user.name, user.role);
    
    res.status(200).json({ 
      message: 'Email verified successfully! Welcome to our platform.',
      verified: true,
      welcome_email_sent: welcomeEmailSent
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for email:', email);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !user.password) {
      console.log('❌ User not found or no password:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email, 'Verified:', user.email_verified);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password valid');

    // Check if email is verified
    if (!user.email_verified) {
      console.log('❌ Email not verified:', email);
      return res.status(403).json({ 
        error: 'Please verify your email before logging in. Check your email for the verification link.',
        email_verified: false 
      });
    }

    console.log('✅ Email verified, generating token');

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie for same-domain requests
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('✅ Login successful for:', email, 'Role:', user.role);

    // Also return token in response for localStorage (Docker compatibility)
    res.json({
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification email endpoint
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔄 Resend verification request for email:', email);

    if (!email) {
      console.log('❌ Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    console.log('🔍 Looking up user in database...');
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    console.log('✅ User found:', user.name, 'verified:', user.email_verified);

    // Check if already verified
    if (user.email_verified) {
      console.log('❌ Email already verified');
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    console.log('🔑 Generating new verification token...');
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    console.log('💾 Updating user with new token...');
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_expires = $2 WHERE user_id = $3',
      [verificationToken, verificationExpires, user.user_id]
    );

    // Send verification email
    console.log('📧 Sending verification email...');
    const emailSent = await sendVerificationEmail(email, user.name, verificationToken);
    
    if (emailSent) {
      console.log('✅ Verification email sent successfully');
      res.status(200).json({ message: 'Verification email sent successfully' });
    } else {
      console.log('❌ Failed to send verification email');
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const result = await pool.query('SELECT user_id, name, email, role FROM users WHERE user_id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
