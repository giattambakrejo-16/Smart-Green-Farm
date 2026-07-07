import {
  Activity,
  Droplets,
  Fish,
  Leaf,
  ShieldCheck,
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

  const healthScore = Math.round(
    soilAvg * 0.25 +
      aqua.waterLevel * 0.2 +
      (aqua.ph >= 6.5 && aqua.ph <= 8 ? 100 : 50) * 0.2 +
      (raised.temp >= 24 && raised.temp <= 32 ? 100 : 60) * 0.15 +
      aqua.feedLevel * 0.1 +
      (alerts.length === 0 ? 100 : 70) * 0.1
  );

  return (
    <section className="space-y-5">
      <section className="rounded-[32px] bg-[#101827] p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-black leading-tight">
              Dashboard
              <br />
              Overview
            </h2>
            <p className="mt-2 max-w-[260px] text-sm font-medium text-slate-400">
              Ringkasan kondisi Smart Green Farm hari ini
            </p>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-400">
            Online
          </span>
        </div>

        <div className="mt-6 rounded-[28px] bg-gradient-to-br from-teal-400 to-emerald-500 p-6 text-white shadow-xl shadow-teal-500/20">
          <div className="flex items-center gap-4">
            <ShieldCheck size={30} />
            <div>
              <p className="text-sm font-black text-white/80">
                Eco Farm Health
              </p>
              <h3 className="mt-1 text-6xl font-black leading-none">
                {healthScore}%
              </h3>
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold text-white/90">
            {healthScore >= 85
              ? "Sistem dalam kondisi sangat baik."
              : healthScore >= 65
              ? "Sistem cukup baik, tetap perlu dipantau."
              : "Sistem perlu perhatian segera."}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <OverviewCard icon={<Leaf />} title="Soil Avg" value={`${soilAvg}%`} />
        <OverviewCard icon={<Droplets />} title="Water Level" value={`${aqua.waterLevel}%`} />
        <OverviewCard icon={<Fish />} title="Feed Level" value={`${aqua.feedLevel}%`} />
        <OverviewCard icon={<Wifi />} title="ESP Online" value="2/2" />
      </div>

      <section className="rounded-[32px] bg-[#101827] p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500/10 text-teal-400">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black">Status Sistem</h3>
            <p className="text-xs font-semibold text-slate-500">
              Monitoring kondisi perangkat
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <p className="rounded-2xl bg-emerald-500/10 p-4 text-sm font-black text-emerald-400">
            Semua sistem berjalan normal.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl p-4 text-sm font-black ${
                  alert.level === "danger"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-amber-500/10 text-amber-400"
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

function OverviewCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] bg-[#101827] p-5 shadow-sm">
      <div className="mb-5 text-teal-400">{icon}</div>
      <p className="text-xs font-black text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
    </div>
  );
}