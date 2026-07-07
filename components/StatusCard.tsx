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
  let status = "Normal";
  let color = "bg-emerald-500/10 text-emerald-500";
  let desc = "Kondisi ideal";

  switch (label) {
    case "Suhu Udara":
      if (value > 32) {
        status = "Panas";
        color = "bg-red-500/10 text-red-500";
        desc = "Suhu terlalu tinggi";
      } else if (value < 22) {
        status = "Dingin";
        color = "bg-amber-500/10 text-amber-500";
        desc = "Suhu rendah";
      }
      break;

    case "Kelembapan":
      if (value < 40) {
        status = "Rendah";
        color = "bg-red-500/10 text-red-500";
        desc = "Udara cukup kering";
      }
      break;

    case "Cahaya":
      if (value < 35) {
        status = "Kurang";
        color = "bg-amber-500/10 text-amber-500";
        desc = "Intensitas cahaya rendah";
      }
      break;

    case "Hujan":
      if (value > 60) {
        status = "Hujan";
        color = "bg-blue-500/10 text-blue-500";
        desc = "Curah hujan tinggi";
      }
      break;
  }

  return (
    <div
      className={`rounded-[26px] p-5 ring-1 transition ${
        dark
          ? "bg-[#111827] ring-white/10"
          : "bg-white ring-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/10 text-teal-500">
          {icon}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${color}`}
        >
          {status}
        </span>
      </div>

      <p
        className={`mt-5 text-sm ${
          dark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
        <span className="ml-1 text-lg">{unit}</span>
      </h2>

      <p
        className={`mt-3 text-xs ${
          dark ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}