import { z } from "zod";

export const CreateScoreSchema = z.object({
  namaSekolah: z.string().min(2, "Nama sekolah minimal 2 karakter").max(100),
  namaSiswa: z.string().min(2, "Nama siswa minimal 2 karakter").max(100),
  postEtu: z.number().min(0, "Nilai tidak boleh negatif").max(100).default(0),
  postSistemRem: z.number().min(0, "Nilai tidak boleh negatif").max(100).default(0),
  postElBody: z.number().min(0, "Nilai tidak boleh negatif").max(100).default(0),
});

export const UpdateScoreSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
  namaSekolah: z.string().min(2, "Nama sekolah minimal 2 karakter").max(100).optional(),
  namaSiswa: z.string().min(2, "Nama siswa minimal 2 karakter").max(100).optional(),
  postEtu: z.number().min(0, "Nilai tidak boleh negatif").max(100).optional(),
  postSistemRem: z.number().min(0, "Nilai tidak boleh negatif").max(100).optional(),
  postElBody: z.number().min(0, "Nilai tidak boleh negatif").max(100).optional(),
});

export const QuickScoreAdjustSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
  field: z.enum(["postEtu", "postSistemRem", "postElBody"]),
  delta: z.number(), // e.g. +1, +5, -1, -5
});
