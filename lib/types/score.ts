import { z } from "zod";
import {
  CreateScoreSchema,
  UpdateScoreSchema,
  QuickScoreAdjustSchema,
} from "@/lib/validations/score";

export type CreateScoreInput = z.infer<typeof CreateScoreSchema>;
export type UpdateScoreInput = z.infer<typeof UpdateScoreSchema>;
export type QuickScoreAdjustInput = z.infer<typeof QuickScoreAdjustSchema>;

export interface LiveScoreItem {
  id: string;
  namaSekolah: string;
  namaSiswa: string;
  postEtu: number;
  postSistemRem: number;
  postElBody: number;
  totalNilai: number;
  rank?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ScoreLogEntry {
  id: string;
  scoreId: string;
  namaSiswa: string;
  field: "postEtu" | "postSistemRem" | "postElBody";
  fieldLabel: string;
  previousValue: number;
  newValue: number;
  timestamp: number;
}
