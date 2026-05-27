const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/doctors ─────────────────────────────────────────────────────────
// FIX: Replaced vulnerable $queryRawUnsafe with parameterized Prisma ORM query
// This completely eliminates the SQL injection vulnerability
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, specialization } = req.query;

    const where = {};

    if (search) {
      // FIX: Using Prisma's `contains` with `mode: 'insensitive'` — fully parameterized, no injection risk
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (specialization && specialization !== 'All') {
      where.specialization = { equals: specialization, mode: 'insensitive' };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        specialization: true,
        department: true,
        consultationFee: true,
        experience: true,
        availableFrom: true,
        availableTo: true,
        userId: true,
      },
    });

    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error('[DOCTORS GET ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve doctors.' });
  }
});

// ─── GET /api/doctors/stats ───────────────────────────────────────────────────
// FIX: Replaced sequential awaits with Promise.all() for parallel execution
router.get('/stats', authenticate, async (req, res) => {
  try {
    // FIX: All independent queries run in parallel — much faster
    const [totalDoctors, surgeonsCount, averageFeeResult, highestExperienceResult] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { department: 'Surgery' } }),
      prisma.doctor.aggregate({ _avg: { consultationFee: true } }),
      prisma.doctor.aggregate({ _max: { experience: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalDoctors,
        surgeons: surgeonsCount,
        averageFee: Math.round(averageFeeResult._avg.consultationFee || 0),
        maxExperience: highestExperienceResult._max.experience || 0,
      },
    });
  } catch (error) {
    console.error('[DOCTOR STATS ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve doctor statistics.' });
  }
});

// ─── GET /api/doctors/:id ─────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10,
          include: {
            patient: { select: { id: true, name: true, age: true } },
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error('[DOCTOR GET BY ID ERROR]:', error.message);
    res.status(500).json({ error: 'Failed to retrieve doctor.' });
  }
});

module.exports = router;
