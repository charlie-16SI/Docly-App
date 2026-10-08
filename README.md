# Docly - Healthcare Appointment System

Docly adalah aplikasi manajemen janji temu dokter berbasis web yang memudahkan pasien memesan jadwal konsultasi dan membantu dokter mengelola status janji temu secara real-time.

---

## 🚀 Fitur Utama

- **Autentikasi Peran (Role-based JWT):** Akses terpisah untuk akun Pasien dan Dokter.
- **Pemesanan Janji Temu:** Pemilihan dokter, tanggal, dan slot jam praktek.
- **Pencegahan Bentrok Jadwal:** Fitur otomatis untuk memblokir pemesanan pada slot waktu dan dokter yang sama.
- **Dashboard Dokter:** Pengelolaan status pengajuan janji temu pasien (Terima / Tolak).
- **Janji Temu Saya:** Riwayat dan pantauan status janji temu bagi pasien.

---

## 🛠️ Teknologi (Tech Stack)

- **Frontend:** React.js (Vite), Axios, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ORM
- **Authentication:** JSON Web Token (JWT), bcryptjs

---

## 📁 Struktur Folder Proyek

```text
Docly-App/
├── client/                 # Application Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
│
└── server/                 # Application Backend (Node + Express)
    ├── controllers/
    ├── models/
    ├── routes/
    ├── .env.example
    └── package.json
