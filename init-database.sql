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

