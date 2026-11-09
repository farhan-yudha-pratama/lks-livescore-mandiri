# LKS Live Score Dashboard (Mandiri / TKRO)

Platform Live Scoreboard real-time berbasis **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Prisma ORM**, dan **WebSocket (Socket.IO)** yang ringan, ultra-responsif, dan siap digunakan untuk kompetisi LKS (Lomba Kompetensi Siswa) maupun turnamen kejuruan.

---

## Fitur Utama

1. **Halaman 1: Papan Skor Publik (`/`)**
   - Tampilan visual *high-contrast* & tipografi besar untuk layar proyektor / TV aula kompetisi.
   - Live update skor real-time via WebSocket (< 50ms tanpa reload halaman).
   - Indikator koneksi Socket (*Live Sync*, *Reconnecting*, *Offline*).
   - 3 Pos Penilaian: **ETU (Engine Tune Up)**, **Sistem Rem**, dan **Electrical Body**.
   - Perhitungan total nilai otomatis dan peringkat (*auto-rank*) dengan lencana Gold/Silver/Bronze.
   - Efek animasi *glow pulse* pada baris yang baru saja nilainya diperbarui.

2. **Halaman 2: Panel Input & Kontrol Skor (`/admin`)**
   - Ramah layar sentuh / smartphone (*touch-friendly steppers* `+1`, `+5`, `-1`, `-5`).
   - Seluruh input nilai berbasis teks/string (mendukung angka bulat maupun desimal berkoma `,` atau bertitik `.`) dan otomatis dikonversi ke angka.
   - Fitur pencarian cepat (*search filter*) berdasarkan nama siswa atau asal sekolah.
   - Formulir pendaftaran peserta baru dan fitur edit langsung.

---

## Panduan Menjalankan Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan server terpadu (Next.js + WebSocket Socket.IO)
npm run dev
```

Buka di browser:
- **Papan Skor Utama**: [http://localhost:3000](http://localhost:3000)
- **Panel Input Nilai**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Panduan Deploy ke VPS Menggunakan Dokploy (Dengan Database PostgreSQL Global)

### 1. Buat User & Database di Container PostgreSQL Global VPS Anda

Jalankan perintah berikut di terminal VPS Anda:

```bash
# 1. Buat akun user baru
docker exec -i global-postgres-db psql -U postgres -c "CREATE USER lks_user WITH ENCRYPTED PASSWORD 'MamanRacingLksUser2026';"

# 2. Buat database baru dengan pemilik (owner) akun yang baru saja dibuat
docker exec -i global-postgres-db psql -U postgres -c "CREATE DATABASE lks_livescore_db OWNER lks_user;"

# 3. Berikan seluruh hak akses database ke user tersebut
docker exec -i global-postgres-db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE lks_livescore_db TO lks_user;"

# 4. Berikan hak akses penuh pada schema public (wajib untuk PostgreSQL 15/16+)
docker exec -i global-postgres-db psql -U postgres -d lks_livescore_db -c "GRANT ALL ON SCHEMA public TO lks_user;"
```

---

### 2. Inisialisasi Tabel

- **Cara A (Otomatis via Terminal Container Dokploy)**:
  Setelah container aplikasi aktif di Dokploy, buka tab **Terminal** pada container dan jalankan:
  ```bash
  npx prisma db push
  ```

- **Cara B (Jalankan File SQL Langsung)**:
  Jalankan file [`init-database.sql`](./init-database.sql) langsung ke database:
  ```bash
  docker exec -i global-postgres-db psql -U lks_user -d lks_livescore_db < init-database.sql
  ```

---

### 3. Langkah Deploy di Dokploy

1. **Buka Dashboard Dokploy** di VPS Anda.
2. Di dalam Project Anda, klik **Create Service** $\rightarrow$ pilih **Application**.
3. Pada tab **General**:
   - **Source**: Pilih **GitHub** (atau Git Repository URL).
   - **Repository & Branch**: Pilih repository proyek ini, branch `main`.
   - **Build Type**: Pilih **Dockerfile**.
   - **Dockerfile Path**: `/Dockerfile`.
4. Pada tab **Environment**:
   Tambahkan variabel:
   ```env
   NODE_ENV=production
   PORT=3000
   HOSTNAME=0.0.0.0
   DATABASE_URL=postgresql://lks_user:MamanRacingLksUser2026@global-postgres-db:5432/lks_livescore_db?schema=public
   ```
   *(Catatan: Jika container aplikasi dan database tidak berada dalam Docker network yang sama, ganti `global-postgres-db` dengan `host.docker.internal` atau IP VPS).*

5. Pada tab **Domains**:
   - Masukkan domain atau subdomain Anda (contoh: `livescore.sekolah.sch.id`).
   - Container Port: `3000`.
   - Centang **HTTPS** (Sertifikat SSL Let's Encrypt otomatis aktif).
   - Traefik Dokploy otomatis mendukung koneksi WebSocket (WSS).
6. Klik **Deploy**. Selesai!
