"use client";

type Props = {
  dark: boolean;
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
};

export default function SensorCard({ dark, label, value, unit, icon }: Props) {
  const status = getStatus(label, value);

  return (
    <div
      className={`rounded-[24px] p-4 ${
        dark ? "bg-white/[0.06]" : "bg-white shadow-sm"
      }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${status.iconBg}`}>
          <span className={status.iconColor}>{icon}</span>
        </div>

        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${status.badge}`}>
          {status.text}
        </span>
      </div>

      <p className={dark ? "text-sm font-semibold text-slate-400" : "text-sm font-semibold text-slate-500"}>
        {label}
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-tight">
        {value}
        <span className={dark ? "ml-1 text-sm text-slate-400" : "ml-1 text-sm text-slate-500"}>
          {unit}
        </span>
      </h2>

      <p className={dark ? "mt-3 text-xs text-slate-500" : "mt-3 text-xs text-slate-400"}>
        {status.desc}
      </p>
    </div>
  );
}

function getStatus(label: string, value: number) {
  const normal = {
    text: "Normal",
    desc: "Kondisi ideal",
    badge: "bg-emerald-500/10 text-emerald-400",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-400",
  };

  if (label.includes("Suhu") && value > 32) {
    return {
      text: "Panas",
      desc: "Suhu terlalu tinggi",
      badge: "bg-red-500/10 text-red-400",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
    };
  }

  if (label.includes("Kelembapan") && value < 40) {
    return {
      text: "Rendah",
      desc: "Udara cukup kering",
      badge: "bg-amber-500/10 text-amber-400",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    };
  }

  if (label.includes("Cahaya") && value > 100) {
    return {
      text: "Tinggi",
      desc: "Intensitas cahaya tinggi",
      badge: "bg-yellow-500/10 text-yellow-400",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
    };
  }

  return normal;
}