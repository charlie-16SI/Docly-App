import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      const res = await API.get('/appointments/my-appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Gagal mengambil daftar janji temu pasien');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Berhasil logout');
    navigate('/login');
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const actionText = newStatus === 'confirmed' ? 'menyetujui' : 'menolak';
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin ${actionText} janji temu ini?`);

    if (isConfirmed) {
      try {
        await API.put(`/appointments/${id}/status`, { status: newStatus });
        toast.success(`Janji temu berhasil di-${newStatus === 'confirmed' ? 'terima' : 'tolak'}`);
        fetchDoctorAppointments();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal memperbarui status');
      }
    }
  };

  const formatDate = (rawDate) => {
    if (!rawDate) return '';
    return rawDate.split('T')[0];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold rounded-full">Menunggu Konfirmasi</span>;
      case 'confirmed':
      case 'approved':
        return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full">Disetujui</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold rounded-full">Dibatalkan Pasien</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-full">Ditolak Dokter</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">Selesai</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Dokter & Logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Dokter</h1>
            <p className="text-xs text-gray-500 mt-1">
              Selamat datang, <strong className="text-blue-600">{user?.name || 'Dokter'}</strong>! Kelola janji temu masuk dari pasien.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            🚪 Logout
          </button>
        </div>

        {/* List Janji Temu Pasien */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Memuat daftar janji temu...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">Belum ada janji temu masuk.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((item) => {
              const patientName = item.patientId?.name || item.patient?.name || 'Pasien';

              return (
                <div key={item._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">👤 {patientName}</h3>
                    </div>
                    <p className="text-xs text-gray-600">
                      📅 <strong>Tanggal:</strong> {formatDate(item.date)} | ⏰ <strong>Jam:</strong> {item.timeSlot}
                    </p>
                    {item.symptoms && (
                      <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2">
                        💬 <strong>Keluhan Pasien:</strong> {item.symptoms}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {getStatusBadge(item.status)}

                    {item.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'confirmed')}
                          className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'rejected')}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}