"use client";

import { Bell, Moon, Sprout, Sun, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AlertItem } from "@/types/sensor";

type Props = {
  dark: boolean;
  setDark: (value: boolean) => void;
  alerts: AlertItem[];
  showAlert: boolean;
  setShowAlert: (value: boolean) => void;
};

export default function Header({ dark, setDark, alerts, showAlert, setShowAlert }: Props) {
  return (
    <header
      className={`relative mb-0 rounded-[26px] p-4 backdrop-blur-xl ${dark
        ? "bg-[#101827]/80 text-white"
        : "bg-white/80 text-slate-950 shadow-sm"
        }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white">
            <Sprout size={22} strokeWidth={2.4} />
          </div>

          <div>
            <h1 className="text-lg font-black leading-tight">
              Smart Green Farm
            </h1>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              Taman Kebun Pancasila
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlert(!showAlert)}
            className={`relative grid h-10 w-10 place-items-center rounded-2xl ${dark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-800"
              }`}
          >
            <Bell size={17} />
            {alerts.length > 0 && (
              <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-black leading-4 text-white">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setDark(!dark)}
            className={`grid h-10 w-10 place-items-center rounded-2xl ${dark ? "bg-white text-slate-950" : "bg-slate-950 text-white"
              }`}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {showAlert && (
        <div
          className={`absolute right-3 top-20 z-50 w-[calc(100%-1.5rem)] rounded-[22px] p-4 shadow-2xl ${dark ? "bg-[#020617] text-white" : "bg-white text-slate-950"
            }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-black">Notifikasi</h3>
            <button
              onClick={() => setShowAlert(false)}
              className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="flex gap-3 rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                <CheckCircle2 size={18} />
                <p className="text-sm font-black">Semua sistem normal</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex gap-3 rounded-2xl p-4 ${alert.level === "danger"
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