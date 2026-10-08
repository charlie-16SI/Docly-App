const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/UserTemp'); // Sesuaikan path model User
const Doctor = require('./models/Doctor'); // Sesuaikan path model Doctor

const doctorsData = [
  {
    name: 'dr. Andi Pratama, Sp.PD',
    email: 'dr.andi@gmail.com',
    password: 'password123',
    phone: '081234567001',
    specialization: 'Penyakit Dalam',
    experienceYears: 8,
    consultationFee: 250000,
    hospital: 'RS Medika Utama',
    bio: 'Spesialis penyakit dalam dengan keahlian hipertensi dan diabetes.'
  },
  {
    name: 'dr. Siti Rahma, Sp.A',
    email: 'dr.siti@gmail.com',
    password: 'password123',
    phone: '081234567002',
    specialization: 'Anak',
    experienceYears: 6,
    consultationFee: 200000,
    hospital: 'RS Siloam',
    bio: 'Dokter spesialis anak dan tumbuh kembang balita.'
  },
  {
    name: 'dr. Budi Santoso, Sp.B',
    email: 'dr.budi@gmail.com',
    password: 'password123',
    phone: '081234567003',
    specialization: 'Bedah Umum',
    experienceYears: 10,
    consultationFee: 300000,
    hospital: 'RS Hermina',
    bio: 'Penanganan tindakan bedah umum dan konsultasi pasca operasi.'
  },
  {
    name: 'dr. Maya Putri, Sp.DVE',
    email: 'dr.maya@gmail.com',
    password: 'password123',
    phone: '081234567004',
    specialization: 'Kulit & Kelamin',
    experienceYears: 5,
    consultationFee: 220000,
    hospital: 'RS Harapan Bunda',
    bio: 'Perawatan kesehatan kulit, jerawat, dan estetika medis.'
  },
  {
    name: 'dr. Hendra Wijaya, Sp.OT',
    email: 'dr.hendra@gmail.com',
    password: 'password123',
    phone: '081234567005',
    specialization: 'Ortopedi (Tulang)',
    experienceYears: 12,
    consultationFee: 350000,
    hospital: 'RS Mitra Keluarga',
    bio: 'Spesialis cedera olahraga dan kesehatan persendian.'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/docly'); // Sesuaikan URI MongoDB milikmu
    console.log('Terhubung ke MongoDB...');

    for (const data of doctorsData) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) continue;

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: 'doctor'
      });

      await Doctor.create({
        userId: user._id,
        specialization: data.specialization,
        experienceYears: data.experienceYears,
        consultationFee: data.consultationFee,
        hospital: data.hospital,
        bio: data.bio,
        isApproved: true
      });
    }

    console.log('Berhasil menambahkan 5 data dokter!');
    process.exit();
  } catch (err) {
    console.error('Gagal menambahkan data:', err);
    process.exit(1);
  }
};

seedDB();