const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Phone number validation regex
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

// ─── GET /api/patients ────────────────────────────────────────────────────────
// FIX: Replaced in-memory pagination and filtering with database-level operations
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, gender, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // FIX: Build where clause for database-level filtering (not in-memory!)
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (gender && gender !== 'All') {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    // FIX: Run count and data fetch in parallel with proper skip/take pagination
    const [totalPatients, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          age: true,
          gender: true,
          medicalHistory: true,
          createdAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalPatients / limitNum);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPatients,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error('[PATIENTS GET ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve patients.' });
  }
});

// ─── GET /api/patients/:id ────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          include: {
            doctor: {
              select: { id: true, name: true, specialization: true, department: true },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('[PATIENT GET BY ID ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve patient.' });
  }
});

// ─── POST /api/patients ───────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, email, phoneNumber, age, gender, medicalHistory } = req.body;

    // FIX: Added comprehensive validation including phone format
    if (!name || !phoneNumber || !age || !gender) {
      return res.status(400).json({ error: 'Name, phone number, age, and gender are required.' });
    }

    if (!PHONE_REGEX.test(phoneNumber)) {
      return res.status(400).json({ error: 'Please provide a valid phone number (7–20 digits, may include +, -, spaces).' });
    }

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) {
      return res.status(400).json({ error: 'Age must be a valid number between 0 and 150.' });
    }

    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({ error: 'Gender must be Male, Female, or Other.' });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
    }

    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : null,
        phoneNumber: phoneNumber.trim(),
        age: parsedAge,
        gender,
        medicalHistory: medicalHistory ? medicalHistory.trim() : null,
      },
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    console.error('[PATIENT CREATE ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to register patient.' });
  }
});

// ─── DELETE /api/patients/:id ─────────────────────────────────────────────────
// FIX: Using `authorizeAdmin` which actually enforces ADMIN role check
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    await prisma.patient.delete({ where: { id } });

    res.json({ success: true, message: `Patient record for ${patient.name} has been deleted.` });
  } catch (error) {
    console.error('[PATIENT DELETE ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to delete patient.' });
  }
});

module.exports = router;
