"use client";

type TileProps = {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  dark?: boolean;
};

export function ControlTile({ label, active, icon, onClick, dark = true }: TileProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[24px] p-4 text-left transition ${
        active
          ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20"
          : dark
          ? "bg-white/[0.08] text-white hover:bg-white/[0.12]"
          : "bg-slate-100 text-slate-950 hover:bg-slate-200"
      }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div
          className={`grid h-11 w-11 place-items-center rounded-2xl ${
            active
              ? "bg-white/20"
              : dark
              ? "bg-white/10 text-slate-300"
              : "bg-white text-slate-600"
          }`}
        >
          {icon}
        </div>

        <div className={`relative h-7 w-12 rounded-full ${active ? "bg-white/30" : "bg-slate-600/40"}`}>
          <div
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              active ? "left-6" : "left-1"
            }`}
          />
        </div>
      </div>

      <h3 className="text-base font-black leading-tight">{label}</h3>

      <p className={active ? "mt-2 text-xs font-semibold text-white/80" : dark ? "mt-2 text-xs font-semibold text-slate-400" : "mt-2 text-xs font-semibold text-slate-500"}>
        {active ? "Perangkat aktif" : "Perangkat nonaktif"}
      </p>
    </button>
  );
}

export default function ManualControl({
  title,
  children,
  single = false,
  dark = true,
}: {
  title: string;
  children: React.ReactNode;
  single?: boolean;
  dark?: boolean;
}) {
  return (
    <section
      className={`mt-6 rounded-[28px] p-5 ${
        dark ? "bg-[#0b1220] text-white" : "bg-white text-slate-950 shadow-sm"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className={dark ? "mt-1 text-sm font-medium text-slate-400" : "mt-1 text-sm font-medium text-slate-500"}>
            Manual device controller
          </p>
        </div>

        <span className="rounded-full bg-teal-500/10 px-3 py-1.5 text-[11px] font-black text-teal-500">
          LIVE
        </span>
      </div>

      <div className={`grid gap-3 ${single ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"}`}>
        {children}
      </div>
    </section>
  );
}