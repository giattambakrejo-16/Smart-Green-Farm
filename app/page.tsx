"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import RaisedBed from "@/components/RaisedBed";
import Aquaponik from "@/components/Aquaponik";
import HistoryPage from "@/components/History";
import BottomNav from "@/components/BottomNav";
import { historyData, initialAqua, initialRaised } from "@/data/dummy";
import { useAlert } from "@/hooks/useAlert";
import type { DateRange, TabType } from "@/types/sensor";
import Overview from "@/components/Overview";

export default function Home() {
  const [tab, setTab] = useState<TabType>("dashboard");
  const [dark, setDark] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange>({
    start: "2026-07-01",
    end: "2026-07-10",
  });

  const [raised, setRaised] = useState(initialRaised);
  const [aqua, setAqua] = useState(initialAqua);

  const alerts = useAlert(raised, aqua);

  const filteredHistory = useMemo(() => {
    return historyData.filter(
      (item) => item.date >= dateRange.start && item.date <= dateRange.end
    );
  }, [dateRange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRaised((p) => ({
        ...p,
        temp: Number((25 + Math.random() * 6).toFixed(1)),
        humidity: Math.floor(60 + Math.random() * 30),
        soil1: Math.floor(30 + Math.random() * 55),
        soil2: Math.floor(30 + Math.random() * 55),
        light: Math.floor(40 + Math.random() * 55),
        rain: Math.floor(Math.random() * 35),
        tank: Math.floor(40 + Math.random() * 60),
      }));

      setAqua((p) => ({
        ...p,
        ph: Number((6.5 + Math.random() * 1.5).toFixed(1)),
        turbidity: Math.floor(10 + Math.random() * 40),
        waterTemp: Number((25 + Math.random() * 5).toFixed(1)),
        waterLevel: Math.floor(45 + Math.random() * 55),
        feedLevel: Math.floor(30 + Math.random() * 70),
      }));
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  return (
    <main
      className={`min-h-screen pb-28 transition ${
        dark ? "bg-[#07111f] text-white" : "bg-[#f4f7fb] text-slate-950"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <Header
          dark={dark}
          setDark={setDark}
          alerts={alerts}
          showAlert={showAlert}
          setShowAlert={setShowAlert}
        />
        
        {tab === "dashboard" && (
          <Overview dark={dark} raised={raised} aqua={aqua} alerts={alerts} />
        )}

        {tab === "raised" && (
          <RaisedBed dark={dark} raised={raised} setRaised={setRaised} />
        )}

        {tab === "aqua" && (
          <Aquaponik dark={dark} aqua={aqua} setAqua={setAqua} />
        )}

        {tab === "history" && (
          <HistoryPage
            dark={dark}
            data={filteredHistory}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        )}

        <footer
          className={`mt-8 rounded-[26px] p-6 text-center ring-1 ${
            dark ? "bg-[#111827] ring-white/10" : "bg-white ring-slate-200"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Developed by
          </p>
          <h3 className="mt-2 text-lg font-extrabold text-teal-500">
            Tim IoT GIAT 16 UNNES
          </h3>
        </footer>
      </div>

      <BottomNav tab={tab} setTab={setTab} dark={dark} />
    </main>
  );
}