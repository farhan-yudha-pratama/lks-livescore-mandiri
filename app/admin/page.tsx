"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Gauge,
  Disc3,
  Zap,
  Save,
  Radio,
  X,
  Search,
  Users,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminScorePage() {
  const {
    scores,
    connectionState,
    updateScore,
    quickAdjust,
    createParticipant,
    deleteParticipant,
  } = useSocket();

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // State Form Tambah Peserta Baru (Semua input string)
  const [namaSiswa, setNamaSiswa] = useState("");
  const [namaSekolah, setNamaSekolah] = useState("");
  const [postEtuStr, setPostEtuStr] = useState("80");
  const [postSistemRemStr, setPostSistemRemStr] = useState("80");
  const [postElBodyStr, setPostElBodyStr] = useState("80");
  const [isAdding, setIsAdding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // State Edit Langsung
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    namaSiswa: string;
    namaSekolah: string;
    postEtu: string;
    postSistemRem: string;
    postElBody: string;
  }>({
    namaSiswa: "",
    namaSekolah: "",
    postEtu: "0",
    postSistemRem: "0",
    postElBody: "0",
  });

  // Filtered scores
  const filteredScores = useMemo(() => {
    if (!searchQuery.trim()) return scores;
    const q = searchQuery.toLowerCase();
    return scores.filter(
      (s) =>
        s.namaSiswa.toLowerCase().includes(q) ||
        s.namaSekolah.toLowerCase().includes(q)
    );
  }, [scores, searchQuery]);

  // Helper konversi string ke number (mendukung koma maupun titik)
  const parseStringToScore = (val: string): number => {
    if (!val || !val.trim()) return 0;
    const sanitized = val.trim().replace(",", ".");
    const num = parseFloat(sanitized);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.round(num * 10) / 10);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswa.trim() || !namaSekolah.trim()) return;

    createParticipant({
      namaSiswa: namaSiswa.trim(),
      namaSekolah: namaSekolah.trim(),
      postEtu: parseStringToScore(postEtuStr),
      postSistemRem: parseStringToScore(postSistemRemStr),
      postElBody: parseStringToScore(postElBodyStr),
    });

    setNamaSiswa("");
    setNamaSekolah("");
    setPostEtuStr("80");
    setPostSistemRemStr("80");
    setPostElBodyStr("80");
    setIsAdding(false);
    showFeedback("Peserta baru berhasil ditambahkan!");
  };

  const startEdit = (item: (typeof scores)[0]) => {
    setEditingId(item.id);
    setEditValues({
      namaSiswa: item.namaSiswa,
      namaSekolah: item.namaSekolah,
      postEtu: String(item.postEtu),
      postSistemRem: String(item.postSistemRem),
      postElBody: String(item.postElBody),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    updateScore(id, {
      namaSiswa: editValues.namaSiswa.trim(),
      namaSekolah: editValues.namaSekolah.trim(),
      postEtu: parseStringToScore(editValues.postEtu),
      postSistemRem: parseStringToScore(editValues.postSistemRem),
      postElBody: parseStringToScore(editValues.postElBody),
    });

    setEditingId(null);
    showFeedback("Nilai berhasil disimpan dan disiarkan!");
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    const link = document.createElement("a");
    link.href = "/api/scores/export";
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setIsExporting(false);
      showFeedback("Berkas Excel berhasil diekspor!");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 antialiased p-3 sm:p-6 lg:p-8 selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3 pb-4 sm:pb-6 border-b border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Papan Skor</span>
            </Link>

            {/* Live Socket Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                connectionState === "connected"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-950/40 border-amber-500/30 text-amber-400"
              }`}
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="text-[11px] sm:text-xs">
                {connectionState === "connected" ? "Live Connected" : "Connecting..."}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
                <span>Panel Input Nilai LKS</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Input dan sesuaikan nilai per pos. Perubahan otomatis disiarkan via WebSocket.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              {/* Tombol Export Excel */}
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/30 border border-emerald-500/40 transition-all cursor-pointer disabled:opacity-50"
                title="Ekspor seluruh data nilai ke format Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>{isExporting ? "Mengekspor..." : "Export Excel"}</span>
              </button>

              {/* Tombol Tambah Peserta */}
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                {isAdding ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Tutup Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Tambah Peserta Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm shadow-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Form Tambah Peserta Baru */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-blue-500/30 shadow-2xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Pendaftaran Peserta Lomba Baru</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Nama Siswa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={namaSiswa}
                  onChange={(e) => setNamaSiswa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Asal Sekolah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMKN 1 Jakarta"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-400 uppercase mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5" /> Pos ETU
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Contoh: 85.5"
                  value={postEtuStr}
                  onChange={(e) => setPostEtuStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase mb-1 flex items-center gap-1">
                  <Disc3 className="w-3.5 h-3.5" /> Sistem Rem
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Contoh: 90"
                  value={postSistemRemStr}
                  onChange={(e) => setPostSistemRemStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyan-400 uppercase mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Pos El. Body
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Contoh: 88.5"
                  value={postElBodyStr}
                  onChange={(e) => setPostElBodyStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                Simpan Peserta
              </button>
            </div>
          </form>
        )}

        {/* Search & Counter Bar for Mobile & Desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta atau sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {filteredScores.length} dari {scores.length} Peserta
              </span>
            </span>
          </div>
        </div>

        {/* Master Score Cards List (Optimized for Mobile & Desktop) */}
        <div className="space-y-3 sm:space-y-4">
          {filteredScores.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 text-sm">
              {scores.length === 0
                ? "Belum ada data peserta. Klik tombol 'Tambah Peserta Baru' di atas untuk memasukkan peserta."
                : "Tidak ada data peserta yang cocok dengan pencarian."}
            </div>
          ) : (
            filteredScores.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-lg flex flex-col gap-4"
                >
                  {/* Row 1: Participant Identity + Total Nilai + Action Buttons */}
                  <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 font-mono font-bold text-amber-400 border border-slate-700/60 shrink-0 text-xs sm:text-sm">
                        #{item.rank}
                      </div>

                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editValues.namaSiswa}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  namaSiswa: e.target.value,
                                })
                              }
                              placeholder="Nama Siswa"
                              className="px-2.5 py-1 bg-slate-800 border border-blue-500 rounded-lg text-xs sm:text-sm text-white focus:outline-none"
                            />
                            <input
                              type="text"
                              value={editValues.namaSekolah}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  namaSekolah: e.target.value,
                                })
                              }
                              placeholder="Asal Sekolah"
                              className="px-2.5 py-1 bg-slate-800 border border-blue-500 rounded-lg text-xs sm:text-sm text-slate-300 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <>
                            <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                              {item.namaSiswa}
                            </h3>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {item.namaSekolah}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Total Score Badge & Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          Total
                        </span>
                        <span className="font-mono text-sm sm:text-base font-black text-emerald-400">
                          {item.totalNilai.toFixed(1)}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-md transition-all"
                            title="Simpan Nilai"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Simpan</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-semibold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Hapus peserta ${item.namaSiswa} dari sistem?`
                                )
                              ) {
                                deleteParticipant(item.id);
                                showFeedback(
                                  `Peserta ${item.namaSiswa} telah dihapus.`
                                );
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors"
                            title="Hapus Peserta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: 3 Posts Scoring Stepper Grid (Touch-Friendly for Mobile) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {/* Pos 1: ETU */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5" />
                          <span>Pos ETU</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-blue-300">
                          {isEditing ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={editValues.postEtu}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  postEtu: e.target.value,
                                })
                              }
                              className="w-16 px-1.5 py-0.5 bg-slate-800 border border-blue-500 rounded text-center text-xs text-white font-mono"
                            />
                          ) : (
                            item.postEtu.toFixed(1)
                          )}
                        </span>
                      </div>

                      {/* Touch Friendly Buttons (Taller on Mobile) */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => quickAdjust(item.id, "postEtu", 1)}
                          className="h-9 sm:h-8 rounded-lg bg-blue-600/30 hover:bg-blue-600 active:scale-95 text-blue-200 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => quickAdjust(item.id, "postEtu", 5)}
                          className="h-9 sm:h-8 rounded-lg bg-blue-600/30 hover:bg-blue-600 active:scale-95 text-blue-200 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => quickAdjust(item.id, "postEtu", -1)}
                          className="h-9 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => quickAdjust(item.id, "postEtu", -5)}
                          className="h-9 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          -5
                        </button>
                      </div>
                    </div>

                    {/* Pos 2: Sistem Rem */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-400 flex items-center gap-1">
                          <Disc3 className="w-3.5 h-3.5" />
                          <span>Sistem Rem</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-amber-300">
                          {isEditing ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={editValues.postSistemRem}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  postSistemRem: e.target.value,
                                })
                              }
                              className="w-16 px-1.5 py-0.5 bg-slate-800 border border-amber-500 rounded text-center text-xs text-white font-mono"
                            />
                          ) : (
                            item.postSistemRem.toFixed(1)
                          )}
                        </span>
                      </div>

                      {/* Touch Friendly Buttons (Taller on Mobile) */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() =>
                            quickAdjust(item.id, "postSistemRem", 1)
                          }
                          className="h-9 sm:h-8 rounded-lg bg-amber-600/30 hover:bg-amber-600 active:scale-95 text-amber-200 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() =>
                            quickAdjust(item.id, "postSistemRem", 5)
                          }
                          className="h-9 sm:h-8 rounded-lg bg-amber-600/30 hover:bg-amber-600 active:scale-95 text-amber-200 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          onClick={() =>
                            quickAdjust(item.id, "postSistemRem", -1)
                          }
                          className="h-9 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={() =>
                            quickAdjust(item.id, "postSistemRem", -5)
                          }
                          className="h-9 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          -5
                        </button>
                      </div>
                    </div>

                    {/* Pos 3: El. Body */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-cyan-400 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Pos El. Body</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-cyan-300">
                          {isEditing ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={editValues.postElBody}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  postElBody: e.target.value,
                                })
                              }
                              className="w-16 px-1.5 py-0.5 bg-slate-800 border border-cyan-500 rounded text-center text-xs text-white font-mono"
                            />
                          ) : (
                            item.postElBody.toFixed(1)
                          )}
                        </span>
                      </div>

                      {/* Touch Friendly Buttons (Taller on Mobile) */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => quickAdjust(item.id, "postElBody", 1)}
                          className="h-9 sm:h-8 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 active:scale-95 text-cyan-200 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => quickAdjust(item.id, "postElBody", 5)}
                          className="h-9 sm:h-8 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 active:scale-95 text-cyan-200 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => quickAdjust(item.id, "postElBody", -1)}
                          className="h-9 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => quickAdjust(item.id, "postElBody", -5)}
                          className="h-9 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          -5
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
