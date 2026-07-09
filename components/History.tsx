"use client";

import { useState } from "react";
import { History } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { DateRange, HistoryItem } from "@/types/sensor";

type Props = {
  dark: boolean;
  data: HistoryItem[];
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
};

export default function HistoryPage({
  dark,
  data,
  dateRange,
  setDateRange,
}: Props) {
  const [selectedRange, setSelectedRange] = useState(7);

  const raisedAvg =
    data.length > 0
      ? Math.round(data.reduce((sum, item) => sum + item.raised, 0) / data.length)
      : 0;

  const aquaAvg =
    data.length > 0
      ? Math.round(data.reduce((sum, item) => sum + item.aqua, 0) / data.length)
      : 0;

  const setQuickRange = (days: number) => {
    setSelectedRange(days);

    const end = new Date();
    const start = new Date();

    start.setDate(end.getDate() - (days - 1));

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    setDateRange({
      start: formatDate(start),
      end: formatDate(end),
    });
  };

  return (
    <section
      className={`rounded-[30px] p-4 shadow-sm ring-1 sm:p-6 ${dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
        }`}
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 text-teal-400">
          <History size={22} strokeWidth={2.3} />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-black leading-tight">Riwayat Monitoring</h2>
          <p className={dark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
            Pilih rentang hari atau tanggal khusus.
          </p>
        </div>
      </div>

      <div
        className={`mb-4 rounded-[22px] p-1 ${dark ? "bg-white/5" : "bg-slate-100"
          }`}
      >
        <div className="grid grid-cols-4 gap-1">
          {[1, 3, 7, 14].map((day) => {
            const active = selectedRange === day;

            return (
              <button
                key={day}
                onClick={() => setQuickRange(day)}
                className={`rounded-2xl py-2.5 text-sm font-bold transition-all duration-300 ${active
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                    : dark
                      ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-600 hover:bg-white"
                  }`}
              >
                {day} Hari
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`mb-5 grid gap-3 rounded-[24px] p-4 ring-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]sm:grid-cols-[1fr_1fr_auto] ${dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"
          }`}
      >
        <DateInput
          dark={dark}
          label="Tanggal Awal"
          value={dateRange.start}
          onChange={(value) => {
            setSelectedRange(0);
            setDateRange({ ...dateRange, start: value });
          }}
        />

        <DateInput
          dark={dark}
          label="Tanggal Akhir"
          value={dateRange.end}
          onChange={(value) => {
            setSelectedRange(0);
            setDateRange({ ...dateRange, end: value });
          }}
        />

        <button className="rounded-2xl bg-teal-500 px-5 py-3 text-sm font-extrabold text-white">
          Terapkan
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <HistorySummary dark={dark} title="Raised Bed" value={`${raisedAvg}%`} />
        <HistorySummary dark={dark} title="Aquaponik" value={`${aquaAvg}%`} />
      </div>

      <HistoryGroup title="Raised Bed">
        <LineChartCard dark={dark} title="Suhu Udara" data={data} dataKey="temp" color="#f59e0b" />
        <LineChartCard dark={dark} title="Kelembapan Udara" data={data} dataKey="humidity" color="#06b6d4" />
        <LineChartCard dark={dark} title="Soil Sensor 1" data={data} dataKey="soil1" color="#14b8a6" />
        <LineChartCard dark={dark} title="Soil Sensor 2" data={data} dataKey="soil2" color="#22c55e" />
        <LineChartCard dark={dark} title="Intensitas Cahaya" data={data} dataKey="light" color="#eab308" />
        <LineChartCard dark={dark} title="Curah Hujan" data={data} dataKey="rain" color="#38bdf8" />
      </HistoryGroup>

      <HistoryGroup title="Aquaponik">
        <LineChartCard dark={dark} title="pH Air" data={data} dataKey="ph" color="#22c55e" />
        <LineChartCard dark={dark} title="Suhu Air" data={data} dataKey="waterTemp" color="#f97316" />
        <LineChartCard dark={dark} title="Turbidity / Kekeruhan" data={data} dataKey="turbidity" color="#38bdf8" />
        <LineChartCard dark={dark} title="Water Level" data={data} dataKey="waterLevel" color="#06b6d4" />
        <LineChartCard dark={dark} title="Sensor Pakan" data={data} dataKey="feedLevel" color="#a855f7" />
      </HistoryGroup>
    </section>
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
      <p
        className={
          dark
            ? "mb-2 text-xs font-bold text-slate-400"
            : "mb-2 text-xs font-bold text-slate-500"
        }
      >
        {label}
      </p>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-12 w-full min-w-0 rounded-2xl px-4 py-3 text-sm font-black outline-none ring-1 ${dark
            ? "bg-[#0b1220] text-white ring-white/10"
            : "bg-white text-slate-950 ring-slate-200"
          }`}
      />
    </label>
  );
}

function HistorySummary({
  dark,
  title,
  value,
}: {
  dark: boolean;
  title: string;
  value: string;
}) {
  return (
    <div className={`rounded-[24px] p-5 ${dark ? "bg-white/[0.06]" : "bg-white shadow-sm"}`}>
      <p className={`text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>
        {title}
      </p>

      <h3 className="mt-3 text-4xl font-black leading-none text-teal-400">
        {value}
      </h3>

      <p className={`mt-2 text-xs font-medium ${dark ? "text-slate-500" : "text-slate-400"}`}>
        Rata-rata periode ini
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
    <div className="mb-5">
      <h3 className="mb-3 text-lg font-extrabold">{title}</h3>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </div>
  );
}

function LineChartCard({
  dark,
  title,
  data,
  dataKey,
  color,
}: {
  dark: boolean;
  title: string;
  data: HistoryItem[];
  dataKey: keyof HistoryItem;
  color: string;
}) {
  return (
    <div
      className={`rounded-[26px] p-4 ring-1 ${dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"
        }`}
    >
      <h4 className="mb-4 font-extrabold">{title}</h4>

      <div className="pointer-events-none outline-none">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} style={{ outline: "none", pointerEvents: "none" }}>
            <defs>
              <linearGradient id={`grad-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />

            <Area
              type="monotone"
              dataKey={dataKey as string}
              stroke={color}
              fill={`url(#grad-${String(dataKey)})`}
              strokeWidth={3}
              activeDot={false}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}