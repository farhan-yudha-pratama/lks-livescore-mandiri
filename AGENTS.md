<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Standard Operating Procedure (SOP) & Panduan Arsitektur Agen AI / Pengembang — LKS Live Score Dashboard

Dokumen ini adalah **panduan kanonikal, standar arsitektur, dan aturan mutlak** bagi seluruh agen AI dan pengembang perangkat lunak yang bekerja pada repositori **lks-livescore-mandiri**. Seluruh instruksi, batasan teknis, dan konvensi di bawah ini wajib dipatuhi tanpa pengecualian.

---

## 1. Profil & Karakteristik Proyek

- **Nama Proyek**: **LKS Live Score Dashboard** (`lks-livescore-mandiri`).
- **Tujuan Proyek**: Platform live score real-time modern yang ringan, ultra-responsif, dan dirancang khusus untuk kebutuhan kompetisi LKS (Lomba Kompetensi Siswa) atau pertandingan olahraga/turnamen mandiri.
- **Teknologi Utama**:
  - **Framework**: Next.js 16.x (App Router, Turbopack, React Server & Client Components).
  - **Runtime & Bahasa**: Node.js & TypeScript 5.x.
  - **UI Library & Styling**: React 19.x & Tailwind CSS v4.
  - **Real-Time Communication**: WebSocket / Socket.IO (Low-latency bidirectional streaming).
  - **Validasi & Type-Safety**: Zod (Schema-First DTO validation).
- **Struktur Fungsional Utama (2 Halaman Inti)**:
  1. **Halaman 1: Root Public Live Scoreboard (`/`)**
     - **Audiens**: Penonton umum, juri, peserta, layar proyektor / LED display aula kompetisi.
     - **Karakteristik**: Read-only, clean presentation, high-contrast, responsif di berbagai resolusi layar (dari smartphone hingga proyektor resolusi 4K).
     - **Fitur**:
       - Menampilkan papan skor besar: Nama Tim A & B, logo/warna tim, dan skor terkini.
       - Indikator status pertandingan (Upcoming, Live, Timeout, Break/Halftime, Finished).
       - Indikator babak/periode/set/ronde (`Period / Round Indicator`).
       - Running Match Timer yang tersinkronisasi.
       - Timeline/Feed ringkas peristiwa skor terbaru (misal: penambahan poin, foul, time).
       - Status badge koneksi WebSocket (Live Connected, Reconnecting, Disconnected) dengan zero page reload.
  2. **Halaman 2: Panel Input & Kontrol Skor (`/admin` atau `/input`)**
     - **Audiens**: Operator pertandingan, wasit, atau tim teknis lomba.
     - **Karakteristik**: Action-driven, protektif, akses cepat, input ergonomis.
     - **Fitur**:
       - Quick score increment buttons (+1, +2, +3, -1) untuk masing-masing tim.
       - Input nilai manual langsung untuk koreksi cepat.
       - Konfigurasi tim (ubah nama tim, warna identitas/jersey, ganti tim).
       - Kontrol pertandingan (Start Match, Pause/Timeout, Next Period, Reset Match, Finish Match).
       - Kontrol timer pertandingan (Start, Pause, Reset, Custom Minute/Second).
       - Riwayat perubahan skor dengan fitur Undo aksi terakhir.
       - Log aktivitas pertandingan (menambahkan catatan poin/pelanggaran).
       - Broadcast instan via WebSocket setiap kali ada perubahan data (latensi < 50ms).

---

## 2. Arsitektur Real-Time WebSocket & Alur Data

Sistem live score mengandalkan komunikasi dua arah berlatensi rendah antara halaman Operator dan halaman Public Display:

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Pertandingan
    participant AdminUI as Halaman Input (/admin)
    participant Server as Custom Server / Socket Server
    participant StateStore as In-Memory / Persistent Store
    participant PublicUI as Halaman Root (/)
    actor Spectator as Penonton / Proyektor

    PublicUI->>Server: Connect WebSocket & Subscribe
    Server-->>PublicUI: Emit 'MATCH_INIT' (Snapshot State Terkini)
    PublicUI->>Spectator: Render Skor & Status Real-Time

    Operator->>AdminUI: Klik Tombol Skor (+1 Tim A)
    AdminUI->>AdminUI: Optimistic UI Feedback
    AdminUI->>Server: Emit 'UPDATE_SCORE' (Payload Valid Zod)
    Server->>Server: Validasi Payload & Mutasi State
    Server->>StateStore: Simpan State Pertandingan Terkini
    Server-->>AdminUI: Emit 'SCORE_UPDATED' (Ack Sukses)
    Server-->>PublicUI: Broadcast 'SCORE_UPDATED' (Real-time Payload)
    PublicUI->>PublicUI: Update State & Animasi Perubahan Angka
    PublicUI->>Spectator: Papan Skor Berubah Instan Tanpa Refresh
