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
⚙️ Panduan Instalasi & Cara Menjalankan
1. Prasyarat
Node.js (Versi 16 LTS ke atas)

MongoDB (Lokal atau MongoDB Atlas)

2. Setup Backend (Server)
Buka terminal dan masuk ke folder server:
cd server

Instal dependensi:
npm install

Buat file .env baru berdasarkan .env.example:

PORT=5000
MONGO_URI=mongodb://localhost:27017/docly_db
JWT_SECRET=rahasia_jwt_key_super_aman_123
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

Jalankan server backend:
npm run dev
# Atau
node server.js

3. Setup Frontend (Client)
Buka terminal baru dan masuk ke folder client:

cd client

Instal dependensi:

npm install
Buat file .env baru berdasarkan .env.example:


VITE_API_BASE_URL=http://localhost:5000/api

Jalankan aplikasi frontend:


npm run dev
Buka link http://localhost:5173 di browser.
