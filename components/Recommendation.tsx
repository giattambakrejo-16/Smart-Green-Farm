import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import type { AquaState, RaisedState } from "@/types/sensor";

type Props = {
  dark: boolean;
  raised: RaisedState;
  aqua: AquaState;
};

export default function Recommendation({ dark, raised, aqua }: Props) {
  const soilAvg = Math.round((raised.soil1 + raised.soil2) / 2);

  const recommendations = [
    {
      show: soilAvg < 35,
      title: "Tanah mulai kering",
      desc: "Disarankan menyalakan pompa penyiraman selama beberapa menit.",
      type: "warning",
    },
    {
      show: aqua.feedLevel < 25,
      title: "Pakan ikan hampir habis",
      desc: "Segera isi ulang wadah pakan agar sistem pemberian pakan tetap berjalan.",
      type: "warning",
    },
    {
      show: aqua.ph < 6.5 || aqua.ph > 8,
      title: "pH air tidak ideal",
      desc: "Lakukan pengecekan kualitas air aquaponik.",
      type: "danger",
    },
    {
      show: soilAvg >= 35 && aqua.feedLevel >= 25 && aqua.ph >= 6.5 && aqua.ph <= 8,
      title: "Kondisi sistem stabil",
      desc: "Raised Bed dan Aquaponik berada dalam kondisi aman.",
      type: "success",
    },
  ].filter((item) => item.show);

  return (
    <section
      className={`rounded-[30px] p-6 ring-1 ${
        dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
      }`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/15 text-teal-500">
          <Lightbulb size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black">Rekomendasi Sistem</h2>
          <p className={dark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
            Saran otomatis berdasarkan kondisi sensor
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((item) => (
          <div
            key={item.title}
            className={`rounded-2xl p-4 ${
              item.type === "danger"
                ? "bg-red-500/10 text-red-500"
                : item.type === "warning"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-emerald-500/10 text-emerald-500"
            }`}
          >
            <div className="flex gap-3">
              {item.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}

              <div>
                <h3 className="text-sm font-extrabold">{item.title}</h3>
                <p className="mt-1 text-xs font-semibold opacity-80">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}