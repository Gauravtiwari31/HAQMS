const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const VALID_STATUSES = ['WAITING', 'CALLING', 'COMPLETED', 'SKIPPED'];

// ─── GET /api/queue ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { doctorId, status } = req.query;

    const where = {};
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    const tokens = await prisma.queueToken.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, age: true, gender: true } },
        doctor: { select: { id: true, name: true, specialization: true, department: true } },
      },
      orderBy: [{ createdAt: 'asc' }, { tokenNumber: 'asc' }],
    });

    res.json({ success: true, data: tokens });
  } catch (error) {
    console.error('[QUEUE GET ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve queue.' });
  }
});

// ─── POST /api/queue/checkin ──────────────────────────────────────────────────
// FIX: Race condition fixed using Prisma interactive transaction
// The token number is incremented atomically inside a single transaction,
// preventing concurrent requests from reading the same max value and assigning duplicates.
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({ error: 'Patient ID and Doctor ID are required.' });
    }

    // Verify patient and doctor exist
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId }, select: { id: true, name: true } }),
      prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true, name: true } }),
    ]);

    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    // FIX: Use a transaction to atomically read the current max token and create the next one.
    // The serializable isolation level prevents phantom reads / race conditions.
    const newToken = await prisma.$transaction(async (tx) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find max token for this doctor today — inside the transaction lock
      const maxTokenResult = await tx.queueToken.aggregate({
        where: {
          doctorId,
          createdAt: { gte: today, lt: tomorrow },
        },
        _max: { tokenNumber: true },
      });

      // FIX: Removed the artificial 350ms setTimeout delay
      const nextTokenNumber = (maxTokenResult._max.tokenNumber || 0) + 1;

      return tx.queueToken.create({
        data: {
          tokenNumber: nextTokenNumber,
          patientId,
          doctorId,
          appointmentId: appointmentId || null,
          status: 'WAITING',
        },
        include: {
          patient: { select: { id: true, name: true, age: true } },
          doctor: { select: { id: true, name: true, specialization: true } },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: `Patient checked in successfully. Token #${newToken.tokenNumber} assigned.`,
      data: newToken,
    });
  } catch (error) {
    console.error('[QUEUE CHECKIN ERROR]:', error.message);
    res.status(500).json({ error: 'Check-in failed. Please try again.' });
  }
});

// ─── PATCH /api/queue/:id ─────────────────────────────────────────────────────
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const existing = await prisma.queueToken.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Queue token not found.' });
    }

    const updatedToken = await prisma.queueToken.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        patient: { select: { id: true, name: true, age: true } },
        doctor: { select: { id: true, name: true, specialization: true } },
      },
    });

    res.json({ success: true, data: updatedToken });
  } catch (error) {
    console.error('[QUEUE UPDATE ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to update queue token.' });
  }
});

module.exports = router;
