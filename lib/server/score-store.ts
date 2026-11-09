import { prisma } from "../db/prisma";
import { LiveScoreItem } from "../types/score";
import type { Server as SocketIOServer } from "socket.io";

// Initial empty store (no dummy data)
const INITIAL_SCORES: LiveScoreItem[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __ioInstance: SocketIOServer | undefined;
  // eslint-disable-next-line no-var
  var __scoreMemoryStore: LiveScoreItem[] | undefined;
  // eslint-disable-next-line no-var
  var __dbAvailable: boolean | undefined;
}

export class ScoreStore {
  private static memoryStore: LiveScoreItem[] =
    globalThis.__scoreMemoryStore ?? [];
  private static dbAvailable: boolean | undefined = globalThis.__dbAvailable;

  static setSocketIO(io: SocketIOServer) {
    globalThis.__ioInstance = io;
  }

  static getSocketIO(): SocketIOServer | undefined {
    return globalThis.__ioInstance;
  }

  static computeTotal(etu: number, rem: number, elBody: number): number {
    return Number((etu + rem + elBody).toFixed(2));
  }

  static sortAndRank(scores: LiveScoreItem[]): LiveScoreItem[] {
    return [...scores]
      .sort((a, b) => b.totalNilai - a.totalNilai)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  static async getAllScores(): Promise<LiveScoreItem[]> {
    if (this.dbAvailable !== false) {
      try {
        const records = await prisma.liveScore.findMany({
          orderBy: { totalNilai: "desc" },
        });

        this.dbAvailable = true;
        globalThis.__dbAvailable = true;

        const mapped = records.map((r, idx) => ({
          id: r.id,
          namaSekolah: r.namaSekolah,
          namaSiswa: r.namaSiswa,
          postEtu: r.postEtu,
          postSistemRem: r.postSistemRem,
          postElBody: r.postElBody,
          totalNilai: r.totalNilai,
          rank: idx + 1,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
        this.memoryStore = mapped;
        globalThis.__scoreMemoryStore = mapped;
        return mapped;
      } catch {
        // Mark DB as unavailable so we don't spam errors on every request
        this.dbAvailable = false;
        globalThis.__dbAvailable = false;
      }
    }

    this.memoryStore = this.sortAndRank(this.memoryStore);
    globalThis.__scoreMemoryStore = this.memoryStore;
    return this.memoryStore;
  }

  static async updateScore(
    id: string,
    updates: {
      postEtu?: number;
      postSistemRem?: number;
      postElBody?: number;
      namaSiswa?: string;
      namaSekolah?: string;
    }
  ): Promise<LiveScoreItem | null> {
    const existingIndex = this.memoryStore.findIndex((s) => s.id === id);
    if (existingIndex === -1) return null;

    const current = this.memoryStore[existingIndex];
    const postEtu = updates.postEtu ?? current.postEtu;
    const postSistemRem = updates.postSistemRem ?? current.postSistemRem;
    const postElBody = updates.postElBody ?? current.postElBody;
    const totalNilai = this.computeTotal(postEtu, postSistemRem, postElBody);
    const namaSiswa = updates.namaSiswa ?? current.namaSiswa;
    const namaSekolah = updates.namaSekolah ?? current.namaSekolah;
    const now = new Date().toISOString();

    const updatedItem: LiveScoreItem = {
      ...current,
      namaSiswa,
      namaSekolah,
      postEtu,
      postSistemRem,
      postElBody,
      totalNilai,
      updatedAt: now,
    };

    // Update memory
    this.memoryStore[existingIndex] = updatedItem;
    this.memoryStore = this.sortAndRank(this.memoryStore);
    globalThis.__scoreMemoryStore = this.memoryStore;

    // Try DB sync in background if DB is active
    if (this.dbAvailable) {
      prisma.liveScore
        .upsert({
          where: { id },
          update: {
            namaSiswa,
            namaSekolah,
            postEtu,
            postSistemRem,
            postElBody,
            totalNilai,
          },
          create: {
            id,
            namaSiswa,
            namaSekolah,
            postEtu,
            postSistemRem,
            postElBody,
            totalNilai,
          },
        })
        .catch(() => {});
    }

    // Broadcast through WebSocket
    this.broadcastUpdate(updatedItem);

    return updatedItem;
  }

  static async createScore(data: {
    namaSiswa: string;
    namaSekolah: string;
    postEtu?: number;
    postSistemRem?: number;
    postElBody?: number;
  }): Promise<LiveScoreItem> {
    const id = crypto.randomUUID();
    const postEtu = data.postEtu ?? 0;
    const postSistemRem = data.postSistemRem ?? 0;
    const postElBody = data.postElBody ?? 0;
    const totalNilai = this.computeTotal(postEtu, postSistemRem, postElBody);
    const now = new Date().toISOString();

    const newItem: LiveScoreItem = {
      id,
      namaSiswa: data.namaSiswa,
      namaSekolah: data.namaSekolah,
      postEtu,
      postSistemRem,
      postElBody,
      totalNilai,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryStore.push(newItem);
    this.memoryStore = this.sortAndRank(this.memoryStore);
    globalThis.__scoreMemoryStore = this.memoryStore;

    // Try DB sync if DB is active
    if (this.dbAvailable) {
      prisma.liveScore
        .create({
          data: {
            id,
            namaSiswa: data.namaSiswa,
            namaSekolah: data.namaSekolah,
            postEtu,
            postSistemRem,
            postElBody,
            totalNilai,
          },
        })
        .catch(() => {});
    }

    this.broadcastSnapshot();
    return newItem;
  }

  static async deleteScore(id: string): Promise<boolean> {
    const idx = this.memoryStore.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    this.memoryStore.splice(idx, 1);
    this.memoryStore = this.sortAndRank(this.memoryStore);
    globalThis.__scoreMemoryStore = this.memoryStore;

    if (this.dbAvailable) {
      prisma.liveScore.delete({ where: { id } }).catch(() => {});
    }

    this.broadcastSnapshot();
    return true;
  }

  static broadcastSnapshot() {
    const io = this.getSocketIO();
    if (io) {
      io.emit("SCORES_UPDATED", this.memoryStore);
    }
  }

  static broadcastUpdate(updatedItem: LiveScoreItem) {
    const io = this.getSocketIO();
    if (io) {
      io.emit("SCORE_ITEM_CHANGED", updatedItem);
      io.emit("SCORES_UPDATED", this.memoryStore);
    }
  }
}
