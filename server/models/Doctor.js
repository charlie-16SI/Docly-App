const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  hospital: { type: String, required: true },
  bio: { type: String, default: '' },
  isApproved: { type: Boolean, default: false }, // Persetujuan dari Admin
  availableSlots: [
    {
      day: String, // Contoh: 'Senin', 'Selasa'
      timeSlots: [String] // Contoh: ['09:00 - 10:00', '14:00 - 15:00']
    }
  ]
});

module.exports = mongoose.model('Doctor', doctorSchema);