```

### Protokol & Kontrak Event WebSocket:
- `MATCH_INIT`: Dikirim oleh server saat client pertama kali terkoneksi, memuat snapshot lengkap `MatchState`.
- `UPDATE_SCORE`: Dikirim oleh admin untuk menambah/mengurangi/mengubah skor tim.
- `SCORE_UPDATED`: Dibroadcast ke seluruh client saat skor berhasil diperbarui.
- `UPDATE_MATCH_STATUS`: Dikirim admin untuk mengubah status pertandingan (`UPCOMING`, `LIVE`, `PAUSED`, `FINISHED`).
- `UPDATE_TIMER`: Sinkronisasi timer pertandingan (start, pause, reset, set waktu).
- `ADD_MATCH_EVENT`: Menambahkan catatan riwayat (misal: "Gol menit ke-12", "Three-point shot").
- `RESET_MATCH`: Reset skor dan timer ke status awal pertandingan baru.

---

## 3. Struktur & Anatomi Direktori Proyek

Proyek mengikuti konvensi App Router Next.js 16 yang terorganisir, modular, dan bersih:

```
lks-livescore-mandiri/
├── app/
│   ├── admin/                    # Halaman 2: Panel Kontrol & Input Skor (Operator)
│   │   ├── components/           # Komponen spesifik admin (ScoreControls, TimerControls, MatchSettings)
│   │   └── page.tsx              # Halaman Controller Admin
│   ├── api/                      # Route Handlers Next.js
│   │   └── match/                # Fallback REST API (GET snapshot, POST updates)
│   ├── globals.css               # Styling global & Tailwind CSS v4 theme
│   ├── layout.tsx                # Root layout dengan font dan SocketProvider
│   └── page.tsx                  # Halaman 1: Public Live Scoreboard Display
├── components/                   # Reusable UI & Display Components
│   ├── ui/                       # Atom UI dasar (Button, Card, Badge, Input, Modal)
│   ├── ConnectionStatus.tsx      # Indikator koneksi WebSocket (Live, Reconnecting, Offline)
│   ├── EventLogFeed.tsx          # Feed riwayat log peristiwa pertandingan
│   ├── LiveScoreBoard.tsx        # Tampilan besar papan skor utama
│   ├── MatchTimerDisplay.tsx     # Display timer pertandingan sinkron
│   └── TeamCard.tsx              # Komponen kartu tim & skor
├── hooks/                        # Custom React Hooks
│   ├── useMatchTimer.ts          # Hook logika running timer sinkron
│   └── useSocket.ts              # Hook client WebSocket & listener event terpusat
├── lib/                          # Domain Services & Shared Libraries
│   ├── constants/                # Konstanta (default scores, socket events, preset games)
│   │   └── socket-events.ts
│   ├── server/                   # Server-side logic & memory store
│   │   ├── match-store.ts        # Singleton In-Memory State Manager pertandingan
│   │   └── socket-handler.ts     # Socket.IO connection & event dispatchers
│   ├── types/                    # Definisi TypeScript interfaces & types
│   │   └── match.ts              # Type MatchState, Team, ScoreEvent, MatchStatus
│   ├── utils/                    # Helper formatters, date/timer calculation
│   │   └── formatters.ts
│   └── validations/              # Zod validation schemas
│       └── match.ts              # Zod schemas untuk semua mutasi skor & match
├── public/                       # Aset publik statis (logo, sounds, icons)
├── server.ts                     # Custom Node.js HTTP Server integrasi Next.js 16 + Socket.IO
├── next.config.ts                # Konfigurasi Next.js 16 & Turbopack
├── package.json                  # Dependensi & skrip aplikasi
├── tsconfig.json                 # Konfigurasi TypeScript strict mode
└── AGENTS.md                     # Dokumen SOP resmi pengembang & agen AI
```

---

## 4. Penerapan Clean Architecture & Alur Akses Data

Setiap perubahan data dalam sistem live score wajib melalui alur yang terisolasi dan bertanggung jawab tunggal:

```mermaid
flowchart LR
    UI["1. Presentation Layer<br/>(Root Page / Admin Controller)"]
    Hook["2. Client Real-Time Layer<br/>(hooks/useSocket.ts)"]
    SocketServer["3. Socket Handler Layer<br/>(lib/server/socket-handler.ts)"]
    Validation["4. Schema Validation Layer<br/>(lib/validations/match.ts)"]
    Store["5. Domain State Store<br/>(lib/server/match-store.ts)"]

    UI -->|User Trigger (Klik +1)| Hook
    Hook -->|Emit Socket Event| SocketServer
    SocketServer -->|Validasi Payload DTO| Validation
    Validation -->|Payload Valid| Store
    Store -->|Update State & Return Snapshot| SocketServer
    SocketServer -->|Broadcast Event ke Semua Client| Hook
    Hook -->|Update Reactive State| UI
```

### Aturan Setiap Lapisan:
1. **Presentation Layer (`app/...`, `components/...`)**:
   - Hanya bertugas me-render visual, menangani interaksi pengguna, dan memicu aksi melalui custom hook.
   - Dilarang menulis logika mutasi data langsung di dalam komponen UI.
2. **Client Real-Time Layer (`hooks/useSocket.ts`)**:
   - Mengelola daur hidup koneksi WebSocket (connect, disconnect, auto-reconnect, error handling).
   - Menyediakan fungsi emit yang bersih dan typed untuk komponen antarmuka.
3. **Socket Handler Layer (`lib/server/socket-handler.ts`)**:
   - Menerima event yang masuk dari client, memvalidasi payload, mengeksekusi aksi domain ke State Store, dan menyiarkan (*broadcast*) pembaruan ke seluruh client yang terhubung.
4. **Validation Layer (`lib/validations/match.ts`)**:
   - Seluruh payload mutasi skor, perubahan status, dan nama tim **wajib lolos validasi Zod** sebelum menyentuh State Store.
5. **Domain State Store Layer (`lib/server/match-store.ts`)**:
   - Pusat penyimpanan state pertandingan (*Single Source of Truth*).
   - Menjaga integritas data (skor tidak boleh negatif, timer tidak boleh melebihi batas waktu yang ditetapkan, transisi status yang valid).

---

## 5. Aturan Struct / Interface & Schema-First

Entitas inti sistem live score berpusat pada **Peserta (Nama Siswa & Asal Sekolah)** serta **Kategori Nilai**. Setiap mutasi skor **wajib** mengikuti protokol *Type & Schema-First*:

1. **Definisi Skema Validasi (Zod)** di [`lib/validations/score.ts`](file:///d:/Kerja/mandiri/lks-livescore-mandiri/lib/validations/score.ts):
   ```typescript
   import { z } from "zod";

   export const ParticipantScoreInputSchema = z.object({
     participantId: z.string().uuid(),
     categoryId: z.string().uuid(),
     nilai: z.number().min(0).max(100),
     catatan: z.string().optional(),
   });

   export const ParticipantCreateSchema = z.object({
     namaSiswa: z.string().min(2).max(100),
     namaSekolah: z.string().min(2).max(100),
     nomorPeserta: z.string().max(20).optional(),
   });

   export const CategoryCreateSchema = z.object({
     nama: z.string().min(2).max(100),
     bobot: z.number().min(0).default(1.0),
     maxNilai: z.number().min(1).default(100),
   });
   ```

2. **Ekspor Tipe TypeScript Menggunakan `z.infer`** di [`lib/types/score.ts`](file:///d:/Kerja/mandiri/lks-livescore-mandiri/lib/types/score.ts):
   ```typescript
   export type ParticipantScoreInput = z.infer<typeof ParticipantScoreInputSchema>;
   export type ParticipantCreateInput = z.infer<typeof ParticipantCreateSchema>;
   export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;

   export interface LiveScoreItem {
     id: string;
     namaSiswa: string;
     namaSekolah: string;
     nomorPeserta?: string | null;
     totalNilai: number;
     scores: Array<{
       categoryId: string;
       categoryName: string;
       nilai: number;
       bobot: number;
     }>;
     rank?: number;
     updatedAt: Date | string;
   }
   ```

3. **Larangan Penggunaan `any`**: Dilarang menggunakan tipe `any`. Jika tipe data payload dinamis, gunakan `unknown` lalu verifikasi dengan safeParse Zod.

---

## 6. Standar Desain UI/UX & Responsive Display

1. **Halaman Root (`/`) — Papan Skor Publik**:
   - **Tipografi Skor Raksasa**: Angka skor harus terlihat jelas dari jarak pandang jauh (minimal `text-7xl` hingga `text-9xl` pada layar desktop/proyektor).
   - **High-Contrast & Clean Theme**: Gunakan latar gelap yang elegan (misal: `#0a0a0a` / `#121212`) dipadukan dengan aksen warna tim yang mencolok untuk visibilitas maksimal.
   - **Animasi Transisi Skor**: Berikan efek mikro-animasi (pulse, scale pop, atau subtle flash) setiap kali skor bertambah untuk menarik perhatian penonton secara dramatis.
   - **Indikator Koneksi Minimalis**: Tampilkan badge status koneksi di sudut layar (hijau kedip untuk Live, kuning untuk Reconnecting, merah untuk Disconnected).
2. **Halaman Admin (`/admin`) — Panel Operator**:
   - **Tombol Sentuh Ramah Jari (Touch-Friendly)**: Tombol tombol +1, +2, +3 berukuran besar (minimal tinggi 48px–64px) sehingga mudah ditekan via tablet atau layar sentuh.
   - **Pemberian Warna Tim yang Jelas**: Tombol Tim A diberi aksen warna Tim A, tombol Tim B diberi aksen warna Tim B untuk mencegah salah input.
   - **Safety Confirmation untuk Tindakan Destruktif**: Aksi Reset Pertandingan atau Reset Skor wajib memiliki konfirmasi modal untuk menghindari kecelakaan klik oleh operator.
   - **Undo Action Cepat**: Sediakan tombol *Undo* untuk membatalkan penambahan skor terakhir jika operator tidak sengaja menekan tombol.

---

## 7. Reusabilitas Helper, Function & Custom Hooks

- **Single Responsibility Principle**:
  - Dilarang menaruh seluruh logika socket dan timer dalam satu file komponen besar.
  - Pisahkan ke dalam hook terdedikasi:
    - `hooks/useSocket.ts`: Inisialisasi socket, handling connection lifecycle, dan typed event listeners.
    - `hooks/useMatchTimer.ts`: Perhitungan countdown/stopwatch yang tersinkronisasi dengan server time drift.
    - `lib/utils/formatters.ts`: Helper format detik ke menit:detik (`MM:SS`), capitalize, dan sanitasi nama tim.
- Setiap fungsi helper harus bersifat *pure function*, mudah diuji (*unit testable*), dan terdokumentasi dengan baik.

---

## 8. Standar Konvensi Penamaan (Naming Conventions)

| Komponen | Konvensi | Contoh |
|---|---|---|
| **Berkas & Direktori** | `kebab-case` | `live-score-board.tsx`, `use-socket.ts`, `match-store.ts` |
| **Fungsi & Variabel** | `camelCase` | `updateScore`, `resetMatch`, `currentPeriod` |
| **Komponen React** | `PascalCase` | `LiveScoreBoard`, `TeamScoreCard`, `MatchTimer` |
| **Interface & Tipe TypeScript** | `PascalCase` | `MatchState`, `ScoreUpdatePayload`, `TeamConfig` |
| **Skema Zod** | `PascalCase` + `Schema` | `TeamScoreUpdateSchema`, `MatchConfigSchema` |
| **Konstanta & Event Socket** | `UPPER_SNAKE_CASE` | `SCORE_UPDATED`, `DEFAULT_MATCH_TIME` |

---

## 9. Filosofi Penanganan Error & Resiliensi Koneksi

1. **Zero Silent Error**:
   - Tangani setiap kemungkinan kegagalan koneksi WebSocket secara elegan.
   - Jika koneksi terputus (*disconnect*), client harus otomatis melakukan *exponential backoff reconnect* tanpa perlu pengguna merefresh halaman secara manual.
2. **State Synchronization Recovery**:
   - Saat koneksi kembali pulih (*reconnected*), client wajib langsung meminta snapshot `MATCH_INIT` terbaru dari server untuk menghindari desinkronisasi skor.
3. **Penyelamatan Akar Masalah**:
   - Dilarang menggunakan `@ts-ignore`, `@ts-nocheck`, atau casting `as any`.
   - Validasi data input form di sisi client dan server menggunakan skema Zod yang sama (*isomorphic validation*).

---

## 10. Standar Pengujian (Testing Strategy)

Keandalan sistem real-time live score diuji menggunakan **Vitest** dan skenario simulasi socket:
1. **State Store Unit Testing**:
   - Uji penambahan dan pengurangan skor (skor tidak boleh menjadi nilai minus jika ada aturan batas bawah).
   - Uji penambahan log riwayat peristiwa.
   - Uji fungsionalitas Reset Pertandingan.
2. **Zod Validation Testing**:
   - Uji payload yang sah (Happy Path).
   - Uji payload tidak sah (Edge cases: angka bukan integer, string kosong, warna hex tidak valid).
3. **Socket Event Contract Simulation**:
   - Simulasi broadcast event: ketika server memanggil update score, seluruh listener terdaftar menerima payload yang sama.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
