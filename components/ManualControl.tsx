"use client";

type TileProps = {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
};

export function ControlTile({
  label,
  active,
  icon,
  onClick,
}: TileProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl p-5 text-left transition-all duration-300 hover:scale-[1.03]
      ${
        active
          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl"
          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
      }`}
    >
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl
        ${active ? "bg-white/20" : "bg-white/10"}`}
      >
        {icon}
      </div>

      <h3 className="font-bold">{label}</h3>

      <div
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
          active
            ? "bg-white/20 text-white"
            : "bg-white/10 text-slate-300"
        }`}
      >
        {active ? "Aktif" : "Nonaktif"}
      </div>
    </button>
  );
}

type BoxProps = {
  title: string;
  children: React.ReactNode;
};

export default function ManualControl({
  title,
  children,
}: BoxProps) {
  return (
    <section className="mt-6 rounded-3xl bg-slate-900 p-5 text-white">

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-lg font-bold">
          {title}
        </h2>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
          Manual
        </span>

      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">

        {children}

      </div>

    </section>
  );
}