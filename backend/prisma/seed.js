const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password once
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ─── Users ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@haqms.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@haqms.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const receptionist1 = await prisma.user.upsert({
    where: { email: 'reception1@haqms.com' },
    update: {},
    create: {
      name: 'Sarah Mitchell',
      email: 'reception1@haqms.com',
      password: hashedPassword,
      role: 'RECEPTIONIST',
    },
  });

  const doctorUser1 = await prisma.user.upsert({
    where: { email: 'doctor1@haqms.com' },
    update: {},
    create: {
      name: 'Dr. James Carter',
      email: 'doctor1@haqms.com',
      password: hashedPassword,
      role: 'DOCTOR',
    },
  });

  const doctorUser2 = await prisma.user.upsert({
    where: { email: 'doctor2@haqms.com' },
    update: {},
    create: {
      name: 'Dr. Priya Sharma',
      email: 'doctor2@haqms.com',
      password: hashedPassword,
      role: 'DOCTOR',
    },
  });

  const doctorUser3 = await prisma.user.upsert({
    where: { email: 'doctor3@haqms.com' },
    update: {},
    create: {
      name: 'Dr. Michael Chen',
      email: 'doctor3@haqms.com',
      password: hashedPassword,
      role: 'DOCTOR',
    },
  });

  console.log('✅ Users seeded');

  // ─── Doctors ───────────────────────────────────────────────────────────────
  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {},
    create: {
      name: 'Dr. James Carter',
      specialization: 'Cardiology',
      department: 'Internal Medicine',
      consultationFee: 150,
      experience: 12,
      availableFrom: '09:00',
      availableTo: '17:00',
      userId: doctorUser1.id,
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {},
    create: {
      name: 'Dr. Priya Sharma',
      specialization: 'Neurology',
      department: 'Surgery',
      consultationFee: 200,
      experience: 8,
      availableFrom: '10:00',
      availableTo: '18:00',
      userId: doctorUser2.id,
    },
  });

  const doctor3 = await prisma.doctor.upsert({
    where: { userId: doctorUser3.id },
    update: {},
    create: {
      name: 'Dr. Michael Chen',
      specialization: 'Orthopedics',
      department: 'Surgery',
      consultationFee: 175,
      experience: 15,
      availableFrom: '08:00',
      availableTo: '16:00',
      userId: doctorUser3.id,
    },
  });

  console.log('✅ Doctors seeded');

  // ─── Patients ──────────────────────────────────────────────────────────────
  const patient1 = await prisma.patient.upsert({
    where: { id: 'patient-bruce-wayne' },
    update: {},
    create: {
      id: 'patient-bruce-wayne',
      name: 'Bruce Wayne',
      email: 'bruce@wayne.com',
      phoneNumber: '555-0100',
      age: 38,
      gender: 'Male',
      medicalHistory: null, // Intentionally null to test crash bug
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { id: 'patient-clark-kent' },
    update: {},
    create: {
      id: 'patient-clark-kent',
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      phoneNumber: '555-0101',
      age: 32,
      gender: 'Male',
      medicalHistory: null,
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: { id: 'patient-diana-prince' },
    update: {},
    create: {
      id: 'patient-diana-prince',
      name: 'Diana Prince',
      email: 'diana@themyscira.gov',
      phoneNumber: '555-0102',
      age: 28,
      gender: 'Female',
      medicalHistory: 'Seasonal allergies. No known drug allergies. Regular cardiovascular checkups.',
    },
  });

  const patient4 = await prisma.patient.upsert({
    where: { id: 'patient-tony-stark' },
    update: {},
    create: {
      id: 'patient-tony-stark',
      name: 'Tony Stark',
      email: 'tony@starkindustries.com',
      phoneNumber: '555-0103',
      age: 45,
      gender: 'Male',
      medicalHistory: 'History of chest trauma. Cardiac monitoring required. Mild anxiety disorder.',
    },
  });

  const patient5 = await prisma.patient.upsert({
    where: { id: 'patient-natasha-romanoff' },
    update: {},
    create: {
      id: 'patient-natasha-romanoff',
      name: 'Natasha Romanoff',
      email: 'natasha@shield.gov',
      phoneNumber: '555-0104',
      age: 35,
      gender: 'Female',
      medicalHistory: 'Excellent physical condition. Mild insomnia. No chronic conditions.',
    },
  });

  console.log('✅ Patients seeded');

  // ─── Appointments ──────────────────────────────────────────────────────────
  const now = new Date();
  const appointment1 = await prisma.appointment.upsert({
    where: { id: 'appt-1' },
    update: {},
    create: {
      id: 'appt-1',
      patientId: patient1.id,
      doctorId: doctor1.id,
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0),
      reason: 'Annual cardiac checkup',
      status: 'COMPLETED',
    },
  });

  const appointment2 = await prisma.appointment.upsert({
    where: { id: 'appt-2' },
    update: {},
    create: {
      id: 'appt-2',
      patientId: patient3.id,
      doctorId: doctor1.id,
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0),
      reason: 'Follow-up echocardiogram',
      status: 'PENDING',
    },
  });

  const appointment3 = await prisma.appointment.upsert({
    where: { id: 'appt-3' },
    update: {},
    create: {
      id: 'appt-3',
      patientId: patient4.id,
      doctorId: doctor1.id,
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0),
      reason: 'Chest pain evaluation',
      status: 'PENDING',
    },
  });

  const appointment4 = await prisma.appointment.upsert({
    where: { id: 'appt-4' },
    update: {},
    create: {
      id: 'appt-4',
      patientId: patient2.id,
      doctorId: doctor2.id,
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0),
      reason: 'Recurring headaches and vision issues',
      status: 'COMPLETED',
    },
  });

  const appointment5 = await prisma.appointment.upsert({
    where: { id: 'appt-5' },
    update: {},
    create: {
      id: 'appt-5',
      patientId: patient5.id,
      doctorId: doctor3.id,
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0),
      reason: 'Knee pain assessment',
      status: 'PENDING',
    },
  });

  console.log('✅ Appointments seeded');

  // ─── Queue Tokens ──────────────────────────────────────────────────────────
  await prisma.queueToken.upsert({
    where: { id: 'token-1' },
    update: {},
    create: {
      id: 'token-1',
      tokenNumber: 1,
      patientId: patient1.id,
      doctorId: doctor1.id,
      appointmentId: appointment1.id,
      status: 'COMPLETED',
    },
  });

  await prisma.queueToken.upsert({
    where: { id: 'token-2' },
    update: {},
    create: {
      id: 'token-2',
      tokenNumber: 2,
      patientId: patient3.id,
      doctorId: doctor1.id,
      appointmentId: appointment2.id,
      status: 'CALLING',
    },
  });

  await prisma.queueToken.upsert({
    where: { id: 'token-3' },
    update: {},
    create: {
      id: 'token-3',
      tokenNumber: 3,
      patientId: patient4.id,
      doctorId: doctor1.id,
      appointmentId: appointment3.id,
      status: 'WAITING',
    },
  });

  await prisma.queueToken.upsert({
    where: { id: 'token-4' },
    update: {},
    create: {
      id: 'token-4',
      tokenNumber: 1,
      patientId: patient2.id,
      doctorId: doctor2.id,
      appointmentId: appointment4.id,
      status: 'COMPLETED',
    },
  });

  await prisma.queueToken.upsert({
    where: { id: 'token-5' },
    update: {},
    create: {
      id: 'token-5',
      tokenNumber: 1,
      patientId: patient5.id,
      doctorId: doctor3.id,
      appointmentId: appointment5.id,
      status: 'CALLING',
    },
  });

  console.log('✅ Queue tokens seeded');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Credentials (password: password123):');
  console.log('   Admin:        admin@haqms.com');
  console.log('   Receptionist: reception1@haqms.com');
  console.log('   Doctor 1:     doctor1@haqms.com (Dr. James Carter - Cardiology)');
  console.log('   Doctor 2:     doctor2@haqms.com (Dr. Priya Sharma - Neurology)');
  console.log('   Doctor 3:     doctor3@haqms.com (Dr. Michael Chen - Orthopedics)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });