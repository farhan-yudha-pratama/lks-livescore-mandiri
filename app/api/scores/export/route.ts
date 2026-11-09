import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { ScoreStore } from "@/lib/server/score-store";

export async function GET() {
  try {
    const scores = await ScoreStore.getAllScores();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "LKS Live Scoreboard TKRO";
    workbook.lastModifiedBy = "LKS Live Scoreboard TKRO";
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet("Rekapitulasi Nilai", {
      pageSetup: {
        orientation: "landscape",
        paperSize: 9, // A4
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
      views: [{ state: "frozen", ySplit: 5 }],
    });

    // Formatting date in Indonesian WIB format
    const now = new Date();
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(now);

    // Title Row 1
    sheet.mergeCells("A1:G1");
    const titleCell1 = sheet.getCell("A1");
    titleCell1.value = "LEMBAR REKAPITULASI NILAI LOMBA KOMPETENSI SISWA (LKS)";
    titleCell1.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell1.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 26;

    // Subtitle Row 2
    sheet.mergeCells("A2:G2");
    const titleCell2 = sheet.getCell("A2");
    titleCell2.value = "Bidang Lomba: Teknik Kendaraan Ringan Otomotif (TKRO)";
    titleCell2.font = { name: "Arial", size: 12, bold: true, color: { argb: "FF334155" } };
    titleCell2.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(2).height = 20;

    // Subtitle Row 3 (Export timestamp)
    sheet.mergeCells("A3:G3");
    const titleCell3 = sheet.getCell("A3");
    titleCell3.value = `Waktu Ekspor: ${dateFormatted} WIB | Total Peserta: ${scores.length}`;
    titleCell3.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF64748B" } };
    titleCell3.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(3).height = 18;

    // Spacer Row 4
    sheet.getRow(4).height = 10;

    // Table Header Row 5
    const headerRow = sheet.getRow(5);
    headerRow.values = [
      "Peringkat",
      "Nama Siswa",
      "Asal Sekolah",
      "Post ETU",
      "Post Sistem Rem",
      "Post El. Body",
      "Total Poin",
    ];
    headerRow.height = 28;

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };

    headerRow.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" }, // Slate-800
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 2 || colNumber === 3 ? "left" : "center",
      };
      cell.border = {
        top: { style: "medium", color: { argb: "FF0F172A" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        bottom: { style: "medium", color: { argb: "FF0F172A" } },
        right: { style: "thin", color: { argb: "FF334155" } },
      };
    });

    // Populate Data Rows
    let currentRowIdx = 6;
    scores.forEach((item, index) => {
      const row = sheet.getRow(currentRowIdx);
      const isTop1 = item.rank === 1;
      const isTop2 = item.rank === 2;
      const isTop3 = item.rank === 3;

      row.values = [
        item.rank ?? index + 1,
        item.namaSiswa,
        item.namaSekolah,
        item.postEtu,
        item.postSistemRem,
        item.postElBody,
        item.totalNilai,
      ];
      row.height = 24;

      // Determine Row Fill Color
      let rowBgColor: string | undefined = undefined;
      if (isTop1) {
        rowBgColor = "FFFEF3C7"; // Amber-100 (Gold)
      } else if (isTop2) {
        rowBgColor = "FFF1F5F9"; // Slate-100 (Silver)
      } else if (isTop3) {
        rowBgColor = "FFFFEDD5"; // Orange-100 (Bronze)
      } else if (index % 2 === 1) {
        rowBgColor = "FFF8FAFC"; // Slate-50 alternating
      }

      row.eachCell((cell, colNumber) => {
        cell.font = {
          name: "Arial",
          size: 10,
          bold: isTop1 || colNumber === 1 || colNumber === 7,
          color: isTop1 && colNumber === 1 ? { argb: "FFB45309" } : { argb: "FF1E293B" },
        };

        if (rowBgColor) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: rowBgColor },
          };
        }

        cell.border = thinBorder;

        // Alignment & Number format
        if (colNumber === 1) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else if (colNumber === 2 || colNumber === 3) {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        } else {
          // Score columns (ETU, Rem, El Body, Total)
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.numFmt = "0.0";
        }
      });

      currentRowIdx++;
    });

    // Summary Statistics Rows (Average & Max)
    if (scores.length > 0) {
      // Empty separator
      sheet.getRow(currentRowIdx).height = 8;
      currentRowIdx++;

      // Row Average
      const avgRow = sheet.getRow(currentRowIdx);
      sheet.mergeCells(`A${currentRowIdx}:C${currentRowIdx}`);
      const avgLabel = sheet.getCell(`A${currentRowIdx}`);
      avgLabel.value = "NILAI RATA-RATA";
      avgLabel.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF1E293B" } };
      avgLabel.alignment = { vertical: "middle", horizontal: "right" };

      avgRow.getCell(4).value = { formula: `AVERAGE(D6:D${currentRowIdx - 2})` };
      avgRow.getCell(5).value = { formula: `AVERAGE(E6:E${currentRowIdx - 2})` };
      avgRow.getCell(6).value = { formula: `AVERAGE(F6:F${currentRowIdx - 2})` };
      avgRow.getCell(7).value = { formula: `AVERAGE(G6:G${currentRowIdx - 2})` };

      [1, 2, 3, 4, 5, 6, 7].forEach((col) => {
        const cell = avgRow.getCell(col);
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF1E293B" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
        cell.border = thinBorder;
        if (col >= 4) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.numFmt = "0.0";
        }
      });
      avgRow.height = 24;
      currentRowIdx++;

      // Row Highest Score
      const maxRow = sheet.getRow(currentRowIdx);
      sheet.mergeCells(`A${currentRowIdx}:C${currentRowIdx}`);
      const maxLabel = sheet.getCell(`A${currentRowIdx}`);
      maxLabel.value = "NILAI TERTINGGI";
      maxLabel.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF1E293B" } };
      maxLabel.alignment = { vertical: "middle", horizontal: "right" };

      maxRow.getCell(4).value = { formula: `MAX(D6:D${currentRowIdx - 3})` };
      maxRow.getCell(5).value = { formula: `MAX(E6:E${currentRowIdx - 3})` };
      maxRow.getCell(6).value = { formula: `MAX(F6:F${currentRowIdx - 3})` };
      maxRow.getCell(7).value = { formula: `MAX(G6:G${currentRowIdx - 3})` };

      [1, 2, 3, 4, 5, 6, 7].forEach((col) => {
        const cell = maxRow.getCell(col);
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF1E293B" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
        cell.border = thinBorder;
        if (col >= 4) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.numFmt = "0.0";
        }
      });
      maxRow.height = 24;
    }

    // Explicit Auto-fit Column Widths
    const columnWidths = [
      { col: 1, minWidth: 12 }, // Peringkat
      { col: 2, minWidth: 26 }, // Nama Siswa
      { col: 3, minWidth: 28 }, // Asal Sekolah
      { col: 4, minWidth: 16 }, // Post ETU
      { col: 5, minWidth: 18 }, // Post Sistem Rem
      { col: 6, minWidth: 18 }, // Post El. Body
      { col: 7, minWidth: 16 }, // Total Poin
    ];

    columnWidths.forEach(({ col, minWidth }) => {
      let maxLen = minWidth;
      sheet.getColumn(col).eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber >= 5) {
          const val = cell.value ? String(cell.value) : "";
          if (val.length + 4 > maxLen) {
            maxLen = val.length + 4;
          }
        }
      });
      sheet.getColumn(col).width = maxLen;
    });

    // Generate Binary Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Timestamp for filename: YYYYMMDD_HHmmss
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fileTimestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
      now.getHours()
    )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `Rekapitulasi_Nilai_LKS_TKRO_${fileTimestamp}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Gagal membuat berkas Excel",
      },
      { status: 500 }
    );
  }
}
