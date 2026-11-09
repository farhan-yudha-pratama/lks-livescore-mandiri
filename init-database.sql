-- ====================================================================
-- Script Inisialisasi Tabel Live Score LKS (PostgreSQL Global VPS)
-- Jalankan query ini pada database PostgreSQL Anda (misal via pgAdmin, DBeaver, atau psql)
-- ====================================================================

-- 1. Buat Tabel Utama
CREATE TABLE IF NOT EXISTS "live_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama_sekolah" VARCHAR(100) NOT NULL,
    "nama_siswa" VARCHAR(100) NOT NULL,
    "post_etu" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "post_sistem_rem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "post_el_body" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_nilai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_scores_pkey" PRIMARY KEY ("id")
);

-- 2. Buat Indeks Ranking untuk Performa Cepat
CREATE INDEX IF NOT EXISTS "live_scores_total_nilai_idx" ON "live_scores"("total_nilai" DESC);

-- 3. Data Awal / Seed Data Peserta (Opsional)
INSERT INTO "live_scores" ("id", "nama_siswa", "nama_sekolah", "post_etu", "post_sistem_rem", "post_el_body", "total_nilai", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'Ahmad Rifai', 'SMKN 2 Surabaya', 94, 91, 95, 280, NOW(), NOW()),
  (gen_random_uuid(), 'Budi Santoso', 'SMKN 1 Jakarta', 90, 93, 89, 272, NOW(), NOW()),
  (gen_random_uuid(), 'Dedi Pratama', 'SMKN 5 Bandung', 88, 86, 92, 266, NOW(), NOW()),
  (gen_random_uuid(), 'Fajar Hidayat', 'SMKN 2 Yogyakarta', 85, 89, 87, 261, NOW(), NOW()),
  (gen_random_uuid(), 'Rian Saputra', 'SMKN 3 Semarang', 82, 84, 88, 254, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
