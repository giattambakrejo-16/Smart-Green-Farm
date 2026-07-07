"use client";

type Props = {
  dark: boolean;
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
};

export default function SensorCard({
  dark,
  label,
  value,
  unit,
  icon,
}: Props) {
  const status = getStatus(label, value);

  return (
    <div
      className={`group rounded-[28px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        dark
          ? "bg-[#1c2434]"
          : "bg-white shadow-[0_8px_25px_rgba(15,23,42,.05)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl ${status.iconBg}`}
        >
          <span className={status.iconColor}>{icon}</span>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${status.badge}`}
        >
          {status.text}
        </span>
      </div>

      {/* Body */}
      <div className="mt-5">
        <p
          className={`text-sm font-semibold ${
            dark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {label}
        </p>

        <h2 className="mt-2 text-4xl font-black tracking-tight">
          {value}
          <span
            className={`ml-1 text-base font-bold ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {unit}
          </span>
        </h2>

        <p
          className={`mt-3 text-xs ${
            dark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {status.desc}
        </p>
      </div>
    </div>
  );
}

function getStatus(label: string, value: number) {
  let text = "Normal";
  let desc = "Kondisi ideal";
  let badge = "bg-emerald-500/10 text-emerald-600";
  let iconBg = "bg-emerald-500/10";
  let iconColor = "text-emerald-500";

  switch (label) {
    case "Suhu Udara":
    case "Suhu Air":
      if (value > 32) {
        text = "Panas";
        desc = "Suhu cukup tinggi";
        badge = "bg-red-500/10 text-red-500";
        iconBg = "bg-red-500/10";
        iconColor = "text-red-500";
      } else if (value < 22) {
        text = "Dingin";
        desc = "Suhu cukup rendah";
        badge = "bg-sky-500/10 text-sky-500";
        iconBg = "bg-sky-500/10";
        iconColor = "text-sky-500";
      }
      break;

    case "Kelembapan":
      if (value < 40) {
        text = "Rendah";
        desc = "Udara cukup kering";
        badge = "bg-amber-500/10 text-amber-600";
        iconBg = "bg-amber-500/10";
        iconColor = "text-amber-500";
      }
      break;

    case "Cahaya":
      if (value < 40) {
        text = "Kurang";
        desc = "Cahaya kurang optimal";
        badge = "bg-yellow-500/10 text-yellow-600";
        iconBg = "bg-yellow-500/10";
        iconColor = "text-yellow-500";
      }
      break;

    case "Hujan":
      if (value > 50) {
        text = "Hujan";
        desc = "Curah hujan tinggi";
        badge = "bg-blue-500/10 text-blue-600";
        iconBg = "bg-blue-500/10";
        iconColor = "text-blue-500";
      }
      break;

    case "pH Air":
      if (value < 6.5 || value > 8) {
        text = "Warning";
        desc = "pH di luar rentang ideal";
        badge = "bg-red-500/10 text-red-500";
        iconBg = "bg-red-500/10";
        iconColor = "text-red-500";
      }
      break;

    case "Kekeruhan":
      if (value > 70) {
        text = "Keruh";
        desc = "Air perlu diperiksa";
        badge = "bg-orange-500/10 text-orange-600";
        iconBg = "bg-orange-500/10";
        iconColor = "text-orange-500";
      }
      break;
  }

  return {
    text,
    desc,
    badge,
    iconBg,
    iconColor,
  };
}