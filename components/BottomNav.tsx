"use client";

import { Fish, History, Home, Leaf } from "lucide-react";
import type { TabType } from "@/types/sensor";

type Props = {
  tab: TabType;
  setTab: (v: TabType) => void;
  dark: boolean;
};

export default function BottomNav({ tab, setTab, dark }: Props) {
  const items = [
    { label: "Home", value: "dashboard" as TabType, icon: <Home size={21} /> },
    { label: "Raised", value: "raised" as TabType, icon: <Leaf size={21} /> },
    { label: "Aqua", value: "aqua" as TabType, icon: <Fish size={21} /> },
    { label: "History", value: "history" as TabType, icon: <History size={21} /> },
  ];

  return (
    <nav
      className={`fixed bottom-4 left-1/2 z-50 grid w-[92%] max-w-md -translate-x-1/2 grid-cols-4 rounded-[30px] p-2 shadow-2xl backdrop-blur-xl sm:hidden ${
        dark ? "bg-[#111827]/95 shadow-black/30" : "bg-white/95 shadow-slate-900/15"
      }`}
    >
      {items.map((item) => {
        const active = tab === item.value;

        return (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className="flex flex-col items-center justify-center gap-1 rounded-[22px] py-2 text-xs font-black transition"
          >
            <div
              className={`grid h-11 w-11 place-items-center rounded-2xl transition ${
                active
                  ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25"
                  : dark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              {item.icon}
            </div>

            <span
              className={
                active
                  ? "text-teal-500"
                  : dark
                  ? "text-slate-500"
                  : "text-slate-400"
              }
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}