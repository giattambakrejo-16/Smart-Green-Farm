"use client";

import {
  Droplets,
  Fish,
  Power,
  ShieldCheck,
  Waves,
} from "lucide-react";

type Activity = {
  time: string;
  title: string;
  desc: string;
  type: "pump" | "feed" | "sensor" | "water" | "system";
};

const activities: Activity[] = [
  {
    time: "14:32",
    title: "Pompa Air Menyala",
    desc: "Pompa raised bed aktif selama 5 menit.",
    type: "pump",
  },
  {
    time: "14:20",
    title: "Pakan Otomatis",
    desc: "Pakan ikan berhasil diberikan.",
    type: "feed",
  },
  {
    time: "14:12",
    title: "Sensor Diperbarui",
    desc: "Semua data sensor berhasil sinkron.",
    type: "sensor",
  },
  {
    time: "13:58",
    title: "Water Level Normal",
    desc: "Level air berada pada 72%.",
    type: "water",
  },
  {
    time: "13:40",
    title: "Sistem Aktif",
    desc: "ESP berhasil terhubung.",
    type: "system",
  },
];

function getIcon(type: Activity["type"]) {
  switch (type) {
    case "pump":
      return <Droplets size={18} />;
    case "feed":
      return <Fish size={18} />;
    case "water":
      return <Waves size={18} />;
    case "sensor":
      return <Power size={18} />;
    default:
      return <ShieldCheck size={18} />;
  }
}

export default function ActivityLog({
  dark,
}: {
  dark: boolean;
}) {
  return (
    <section
      className={`rounded-[30px] p-6 ring-1 ${
        dark
          ? "bg-[#111827] ring-white/10"
          : "bg-white ring-slate-200"
      }`}
    >
      <h2 className="mb-6 text-xl font-black">
        Aktivitas Hari Ini
      </h2>

      <div className="space-y-5">
        {activities.map((item) => (
          <div
            key={item.time + item.title}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500 text-white">
                {getIcon(item.type)}
              </div>

              <div className="mt-2 h-full w-[2px] bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400">
                {item.time}
              </p>

              <h3 className="mt-1 font-bold">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}