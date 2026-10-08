const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor'); // Ditambahkan untuk mencari profil dokter

// 1. Membuat janji temu baru
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Dokter, tanggal, dan jam wajib diisi' });
    }

    // Normalisasi tanggal target menjadi format YYYY-MM-DD
    const targetDateStr = typeof date === 'string'
      ? date.split('T')[0]
      : new Date(date).toISOString().split('T')[0];

    // Normalisasi jam target
    const normalizeTime = (str) => (str ? str.replace(/WIB/gi, '').replace(/\s+/g, '').trim() : '');
    const targetTime = normalizeTime(timeSlot);

    // Ambil seluruh janji temu yang masih aktif dari database
    const activeAppointments = await Appointment.find({
      status: { $nin: ['cancelled', 'rejected', 'batal', 'ditolak'] }
    }).populate('doctorId');

    // Cek bentrok jadwal
    const isBentrok = activeAppointments.some((app) => {
      const appDocId = app.doctorId?._id?.toString() || app.doctorId?.toString();
      const appDocUserId = app.doctorId?.userId?._id?.toString() || app.doctorId?.userId?.toString();
      const targetDocId = doctorId.toString();

      const isSameDoctor = appDocId === targetDocId || appDocUserId === targetDocId;
      if (!isSameDoctor) return false;

      const appDateStr = typeof app.date === 'string'
        ? app.date.split('T')[0]
        : new Date(app.date).toISOString().split('T')[0];

      if (appDateStr !== targetDateStr) return false;

      const appTime = normalizeTime(app.timeSlot);
      return appTime === targetTime;
    });

    if (isBentrok) {
      return res.status(400).json({
        message: 'Jadwal pada tanggal dan jam ini sudah dipesan! Silakan pilih jam lain.'
      });
    }

    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date,
      timeSlot,
      symptoms,
      status: 'pending'
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Janji temu berhasil dibuat', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat janji temu', error: error.message });
  }
};

// 2. Mengambil daftar janji temu milik user (pasien / dokter)
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    // PERBAIKAN: Cari profil dokter yang terhubung dengan userId yang sedang login
    const doctorProfile = await Doctor.findOne({ userId: userId });

    // Ambil janji temu di mana user bertindak sebagai pasien ATAU sebagai dokter
    const appointments = await Appointment.find({
      $or: [
        { patientId: userId },
        { doctorId: doctorProfile ? doctorProfile._id : null }
      ]
    })
      .populate('doctorId patientId')
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data janji temu', error: error.message });
  }
};

// 3. Mengambil jam/slot yang sudah terisi berdasarkan dokter dan tanggal
exports.getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID dan tanggal wajib diisi' });
    }

    const targetDateStr = typeof date === 'string'
      ? date.split('T')[0]
      : new Date(date).toISOString().split('T')[0];

    const activeAppointments = await Appointment.find({
      doctorId,
      status: { $nin: ['cancelled', 'rejected', 'batal', 'ditolak'] }
    });

    const bookedSlots = activeAppointments
      .filter((app) => {
        const appDateStr = typeof app.date === 'string'
          ? app.date.split('T')[0]
          : new Date(app.date).toISOString().split('T')[0];
        return appDateStr === targetDateStr;
      })
      .map((app) => app.timeSlot);

    res.status(200).json({ bookedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil slot jadwal terisi', error: error.message });
  }
};

// 4. Membatalkan janji temu
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Janji temu tidak ditemukan' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Janji temu berhasil dibatalkan', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membatalkan janji temu', error: error.message });
  }
};

// 5. Memperbarui status janji temu (Disetujui/Ditolak/Selesai)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status wajib diisi' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Janji temu tidak ditemukan' });
    }

    res.status(200).json({ message: 'Status janji temu berhasil diperbarui', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status janji temu', error: error.message });
  }
};