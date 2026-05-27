const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Valid appointment status values
const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

// ─── GET /api/appointments ────────────────────────────────────────────────────
// FIX: Replaced N+1 query loop with a single Prisma query using `include`
router.get('/', authenticate, async (req, res) => {
  try {
    const { doctorId, status, patientId } = req.query;

    const where = {};
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    // FIX: Single query with JOIN-equivalent `include` — eliminates N+1 completely
    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: 'asc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            age: true,
            gender: true,
            medicalHistory: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            department: true,
            consultationFee: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('[APPOINTMENTS GET ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve appointments.' });
  }
});

// ─── POST /api/appointments ───────────────────────────────────────────────────
// FIX: Proper duplicate check using date range (not exact millisecond matching)
router.post('/', authenticate, async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, reason } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({ error: 'Patient ID, Doctor ID, and appointment date are required.' });
    }

    const appDate = new Date(appointmentDate);
    if (isNaN(appDate.getTime())) {
      return res.status(400).json({ error: 'Invalid appointment date format.' });
    }

    if (appDate < new Date()) {
      return res.status(400).json({ error: 'Appointment date cannot be in the past.' });
    }

    // FIX: Check for appointments within a 30-minute window (not exact millisecond!)
    // This properly prevents double-booking the same doctor at the same time slot
    const windowStart = new Date(appDate.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(appDate.getTime() + 30 * 60 * 1000);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        status: { not: 'CANCELLED' },
        appointmentDate: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        error: 'This time slot is not available. The doctor already has an appointment within 30 minutes of this time.',
      });
    }

    // Verify patient and doctor exist
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId }, select: { id: true, name: true } }),
      prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true, name: true } }),
    ]);

    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: appDate,
        reason: reason ? reason.trim() : '',
        status: 'PENDING',
      },
      include: {
        patient: { select: { id: true, name: true, phoneNumber: true } },
        doctor: { select: { id: true, name: true, specialization: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: appointment,
    });
  } catch (error) {
    console.error('[APPOINTMENT CREATE ERROR]:', error.message);
    // Handle unique constraint violation (DB-level double booking prevention)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'This exact time slot is already booked for this doctor.' });
    }
    res.status(500).json({ error: 'Failed to book appointment.' });
  }
});

// ─── PATCH /api/appointments/:id ──────────────────────────────────────────────
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true, specialization: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[APPOINTMENT UPDATE ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to update appointment.' });
  }
});

module.exports = router;
