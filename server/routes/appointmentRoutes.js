const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getBookedSlots
} = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Semua rute janji temu membutuhkan autentikasi
router.post('/', verifyToken, createAppointment);
router.get('/my-appointments', verifyToken, getMyAppointments);
router.get('/booked-slots', verifyToken, getBookedSlots);
router.put('/:id/cancel', verifyToken, cancelAppointment);
router.put('/:id/status', verifyToken, updateAppointmentStatus);

module.exports = router;