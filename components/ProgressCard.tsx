type Props = {
  dark: boolean;
  label: string;
  value: number;
};

export default function ProgressCard({ dark, label, value }: Props) {
  return (
    <div
      className={`col-span-2 rounded-[24px] p-4 ring-1 sm:col-span-1 ${
        dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className={dark ? "text-xs font-bold text-slate-400" : "text-xs font-bold text-slate-500"}>
          {label}
        </p>
        <b className="text-sm">{value}%</b>
      </div>

      <div className={dark ? "h-3 overflow-hidden rounded-full bg-white/10" : "h-3 overflow-hidden rounded-full bg-slate-200"}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-lime-400 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}