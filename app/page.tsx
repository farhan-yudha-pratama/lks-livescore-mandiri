"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import {
  Trophy,
  Award,
  Medal,
  Radio,
  Search,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  Gauge,
  Disc3,
  Zap,
  Maximize2,
  Minimize2,
} from "lucide-react";

export default function HomePage() {
  const { scores, connectionState, recentlyUpdatedId } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state dengan event fullscreenchange browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Fungsi toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Gagal masuk mode fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error("Gagal keluar mode fullscreen:", err);
        });
      }
    }
  }, []);

  // Shortcut keyboard: Tekan 'F' untuk toggle Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika sedang mengetik di input pencarian
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  const filteredScores = useMemo(() => {
    if (!searchQuery.trim()) return scores;
    const q = searchQuery.toLowerCase();
    return scores.filter(
      (s) =>
        s.namaSiswa.toLowerCase().includes(q) ||
        s.namaSekolah.toLowerCase().includes(q)
    );
  }, [scores, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Ambience Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />

      <div
        className={`relative z-10 mx-auto py-6 sm:py-8 transition-all duration-300 ${
          isFullscreen
            ? "max-w-[96vw] px-4 sm:px-6"
            : "max-w-7xl px-4 sm:px-6 lg:px-8"
        }`}
      >
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Flame className="w-3.5 h-3.5 text-blue-400" />
                LOMBA KOMPETENSI SISWA (LKS)
              </span>

              {/* Real-time Connection Indicator */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                  connectionState === "connected"
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                    : connectionState === "connecting"
                    ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                    : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {connectionState === "connected" && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      connectionState === "connected"
                        ? "bg-emerald-500"
                        : connectionState === "connecting"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                </span>
                <span className="font-mono uppercase tracking-wider text-[11px]">
                  {connectionState === "connected"
                    ? "Live Sync"
                    : connectionState === "connecting"
                    ? "Connecting..."
                    : "Offline"}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              Live Scoreboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Bidang Lomba:{" "}
              <span className="text-slate-200 font-medium">
                Teknik Kendaraan Ringan Otomotif (TKRO)
              </span>{" "}
              — Pos ETU, Sistem Rem, dan Electrical Body.
            </p>
          </div>

          {/* Action Buttons: Fullscreen & Link to Admin */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Tombol Full Screen */}
            <button
              onClick={toggleFullscreen}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border shadow-lg shadow-black/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                isFullscreen
                  ? "bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700/80 text-white"
              }`}
              title={
                isFullscreen
                  ? "Keluar dari Layar Penuh (Tekan Esc atau F)"
                  : "Buka Layar Penuh (Tekan F)"
              }
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Keluar Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Layar Penuh</span>
                </>
              )}
            </button>

            {/* Link ke Panel Input Nilai */}
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700/80 shadow-lg shadow-black/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Panel Input Nilai</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 hidden sm:inline" />
            </Link>
          </div>
        </header>

        {/* Search & Legend Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 my-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau asal sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Pos Indicator Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              Pos 1: ETU
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Disc3 className="w-3.5 h-3.5 text-amber-400" />
              Pos 2: Sistem Rem
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Pos 3: El. Body
            </span>
          </div>
        </div>

        {/* Master Live Score Table */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4 sm:px-6 w-20 text-center">Rank</th>
                  <th className="py-4 px-4 sm:px-6">Peserta & Asal Sekolah</th>
                  <th className="py-4 px-4 sm:px-6 text-center w-36">
                    <span className="flex items-center justify-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" />
                      Post ETU
                    </span>
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-center w-36">
                    <span className="flex items-center justify-center gap-1.5">
                      <Disc3 className="w-3.5 h-3.5 text-amber-400" />
                      Sistem Rem
                    </span>
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-center w-36">
                    <span className="flex items-center justify-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Post El. Body
                    </span>
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-right w-44">
                    Total Nilai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredScores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-500 text-sm"
                    >
                      Tidak ada data peserta yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((item, index) => {
                    const isRank1 = item.rank === 1;
                    const isRank2 = item.rank === 2;
                    const isRank3 = item.rank === 3;
                    const isRecentlyChanged = recentlyUpdatedId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-all duration-500 ${
                          isRecentlyChanged
                            ? "bg-amber-500/20 shadow-inner"
                            : isRank1
                            ? "bg-gradient-to-r from-amber-500/10 via-transparent to-transparent hover:bg-amber-500/15"
                            : isRank2
                            ? "bg-gradient-to-r from-slate-400/5 via-transparent to-transparent hover:bg-slate-800/40"
                            : isRank3
                            ? "bg-gradient-to-r from-orange-500/5 via-transparent to-transparent hover:bg-slate-800/40"
                            : "hover:bg-slate-800/30"
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          {isRank1 ? (
                            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-sm shadow-lg shadow-amber-500/30">
                              <Trophy className="w-4 h-4" />
                            </div>
                          ) : isRank2 ? (
                            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 text-black font-black text-sm shadow-md">
                              <Medal className="w-4 h-4" />
                            </div>
                          ) : isRank3 ? (
                            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-700 text-white font-black text-sm shadow-md">
                              <Award className="w-4 h-4" />
                            </div>
                          ) : (
                            <span className="font-mono text-slate-400 font-semibold text-sm">
                              #{item.rank ?? index + 1}
                            </span>
                          )}
                        </td>

                        {/* Nama Siswa & Asal Sekolah */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex flex-col">
                            <span
                              className={`text-base font-bold tracking-tight ${
                                isRank1 ? "text-amber-200" : "text-white"
                              }`}
                            >
                              {item.namaSiswa}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {item.namaSekolah}
                            </span>
                          </div>
                        </td>

                        {/* Post ETU */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <span className="font-mono text-base sm:text-lg font-bold text-blue-300">
                            {item.postEtu.toFixed(1)}
                          </span>
                        </td>

                        {/* Post Sistem Rem */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <span className="font-mono text-base sm:text-lg font-bold text-amber-300">
                            {item.postSistemRem.toFixed(1)}
                          </span>
                        </td>

                        {/* Post El. Body */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <span className="font-mono text-base sm:text-lg font-bold text-cyan-300">
                            {item.postElBody.toFixed(1)}
                          </span>
                        </td>

                        {/* Total Score */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="inline-flex flex-col items-end">
                            <span
                              className={`font-mono text-xl sm:text-2xl font-black tracking-tight ${
                                isRank1
                                  ? "text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]"
                                  : isRank2
                                  ? "text-slate-200"
                                  : isRank3
                                  ? "text-orange-300"
                                  : "text-emerald-400"
                              }`}
                            >
                              {item.totalNilai.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Total Poin
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer of Table */}
          <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Menampilkan {filteredScores.length} dari total {scores.length}{" "}
              peserta lomba.
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Tekan tombol <span className="text-amber-400 font-bold">F</span>{" "}
              pada keyboard untuk membuka layar penuh (Full Screen).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
