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
    { label: "Home", value: "dashboard" as TabType, icon: <Home size={20} /> },
    { label: "Raised", value: "raised" as TabType, icon: <Leaf size={20} /> },
    { label: "Aqua", value: "aqua" as TabType, icon: <Fish size={20} /> },
    { label: "History", value: "history" as TabType, icon: <History size={20} /> },
  ];

  return (
    <nav
      className={`fixed bottom-4 left-1/2 z-50 grid w-[92%] max-w-md -translate-x-1/2 grid-cols-4 rounded-[24px] p-2 shadow-2xl ring-1 backdrop-blur sm:hidden ${
        dark
          ? "bg-[#111827]/95 ring-white/10 shadow-black/30"
          : "bg-white/95 ring-slate-200 shadow-slate-900/20"
      }`}
    >
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => setTab(item.value)}
          className={`rounded-[18px] py-3 text-xs font-extrabold transition ${
            tab === item.value ? "bg-teal-600 text-white" : "text-slate-500"
          }`}
        >
          <div className="flex justify-center">{item.icon}</div>
          <div className="mt-1">{item.label}</div>
        </button>
      ))}
    </nav>
  );
}