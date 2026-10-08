import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Jika belum login, redirect ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika role pengguna tidak sesuai dengan yang diizinkan, redirect ke home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}