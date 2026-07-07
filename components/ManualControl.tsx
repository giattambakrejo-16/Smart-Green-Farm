"use client";

type TileProps = {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "wide";
};

export function ControlTile({
  label,
  active,
  icon,
  onClick,
  variant = "default",
}: TileProps) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-[28px] p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
        variant === "wide" ? "min-h-[150px]" : "min-h-[132px]"
      } ${
        active
          ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-xl shadow-teal-500/20"
          : "bg-white/10 text-slate-200 hover:bg-white/15"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl ${
            active ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
          }`}
        >
          {icon}
        </div>

        <div
          className={`relative h-7 w-12 rounded-full transition ${
            active ? "bg-white/30" : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-300 ${
              active ? "left-6" : "left-1"
            }`}
          />
        </div>
      </div>

      <h3 className="text-base font-black leading-tight">{label}</h3>

      <p
        className={`mt-2 text-xs font-semibold ${
          active ? "text-white/80" : "text-slate-400"
        }`}
      >
        {active ? "Perangkat sedang aktif" : "Perangkat nonaktif"}
      </p>
    </button>
  );
}

export default function ManualControl({
  title,
  children,
  single = false,
}: {
  title: string;
  children: React.ReactNode;
  single?: boolean;
}) {
  return (
    <section className="mt-6 rounded-[32px] bg-[#0f172a] p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,.16)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manual device controller
          </p>
        </div>

        <span className="rounded-full bg-teal-500/15 px-4 py-2 text-xs font-black text-teal-400">
          LIVE
        </span>
      </div>

      <div
        className={`grid gap-3 ${
          single ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {children}
      </div>
    </section>
  );
}