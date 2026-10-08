import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({ date: '', timeSlot: '', symptoms: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('Semua');
  const [bookedSlots, setBookedSlots] = useState([]);

  const bookingFormRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const timeSlots = [
    '08:00 - 09:00 WIB',
    '09:00 - 10:00 WIB',
    '10:00 - 11:00 WIB',
    '11:00 - 12:00 WIB',
    '13:00 - 14:00 WIB',
    '14:00 - 15:00 WIB',
    '15:00 - 16:00 WIB',
    '16:00 - 17:00 WIB'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && bookingData.date) {
      fetchBookedSlots();
    } else {
      setBookedSlots([]);
    }
  }, [selectedDoctor, bookingData.date]);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      toast.error('Gagal mengambil data dokter');
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const res = await API.get(
        `/appointments/booked-slots?doctorId=${selectedDoctor._id}&date=${bookingData.date}`
      );
      // PERUBAHAN: Pastikan kita mengambil array 'bookedSlots' dari dalam objek res.data
      setBookedSlots(res.data.bookedSlots || []);
    } catch (err) {
      console.error('Gagal memuat slot terisi');
      setBookedSlots([]); // Fallback ke array kosong jika gagal
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Berhasil logout');
    navigate('/login');
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setBookingData({ date: '', timeSlot: '', symptoms: '' });
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.warning('Silakan login terlebih dahulu untuk membuat janji temu!');
      return;
    }

    const doctorName = selectedDoctor?.userId?.name || selectedDoctor?.name || 'Dokter';

    const isConfirmed = window.confirm(
      `Konfirmasi Janji Temu:\n\nDokter: ${doctorName}\nTanggal: ${bookingData.date}\nJam: ${bookingData.timeSlot}\n\nLanjutkan pemesanan?`
    );

    if (isConfirmed) {
      try {
        await API.post('/appointments', {
          doctorId: selectedDoctor._id,
          ...bookingData
        });
        toast.success('Janji temu berhasil dibuat!');
        setSelectedDoctor(null);
        setBookingData({ date: '', timeSlot: '', symptoms: '' });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal membuat janji temu');
      }
    }
  };

  const specializations = [
    'Semua',
    ...new Set(doctors.map((doc) => doc.specialization).filter(Boolean))
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const doctorName = doc.userId?.name || doc.name || '';
    const hospitalName = doc.hospital || '';
    const matchesSearch =
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === 'Semua' || doc.specialization === selectedSpecialization;

    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header & Navigasi */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Cari & Jadwalkan Dokter
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Halo, <strong className="text-blue-600">{user?.name || 'Pasien'}</strong>! Temukan dokter spesialis terbaik.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/my-appointments"
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              📋 Janji Temu Saya
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-all"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cari Dokter / Rumah Sakit
              </label>
              <input
                type="text"
                placeholder="Ketik nama dokter atau RS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Spesialisasi
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctor List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">Tidak ada dokter yang sesuai.</p>
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {doc.userId?.name || doc.name || 'dr. Spesialis'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">📍 {doc.hospital}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                      {doc.specialization}
                    </span>
                  </div>
                  {doc.bio && (
                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">{doc.bio}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                      Biaya
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      Rp {doc.consultationFee?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectDoctor(doc)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                  >
                    Buat Janji
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Booking */}
        {selectedDoctor && (
          <div
            ref={bookingFormRef}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-100 max-w-2xl mx-auto mb-12"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Form Janji Temu</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Dokter:{' '}
                  <strong className="text-blue-600">
                    {selectedDoctor.userId?.name || selectedDoctor.name}
                  </strong>{' '}
                  ({selectedDoctor.specialization})
                </p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal Booking
                  </label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, date: e.target.value, timeSlot: '' })
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jam Praktek (Slot)
                  </label>
                  <select
                    value={bookingData.timeSlot}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, timeSlot: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Jam Praktek --</option>
                    {timeSlots.map((slot, index) => {
                      // PERUBAHAN: Pastikan isBooked menggunakan array yang selamat
                      const safeBookedSlots = Array.isArray(bookedSlots) ? bookedSlots : [];
                      const isBooked = safeBookedSlots.includes(slot);
                      return (
                        <option
                          key={index}
                          value={slot}
                          disabled={isBooked}
                          className={isBooked ? 'text-gray-400 bg-gray-100' : ''}
                        >
                          {slot} {isBooked ? '(Penuh)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Keluhan / Gejala
                </label>
                <textarea
                  rows="3"
                  placeholder="Jelaskan secara singkat keluhan yang Anda rasakan..."
                  value={bookingData.symptoms}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, symptoms: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                >
                  Kirim Janji Temu
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}