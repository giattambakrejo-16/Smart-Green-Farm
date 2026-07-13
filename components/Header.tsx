"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Moon,
  Sprout,
  Sun,
  X,
} from "lucide-react";
import type { AlertItem } from "@/types/sensor";
import UserMenu from "./UserMenu";

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
      className={`relative mb-0 rounded-[26px] p-4 backdrop-blur-xl ${
        dark
          ? "bg-[#101827]/80 text-white"
          : "bg-white/80 text-slate-950 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserMenu dark={dark} />

          <div className="hidden h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white sm:flex">
            <Sprout size={22} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-black leading-tight sm:text-lg">
              Smart Green Farm
            </h1>

            <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
              Taman Kebun Pancasila
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAlert(!showAlert)}
            aria-label="Buka notifikasi"
            aria-expanded={showAlert}
            className={`relative grid h-10 w-10 place-items-center rounded-2xl transition ${
              dark
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
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
            type="button"
            onClick={() => setDark(!dark)}
            aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            className={`grid h-10 w-10 place-items-center rounded-2xl transition ${
              dark
                ? "bg-white text-slate-950 hover:bg-slate-200"
                : "bg-slate-950 text-white hover:bg-slate-800"
            }`}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {showAlert && (
        <div
          className={`absolute right-3 top-20 z-50 w-[calc(100%-1.5rem)] rounded-[22px] p-4 shadow-2xl ring-1 ${
            dark
              ? "bg-[#020617] text-white ring-white/10"
              : "bg-white text-slate-950 ring-slate-200"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black">Notifikasi</h3>

              <p
                className={`mt-1 text-xs font-semibold ${
                  dark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Status terbaru Smart Green Farm
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAlert(false)}
              aria-label="Tutup notifikasi"
              className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                dark
                  ? "bg-white/10 text-slate-300 hover:bg-white/15"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="flex gap-3 rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-black">
                    Semua sistem normal
                  </p>

                  <p className="mt-1 text-xs font-semibold opacity-80">
                    Tidak ada peringatan sensor saat ini.
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
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-sm font-black">
                      {alert.title}
                    </p>

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