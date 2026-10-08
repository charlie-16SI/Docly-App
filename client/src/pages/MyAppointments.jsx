import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const res = await API.get('/appointments/my-appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Gagal mengambil daftar janji temu');
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

  const handleCancel = (id) => {
    const isConfirmed = window.confirm('Apakah Anda yakin ingin membatalkan janji temu ini?');
    if (isConfirmed) {
      API.put(`/appointments/${id}/cancel`)
        .then(() => {
          toast.success('Janji temu berhasil dibatalkan');
          fetchMyAppointments();
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Gagal membatalkan janji temu');
        });
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
        return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full">Disetujui Dokter</span>;
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Janji Temu Saya</h1>
            <p className="text-xs text-gray-500 mt-1">Daftar janji temu yang pernah Anda buat.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/home" className="text-xs font-semibold text-blue-600 hover:underline">
              ← Cari Dokter
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-all"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Memuat riwayat janji temu...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm mb-3">Belum ada riwayat janji temu.</p>
            <Link to="/home" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all inline-block">
              Buat Janji Temu Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((item) => {
              const doctorName = item.doctorId?.userId?.name || item.doctorId?.name || 'dr. Spesialis';
              const specialization = item.doctorId?.specialization || 'Umum';

              return (
                <div key={item._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{doctorName}</h3>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">{specialization}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      📅 <strong>Tanggal:</strong> {formatDate(item.date)} | ⏰ <strong>Jam:</strong> {item.timeSlot}
                    </p>
                    {item.symptoms && (
                      <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2">
                        💬 <strong>Keluhan:</strong> {item.symptoms}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {getStatusBadge(item.status)}

                    {(item.status === 'pending' || item.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(item._id)}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-all"
                      >
                        Batalkan Janji
                      </button>
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