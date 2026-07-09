"use client";

import { Fish, FlaskConical, ShieldCheck, Thermometer, Waves } from "lucide-react";
import type { AquaState } from "@/types/sensor";
import SensorCard from "./SensorCard";
import ProgressCard from "./ProgressCard";
import ManualControl, { ControlTile } from "./ManualControl";

type Props = {
    aqua: AquaState;
    setAqua: (value: AquaState) => void;
    dark: boolean;
};

export default function Aquaponik({ aqua, setAqua, dark }: Props) {
    return (
        <section
            className={`rounded-[30px] p-4 shadow-sm ring-1 sm:p-6 ${dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
                }`}
        >
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                        <Fish size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold">Aquaponik</h2>
                        <p className={dark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
                            Monitoring kualitas air dan pakan ikan otomatis
                        </p>
                    </div>
                </div>

                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-500">
                    Online
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <SensorCard dark={dark} label="pH Air" value={aqua.ph} unit="" icon={<FlaskConical size={20} />} />
                <SensorCard dark={dark} label="Kekeruhan" value={aqua.turbidity} unit="NTU" icon={<Waves size={20} />} />
                <SensorCard dark={dark} label="Suhu Air" value={aqua.waterTemp} unit="°C" icon={<Thermometer size={20} />} />
                <SensorCard
                    dark={dark}
                    label="Kondisi Air"
                    value={aqua.ph >= 6.5 && aqua.ph <= 8 ? 100 : 50}
                    unit="%"
                    icon={<ShieldCheck size={20} />}
                />
                <ProgressCard dark={dark} label="Water Level" value={aqua.waterLevel} />
                <ProgressCard dark={dark} label="Sensor Pakan" value={aqua.feedLevel} />

                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                    <ManualControl title="Manual Feed Control" single dark={dark}>
                        <ControlTile
                            label="Pakan Otomatis"
                            active={aqua.autoFeed}
                            icon={<Fish size={22} />}
                            dark={dark}
                            onClick={() => setAqua({ ...aqua, autoFeed: !aqua.autoFeed })}
                        />
                    </ManualControl>
                </div>
            </div>
        </section>
    );
}