const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// FIX: Use env var only — no hardcoded fallback secret
const JWT_SECRET = process.env.JWT_SECRET;

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // FIX: Removed plaintext password logging
    // FIX: Added proper email format + password strength validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: role || 'RECEPTIONIST',
      },
      // FIX: Never return the password hash — select only safe fields
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // FIX: Consistent API response format
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: { user },
    });
  } catch (error) {
    console.error('[REGISTER ERROR]:', error.message);
    // FIX: Never leak database error details to client
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIX: Removed plaintext password logging
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // FIX: Always run bcrypt compare to prevent timing attacks (constant-time comparison)
    const dummyHash = '$2a$12$dummyhashforpreventingtimingattack.thatdoesntmatch';
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // FIX: Token expires in 8 hours (reasonable work session), not 365 days
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // FIX: Consistent API response format
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]:', error.message);
    // FIX: Never leak stack traces to client
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // FIX: Consistent response format
    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('[AUTH ME ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

module.exports = router;
