import {
  Activity,
  Droplets,
  Fish,
  Leaf,
  Sprout,
  Wifi,
} from "lucide-react";
import type { AlertItem, AquaState, RaisedState } from "@/types/sensor";
import ActivityLog from "./ActivityLog";
import Recommendation from "./Recommendation";

type Props = {
  dark: boolean;
  raised: RaisedState;
  aqua: AquaState;
  alerts: AlertItem[];
};

export default function Overview({ dark, raised, aqua, alerts }: Props) {
  const soilAvg = Math.round((raised.soil1 + raised.soil2) / 2);

  const raisedScore = Math.round(
    soilAvg * 0.4 +
    (raised.temp >= 24 && raised.temp <= 32 ? 100 : 60) * 0.2 +
    raised.humidity * 0.2 +
    raised.light * 0.1 +
    (100 - raised.rain) * 0.1
  );

  const aquaScore = Math.round(
    (aqua.ph >= 6.5 && aqua.ph <= 8 ? 100 : 50) * 0.3 +
    aqua.waterLevel * 0.25 +
    aqua.feedLevel * 0.2 +
    (aqua.waterTemp >= 24 && aqua.waterTemp <= 32 ? 100 : 60) * 0.15 +
    (100 - aqua.turbidity) * 0.1
  );

  const card = dark
    ? "bg-[#101827] text-white"
    : "bg-white text-slate-950 shadow-[0_12px_32px_rgba(15,23,42,.08)]";

  return (
    <section className="space-y-5">
      <section className={`rounded-[32px] p-5 ${card}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold">
              Dashboard Overview
            </h2>

            <p
              className={
                dark
                  ? "mt-1 text-sm text-slate-400"
                  : "mt-1 text-sm text-slate-500"
              }
            >
              Ringkasan kondisi Raised Bed dan Aquaponik hari ini
            </p>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-500">
            Online
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <HealthCard
            icon={<Sprout size={24} />}
            title="Raised Bed"
            value={raisedScore}
            desc="Kondisi kebun"
          />

          <HealthCard
            icon={<Fish size={24} />}
            title="Aquaponik"
            value={aquaScore}
            desc="Air & pakan"
          />
        </div>
      </section>

      <section className={`rounded-[32px] p-5 ${card}`}>
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500/10 text-teal-500">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black">Status Sistem</h3>
            <p
              className={
                dark
                  ? "text-xs font-semibold text-slate-500"
                  : "text-xs font-semibold text-slate-400"
              }
            >
              Monitoring kondisi perangkat
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <p className="rounded-2xl bg-emerald-500/10 p-4 text-sm font-black text-emerald-500">
            Semua sistem berjalan normal.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl p-4 text-sm font-black ${alert.level === "danger"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-amber-500/10 text-amber-500"
                  }`}
              >
                {alert.title}
              </div>
            ))}
          </div>
        )}
      </section>

      <Recommendation dark={dark} raised={raised} aqua={aqua} />
      <ActivityLog dark={dark} />
    </section>
  );
}

function HealthCard({
  icon,
  title,
  value,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  desc: string;
}) {
  return (
    <div className="rounded-[26px] bg-gradient-to-br from-teal-400 to-emerald-500 p-5 text-white shadow-xl shadow-teal-500/20">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
        {icon}
      </div>

      <p className="text-sm font-black text-white/80">{title}</p>

      <h3 className="mt-2 text-4xl font-black leading-none">{value}%</h3>

      <p className="mt-3 text-xs font-semibold text-white/80">{desc}</p>
    </div>
  );
}

function OverviewCard({
  dark,
  icon,
  title,
  value,
}: {
  dark: boolean;
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div
      className={`rounded-[28px] p-5 ${dark
          ? "bg-[#101827] text-white"
          : "bg-white text-slate-950 shadow-[0_12px_32px_rgba(15,23,42,.08)]"
        }`}
    >
      <div className="mb-5 text-teal-500">{icon}</div>
      <p
        className={
          dark
            ? "text-xs font-black text-slate-400"
            : "text-xs font-black text-slate-500"
        }
      >
        {title}
      </p>
      <h3 className="mt-2 text-3xl font-black">{value}</h3>
    </div>
  );
}