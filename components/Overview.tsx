import { Activity, Droplets, Fish, Leaf, ShieldCheck, Wifi } from "lucide-react";
import type { AlertItem, AquaState, RaisedState } from "@/types/sensor";
import ActivityLog from "./ActivityLog";

type Props = {
  dark: boolean;
  raised: RaisedState;
  aqua: AquaState;
  alerts: AlertItem[];
};

export default function Overview({ dark, raised, aqua, alerts }: Props) {
  const soilAvg = Math.round((raised.soil1 + raised.soil2) / 2);

  const healthScore = Math.round(
    (soilAvg * 0.25) +
    (aqua.waterLevel * 0.2) +
    ((aqua.ph >= 6.5 && aqua.ph <= 8 ? 100 : 50) * 0.2) +
    ((raised.temp >= 24 && raised.temp <= 32 ? 100 : 60) * 0.15) +
    (aqua.feedLevel * 0.1) +
    ((alerts.length === 0 ? 100 : 70) * 0.1)
  );

  return (
    <section className="space-y-5">
      <div
        className={`rounded-[30px] p-6 ring-1 ${
          dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Dashboard Overview</h2>
            <p className={dark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
              Ringkasan kondisi Smart Green Farm hari ini
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-sm font-extrabold text-emerald-500">
            Online
          </div>
        </div>

        <div className="mt-6 rounded-[26px] bg-gradient-to-br from-teal-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} />
            <div>
              <p className="text-sm font-bold text-white/80">Eco Farm Health</p>
              <h3 className="mt-1 text-5xl font-black">{healthScore}%</h3>
            </div>
          </div>

          <p className="mt-4 text-sm font-medium text-white/80">
            {healthScore >= 85
              ? "Sistem dalam kondisi sangat baik."
              : healthScore >= 65
              ? "Sistem cukup baik, tetap perlu dipantau."
              : "Sistem perlu perhatian segera."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <OverviewCard dark={dark} icon={<Leaf />} title="Soil Avg" value={`${soilAvg}%`} />
        <OverviewCard dark={dark} icon={<Droplets />} title="Water Level" value={`${aqua.waterLevel}%`} />
        <OverviewCard dark={dark} icon={<Fish />} title="Pakan" value={`${aqua.feedLevel}%`} />
        <OverviewCard dark={dark} icon={<Wifi />} title="ESP Online" value="2/2" />
      </div>

      <div
        className={`rounded-[28px] p-5 ring-1 ${
          dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <Activity className="text-teal-500" />
          <h3 className="text-lg font-extrabold">Status Sistem</h3>
        </div>

        {alerts.length === 0 ? (
          <p className="rounded-2xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-500">
            Semua sistem berjalan normal.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl p-4 text-sm font-bold ${
                  alert.level === "danger"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {alert.title}
              </div>
            ))}
          </div>
        )}
      </div>
        <ActivityLog dark={dark} />
    </section>
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
      className={`rounded-[24px] p-4 ring-1 ${
        dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
      }`}
    >
      <div className="mb-4 text-teal-500">{icon}</div>
      <p className={dark ? "text-xs font-bold text-slate-400" : "text-xs font-bold text-slate-500"}>
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-extrabold">{value}</h3>
    </div>
  );
}