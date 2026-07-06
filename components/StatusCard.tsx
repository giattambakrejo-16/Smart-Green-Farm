type Props = {
  dark: boolean;
  label: string;
  value: string;
};

export default function StatusCard({ dark, label, value }: Props) {
  return (
    <div
      className={`rounded-[24px] p-4 ring-1 ${
        dark ? "bg-white/5 ring-white/10" : "bg-[#f8fafc] ring-slate-100"
      }`}
    >
      <p className={dark ? "text-xs font-bold text-slate-400" : "text-xs font-bold text-slate-500"}>
        {label}
      </p>
      <div className="mt-4 inline-flex rounded-full bg-teal-500 px-4 py-2 text-sm font-extrabold text-white">
        {value}
      </div>
    </div>
  );
}