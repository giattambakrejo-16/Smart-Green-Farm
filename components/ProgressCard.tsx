"use client";

type Props = {
  dark: boolean;
  label: string;
  value: number;
};

export default function ProgressCard({ dark, label, value }: Props) {
  const status = getProgressStatus(label, value);

  return (
    <div
      className={`col-span-2 rounded-[28px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:col-span-1 ${
        dark
          ? "bg-[#1c2434]"
          : "bg-white shadow-[0_8px_25px_rgba(15,23,42,.05)]"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
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
              %
            </span>
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${status.badge}`}
        >
          {status.text}
        </span>
      </div>

      <div
        className={`h-4 overflow-hidden rounded-full ${
          dark ? "bg-white/10" : "bg-slate-100"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${status.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>

      <p
        className={`mt-4 text-xs leading-5 ${
          dark ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {status.desc}
      </p>
    </div>
  );
}

function getProgressStatus(label: string, value: number) {
  const lower = label.toLowerCase();

  if (lower.includes("soil")) {
    if (value < 30) {
      return {
        text: "Kering",
        desc: "Tanah perlu segera disiram.",
        badge: "bg-red-500/10 text-red-500",
        bar: "bg-red-500",
      };
    }

    if (value > 75) {
      return {
        text: "Basah",
        desc: "Kelembapan tanah cukup tinggi.",
        badge: "bg-blue-500/10 text-blue-500",
        bar: "bg-blue-500",
      };
    }

    return {
      text: "Ideal",
      desc: "Kelembapan tanah dalam kondisi baik.",
      badge: "bg-emerald-500/10 text-emerald-600",
      bar: "bg-gradient-to-r from-teal-500 to-lime-400",
    };
  }

  if (lower.includes("pakan")) {
    if (value < 20) {
      return {
        text: "Habis",
        desc: "Pakan hampir habis, segera isi ulang.",
        badge: "bg-red-500/10 text-red-500",
        bar: "bg-red-500",
      };
    }

    if (value < 40) {
      return {
        text: "Menipis",
        desc: "Stok pakan mulai menipis.",
        badge: "bg-amber-500/10 text-amber-600",
        bar: "bg-amber-500",
      };
    }

    return {
      text: "Aman",
      desc: "Stok pakan masih mencukupi.",
      badge: "bg-emerald-500/10 text-emerald-600",
      bar: "bg-gradient-to-r from-teal-500 to-lime-400",
    };
  }

  if (lower.includes("water") || lower.includes("tangki")) {
    if (value < 30) {
      return {
        text: "Rendah",
        desc: "Level air rendah, perlu pengisian.",
        badge: "bg-red-500/10 text-red-500",
        bar: "bg-red-500",
      };
    }

    if (value < 60) {
      return {
        text: "Cukup",
        desc: "Level air cukup, tetap dipantau.",
        badge: "bg-amber-500/10 text-amber-600",
        bar: "bg-amber-500",
      };
    }

    return {
      text: "Aman",
      desc: "Level air dalam kondisi aman.",
      badge: "bg-cyan-500/10 text-cyan-600",
      bar: "bg-gradient-to-r from-cyan-400 to-teal-500",
    };
  }

  return {
    text: "Normal",
    desc: "Kondisi sensor normal.",
    badge: "bg-emerald-500/10 text-emerald-600",
    bar: "bg-gradient-to-r from-teal-500 to-lime-400",
  };
}