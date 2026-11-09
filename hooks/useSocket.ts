"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { LiveScoreItem } from "@/lib/types/score";

export type ConnectionState = "connected" | "connecting" | "disconnected";

export function useSocket() {
  const [scores, setScores] = useState<LiveScoreItem[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(
    null
  );
  const socketRef = useRef<Socket | null>(null);

  // Fallback initial fetch via REST
  const fetchInitialScores = useCallback(async () => {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setScores(json.data);
        }
      }
    } catch {
      // Ignored: socket will populate
    }
  }, []);

  useEffect(() => {
    fetchInitialScores();

    const socket = io({
      path: "/api/socket/io",
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionState("connected");
    });

    socket.on("disconnect", () => {
      setConnectionState("disconnected");
    });

    socket.on("connect_error", () => {
      setConnectionState("disconnected");
    });

    socket.on("SCORES_INIT", (data: LiveScoreItem[]) => {
      if (Array.isArray(data)) {
        setScores(data);
      }
    });

    socket.on("SCORES_UPDATED", (data: LiveScoreItem[]) => {
      if (Array.isArray(data)) {
        setScores(data);
      }
    });

    socket.on("SCORE_ITEM_CHANGED", (item: LiveScoreItem) => {
      setRecentlyUpdatedId(item.id);
      const timer = setTimeout(() => {
        setRecentlyUpdatedId((prev) => (prev === item.id ? null : prev));
      }, 2500);
      return () => clearTimeout(timer);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchInitialScores]);

  const updateScore = useCallback(
    (
      id: string,
      updates: {
        postEtu?: number;
        postSistemRem?: number;
        postElBody?: number;
        namaSiswa?: string;
        namaSekolah?: string;
      }
    ) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("UPDATE_SCORE", { id, ...updates });
      } else {
        // Fallback REST PUT
        fetch("/api/scores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        }).then(fetchInitialScores);
      }
    },
    [fetchInitialScores]
  );

  const quickAdjust = useCallback(
    (
      id: string,
      field: "postEtu" | "postSistemRem" | "postElBody",
      delta: number
    ) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("QUICK_ADJUST", { id, field, delta });
      } else {
        // Fallback via local calculation + PUT
        const target = scores.find((s) => s.id === id);
        if (target) {
          const nextVal = Math.max(
            0,
            Math.min(100, Math.round(((target[field] ?? 0) + delta) * 10) / 10)
          );
          updateScore(id, { [field]: nextVal });
        }
      }
    },
    [scores, updateScore]
  );

  const createParticipant = useCallback(
    (data: {
      namaSiswa: string;
      namaSekolah: string;
      postEtu?: number;
      postSistemRem?: number;
      postElBody?: number;
    }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("CREATE_PARTICIPANT", data);
      } else {
        fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then(fetchInitialScores);
      }
    },
    [fetchInitialScores]
  );

  const deleteParticipant = useCallback(
    (id: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("DELETE_PARTICIPANT", id);
      }
    },
    []
  );

  return {
    scores,
    connectionState,
    recentlyUpdatedId,
    updateScore,
    quickAdjust,
    createParticipant,
    deleteParticipant,
    refresh: fetchInitialScores,
  };
}
