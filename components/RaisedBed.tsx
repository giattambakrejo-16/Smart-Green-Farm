"use client";

import { CloudRain, Droplets, Leaf, Power, SunMedium, Thermometer } from "lucide-react";
import type { RaisedState } from "@/types/sensor";
import SensorCard from "./SensorCard";
import ProgressCard from "./ProgressCard";
import ManualControl, { ControlTile } from "./ManualControl";

type Props = {
  raised: RaisedState;
  setRaised: (value: RaisedState) => void;
  dark: boolean;
};

export default function RaisedBed({ raised, setRaised, dark }: Props) {
  return (
    <section className={`rounded-[30px] p-4 shadow-sm ring-1 sm:p-6 ${dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/15 text-teal-500">
            <Leaf size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">Raised Bed</h2>
            <p className={dark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
              Monitoring kebun dan sistem penyiraman otomatis
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-500">
          Online
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <SensorCard dark={dark} label="Suhu Udara" value={raised.temp} unit="°C" icon={<Thermometer size={20} />} />
        <SensorCard dark={dark} label="Kelembapan" value={raised.humidity} unit="%" icon={<Droplets size={20} />} />
        <SensorCard dark={dark} label="Cahaya" value={raised.light} unit="%" icon={<SunMedium size={20} />} />
        <SensorCard dark={dark} label="Hujan" value={raised.rain} unit="%" icon={<CloudRain size={20} />} />

        <ProgressCard dark={dark} label="Soil Sensor 1" value={raised.soil1} />
        <ProgressCard dark={dark} label="Soil Sensor 2" value={raised.soil2} />
        <ProgressCard dark={dark} label="Level Tangki Air" value={raised.tank} />

        <div className="col-span-2 sm:col-span-3 lg:col-span-4">
          <ManualControl title="Manual Control">
            <ControlTile label="Pompa Air" active={raised.pump} icon={<Droplets size={22} />} onClick={() => setRaised({ ...raised, pump: !raised.pump })} />
            <ControlTile label="Valve 1" active={raised.valve1} icon={<Power size={22} />} onClick={() => setRaised({ ...raised, valve1: !raised.valve1 })} />
            <ControlTile label="Valve 2" active={raised.valve2} icon={<Power size={22} />} onClick={() => setRaised({ ...raised, valve2: !raised.valve2 })} />
            <ControlTile label="Valve 3" active={raised.valve3} icon={<Power size={22} />} onClick={() => setRaised({ ...raised, valve3: !raised.valve3 })} />
            <ControlTile label="Valve 4" active={raised.valve4} icon={<Power size={22} />} onClick={() => setRaised({ ...raised, valve4: !raised.valve4 })} />
            <ControlTile label="Valve 5" active={raised.valve5} icon={<Power size={22} />} onClick={() => setRaised({ ...raised, valve5: !raised.valve5 })} />
          </ManualControl>
        </div>
      </div>
    </section>
  );
}