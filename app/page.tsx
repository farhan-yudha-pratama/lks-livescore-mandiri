"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import {
  Trophy,
  Award,
  Medal,
  Activity,
  Radio,
  Search,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  Gauge,
  Disc3,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { scores, connectionState, recentlyUpdatedId } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScores = useMemo(() => {
    if (!searchQuery.trim()) return scores;
    const q = searchQuery.toLowerCase();
    return scores.filter(
      (s) =>
        s.namaSiswa.toLowerCase().includes(q) ||
        s.namaSekolah.toLowerCase().includes(q)
    );
  }, [scores, searchQuery]);

  const topScore = scores.length > 0 ? scores[0] : null;
  const avgTotal =
    scores.length > 0
      ? (
          scores.reduce((acc, curr) => acc + curr.totalNilai, 0) / scores.length
        ).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Ambience Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
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
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl font-normal">
              Bidang Lomba:{" "}
              <span className="text-slate-200 font-medium">
                Teknik Kendaraan Ringan Otomotif (TKRO)
              </span>{" "}
              — Penilaian Pos ETU, Sistem Rem, dan Electrical Body.
            </p>
          </div>

          {/* Action to Admin / Input Page */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700/80 shadow-lg shadow-black/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Panel Input Nilai</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Highlight KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-8">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Pemimpin Klasemen
              </span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white truncate">
              {topScore ? topScore.namaSiswa : "—"}
            </div>
            <div className="text-xs text-amber-400/90 truncate mt-1">
              {topScore ? topScore.namaSekolah : "Menunggu data"}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Skor Tertinggi
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {topScore ? topScore.totalNilai.toFixed(1) : "0.0"}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              dari maks 300.0 poin
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Total Kontingen
              </span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {scores.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Peserta terdaftar di sistem
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Rata-rata Skor
              </span>
              <Radio className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-300">
              {avgTotal}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Performa rata-rata pos
            </div>
          </div>
        </section>

        {/* Search & Legend Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
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
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              Pos 1: ETU (Engine Tune Up)
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
                                isRank1
                                  ? "text-amber-200"
                                  : "text-white"
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
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono text-base font-bold text-blue-300">
                              {item.postEtu.toFixed(1)}
                            </span>
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, item.postEtu)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Post Sistem Rem */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono text-base font-bold text-amber-300">
                              {item.postSistemRem.toFixed(1)}
                            </span>
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, item.postSistemRem)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Post El. Body */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono text-base font-bold text-cyan-300">
                              {item.postElBody.toFixed(1)}
                            </span>
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, item.postElBody)}%`,
                                }}
                              />
                            </div>
                          </div>
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
                              / 300.0 maks
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
              Pembaruan data otomatis melalui WebSocket tanpa refresh halaman.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
