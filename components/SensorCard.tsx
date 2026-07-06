type Props = {
  dark: boolean;
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
};

export default function SensorCard({ dark, label, value, unit, icon }: Props) {
  return (
    <div
      className={`rounded-[24px] p-4 ring-1 transition hover:-translate-y-1 ${
        dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <p className={dark ? "text-xs font-bold text-slate-400" : "text-xs font-bold text-slate-500"}>
          {label}
        </p>
        <span className="text-teal-500">{icon}</span>
      </div>

      <h3 className="text-3xl font-extrabold tracking-tight">
        {value}
        <span className="ml-1 text-sm font-bold text-slate-400">{unit}</span>
      </h3>
    </div>
  );
}