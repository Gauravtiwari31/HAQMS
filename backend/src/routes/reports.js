const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/reports/doctor-stats ───────────────────────────────────────────
// FIX: Replaced sequential nested loop with parallel queries using Promise.all()
// FIX: Used aggregation queries instead of fetching all records to compute counts
// FIX: Removed artificial setTimeout delays
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all doctors first
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        department: true,
        consultationFee: true,
        experience: true,
      },
    });

    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // FIX: Run all stats queries in parallel with Promise.all() instead of a sequential loop
    const reportData = await Promise.all(
      doctors.map(async (doc) => {
        // Run all queries for each doctor in parallel
        const [totalAppointments, completedAppointments, cancelledAppointments, todayQueueTokens] =
          await Promise.all([
            prisma.appointment.count({ where: { doctorId: doc.id } }),
            prisma.appointment.count({ where: { doctorId: doc.id, status: 'COMPLETED' } }),
            prisma.appointment.count({ where: { doctorId: doc.id, status: 'CANCELLED' } }),
            prisma.queueToken.count({
              where: {
                doctorId: doc.id,
                createdAt: { gte: today, lt: tomorrow },
              },
            }),
          ]);

        // FIX: Calculate revenue using count * fee — no need to fetch all appointment records
        const revenue = completedAppointments * doc.consultationFee;

        return {
          id: doc.id,
          name: doc.name,
          specialization: doc.specialization,
          department: doc.department,
          consultationFee: doc.consultationFee,
          experience: doc.experience,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          pendingAppointments: totalAppointments - completedAppointments - cancelledAppointments,
          todayQueueSize: todayQueueTokens,
          revenue,
          completionRate:
            totalAppointments > 0
              ? Math.round((completedAppointments / totalAppointments) * 100)
              : 0,
        };
      })
    );

    res.json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[REPORTS ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
});

// ─── GET /api/reports/summary ─────────────────────────────────────────────────
// Overall system summary for dashboard
router.get('/summary', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      todayQueueTokens,
      pendingAppointments,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { appointmentDate: { gte: today, lt: tomorrow } },
      }),
      prisma.queueToken.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        todayQueueTokens,
        pendingAppointments,
      },
    });
  } catch (error) {
    console.error('[SUMMARY ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve summary.' });
  }
});

module.exports = router;
