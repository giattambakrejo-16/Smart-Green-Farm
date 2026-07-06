"use client";

import { AlertTriangle, Bell, CheckCircle2, Moon, Sun, X } from "lucide-react";
import type { AlertItem } from "@/types/sensor";

type Props = {
  dark: boolean;
  setDark: (value: boolean) => void;
  alerts: AlertItem[];
  showAlert: boolean;
  setShowAlert: (value: boolean) => void;
};

export default function Header({
  dark,
  setDark,
  alerts,
  showAlert,
  setShowAlert,
}: Props) {
  return (
    <header
      className={`relative mb-5 rounded-[28px] p-5 shadow-sm ring-1 sm:p-7 ${
        dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Smart Green Farm
          </h1>
          <p className={dark ? "mt-2 text-sm text-slate-300" : "mt-2 text-sm text-slate-500"}>
            Taman Kebun Pancasila
          </p>

          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold ${
              alerts.length > 0
                ? "bg-amber-500/15 text-amber-500"
                : "bg-emerald-500/15 text-emerald-500"
            }`}
          >
            {alerts.length > 0 ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            {alerts.length > 0 ? `${alerts.length} Peringatan` : "Semua sistem normal"}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAlert(!showAlert)}
            className={`relative grid h-12 w-12 place-items-center rounded-2xl transition ${
              dark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-950"
            }`}
          >
            <Bell size={20} />
            {alerts.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-extrabold text-white">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setDark(!dark)}
            className={`grid h-12 w-12 place-items-center rounded-2xl transition ${
              dark ? "bg-white text-slate-950" : "bg-slate-950 text-white"
            }`}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {showAlert && (
        <div
          className={`absolute right-4 top-32 z-40 w-[calc(100%-2rem)] rounded-[24px] p-4 shadow-2xl ring-1 sm:right-7 sm:w-96 ${
            dark ? "bg-[#020617] ring-white/10" : "bg-white ring-slate-200"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold">Pemberitahuan Sistem</h3>
            <button
              onClick={() => setShowAlert(false)}
              className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-500">
                Semua sistem berjalan normal.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-4 ${
                    alert.level === "danger"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  <div className="flex gap-3">
                    <AlertTriangle size={18} />
                    <div>
                      <p className="text-sm font-extrabold">{alert.title}</p>
                      <p className="mt-1 text-xs font-semibold opacity-80">{alert.message}</p>
                    </div>
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