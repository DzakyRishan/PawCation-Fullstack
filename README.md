<div align="center">

# 🐾 PawCation

**Platform layanan hewan peliharaan all-in-one** — supermarket, pet hotel, konsultasi kesehatan, pet taxi, CCTV monitoring, dan asisten AI (PawBot) untuk klasifikasi ras & konsultasi gejala.

Full-stack project: **React** frontend · **Laravel** REST API · **Flask + TensorFlow + Gemini** AI service.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9-3776AB?logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.10-FF6F00?logo=tensorflow&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-API-8E75B2?logo=googlegemini&logoColor=white)

</div>

---

## ✨ Highlights

- **Arsitektur 3-tier full-stack** — SPA React yang berkomunikasi dengan REST API Laravel (auth via Sanctum token), ditambah microservice AI Flask terpisah.
- **AI klasifikasi ras hewan** — model CNN TensorFlow (23 kelas ras anjing & kucing) mengenali ras dari foto yang di-upload, dengan tingkat keyakinan.
- **Chatbot kesehatan hewan (PawBot)** — Google Gemini menganalisis gejala & foto, memberi informasi awal + saran pertolongan pertama dalam Bahasa Indonesia.
- **Role-based access** — tiga peran (Customer, Admin, Owner) dengan dashboard & hak akses berbeda.
- **Alur bisnis lengkap** — shop + checkout, booking pet hotel, konsultasi, pet taxi, dan CCTV monitoring live saat hewan dititipkan.

## 🏗️ Arsitektur

```
┌─────────────────┐      REST (Sanctum)      ┌──────────────────┐
│  PawCation-FE   │ ───────────────────────► │  PawCation-BE    │
│  React + Vite   │ ◄─────────────────────── │  Laravel 13 API  │
│  (port 5173)    │        JSON              │  (port 8000)     │
└────────┬────────┘                          └────────┬─────────┘
         │                                            │
         │ multipart (foto + pesan)                   │ PostgreSQL
         ▼                                            ▼
┌─────────────────┐                          ┌──────────────────┐
│  PawCation-AI   │  TensorFlow (klasifikasi)│   pawcation_db    │
│  Flask (5000)   │  + Google Gemini (chat)  │                   │
└─────────────────┘                          └──────────────────┘
```

| Folder | Teknologi | Fungsi |
|--------|-----------|--------|
| [`PawCation-FE`](PawCation-FE) | React 19 · Vite · Tailwind 4 · React Router | Website frontend (SPA) |
| [`PawCation-BE`](PawCation-BE) | Laravel 13 · Sanctum · PostgreSQL | REST API & database |
| [`PawCation-AI`](PawCation-AI) | Flask · TensorFlow/Keras · Google Gemini | PawBot chat & klasifikasi ras |

## 📸 Screenshots

> _Tambahkan screenshot di sini — mis. simpan ke `docs/` lalu referensikan:_
>
> `![Home](docs/home.png)` · `![PawBot](docs/pawbot.png)` · `![CCTV](docs/cctv.png)`

<!-- ![Home](docs/home.png) -->
<!-- ![PawBot AI](docs/pawbot.png) -->

---

## 🚀 Setup cepat (development)

### 1. Backend (Laravel API)

```bash
cd PawCation-BE
cp .env.example .env        # Windows: copy .env.example .env
composer install
php artisan key:generate
```

**Database — pilih salah satu:**

- **SQLite (paling mudah):** di `.env` set `DB_CONNECTION=sqlite`, kosongkan `DB_DATABASE` (Laravel pakai `database/database.sqlite`; buat file kosong jika belum ada).
- **PostgreSQL:** set `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve
```

API berjalan di `http://127.0.0.1:8000`.

### 2. Frontend (React)

```bash
cd PawCation-FE
cp .env.example .env
npm install
npm run dev
```

Website: `http://127.0.0.1:5173`. Pastikan `VITE_API_URL=http://127.0.0.1:8000/api` di `.env` frontend.

### 3. PawBot AI (opsional)

```bash
cd PawCation-AI
cp .env.example .env         # lalu isi API_KEY (Google AI Studio)
pip install flask flask-cors pandas pillow google-genai tensorflow numpy python-dotenv
python main.py
```

Flask default di `http://127.0.0.1:5000`.

> **Catatan model:** `model_ras_hewan_terbaik.h5` dibuat dengan **TensorFlow 2.10 / Keras 2.x**. Jalankan AI service dengan environment TF 2.10 (Keras 2) — Keras 3 menghapus layer `TFOpLambda` sehingga model gagal di-load. Dataset training (`Pet_Breeds/`, ~800 MB) sengaja **tidak** di-commit; model `.h5` sudah cukup untuk inferensi.

## 👤 Akun demo (setelah `db:seed`)

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@pawcation.com` | `password123` |
| Admin | `admin@pawcation.com` | `password123` |
| Owner | `JekyOwner@gmail.com` | *(lihat `OwnerSeeder.php`)* |

Customer demo sudah punya hewan **Choco** & **Bruno**. Produk shop diisi oleh `ProductSeeder`.

## 🔌 Fitur ↔ API

| Halaman | Endpoint utama |
|---------|----------------|
| Login / Register | `POST /api/login`, `/register` |
| Home | `GET /api/dashboard`, `/products` |
| Profil | `GET /api/profile`, CRUD `/api/pets`, upload foto `POST /api/pets/{id}/photo`, `/api/orders` |
| Shop | `GET /api/products`, checkout `POST /api/orders` |
| Pet Hotel | `GET/POST /api/hotel-bookings` |
| Booking Kesehatan | `GET/POST /api/consult-bookings` |
| Pet Taxi | `GET/POST /api/pet-taxi` |
| CCTV | `GET /api/cctv/sessions` (booking hotel confirmed/checked_in) |
| Admin | `/api/admin/*` |
| Owner | `/api/owner/*` kelola admin |
| PawBot AI | `POST /chat` (Flask, port 5000) — teks + foto |

**Alur CCTV:** customer booking hotel → admin ubah status ke `confirmed`/`checked_in` → CCTV menampilkan sesi live untuk hewan tersebut.

## 🧠 Cara kerja PawBot

1. User kirim pesan (dan opsional foto) ke `POST /chat`.
2. Jika ada foto → model **TensorFlow** memprediksi ras (23 kelas, input 224×224×3) + confidence.
3. Konteks ras + 50 baris data medis + riwayat chat disusun jadi prompt.
4. **Google Gemini** membalas: analisis visual, info kondisi, pertolongan pertama, pengingat CCTV/klinik — ringkas, Bahasa Indonesia.

## 🛠️ Troubleshooting

- **CORS error:** pastikan origin frontend (`localhost:5173` / `127.0.0.1:5173`) ada di `PawCation-BE/config/cors.php`.
- **401 / logout otomatis:** token kadaluarsa; login ulang.
- **Produk kosong:** `php artisan db:seed --class=ProductSeeder`.
- **PawBot error 500:** cek `.env` AI punya `API_KEY` valid, dan jalankan dengan env TensorFlow 2.10 (lihat catatan model di atas).
- **Gemini 429 (quota):** free tier punya limit harian per model; tunggu reset atau ganti ke model Flash-Lite.

---

<div align="center">
<sub>Dibangun sebagai project full-stack — React · Laravel · TensorFlow · Google Gemini</sub>
</div>
