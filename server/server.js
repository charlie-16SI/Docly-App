const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Jalankan Route
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API Docly Berhasil Jalan!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Terhubung!'))
  .catch((err) => console.error('Gagal koneksi MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Backend berjalan di port ${PORT}`));

const doctorRoutes = require('./routes/doctorRoutes');

// Pasang rute
app.use('/api/doctors', doctorRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');

// Pasang rute
app.use('/api/appointments', appointmentRoutes);