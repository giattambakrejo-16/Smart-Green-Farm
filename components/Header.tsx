"use client";

import { AlertTriangle, Bell, CheckCircle2, Moon, Sprout, Sun, X } from "lucide-react";
import type { AlertItem } from "@/types/sensor";

type Props = {
  dark: boolean;
  setDark: (value: boolean) => void;
  alerts: AlertItem[];
  showAlert: boolean;
  setShowAlert: (value: boolean) => void;
};

export default function Header({ dark, setDark, alerts, showAlert, setShowAlert }: Props) {
  const time = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className={`relative mb-5 rounded-[32px] p-5 shadow-sm ${
        dark ? "bg-[#101827]" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[24px] bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
            <Sprout size={27} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight tracking-tight">
              Smart Green Farm
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Taman Kebun Pancasila
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-black ${
                  alerts.length > 0
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {alerts.length > 0 ? `${alerts.length} Warning` : "System Normal"}
              </span>

              <span className="text-[11px] font-bold text-slate-500">
                Last update {time}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setShowAlert(!showAlert)}
            className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white"
          >
            <Bell size={19} />
            {alerts.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-black text-white">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setDark(!dark)}
            className={`grid h-11 w-11 place-items-center rounded-2xl ${
              dark ? "bg-white text-slate-950" : "bg-slate-950 text-white"
            }`}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>

      {showAlert && (
        <div
          className={`absolute right-4 top-28 z-50 w-[calc(100%-2rem)] rounded-[28px] p-4 shadow-2xl ${
            dark ? "bg-[#020617]" : "bg-white"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-black">Notification Center</h3>
            <button
              onClick={() => setShowAlert(false)}
              className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="flex gap-3 rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                <CheckCircle2 size={18} />
                <div>
                  <p className="text-sm font-black">Semua sistem normal</p>
                  <p className="mt-1 text-xs font-semibold opacity-80">
                    Tidak ada peringatan saat ini.
                  </p>
                </div>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex gap-3 rounded-2xl p-4 ${
                    alert.level === "danger"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  <AlertTriangle size={18} />
                  <div>
                    <p className="text-sm font-black">{alert.title}</p>
                    <p className="mt-1 text-xs font-semibold opacity-80">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
}