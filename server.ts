import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { ScoreStore } from "./lib/server/score-store";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ScoreStore.setSocketIO(io);

  io.on("connection", async (socket) => {
    // Kirim snapshot data lengkap saat client pertama kali connect
    const currentScores = await ScoreStore.getAllScores();
    socket.emit("SCORES_INIT", currentScores);

    // Handler update nilai
    socket.on(
      "UPDATE_SCORE",
      async (payload: {
        id: string;
        postEtu?: number;
        postSistemRem?: number;
        postElBody?: number;
        namaSiswa?: string;
        namaSekolah?: string;
      }) => {
        if (payload?.id) {
          await ScoreStore.updateScore(payload.id, payload);
        }
      }
    );

    // Handler quick score adjustment (+1, +5, -1, -5)
    socket.on(
      "QUICK_ADJUST",
      async (payload: {
        id: string;
        field: "postEtu" | "postSistemRem" | "postElBody";
        delta: number;
      }) => {
        if (!payload?.id || !payload?.field) return;
        const all = await ScoreStore.getAllScores();
        const target = all.find((s) => s.id === payload.id);
        if (target) {
          const currentVal = target[payload.field] ?? 0;
          const nextVal = Math.max(
            0,
            Math.round((currentVal + payload.delta) * 10) / 10
          );
          await ScoreStore.updateScore(payload.id, {
            [payload.field]: nextVal,
          });
        }
      }
    );

    // Handler pendaftaran peserta baru
    socket.on(
      "CREATE_PARTICIPANT",
      async (payload: {
        namaSiswa: string;
        namaSekolah: string;
        postEtu?: number;
        postSistemRem?: number;
        postElBody?: number;
      }) => {
        if (payload?.namaSiswa && payload?.namaSekolah) {
          await ScoreStore.createScore(payload);
        }
      }
    );

    // Handler penghapusan peserta
    socket.on("DELETE_PARTICIPANT", async (id: string) => {
      if (id) {
        await ScoreStore.deleteScore(id);
      }
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> LKS Live Score Server running on http://${hostname}:${port}`);
    console.log(`> WebSocket ready on path: /api/socket/io`);
  });
});
