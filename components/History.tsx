"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  ChevronDown,
  Download,
  Filter,
  History,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ExcelJS from "exceljs";
import type {
  AlertItem,
  DateRange,
  HistoryItem,
} from "@/types/sensor";

export type HistoryInterval =
  | "30m"
  | "1h"
  | "6h"
  | "1d";

type SystemFilter =
  | "all"
  | "raised_bed"
  | "aquaponik";

type ActivityLogItem = {
  id?: string;
  activity_at?: string;
  created_at?: string;

  activity_type?: string;

  system_type?: string;

  device_id?: string;

  zone_id?: string;

  actor_name?: string;

  actor_type?: string;

  title?: string;

  description?: string;

  status?: string;
};

type ManualControlLogItem = {
  id?: string;
  requested_at?: string;
  executed_at?: string;
  completed_at?: string;
  created_at?: string;

  system_type?: string;
  device_id?: string;
  zone_id?: string;

  actuator_name?: string;
  command?: string;
  duration_seconds?: number;

  previous_state?: boolean | string;
  requested_state?: boolean | string;
  final_state?: boolean | string;

  command_status?: string;
  initiated_by?: string;
  reason?: string;
  error_message?: string;
};

type Props = {
  dark: boolean;
  data: HistoryItem[];
  alerts: AlertItem[];
  activityLogs: ActivityLogItem[];
  manualControlLogs: ManualControlLogItem[];
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
  interval: HistoryInterval;
  setInterval: (value: HistoryInterval) => void;
};

const RANGE_OPTIONS = [
  { label: "1 Hari", value: "1" },
  { label: "2 Hari", value: "2" },
  { label: "3 Hari", value: "3" },
  { label: "7 Hari", value: "7" },
  { label: "14 Hari", value: "14" },
  { label: "1 Bulan", value: "30" },
  { label: "2 Bulan", value: "60" },
  { label: "3 Bulan", value: "90" },
];

const SYSTEM_OPTIONS: Array<{
  label: string;
  value: SystemFilter;
}> = [
    {
      label: "Semua Sistem",
      value: "all",
    },
    {
      label: "Raised Bed",
      value: "raised_bed",
    },
    {
      label: "Aquaponik",
      value: "aquaponik",
    },
  ];

const INTERVAL_OPTIONS: Array<{
  label: string;
  value: HistoryInterval;
}> = [
    {
      label: "30 Menit",
      value: "30m",
    },
    {
      label: "1 Jam",
      value: "1h",
    },
    {
      label: "6 Jam",
      value: "6h",
    },
    {
      label: "Harian",
      value: "1d",
    },
  ];

function formatExportDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatExportDate(value: string): string {
  const date = new Date(`${value}T00:00:00+07:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function normalizeLightPercentage(value: number): number {
  const numericValue = Number(value ?? 0);

  if (numericValue <= 100) {
    return Math.round(numericValue);
  }

  // Diasumsikan sensor LDR menggunakan ADC 0–1023.
  return Math.min(
    100,
    Math.max(0, Math.round((numericValue / 1023) * 100))
  );
}

function calculateAverage(
  values: Array<number | null | undefined>
): number {
  const validValues = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (validValues.length === 0) {
    return 0;
  }

  return (
    validValues.reduce((total, value) => total + value, 0) /
    validValues.length
  );
}

function formatActivityType(type?: string): string {
  switch (type) {
    case "sensor_data_received":
      return "Data Sensor Masuk";

    case "recommendation_generated":
      return "Rekomendasi Dibuat";

    case "manual_control":
      return "Kontrol Manual";

    case "automatic_control":
      return "Kontrol Otomatis";

    case "irrigation_started":
      return "Irigasi Dimulai";

    case "irrigation_stopped":
      return "Irigasi Dihentikan";

    case "feeding_started":
      return "Pemberian Pakan";

    case "water_refill":
      return "Pengisian Air";

    case "device_connected":
      return "Perangkat Terhubung";

    case "device_disconnected":
      return "Perangkat Terputus";

    default:
      return type
        ? type
          .replaceAll("_", " ")
          .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
          )
        : "-";
  }
}

function applyHealthScoreStyle(
  cell: ExcelJS.Cell,
  score: number
) {
  if (score >= 90) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCFCE7" },
    };

    cell.font = {
      bold: true,
      color: { argb: "FF166534" },
    };

    return;
  }

  if (score >= 70) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFEF3C7" },
    };

    cell.font = {
      bold: true,
      color: { argb: "FF92400E" },
    };

    return;
  }

  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFEE2E2" },
  };

  cell.font = {
    bold: true,
    color: { argb: "FF991B1B" },
  };
}

function applyHeaderStyle(row: ExcelJS.Row) {
  row.height = 28;

  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F766E" },
    };

    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    cell.border = {
      top: {
        style: "thin",
        color: { argb: "FFCBD5E1" },
      },
      left: {
        style: "thin",
        color: { argb: "FFCBD5E1" },
      },
      bottom: {
        style: "thin",
        color: { argb: "FFCBD5E1" },
      },
      right: {
        style: "thin",
        color: { argb: "FFCBD5E1" },
      },
    };
  });
}

function applyDataRowStyle(
  row: ExcelJS.Row,
  alternate: boolean
) {

  row.height = 22;

  row.eachCell(
    { includeEmpty: true },
    (cell, colNumber) => {

      if (alternate) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFF0FDFA",
          },
        };
      }

      cell.alignment = {
        vertical: "middle",
        horizontal:
          colNumber === 1
            ? "left"
            : "center",
      };

      cell.border = {
        top: {
          style: "hair",
          color: {
            argb: "FFE2E8F0",
          },
        },
        left: {
          style: "hair",
          color: {
            argb: "FFE2E8F0",
          },
        },
        bottom: {
          style: "hair",
          color: {
            argb: "FFE2E8F0",
          },
        },
        right: {
          style: "hair",
          color: {
            argb: "FFE2E8F0",
          },
        },
      };
    }
  );

}

function downloadWorkbook(
  buffer: ExcelJS.Buffer,
  filename: string
) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function HistoryPage({
  dark,
  data,
  alerts,
  activityLogs,
  manualControlLogs,
  dateRange,
  setDateRange,
  interval,
  setInterval,
}: Props) {
  const [selectedRange, setSelectedRange] =
    useState("7");

  const [selectedSystem, setSelectedSystem] =
    useState<SystemFilter>("all");

  const [draftDateRange, setDraftDateRange] =
    useState<DateRange>(dateRange);

  const raisedAvg = useMemo(() => {
    if (data.length === 0) return 0;

    const validRows = data.filter(
      (item) =>
        item.raised !== null &&
        item.raised !== undefined
    );

    if (validRows.length === 0) return 0;

    return Math.round(
      validRows.reduce(
        (sum, item) =>
          sum + Number(item.raised),
        0
      ) / validRows.length
    );
  }, [data]);

  const aquaAvg = useMemo(() => {
    if (data.length === 0) return 0;

    const validRows = data.filter(
      (item) =>
        item.aqua !== null &&
        item.aqua !== undefined
    );

    if (validRows.length === 0) return 0;

    return Math.round(
      validRows.reduce(
        (sum, item) =>
          sum + Number(item.aqua),
        0
      ) / validRows.length
    );
  }, [data]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const setQuickRange = (value: string) => {
    setSelectedRange(value);

    const days = Number(value);
    const end = new Date();
    const start = new Date();

    start.setDate(
      end.getDate() - (days - 1)
    );

    setDraftDateRange({
      start: formatDate(start),
      end: formatDate(end),
    });
  };

  const applyFilter = () => {
    if (
      !draftDateRange.start ||
      !draftDateRange.end
    ) {
      window.alert(
        "Tanggal awal dan tanggal akhir harus diisi."
      );

      return;
    }

    if (
      draftDateRange.start >
      draftDateRange.end
    ) {
      window.alert(
        "Tanggal awal tidak boleh melewati tanggal akhir."
      );

      return;
    }

    setDateRange(draftDateRange);
  };

  const exportExcel = async () => {
    if (data.length === 0) {
      window.alert("Belum ada data untuk diekspor.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();

      workbook.creator = "Smart Green Farm Dashboard";
      workbook.company = "Tim IoT GIAT 16 UNNES";
      workbook.subject = "Laporan Monitoring Smart Green Farm";
      workbook.title = "Smart Green Farm Monitoring Report";
      workbook.created = new Date();

      const reportSystem =
        selectedSystem === "all"
          ? "Semua Sistem"
          : selectedSystem === "raised_bed"
            ? "Raised Bed"
            : "Aquaponik";

      const intervalLabel =
        INTERVAL_OPTIONS.find(
          (option) => option.value === interval
        )?.label ?? interval;

      const exportTime = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }).format(new Date());

      /*
      ===========================================
      SHEET 1 — RINGKASAN
      ===========================================
      */

      const summarySheet = workbook.addWorksheet("Ringkasan", {
        views: [
          {
            showGridLines: false,
          },
        ],
      });

      summarySheet.columns = [
        { width: 30 },
        { width: 25 },
        { width: 20 },
        { width: 20 },
      ];

      summarySheet.mergeCells("A1:D1");
      summarySheet.getCell("A1").value = "SMART GREEN FARM";

      summarySheet.getCell("A1").font = {
        bold: true,
        size: 22,
        color: { argb: "FFFFFFFF" },
      };

      summarySheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      summarySheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F766E" },
      };

      summarySheet.getRow(1).height = 38;

      summarySheet.mergeCells("A2:D2");
      summarySheet.getCell("A2").value =
        "Laporan Riwayat Monitoring";

      summarySheet.getCell("A2").font = {
        bold: true,
        size: 14,
        color: { argb: "FF0F766E" },
      };

      summarySheet.getCell("A2").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      summarySheet.getRow(2).height = 27;

      summarySheet.addRow([]);

      const reportInformation = [
        ["Periode", `${formatExportDate(dateRange.start)} – ${formatExportDate(dateRange.end)}`],
        ["Sistem", reportSystem],
        ["Interval", intervalLabel],
        ["Jumlah Data", data.length],
        ["Waktu Export", `${exportTime} WIB`],
      ];

      reportInformation.forEach(([label, value], index) => {
        const rowNumber = index + 4;

        summarySheet.getCell(`A${rowNumber}`).value = label;
        summarySheet.getCell(`B${rowNumber}`).value = value;

        summarySheet.getCell(`A${rowNumber}`).font = {
          bold: true,
          color: { argb: "FF475569" },
        };

        summarySheet.getCell(`B${rowNumber}`).font = {
          bold: true,
          color: { argb: "FF0F172A" },
        };

        summarySheet.getCell(`A${rowNumber}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };

        summarySheet.mergeCells(
          `B${rowNumber}:D${rowNumber}`
        );

        summarySheet.getCell(`B${rowNumber}`).alignment = {
          horizontal: "left",
          vertical: "middle",
        };

        for (let column = 1; column <= 4; column++) {
          const cell = summarySheet.getCell(
            rowNumber,
            column
          );

          cell.border = {
            top: {
              style: "thin",
              color: { argb: "FFE2E8F0" },
            },
            left: {
              style: "thin",
              color: { argb: "FFE2E8F0" },
            },
            bottom: {
              style: "thin",
              color: { argb: "FFE2E8F0" },
            },
            right: {
              style: "thin",
              color: { argb: "FFE2E8F0" },
            },
          };

          cell.alignment = {
            ...cell.alignment,
            vertical: "middle",
          };
        }

        summarySheet.getRow(rowNumber).height = 23;
      });

      let summaryStartRow = 11;

      if (
        selectedSystem === "all" ||
        selectedSystem === "raised_bed"
      ) {
        summarySheet.mergeCells(
          `A${summaryStartRow}:D${summaryStartRow}`
        );

        const raisedTitle =
          summarySheet.getCell(`A${summaryStartRow}`);

        raisedTitle.value = "Ringkasan Raised Bed";
        raisedTitle.font = {
          bold: true,
          size: 13,
          color: { argb: "FFFFFFFF" },
        };

        raisedTitle.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF14B8A6" },
        };

        raisedTitle.alignment = {
          horizontal: "left",
          vertical: "middle",
        };

        summarySheet.getRow(summaryStartRow).height = 27;

        const raisedSummary = [
          [
            "Suhu Udara Rata-rata",
            `${calculateAverage(
              data.map((item) => item.temp)
            ).toFixed(1)} °C`,
          ],
          [
            "Kelembapan Rata-rata",
            `${calculateAverage(
              data.map((item) => item.humidity)
            ).toFixed(1)} %`,
          ],
          [
            "Soil Sensor 1 Rata-rata",
            `${calculateAverage(
              data.map((item) => item.soil1)
            ).toFixed(1)} %`,
          ],
          [
            "Soil Sensor 2 Rata-rata",
            `${calculateAverage(
              data.map((item) => item.soil2)
            ).toFixed(1)} %`,
          ],
          [
            "Intensitas Cahaya Rata-rata",
            `${calculateAverage(
              data.map((item) =>
                normalizeLightPercentage(item.light)
              )
            ).toFixed(1)} %`,
          ],
          [
            "Health Score Rata-rata",
            `${calculateAverage(
              data.map((item) => item.raised)
            ).toFixed(1)} %`,
          ],
        ];

        raisedSummary.forEach(([label, value], index) => {
          const rowNumber = summaryStartRow + index + 1;

          // Merge terlebih dahulu
          summarySheet.mergeCells(
            `B${rowNumber}:D${rowNumber}`
          );

          const labelCell =
            summarySheet.getCell(`A${rowNumber}`);

          const valueCell =
            summarySheet.getCell(`B${rowNumber}`);

          // Baru isi nilainya
          labelCell.value = String(label);
          valueCell.value = String(value);

          labelCell.font = {
            bold: true,
            color: { argb: "FF475569" },
          };

          labelCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };

          labelCell.alignment = {
            vertical: "middle",
            horizontal: "left",
          };

          valueCell.font = {
            bold: true,
            color: { argb: "FF0F172A" },
          };

          valueCell.alignment = {
            vertical: "middle",
            horizontal: "left",
          };

          for (let column = 1; column <= 4; column++) {
            const cell = summarySheet.getCell(
              rowNumber,
              column
            );

            cell.border = {
              top: {
                style: "thin",
                color: { argb: "FFE2E8F0" },
              },
              left: {
                style: "thin",
                color: { argb: "FFE2E8F0" },
              },
              bottom: {
                style: "thin",
                color: { argb: "FFE2E8F0" },
              },
              right: {
                style: "thin",
                color: { argb: "FFE2E8F0" },
              },
            };
          }

          summarySheet.getRow(rowNumber).height = 23;
        });

        summaryStartRow += raisedSummary.length + 2;
      }

      if (
        selectedSystem === "all" ||
        selectedSystem === "aquaponik"
      ) {
        summarySheet.mergeCells(
          `A${summaryStartRow}:D${summaryStartRow}`
        );

        const aquaTitle =
          summarySheet.getCell(`A${summaryStartRow}`);

        aquaTitle.value = "Ringkasan Aquaponik";
        aquaTitle.font = {
          bold: true,
          size: 13,
          color: { argb: "FFFFFFFF" },
        };

        aquaTitle.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0891B2" },
        };

        aquaTitle.alignment = {
          horizontal: "left",
          vertical: "middle",
        };

        summarySheet.getRow(summaryStartRow).height = 27;

        const aquaponicsSummary = [
          [
            "pH Air Rata-rata",
            calculateAverage(
              data.map((item) => item.ph)
            ).toFixed(2),
          ],
          [
            "Suhu Air Rata-rata",
            `${calculateAverage(
              data.map((item) => item.waterTemp)
            ).toFixed(1)} °C`,
          ],
          [
            "Turbidity Rata-rata",
            `${calculateAverage(
              data.map((item) => item.turbidity)
            ).toFixed(1)} NTU`,
          ],
          [
            "Water Level Rata-rata",
            `${calculateAverage(
              data.map((item) => item.waterLevel)
            ).toFixed(1)} %`,
          ],
          [
            "Feed Level Rata-rata",
            `${calculateAverage(
              data.map((item) => item.feedLevel)
            ).toFixed(1)} %`,
          ],
          [
            "Health Score Rata-rata",
            `${calculateAverage(
              data.map((item) => item.aqua)
            ).toFixed(1)} %`,
          ],
        ];

        aquaponicsSummary.forEach(
          ([label, value], index) => {
            const rowNumber =
              summaryStartRow + index + 1;

            // Merge terlebih dahulu
            summarySheet.mergeCells(
              `B${rowNumber}:D${rowNumber}`
            );

            const labelCell =
              summarySheet.getCell(`A${rowNumber}`);

            const valueCell =
              summarySheet.getCell(`B${rowNumber}`);

            // Baru isi nilainya
            labelCell.value = String(label);
            valueCell.value = String(value);

            labelCell.font = {
              bold: true,
              color: { argb: "FF475569" },
            };

            labelCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" },
            };

            labelCell.alignment = {
              vertical: "middle",
              horizontal: "left",
            };

            valueCell.font = {
              bold: true,
              color: { argb: "FF0F172A" },
            };

            valueCell.alignment = {
              vertical: "middle",
              horizontal: "left",
            };

            for (
              let column = 1;
              column <= 4;
              column++
            ) {
              const cell = summarySheet.getCell(
                rowNumber,
                column
              );

              cell.border = {
                top: {
                  style: "thin",
                  color: { argb: "FFE2E8F0" },
                },
                left: {
                  style: "thin",
                  color: { argb: "FFE2E8F0" },
                },
                bottom: {
                  style: "thin",
                  color: { argb: "FFE2E8F0" },
                },
                right: {
                  style: "thin",
                  color: { argb: "FFE2E8F0" },
                },
              };
            }

            summarySheet.getRow(rowNumber).height = 23;
          }
        );
      }

      /*
      ===========================================
      SHEET 2 — RAISED BED
      ===========================================
      */

      if (
        selectedSystem === "all" ||
        selectedSystem === "raised_bed"
      ) {
        const raisedSheet =
          workbook.addWorksheet("Raised Bed", {
            views: [
              {
                state: "frozen",
                ySplit: 5,
                showGridLines: false,
              },
            ],
          });

        raisedSheet.columns = [
          { key: "waktu", width: 24 },
          { key: "suhu", width: 20 },
          { key: "humidity", width: 23 },
          { key: "soil1", width: 18 },
          { key: "soil2", width: 18 },
          { key: "light", width: 24 },
          { key: "rain", width: 21 },
          { key: "health", width: 21 },
          { key: "status", width: 17 },
        ];

        raisedSheet.mergeCells("A1:I1");
        raisedSheet.getCell("A1").value =
          "SMART GREEN FARM — RAISED BED";

        raisedSheet.getCell("A1").font = {
          bold: true,
          size: 18,
          color: { argb: "FFFFFFFF" },
        };

        raisedSheet.getCell("A1").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0F766E" },
        };

        raisedSheet.getCell("A1").alignment = {
          horizontal: "center",
          vertical: "middle",
        };

        raisedSheet.getRow(1).height = 34;

        raisedSheet.mergeCells("A2:I2");
        raisedSheet.getCell("A2").value =
          `Periode: ${formatExportDate(
            dateRange.start
          )} – ${formatExportDate(
            dateRange.end
          )} | Interval: ${intervalLabel}`;

        raisedSheet.getCell("A2").alignment = {
          horizontal: "center",
        };

        raisedSheet.getCell("A2").font = {
          italic: true,
          color: { argb: "FF475569" },
        };

        raisedSheet.addRow([]);
        raisedSheet.addRow([]);

        const raisedHeader = raisedSheet.getRow(5);

        raisedHeader.values = [
          "Waktu",
          "Suhu Udara (°C)",
          "Kelembapan Udara (%)",
          "Soil Sensor 1 (%)",
          "Soil Sensor 2 (%)",
          "Intensitas Cahaya (%)",
          "Curah Hujan (%)",
          "Health Score (%)",
          "Status",
        ];

        applyHeaderStyle(raisedHeader);

        data.forEach((item, index) => {
          const healthScore = Number(item.raised ?? 0);

          const status =
            healthScore >= 85
              ? "Sangat Baik"
              : healthScore >= 70
                ? "Baik"
                : healthScore >= 50
                  ? "Peringatan"
                  : "Kritis";

          const row = raisedSheet.addRow({
            waktu: formatExportDateTime(
              item.date || item.label
            ),
            suhu: Number(item.temp ?? 0),
            humidity: Number(item.humidity ?? 0),
            soil1: Number(item.soil1 ?? 0),
            soil2: Number(item.soil2 ?? 0),
            light: normalizeLightPercentage(
              Number(item.light ?? 0)
            ),
            rain: Number(item.rain ?? 0),
            health: healthScore,
            status,
          });

          applyDataRowStyle(row, index % 2 === 1);

          row.getCell(2).numFmt = "0.0";
          row.getCell(3).numFmt = "0.0";
          row.getCell(4).numFmt = "0.0";
          row.getCell(5).numFmt = "0.0";
          row.getCell(6).numFmt = "0";
          row.getCell(7).numFmt = "0.0";
          row.getCell(8).numFmt = "0";

          applyHealthScoreStyle(
            row.getCell(8),
            healthScore
          );

          applyHealthScoreStyle(
            row.getCell(9),
            healthScore
          );
        });

        raisedSheet.autoFilter = {
          from: "A5",
          to: `I${raisedSheet.rowCount}`,
        };

        raisedSheet.pageSetup = {
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          paperSize: 9,
          margins: {
            left: 0.3,
            right: 0.3,
            top: 0.5,
            bottom: 0.5,
            header: 0.2,
            footer: 0.2,
          },
        };

        raisedSheet.headerFooter.oddFooter =
          `Generated by Smart Green Farm Dashboard | ${exportTime} WIB`;
      }

      /*
      ===========================================
      SHEET 3 — AQUAPONIK
      ===========================================
      */

      if (
        selectedSystem === "all" ||
        selectedSystem === "aquaponik"
      ) {
        const aquaSheet =
          workbook.addWorksheet("Aquaponik", {
            views: [
              {
                state: "frozen",
                ySplit: 5,
                showGridLines: false,
              },
            ],
          });

        aquaSheet.columns = [
          { key: "waktu", width: 24 },
          { key: "ph", width: 14 },
          { key: "temperature", width: 18 },
          { key: "turbidity", width: 18 },
          { key: "water", width: 18 },
          { key: "feed", width: 18 },
          { key: "health", width: 21 },
          { key: "status", width: 17 },
        ];

        aquaSheet.mergeCells("A1:H1");
        aquaSheet.getCell("A1").value =
          "SMART GREEN FARM — AQUAPONIK";

        aquaSheet.getCell("A1").font = {
          bold: true,
          size: 18,
          color: { argb: "FFFFFFFF" },
        };

        aquaSheet.getCell("A1").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0891B2" },
        };

        aquaSheet.getCell("A1").alignment = {
          horizontal: "center",
          vertical: "middle",
        };

        aquaSheet.getRow(1).height = 34;

        aquaSheet.mergeCells("A2:H2");
        aquaSheet.getCell("A2").value =
          `Periode: ${formatExportDate(
            dateRange.start
          )} – ${formatExportDate(
            dateRange.end
          )} | Interval: ${intervalLabel}`;

        aquaSheet.getCell("A2").alignment = {
          horizontal: "center",
        };

        aquaSheet.getCell("A2").font = {
          italic: true,
          color: { argb: "FF475569" },
        };

        aquaSheet.addRow([]);
        aquaSheet.addRow([]);

        const aquaHeader = aquaSheet.getRow(5);

        aquaHeader.values = [
          "Waktu",
          "pH Air",
          "Suhu Air (°C)",
          "Turbidity (NTU)",
          "Water Level (%)",
          "Feed Level (%)",
          "Health Score (%)",
          "Status",
        ];

        applyHeaderStyle(aquaHeader);

        data.forEach((item, index) => {
          const healthScore = Number(item.aqua ?? 0);

          const status =
            healthScore >= 85
              ? "Sangat Baik"
              : healthScore >= 70
                ? "Baik"
                : healthScore >= 50
                  ? "Peringatan"
                  : "Kritis";

          const row = aquaSheet.addRow({
            waktu: formatExportDateTime(
              item.date || item.label
            ),
            ph: Number(item.ph ?? 0),
            temperature: Number(item.waterTemp ?? 0),
            turbidity: Number(item.turbidity ?? 0),
            water: Number(item.waterLevel ?? 0),
            feed: Number(item.feedLevel ?? 0),
            health: healthScore,
            status,
          });

          applyDataRowStyle(row, index % 2 === 1);

          row.getCell(2).numFmt = "0.00";
          row.getCell(3).numFmt = "0.0";
          row.getCell(4).numFmt = "0.0";
          row.getCell(5).numFmt = "0.0";
          row.getCell(6).numFmt = "0.0";
          row.getCell(7).numFmt = "0";

          applyHealthScoreStyle(
            row.getCell(7),
            healthScore
          );

          applyHealthScoreStyle(
            row.getCell(8),
            healthScore
          );
        });

        aquaSheet.autoFilter = {
          from: "A5",
          to: `H${aquaSheet.rowCount}`,
        };

        aquaSheet.pageSetup = {
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          paperSize: 9,
          margins: {
            left: 0.3,
            right: 0.3,
            top: 0.5,
            bottom: 0.5,
            header: 0.2,
            footer: 0.2,
          },
        };

        aquaSheet.headerFooter.oddFooter =
          `Generated by Smart Green Farm Dashboard | ${exportTime} WIB`;
      }

      /*
===========================================
SHEET 4 — ALERTS
===========================================
*/

      const alertsSheet = workbook.addWorksheet("Alerts", {
        views: [
          {
            state: "frozen",
            ySplit: 5,
            showGridLines: false,
          },
        ],
      });

      alertsSheet.columns = [
        { key: "number", width: 10 },
        { key: "level", width: 17 },
        { key: "title", width: 30 },
        { key: "message", width: 55 },
        { key: "status", width: 18 },
      ];

      alertsSheet.mergeCells("A1:E1");
      alertsSheet.getCell("A1").value =
        "SMART GREEN FARM — ALERTS";

      alertsSheet.getCell("A1").font = {
        bold: true,
        size: 18,
        color: { argb: "FFFFFFFF" },
      };

      alertsSheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB45309" },
      };

      alertsSheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      alertsSheet.getRow(1).height = 34;

      alertsSheet.mergeCells("A2:E2");
      alertsSheet.getCell("A2").value =
        `Periode: ${formatExportDate(
          dateRange.start
        )} – ${formatExportDate(
          dateRange.end
        )} | Total Alert: ${alerts.length}`;

      alertsSheet.getCell("A2").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      alertsSheet.getCell("A2").font = {
        italic: true,
        color: { argb: "FF475569" },
      };

      alertsSheet.addRow([]);
      alertsSheet.addRow([]);

      const alertsHeader = alertsSheet.getRow(5);

      alertsHeader.values = [
        "No.",
        "Level",
        "Judul",
        "Pesan",
        "Status",
      ];

      applyHeaderStyle(alertsHeader);

      if (alerts.length === 0) {
        const emptyRow = alertsSheet.addRow({
          number: "-",
          level: "-",
          title: "Tidak Ada Alert",
          message:
            "Tidak ditemukan kondisi peringatan pada sistem.",
          status: "Normal",
        });

        alertsSheet.mergeCells(
          `C${emptyRow.number}:D${emptyRow.number}`
        );

        emptyRow.height = 28;

        emptyRow.eachCell((cell) => {
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCFCE7" },
          };

          cell.font = {
            bold: true,
            color: { argb: "FF166534" },
          };
        });
      } else {
        alerts.forEach((alert, index) => {
          const isDanger = alert.level === "danger";

          const row = alertsSheet.addRow({
            number: index + 1,
            level: isDanger ? "Kritis" : "Peringatan",
            title: alert.title,
            message: alert.message,
            status: "Aktif",
          });

          applyDataRowStyle(row, index % 2 === 1);

          row.getCell(1).alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          row.getCell(2).alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          row.getCell(3).alignment = {
            vertical: "middle",
            wrapText: true,
          };

          row.getCell(4).alignment = {
            vertical: "middle",
            wrapText: true,
          };

          row.getCell(5).alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          const alertColor = isDanger
            ? {
              background: "FFFEE2E2",
              text: "FF991B1B",
            }
            : {
              background: "FFFEF3C7",
              text: "FF92400E",
            };

          [2, 5].forEach((column) => {
            const cell = row.getCell(column);

            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: alertColor.background,
              },
            };

            cell.font = {
              bold: true,
              color: {
                argb: alertColor.text,
              },
            };
          });
        });
      }

      alertsSheet.autoFilter = {
        from: "A5",
        to: `E${alertsSheet.rowCount}`,
      };

      alertsSheet.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
        margins: {
          left: 0.3,
          right: 0.3,
          top: 0.5,
          bottom: 0.5,
          header: 0.2,
          footer: 0.2,
        },
      };

      alertsSheet.headerFooter.oddFooter =
        `Generated by Smart Green Farm Dashboard | ${exportTime} WIB`;

      /*
===========================================
SHEET 5 — ACTIVITY LOG
===========================================
*/

      const activitySheet =
        workbook.addWorksheet("Activity Log", {
          views: [
            {
              state: "frozen",
              ySplit: 5,
              showGridLines: false,
            },
          ],
        });

      activitySheet.columns = [
        { key: "number", width: 9 },
        { key: "time", width: 24 },
        { key: "type", width: 30 },
        { key: "system", width: 18 },
        { key: "title", width: 32 },
        { key: "description", width: 55 },
        { key: "actor", width: 24 },
        { key: "actorType", width: 18 },
        { key: "status", width: 17 },
      ];

      activitySheet.mergeCells("A1:I1");

      const activityTitle =
        activitySheet.getCell("A1");

      activityTitle.value =
        "SMART GREEN FARM — ACTIVITY LOG";

      activityTitle.font = {
        bold: true,
        size: 18,
        color: {
          argb: "FFFFFFFF",
        },
      };

      activityTitle.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FF334155",
        },
      };

      activityTitle.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      activitySheet.getRow(1).height = 34;

      activitySheet.mergeCells("A2:I2");

      const activitySubtitle =
        activitySheet.getCell("A2");

      activitySubtitle.value =
        `Periode: ${formatExportDate(
          dateRange.start
        )} – ${formatExportDate(
          dateRange.end
        )} | Total Aktivitas: ${activityLogs.length
        }`;

      activitySubtitle.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      activitySubtitle.font = {
        italic: true,
        color: {
          argb: "FF475569",
        },
      };

      activitySheet.addRow([]);
      activitySheet.addRow([]);

      const activityHeader =
        activitySheet.getRow(5);

      activityHeader.values = [
        "No.",
        "Waktu",
        "Jenis Aktivitas",
        "Sistem",
        "Judul",
        "Deskripsi",
        "Pelaku",
        "Tipe Pelaku",
        "Status",
      ];

      applyHeaderStyle(activityHeader);

      if (activityLogs.length === 0) {
        const emptyRow =
          activitySheet.addRow({
            number: "-",
            time: "-",
            type: "-",
            system: "-",
            title: "Belum Ada Aktivitas",
            description:
              "Tidak ditemukan aktivitas pada periode yang dipilih.",
            actor: "-",
            actorType: "-",
            status: "Info",
          });

        emptyRow.height = 30;

        emptyRow.eachCell((cell) => {
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "FFF1F5F9",
            },
          };

          cell.font = {
            bold: true,
            color: {
              argb: "FF475569",
            },
          };
        });
      } else {
        activityLogs.forEach(
          (activity, index) => {
            const rawTime =
              activity.activity_at ??
              activity.created_at ??
              "";

            const rawStatus =
              activity.status?.toLowerCase() ??
              "info";

            const statusLabel =
              rawStatus === "success"
                ? "Berhasil"
                : rawStatus === "failed"
                  ? "Gagal"
                  : rawStatus === "warning"
                    ? "Peringatan"
                    : "Info";

            const systemLabel =
              activity.system_type ===
                "raised_bed"
                ? "Raised Bed"
                : activity.system_type ===
                  "aquaponik"
                  ? "Aquaponik"
                  : activity.system_type ??
                  "Sistem";

            const actorTypeLabel =
              activity.actor_type === "user"
                ? "Pengguna"
                : activity.actor_type ===
                  "device"
                  ? "Perangkat"
                  : activity.actor_type ===
                    "automation"
                    ? "Otomatisasi"
                    : activity.actor_type ===
                      "system"
                      ? "Sistem"
                      : activity.actor_type ??
                      "-";

            const row =
              activitySheet.addRow({
                number: index + 1,

                time: rawTime
                  ? formatExportDateTime(
                    rawTime
                  )
                  : "-",

                type: formatActivityType(
                  activity.activity_type
                ),

                system: systemLabel,

                title:
                  activity.title ??
                  "Aktivitas Sistem",

                description:
                  activity.description ??
                  "-",

                actor:
                  activity.actor_name ??
                  activity.device_id ??
                  "Smart Green Farm",

                actorType:
                  actorTypeLabel,

                status:
                  statusLabel,
              });

            applyDataRowStyle(
              row,
              index % 2 === 1
            );

            row.height = 30;

            row.getCell(1).alignment = {
              horizontal: "center",
              vertical: "middle",
            };

            row.getCell(2).alignment = {
              horizontal: "center",
              vertical: "middle",
            };

            row.getCell(3).alignment = {
              vertical: "middle",
              wrapText: true,
            };

            row.getCell(4).alignment = {
              horizontal: "center",
              vertical: "middle",
            };

            row.getCell(5).alignment = {
              vertical: "middle",
              wrapText: true,
            };

            row.getCell(6).alignment = {
              vertical: "middle",
              wrapText: true,
            };

            row.getCell(7).alignment = {
              vertical: "middle",
              wrapText: true,
            };

            row.getCell(8).alignment = {
              horizontal: "center",
              vertical: "middle",
            };

            const statusCell =
              row.getCell(9);

            statusCell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };

            if (rawStatus === "success") {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFDCFCE7",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF166534",
                },
              };
            } else if (
              rawStatus === "failed"
            ) {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFFEE2E2",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF991B1B",
                },
              };
            } else if (
              rawStatus === "warning"
            ) {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFFEF3C7",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF92400E",
                },
              };
            } else {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFDBEAFE",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF1D4ED8",
                },
              };
            }
          }
        );
      }

      activitySheet.autoFilter = {
        from: "A5",
        to: `I${activitySheet.rowCount}`,
      };

      activitySheet.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
        margins: {
          left: 0.3,
          right: 0.3,
          top: 0.5,
          bottom: 0.5,
          header: 0.2,
          footer: 0.2,
        },
      };

      activitySheet.headerFooter.oddFooter =
        `Generated by Smart Green Farm Dashboard | ${exportTime} WIB`;


      /*
===========================================
SHEET 6 — MANUAL CONTROL LOG
===========================================
*/

      const manualSheet =
        workbook.addWorksheet(
          "Manual Control Log",
          {
            views: [
              {
                state: "frozen",
                ySplit: 5,
                showGridLines: false,
              },
            ],
          }
        );

      manualSheet.columns = [
        { key: "number", width: 8 },
        { key: "time", width: 24 },
        { key: "system", width: 18 },
        { key: "actuator", width: 22 },
        { key: "command", width: 20 },
        { key: "previous", width: 18 },
        { key: "requested", width: 18 },
        { key: "final", width: 18 },
        { key: "duration", width: 17 },
        { key: "initiatedBy", width: 22 },
        { key: "status", width: 18 },
        { key: "reason", width: 45 },
      ];

      manualSheet.mergeCells("A1:L1");

      const manualTitle =
        manualSheet.getCell("A1");

      manualTitle.value =
        "SMART GREEN FARM — MANUAL CONTROL LOG";

      manualTitle.font = {
        bold: true,
        size: 18,
        color: {
          argb: "FFFFFFFF",
        },
      };

      manualTitle.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FF7C3AED",
        },
      };

      manualTitle.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      manualSheet.getRow(1).height = 34;

      manualSheet.mergeCells("A2:L2");

      const manualSubtitle =
        manualSheet.getCell("A2");

      manualSubtitle.value =
        `Periode: ${formatExportDate(
          dateRange.start
        )} – ${formatExportDate(
          dateRange.end
        )} | Total Perintah: ${manualControlLogs.length
        }`;

      manualSubtitle.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      manualSubtitle.font = {
        italic: true,
        color: {
          argb: "FF475569",
        },
      };

      manualSheet.addRow([]);
      manualSheet.addRow([]);

      const manualHeader =
        manualSheet.getRow(5);

      manualHeader.values = [
        "No.",
        "Waktu",
        "Sistem",
        "Aktuator",
        "Perintah",
        "Status Sebelumnya",
        "Status Diminta",
        "Status Akhir",
        "Durasi",
        "Pelaku",
        "Status Eksekusi",
        "Alasan",
      ];

      applyHeaderStyle(manualHeader);

      const formatState = (
        value: boolean | string | undefined
      ): string => {
        if (value === true) return "ON";
        if (value === false) return "OFF";

        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return "-";
        }

        return String(value).toUpperCase();
      };

      if (manualControlLogs.length === 0) {
        const emptyRow =
          manualSheet.addRow({
            number: "-",
            time: "-",
            system: "-",
            actuator: "-",
            command: "-",
            previous: "-",
            requested: "-",
            final: "-",
            duration: "-",
            initiatedBy: "-",
            status: "Info",
            reason:
              "Tidak ditemukan manual control log pada periode yang dipilih.",
          });

        emptyRow.height = 30;

        emptyRow.eachCell((cell) => {
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "FFF1F5F9",
            },
          };

          cell.font = {
            bold: true,
            color: {
              argb: "FF475569",
            },
          };
        });
      } else {
        manualControlLogs.forEach(
          (manual, index) => {
            const rawTime =
              manual.requested_at ??
              manual.executed_at ??
              manual.created_at ??
              "";

            const rawStatus =
              manual.command_status
                ?.toLowerCase() ??
              "pending";

            const statusLabel =
              rawStatus === "success"
                ? "Berhasil"
                : rawStatus === "failed"
                  ? "Gagal"
                  : rawStatus === "timeout"
                    ? "Timeout"
                    : rawStatus === "cancelled"
                      ? "Dibatalkan"
                      : rawStatus === "executing"
                        ? "Diproses"
                        : "Menunggu";

            const systemLabel =
              manual.system_type ===
                "raised_bed"
                ? "Raised Bed"
                : manual.system_type ===
                  "aquaponik"
                  ? "Aquaponik"
                  : manual.system_type ??
                  "-";

            const durationLabel =
              manual.duration_seconds !==
                undefined
                ? `${manual.duration_seconds} detik`
                : "-";

            const row =
              manualSheet.addRow({
                number: index + 1,

                time: rawTime
                  ? formatExportDateTime(
                    rawTime
                  )
                  : "-",

                system: systemLabel,

                actuator:
                  manual.actuator_name ??
                  "-",

                command:
                  manual.command ?? "-",

                previous: formatState(
                  manual.previous_state
                ),

                requested: formatState(
                  manual.requested_state
                ),

                final: formatState(
                  manual.final_state
                ),

                duration: durationLabel,

                initiatedBy:
                  manual.initiated_by ??
                  "Pengguna",

                status: statusLabel,

                reason:
                  manual.reason ??
                  manual.error_message ??
                  "-",
              });

            applyDataRowStyle(
              row,
              index % 2 === 1
            );

            row.height = 30;

            row.eachCell(
              { includeEmpty: true },
              (cell, columnNumber) => {
                cell.alignment = {
                  horizontal:
                    columnNumber === 12
                      ? "left"
                      : "center",
                  vertical: "middle",
                  wrapText:
                    columnNumber === 12,
                };
              }
            );

            const statusCell =
              row.getCell(11);

            if (rawStatus === "success") {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFDCFCE7",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF166534",
                },
              };
            } else if (
              rawStatus === "failed" ||
              rawStatus === "timeout"
            ) {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFFEE2E2",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF991B1B",
                },
              };
            } else if (
              rawStatus === "executing"
            ) {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFDBEAFE",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF1D4ED8",
                },
              };
            } else {
              statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: "FFFEF3C7",
                },
              };

              statusCell.font = {
                bold: true,
                color: {
                  argb: "FF92400E",
                },
              };
            }
          }
        );
      }

      manualSheet.autoFilter = {
        from: "A5",
        to: `L${manualSheet.rowCount}`,
      };

      manualSheet.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
        margins: {
          left: 0.3,
          right: 0.3,
          top: 0.5,
          bottom: 0.5,
          header: 0.2,
          footer: 0.2,
        },
      };

      manualSheet.headerFooter.oddFooter =
        `Generated by Smart Green Farm Dashboard | ${exportTime} WIB`;

      /*
===========================================
SHEET 7 — STATISTIK
===========================================
*/

      const statisticsSheet =
        workbook.addWorksheet("Statistik", {
          views: [
            {
              showGridLines: false,
            },
          ],
        });

      statisticsSheet.columns = [
        { key: "parameter", width: 34 },
        { key: "value", width: 24 },
        { key: "unit", width: 18 },
        { key: "description", width: 60 },
      ];

      statisticsSheet.mergeCells("A1:D1");

      const statisticsTitle =
        statisticsSheet.getCell("A1");

      statisticsTitle.value =
        "SMART GREEN FARM — STATISTIK MONITORING";

      statisticsTitle.font = {
        bold: true,
        size: 18,
        color: {
          argb: "FFFFFFFF",
        },
      };

      statisticsTitle.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FF0F766E",
        },
      };

      statisticsTitle.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      statisticsSheet.getRow(1).height = 34;

      statisticsSheet.mergeCells("A2:D2");

      const statisticsSubtitle =
        statisticsSheet.getCell("A2");

      statisticsSubtitle.value =
        `Periode: ${formatExportDate(
          dateRange.start
        )} – ${formatExportDate(
          dateRange.end
        )} | Interval: ${intervalLabel}`;

      statisticsSubtitle.font = {
        italic: true,
        color: {
          argb: "FF475569",
        },
      };

      statisticsSubtitle.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      statisticsSheet.addRow([]);
      statisticsSheet.addRow([]);

      const statisticsHeader =
        statisticsSheet.getRow(5);

      statisticsHeader.values = [
        "Parameter",
        "Nilai",
        "Satuan",
        "Keterangan",
      ];

      applyHeaderStyle(statisticsHeader);

      const safeValues = (
        values: Array<number | null | undefined>
      ): number[] =>
        values
          .map((value) => Number(value))
          .filter((value) =>
            Number.isFinite(value)
          );

      const minValue = (
        values: Array<number | null | undefined>
      ): number => {
        const validValues = safeValues(values);

        return validValues.length > 0
          ? Math.min(...validValues)
          : 0;
      };

      const maxValue = (
        values: Array<number | null | undefined>
      ): number => {
        const validValues = safeValues(values);

        return validValues.length > 0
          ? Math.max(...validValues)
          : 0;
      };

      const averageValue = (
        values: Array<number | null | undefined>
      ): number =>
        calculateAverage(values);

      const statisticsRows = [
        {
          parameter: "Jumlah Data History",
          value: data.length,
          unit: "baris",
          description:
            "Jumlah data hasil agregasi sesuai interval yang dipilih.",
        },
        {
          parameter: "Jumlah Alert",
          value: alerts.length,
          unit: "alert",
          description:
            "Jumlah alert aktif yang tersedia saat laporan dibuat.",
        },
        {
          parameter: "Jumlah Aktivitas",
          value: activityLogs.length,
          unit: "aktivitas",
          description:
            "Jumlah activity log pada periode yang dipilih.",
        },
        {
          parameter: "Jumlah Kontrol Manual",
          value: manualControlLogs.length,
          unit: "perintah",
          description:
            "Jumlah perintah manual control pada periode yang dipilih.",
        },

        {
          parameter: "Suhu Udara Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.temp)
            ).toFixed(1)
          ),
          unit: "°C",
          description:
            "Rata-rata suhu udara Raised Bed.",
        },
        {
          parameter: "Suhu Udara Minimum",
          value: Number(
            minValue(
              data.map((item) => item.temp)
            ).toFixed(1)
          ),
          unit: "°C",
          description:
            "Nilai suhu udara terendah.",
        },
        {
          parameter: "Suhu Udara Maksimum",
          value: Number(
            maxValue(
              data.map((item) => item.temp)
            ).toFixed(1)
          ),
          unit: "°C",
          description:
            "Nilai suhu udara tertinggi.",
        },

        {
          parameter: "Kelembapan Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.humidity)
            ).toFixed(1)
          ),
          unit: "%",
          description:
            "Rata-rata kelembapan udara Raised Bed.",
        },
        {
          parameter: "Soil Sensor 1 Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.soil1)
            ).toFixed(1)
          ),
          unit: "%",
          description:
            "Rata-rata soil moisture sensor 1.",
        },
        {
          parameter: "Soil Sensor 2 Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.soil2)
            ).toFixed(1)
          ),
          unit: "%",
          description:
            "Rata-rata soil moisture sensor 2.",
        },

        {
          parameter: "pH Air Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.ph)
            ).toFixed(2)
          ),
          unit: "pH",
          description:
            "Rata-rata pH air Aquaponik.",
        },
        {
          parameter: "pH Air Minimum",
          value: Number(
            minValue(
              data.map((item) => item.ph)
            ).toFixed(2)
          ),
          unit: "pH",
          description:
            "Nilai pH terendah.",
        },
        {
          parameter: "pH Air Maksimum",
          value: Number(
            maxValue(
              data.map((item) => item.ph)
            ).toFixed(2)
          ),
          unit: "pH",
          description:
            "Nilai pH tertinggi.",
        },

        {
          parameter: "Turbidity Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.turbidity)
            ).toFixed(1)
          ),
          unit: "NTU",
          description:
            "Rata-rata tingkat kekeruhan air.",
        },
        {
          parameter: "Water Level Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.waterLevel)
            ).toFixed(1)
          ),
          unit: "%",
          description:
            "Rata-rata ketinggian air Aquaponik.",
        },
        {
          parameter: "Feed Level Rata-rata",
          value: Number(
            averageValue(
              data.map((item) => item.feedLevel)
            ).toFixed(1)
          ),
          unit: "%",
          description:
            "Rata-rata stok pakan.",
        },

        {
          parameter: "Health Score Raised Bed",
          value: Number(
            averageValue(
              data.map((item) => item.raised)
            ).toFixed(1)
          ),
          unit: "%",
          description:
            "Rata-rata Health Score Raised Bed.",
        },
        {
          parameter: "Health Score Aquaponik",
          value: Number(
            averageValue(
              data.map((item) => item.aqua)
            ).toFixed(1)
          ),
          unit: "%",
          description:
            "Rata-rata Health Score Aquaponik.",
        },
      ];

      statisticsRows.forEach(
        (statistic, index) => {
          const row =
            statisticsSheet.addRow(
              statistic
            );

          applyDataRowStyle(
            row,
            index % 2 === 1
          );

          row.height = 30;

          row.getCell(1).alignment = {
            vertical: "middle",
            horizontal: "left",
          };

          row.getCell(2).alignment = {
            vertical: "middle",
            horizontal: "center",
          };

          row.getCell(3).alignment = {
            vertical: "middle",
            horizontal: "center",
          };

          row.getCell(4).alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };

          if (
            statistic.parameter.includes(
              "Health Score"
            )
          ) {
            applyHealthScoreStyle(
              row.getCell(2),
              Number(statistic.value)
            );
          }
        }
      );

      statisticsSheet.autoFilter = {
        from: "A5",
        to: `D${statisticsSheet.rowCount}`,
      };

      statisticsSheet.pageSetup = {
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
        margins: {
          left: 0.4,
          right: 0.4,
          top: 0.5,
          bottom: 0.5,
          header: 0.2,
          footer: 0.2,
        },
      };

      statisticsSheet.headerFooter.oddFooter =
        `Generated by Smart Green Farm Dashboard | ${exportTime} WIB`;

      const buffer = await workbook.xlsx.writeBuffer();

      const systemFilename =
        selectedSystem === "all"
          ? "Smart_Green_Farm"
          : selectedSystem === "raised_bed"
            ? "Raised_Bed"
            : "Aquaponik";

      downloadWorkbook(
        buffer,
        `${systemFilename}_Report_${dateRange.start}_${dateRange.end}.xlsx`
      );
    } catch (error) {
      console.error("Gagal membuat file Excel:", error);

      window.alert(
        "Terjadi kesalahan saat membuat file Excel."
      );
    }
  };

  const showRaisedBed =
    selectedSystem === "all" ||
    selectedSystem === "raised_bed";

  const showAquaponik =
    selectedSystem === "all" ||
    selectedSystem === "aquaponik";

  const intervalLabel =
    INTERVAL_OPTIONS.find(
      (item) => item.value === interval
    )?.label ?? "30 Menit";

  return (
    <section
      className={`w-full min-w-0 overflow-hidden rounded-[26px] p-4 shadow-sm ring-1 sm:rounded-[30px] sm:p-6 ${dark
        ? "bg-[#111827] ring-white/10"
        : "bg-white ring-slate-200"
        }`}
    >
      {/* Header */}
      <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-400">
          <History
            size={22}
            strokeWidth={2.3}
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-black leading-tight sm:text-xl">
            Riwayat Monitoring
          </h2>

          <p
            className={`mt-1 text-xs leading-relaxed sm:text-sm ${dark
              ? "text-slate-400"
              : "text-slate-500"
              }`}
          >
            Pilih sistem, rentang tanggal,
            dan interval data.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div
        className={`mb-5 rounded-[28px] p-4 sm:p-5 ${dark
          ? "bg-gradient-to-br from-white/[0.07] to-white/[0.03] shadow-inner shadow-white/[0.02]"
          : "bg-gradient-to-br from-slate-50 to-white shadow-sm"
          }`}
      >
        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={17}
            className="shrink-0 text-teal-400"
          />

          <h3 className="text-sm font-black">
            Filter Riwayat
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SelectInput
            dark={dark}
            label="Sistem"
            value={selectedSystem}
            options={SYSTEM_OPTIONS}
            onChange={(value) =>
              setSelectedSystem(
                value as SystemFilter
              )
            }
          />

          <SelectInput
            dark={dark}
            label="Pilih Rentang"
            value={selectedRange}
            options={RANGE_OPTIONS}
            onChange={setQuickRange}
          />

          <SelectInput
            dark={dark}
            label="Interval Data"
            value={interval}
            options={INTERVAL_OPTIONS}
            onChange={(value) =>
              setInterval(
                value as HistoryInterval
              )
            }
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]">
          <DateInput
            dark={dark}
            label="Tanggal Awal"
            value={draftDateRange.start}
            onChange={(value) => {
              setSelectedRange("");

              setDraftDateRange(
                (current) => ({
                  ...current,
                  start: value,
                })
              );
            }}
          />

          <DateInput
            dark={dark}
            label="Tanggal Akhir"
            value={draftDateRange.end}
            onChange={(value) => {
              setSelectedRange("");

              setDraftDateRange(
                (current) => ({
                  ...current,
                  end: value,
                })
              );
            }}
          />

          <button
            type="button"
            onClick={applyFilter}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-500 px-5 py-3 text-sm font-extrabold text-white transition active:scale-[0.98] hover:bg-teal-600 xl:w-auto xl:self-end"
          >
            Terapkan
          </button>

          <button
            type="button"
            onClick={exportExcel}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold ring-1 transition active:scale-[0.98] xl:w-auto xl:self-end ${dark
              ? "bg-white/5 text-white ring-white/10 hover:bg-white/10"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              }`}
          >
            <Download size={17} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {showRaisedBed && (
          <HistorySummary
            dark={dark}
            title="Raised Bed"
            value={`${raisedAvg}%`}
            description="Health score"
          />
        )}

        {showAquaponik && (
          <HistorySummary
            dark={dark}
            title="Aquaponik"
            value={`${aquaAvg}%`}
            description="Health score"
          />
        )}

        <HistorySummary
          dark={dark}
          title="Jumlah Data"
          value={String(data.length)}
          description="Data grafik"
        />

        <HistorySummary
          dark={dark}
          title="Interval"
          value={intervalLabel}
          description="Interval grafik"
          smallValue
        />
      </div>

      {data.length === 0 && (
        <div
          className={`mb-6 rounded-[22px] border border-dashed p-8 text-center ${dark
            ? "border-white/10 bg-white/[0.03]"
            : "border-slate-200 bg-slate-50"
            }`}
        >
          <p className="text-sm font-bold">
            Data riwayat belum tersedia
          </p>

          <p
            className={`mt-2 text-xs ${dark
              ? "text-slate-500"
              : "text-slate-400"
              }`}
          >
            Pilih rentang tanggal yang
            memiliki data, kemudian tekan
            Terapkan.
          </p>
        </div>
      )}

      {showRaisedBed && (
        <HistoryGroup title="Raised Bed">
          <LineChartCard
            dark={dark}
            title="Suhu Udara"
            unit="°C"
            data={data}
            dataKey="temp"
            color="#f59e0b"
            domain={[15, 45]}
          />

          <LineChartCard
            dark={dark}
            title="Kelembapan Udara"
            unit="%"
            data={data}
            dataKey="humidity"
            color="#06b6d4"
            domain={[0, 100]}
          />

          <LineChartCard
            dark={dark}
            title="Soil Sensor 1"
            unit="%"
            data={data}
            dataKey="soil1"
            color="#14b8a6"
            domain={[0, 100]}
          />

          <LineChartCard
            dark={dark}
            title="Soil Sensor 2"
            unit="%"
            data={data}
            dataKey="soil2"
            color="#22c55e"
            domain={[0, 100]}
          />

          <LineChartCard
            dark={dark}
            title="Intensitas Cahaya"
            unit="%"
            data={data}
            dataKey="light"
            color="#eab308"
            domain={[0, 100]}
          />

          <LineChartCard
            dark={dark}
            title="Curah Hujan"
            unit="%"
            data={data}
            dataKey="rain"
            color="#38bdf8"
            domain={[0, 100]}
          />
        </HistoryGroup>
      )}

      {showAquaponik && (
        <HistoryGroup title="Aquaponik">
          <LineChartCard
            dark={dark}
            title="pH Air"
            unit="pH"
            data={data}
            dataKey="ph"
            color="#22c55e"
            domain={[5, 9]}
          />

          <LineChartCard
            dark={dark}
            title="Suhu Air"
            unit="°C"
            data={data}
            dataKey="waterTemp"
            color="#f97316"
            domain={[15, 40]}
          />

          <LineChartCard
            dark={dark}
            title="Turbidity"
            unit="NTU"
            data={data}
            dataKey="turbidity"
            color="#38bdf8"
            domain={[0, 100]}
          />

          <LineChartCard
            dark={dark}
            title="Water Level"
            unit="%"
            data={data}
            dataKey="waterLevel"
            color="#06b6d4"
            domain={[0, 100]}
          />

          <LineChartCard
            dark={dark}
            title="Sensor Pakan"
            unit="%"
            data={data}
            dataKey="feedLevel"
            color="#a855f7"
            domain={[0, 100]}
          />
        </HistoryGroup>
      )}
    </section>
  );
}

function SelectInput({
  dark,
  label,
  value,
  options,
  onChange,
}: {
  dark: boolean;
  label: string;
  value: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`relative min-w-0 ${open ? "z-[80]" : "z-10"
        }`}
    >
      <span
        className={`mb-2 block px-1 text-[11px] font-bold sm:text-xs ${dark
          ? "text-slate-400"
          : "text-slate-500"
          }`}
      >
        {label}
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() =>
          setOpen((current) => !current)
        }
        className={`relative flex min-h-[54px] w-full items-center justify-between gap-3 overflow-hidden rounded-[20px] px-4 py-3 text-left outline-none transition duration-200 ${open
          ? "ring-2 ring-teal-400"
          : dark
            ? "ring-1 ring-white/10"
            : "ring-1 ring-slate-200"
          } ${dark
            ? "bg-[#0b1322] text-white hover:bg-[#101b2e]"
            : "bg-white text-slate-900 shadow-sm hover:bg-slate-50"
          }`}
      >

        <span className="min-w-0 truncate text-sm font-extrabold">
          {selectedOption?.label ??
            "Pilih opsi"}
        </span>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-200 ${dark
            ? "bg-white/[0.06] text-slate-400"
            : "bg-slate-100 text-slate-500"
            }`}
        >
          <ChevronDown
            size={16}
            strokeWidth={2.4}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""
              }`}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 top-[calc(100%+10px)] z-[100] overflow-hidden rounded-[22px] p-2 shadow-2xl ${dark
            ? "bg-[#101a2b] ring-1 ring-white/10 shadow-black/50"
            : "bg-white ring-1 ring-slate-200 shadow-slate-300/50"
            }`}
        >
          <div className="max-h-64 space-y-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {options.map((option) => {
              const active =
                option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-bold transition ${active
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/15"
                    : dark
                      ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                >
                  <span className="truncate">
                    {option.label}
                  </span>

                  {active && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check
                        size={15}
                        strokeWidth={2.7}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DateInput({
  dark,
  label,
  value,
  onChange,
}: {
  dark: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span
        className={`mb-2 block px-1 text-[11px] font-bold sm:text-xs ${dark
          ? "text-slate-400"
          : "text-slate-500"
          }`}
      >
        {label}
      </span>

      <div
        className={`relative overflow-hidden rounded-[20px] transition focus-within:ring-2 focus-within:ring-teal-500 ${dark
          ? "bg-[#0b1322] ring-1 ring-white/10"
          : "bg-white shadow-sm ring-1 ring-slate-200"
          }`}
      >

        <input
          type="date"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`min-h-[54px] w-full border-0 bg-transparent py-3 pl-5 pr-4 text-sm font-extrabold outline-none ${dark
            ? "text-white [color-scheme:dark]"
            : "text-slate-900 [color-scheme:light]"
            }`}
        />
      </div>
    </label>
  );
}

function HistorySummary({
  dark,
  title,
  value,
  description,
  smallValue = false,
}: {
  dark: boolean;
  title: string;
  value: string;
  description: string;
  smallValue?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-[20px] p-4 sm:rounded-[24px] sm:p-5 ${dark
        ? "bg-white/[0.06]"
        : "bg-white shadow-sm ring-1 ring-slate-100"
        }`}
    >
      <p
        className={`truncate text-[11px] font-semibold sm:text-xs ${dark
          ? "text-slate-400"
          : "text-slate-500"
          }`}
      >
        {title}
      </p>

      <h3
        className={`mt-2 truncate font-black leading-none text-teal-400 ${smallValue
          ? "text-lg sm:text-xl"
          : "text-3xl sm:text-4xl"
          }`}
      >
        {value}
      </h3>

      <p
        className={`mt-2 truncate text-[10px] font-medium sm:text-xs ${dark
          ? "text-slate-500"
          : "text-slate-400"
          }`}
      >
        {description}
      </p>
    </div>
  );
}

function HistoryGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7 min-w-0">
      <h3 className="mb-3 text-lg font-extrabold">
        {title}
      </h3>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function LineChartCard({
  dark,
  title,
  unit,
  data,
  dataKey,
  color,
  domain,
}: {
  dark: boolean;
  title: string;
  unit: string;
  data: HistoryItem[];
  dataKey: keyof HistoryItem;
  color: string;
  domain: [number, number];
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-[22px] p-3 ring-1 sm:rounded-[26px] sm:p-4 ${dark
        ? "bg-white/5 ring-white/10"
        : "bg-[#f8fafc] ring-slate-100"
        }`}
    >
      <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
        <h4 className="min-w-0 truncate text-sm font-extrabold sm:text-base">
          {title}
        </h4>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-[11px] ${dark
            ? "bg-white/5 text-slate-400"
            : "bg-white text-slate-500"
            }`}
        >
          {unit}
        </span>
      </div>

      <div className="h-[210px] w-full min-w-0 sm:h-[240px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: -18,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id={`gradient-${String(
                  dataKey
                )}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={color}
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor={color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.12}
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fontSize: 10,
              }}
              minTickGap={30}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              domain={domain}
              tick={{
                fontSize: 10,
              }}
              width={42}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              formatter={(value) => [
                `${String(value ?? 0)} ${unit}`,
                title,
              ]}
              contentStyle={{
                borderRadius: 14,
                border:
                  "1px solid rgba(148,163,184,0.2)",
                background: dark
                  ? "#0b1220"
                  : "#ffffff",
                color: dark
                  ? "#ffffff"
                  : "#0f172a",
                fontSize: 12,
              }}
            />

            <Area
              type="monotone"
              dataKey={dataKey as string}
              stroke={color}
              fill={`url(#gradient-${String(
                dataKey
              )})`}
              strokeWidth={2.5}
              activeDot={{
                r: 4,
              }}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}