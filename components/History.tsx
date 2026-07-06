"use client";

import { CalendarDays } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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

export default function HistoryPage({ dark, data, dateRange, setDateRange }: Props) {
  const raisedAvg = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.raised, 0) / data.length) : 0;
  const aquaAvg = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.aqua, 0) / data.length) : 0;

  return (
    <section className={`rounded-[30px] p-4 shadow-sm ring-1 sm:p-6 ${dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"}`}>
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/15 text-teal-500">
          <CalendarDays size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Riwayat Monitoring</h2>
          <p className={dark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
            Pilih tanggal awal dan akhir untuk melihat rekap data.
          </p>
        </div>
      </div>

      <div className={`mb-5 grid gap-3 rounded-[24px] p-4 ring-1 sm:grid-cols-[1fr_1fr_auto] ${dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"}`}>
        <DateInput dark={dark} label="Tanggal Awal" value={dateRange.start} onChange={(value) => setDateRange({ ...dateRange, start: value })} />
        <DateInput dark={dark} label="Tanggal Akhir" value={dateRange.end} onChange={(value) => setDateRange({ ...dateRange, end: value })} />
        <button className="rounded-2xl bg-teal-500 px-5 py-3 text-sm font-extrabold text-white">
          Terapkan
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <HistorySummary dark={dark} title="Rata-rata Raised Bed" value={`${raisedAvg}%`} />
        <HistorySummary dark={dark} title="Rata-rata Aquaponik" value={`${aquaAvg}%`} />
      </div>

      <HistoryGroup title="Raised Bed">
        <LineChartCard dark={dark} title="Suhu Udara" data={data} dataKey="temp" suffix="°C" color="#f59e0b" />
        <LineChartCard dark={dark} title="Kelembapan Udara" data={data} dataKey="humidity" suffix="%" color="#06b6d4" />
        <LineChartCard dark={dark} title="Soil Sensor 1" data={data} dataKey="soil1" suffix="%" color="#14b8a6" />
        <LineChartCard dark={dark} title="Soil Sensor 2" data={data} dataKey="soil2" suffix="%" color="#22c55e" />
        <LineChartCard dark={dark} title="Intensitas Cahaya" data={data} dataKey="light" suffix="%" color="#eab308" />
        <LineChartCard dark={dark} title="Curah Hujan" data={data} dataKey="rain" suffix="%" color="#38bdf8" />
      </HistoryGroup>

      <HistoryGroup title="Aquaponik">
        <LineChartCard dark={dark} title="pH Air" data={data} dataKey="ph" suffix="" color="#22c55e" />
        <LineChartCard dark={dark} title="Suhu Air" data={data} dataKey="waterTemp" suffix="°C" color="#f97316" />
        <LineChartCard dark={dark} title="Turbidity / Kekeruhan" data={data} dataKey="turbidity" suffix="NTU" color="#38bdf8" />
        <LineChartCard dark={dark} title="Water Level" data={data} dataKey="waterLevel" suffix="%" color="#06b6d4" />
        <LineChartCard dark={dark} title="Sensor Pakan" data={data} dataKey="feedLevel" suffix="%" color="#a855f7" />
      </HistoryGroup>
    </section>
  );
}

function DateInput({ dark, label, value, onChange }: { dark: boolean; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <p className={dark ? "mb-2 text-xs font-bold text-slate-400" : "mb-2 text-xs font-bold text-slate-500"}>{label}</p>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl px-4 py-3 text-sm font-bold outline-none ring-1 ${dark ? "bg-[#0b1220] text-white ring-white/10" : "bg-white text-slate-950 ring-slate-200"}`}
      />
    </label>
  );
}

function HistorySummary({ dark, title, value }: { dark: boolean; title: string; value: string }) {
  return (
    <div className={`rounded-[24px] p-4 ring-1 ${dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"}`}>
      <p className={dark ? "text-xs font-bold text-slate-400" : "text-xs font-bold text-slate-500"}>{title}</p>
      <h3 className="mt-2 text-2xl font-extrabold text-teal-500">{value}</h3>
    </div>
  );
}

function HistoryGroup({ title, children }: { title: string; children: React.ReactNode }) {
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
  suffix,
  color,
}: {
  dark: boolean;
  title: string;
  data: HistoryItem[];
  dataKey: keyof HistoryItem;
  suffix: string;
  color: string;
}) {
  return (
    <div className={`rounded-[26px] p-4 ring-1 ${dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"}`}>
      <h4 className="mb-4 font-extrabold">{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [`${value}${suffix}`, title]} />
          <Area type="monotone" dataKey={dataKey as string} stroke={color} fill={`url(#grad-${String(dataKey)})`} strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}