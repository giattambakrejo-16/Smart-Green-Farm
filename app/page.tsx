"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Overview from "@/components/Overview";
import RaisedBed from "@/components/RaisedBed";
import Aquaponik from "@/components/Aquaponik";
import HistoryPage from "@/components/History";
import BottomNav from "@/components/BottomNav";
import { initialAqua, initialRaised } from "@/data/dummy";
import { useAlert } from "@/hooks/useAlert";
import type { DateRange, TabType, HistoryItem } from "@/types/sensor";
import { supabase } from "@/lib/supabase";

interface RaisedBedRow {
  summary_date?: string;
  created_at?: string;
  bed_id: string;
  air_temperature?: number;
  air_humidity?: number;
  light_intensity?: number;
  rainfall?: number;
  tandon_water_level?: string;
  soil_moisture?: number;
  avg_air_temperature?: number;
  avg_air_humidity?: number;
  avg_light_intensity?: number;
  total_rainfall?: number;
  avg_soil_moisture?: number;
}

interface AquaponicsRow {
  summary_date?: string;
  created_at?: string;
  water_ph?: number;
  turbidity?: number;
  water_temperature?: number;
  water_level?: number;
  feed_storage?: number;
  avg_water_ph?: number;
  avg_turbidity?: number;
  avg_water_temperature?: number;
  avg_water_level?: number;
  avg_feed_storage?: number;
}

function mapTankLevel(level: string | null | undefined): number {
  if (!level) return 0;
  switch (level.toLowerCase()) {
    case "empty": return 0;
    case "low": return 25;
    case "medium": return 50;
    case "high": return 75;
    case "full": return 100;
    default: return 0;
  }
}

function aggregateData(
  raisedRows: RaisedBedRow[],
  aquaRows: AquaponicsRow[],
  isSummary: boolean
): HistoryItem[] {
  const dates: { [dateStr: string]: { raised: RaisedBedRow[]; aqua: AquaponicsRow[] } } = {};

  const getDateKey = (row: RaisedBedRow | AquaponicsRow) => {
    const dateVal = isSummary ? row.summary_date : row.created_at;
    if (!dateVal) return "";
    return dateVal.split("T")[0];
  };

  raisedRows.forEach((row) => {
    const d = getDateKey(row);
    if (!d) return;
    if (!dates[d]) dates[d] = { raised: [], aqua: [] };
    dates[d].raised.push(row);
  });

  aquaRows.forEach((row) => {
    const d = getDateKey(row);
    if (!d) return;
    if (!dates[d]) dates[d] = { raised: [], aqua: [] };
    dates[d].aqua.push(row);
  });

  const historyItems: HistoryItem[] = [];

  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const sortedDates = Object.keys(dates).sort();

  sortedDates.forEach((dateStr) => {
    const rGroup = dates[dateStr].raised;
    const aGroup = dates[dateStr].aqua;

    let temp = 0, humidity = 0, light = 0, rain = 0;
    let soil1Count = 0, soil1Sum = 0;
    let soil2Count = 0, soil2Sum = 0;

    if (isSummary) {
      rGroup.forEach((r) => {
        temp += r.avg_air_temperature || 0;
        humidity += r.avg_air_humidity || 0;
        light += r.avg_light_intensity || 0;
        rain += r.total_rainfall || 0;
        if (r.bed_id === "Bed-1") {
          soil1Sum += r.avg_soil_moisture || 0;
          soil1Count++;
        } else if (r.bed_id === "Bed-2") {
          soil2Sum += r.avg_soil_moisture || 0;
          soil2Count++;
        }
      });
      const count = rGroup.length || 1;
      temp = temp / count;
      humidity = humidity / count;
      light = light / count;
      rain = rain / count;
    } else {
      rGroup.forEach((r) => {
        temp += r.air_temperature || 0;
        humidity += r.air_humidity || 0;
        light += r.light_intensity || 0;
        rain += r.rainfall || 0;
        if (r.bed_id === "Bed-1") {
          soil1Sum += r.soil_moisture || 0;
          soil1Count++;
        } else if (r.bed_id === "Bed-2") {
          soil2Sum += r.soil_moisture || 0;
          soil2Count++;
        }
      });
      const count = rGroup.length || 1;
      temp = temp / count;
      humidity = humidity / count;
      light = light / count;
      rain = rain / count;
    }

    const finalSoil1 = soil1Count > 0 ? soil1Sum / soil1Count : 0;
    const finalSoil2 = soil2Count > 0 ? soil2Sum / soil2Count : 0;

    let ph = 0, turbidity = 0, waterTemp = 0, waterLevel = 0, feedLevel = 0;

    aGroup.forEach((a) => {
      if (isSummary) {
        ph += a.avg_water_ph || 0;
        turbidity += a.avg_turbidity || 0;
        waterTemp += a.avg_water_temperature || 0;
        waterLevel += a.avg_water_level || 0;
        feedLevel += a.avg_feed_storage || 0;
      } else {
        ph += a.water_ph || 0;
        turbidity += a.turbidity || 0;
        waterTemp += a.water_temperature || 0;
        waterLevel += a.water_level || 0;
        feedLevel += a.feed_storage || 0;
      }
    });

    const aCount = aGroup.length || 1;
    ph = ph / aCount;
    turbidity = turbidity / aCount;
    waterTemp = waterTemp / aCount;
    waterLevel = waterLevel / aCount;
    feedLevel = feedLevel / aCount;

    historyItems.push({
      date: dateStr,
      label: formatDateLabel(dateStr),
      temp: Number(temp.toFixed(1)),
      humidity: Math.round(humidity),
      soil1: Math.round(finalSoil1),
      soil2: Math.round(finalSoil2),
      light: Math.round(light),
      rain: Math.round(rain),
      ph: Number(ph.toFixed(1)),
      waterTemp: Number(waterTemp.toFixed(1)),
      turbidity: Math.round(turbidity),
      waterLevel: Math.round(waterLevel),
      feedLevel: Math.round(feedLevel),
      raised: Math.round((finalSoil1 + finalSoil2) / 2),
      aqua: Math.round(waterLevel),
    });
  });

  return historyItems;
}

export default function Home() {
  const [tab, setTab] = useState<TabType>("dashboard");
  const [dark, setDark] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange>({
    start: "2026-07-01",
    end: "2026-07-10",
  });

  const [raised, setRaised] = useState(initialRaised);
  const [aqua, setAqua] = useState(initialAqua);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const alerts = useAlert(raised, aqua);

  // Register Service Worker (PWA)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ Service Worker Registered"))
        .catch((err) =>
          console.error("❌ Service Worker Error:", err)
        );
    }
  }, []);

  // Initialize and subscribe to real-time sensor updates
  useEffect(() => {
    async function fetchInitialData() {
      // Fetch latest for Bed-1
      const { data: bed1Data } = await supabase
        .from("raised_bed_sensors")
        .select("*")
        .eq("bed_id", "Bed-1")
        .order("created_at", { ascending: false })
        .limit(1);

      if (bed1Data && bed1Data.length > 0) {
        const latest = bed1Data[0] as RaisedBedRow;
        setRaised((p) => ({
          ...p,
          temp: latest.air_temperature ?? p.temp,
          humidity: latest.air_humidity ?? p.humidity,
          light: latest.light_intensity ?? p.light,
          rain: latest.rainfall ?? p.rain,
          tank: mapTankLevel(latest.tandon_water_level),
          soil1: latest.soil_moisture ?? p.soil1,
        }));
      }

      // Fetch latest for Bed-2
      const { data: bed2Data } = await supabase
        .from("raised_bed_sensors")
        .select("*")
        .eq("bed_id", "Bed-2")
        .order("created_at", { ascending: false })
        .limit(1);

      if (bed2Data && bed2Data.length > 0) {
        const latest = bed2Data[0] as RaisedBedRow;
        setRaised((p) => ({
          ...p,
          temp: latest.air_temperature ?? p.temp,
          humidity: latest.air_humidity ?? p.humidity,
          light: latest.light_intensity ?? p.light,
          rain: latest.rainfall ?? p.rain,
          tank: mapTankLevel(latest.tandon_water_level),
          soil2: latest.soil_moisture ?? p.soil2,
        }));
      }

      // Fetch latest aquaponics sensor reading
      const { data: aquaData } = await supabase
        .from("aquaponics_sensors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (aquaData && aquaData.length > 0) {
        const latest = aquaData[0] as AquaponicsRow;
        setAqua((p) => ({
          ...p,
          ph: latest.water_ph ?? p.ph,
          turbidity: latest.turbidity ?? p.turbidity,
          waterTemp: latest.water_temperature ?? p.waterTemp,
          waterLevel: latest.water_level ?? p.waterLevel,
          feedLevel: latest.feed_storage ?? p.feedLevel,
        }));
      }
    }

    fetchInitialData();

    // Subscribe to real-time changes
    const raisedChannel = supabase
      .channel("realtime-raised-sensors")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "raised_bed_sensors" },
        (payload) => {
          const latest = payload.new as RaisedBedRow;
          if (!latest) return;

          setRaised((p) => {
            const next = { ...p };
            if (latest.bed_id === "Bed-1") {
              next.soil1 = latest.soil_moisture ?? p.soil1;
            } else if (latest.bed_id === "Bed-2") {
              next.soil2 = latest.soil_moisture ?? p.soil2;
            }
            next.temp = latest.air_temperature ?? p.temp;
            next.humidity = latest.air_humidity ?? p.humidity;
            next.light = latest.light_intensity ?? p.light;
            next.rain = latest.rainfall ?? p.rain;
            if (latest.tandon_water_level !== undefined) {
              next.tank = mapTankLevel(latest.tandon_water_level);
            }
            return next;
          });
        }
      )
      .subscribe();

    const aquaChannel = supabase
      .channel("realtime-aqua-sensors")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "aquaponics_sensors" },
        (payload) => {
          const latest = payload.new as AquaponicsRow;
          if (!latest) return;

          setAqua((p) => ({
            ...p,
            ph: latest.water_ph ?? p.ph,
            turbidity: latest.turbidity ?? p.turbidity,
            waterTemp: latest.water_temperature ?? p.waterTemp,
            waterLevel: latest.water_level ?? p.waterLevel,
            feedLevel: latest.feed_storage ?? p.feedLevel,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(raisedChannel);
      supabase.removeChannel(aquaChannel);
    };
  }, []);

  // Fetch and aggregate history data
  useEffect(() => {
    async function fetchHistoryData() {
      setLoadingHistory(true);
      try {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const useSummary = diffDays > 7;

        let raisedRows: RaisedBedRow[] = [];
        let aquaRows: AquaponicsRow[] = [];

        if (useSummary) {
          // Fetch from daily summaries
          const { data: raisedSummary } = await supabase
            .from("daily_raised_bed_summary")
            .select("*")
            .gte("summary_date", dateRange.start)
            .lte("summary_date", dateRange.end)
            .order("summary_date", { ascending: true });

          const { data: aquaSummary } = await supabase
            .from("daily_aquaponics_summary")
            .select("*")
            .gte("summary_date", dateRange.start)
            .lte("summary_date", dateRange.end)
            .order("summary_date", { ascending: true });

          if (raisedSummary) raisedRows = raisedSummary as RaisedBedRow[];
          if (aquaSummary) aquaRows = aquaSummary as AquaponicsRow[];
        } else {
          // Fetch raw logs
          const { data: raisedRaw } = await supabase
            .from("raised_bed_sensors")
            .select("*")
            .gte("created_at", `${dateRange.start}T00:00:00.000Z`)
            .lte("created_at", `${dateRange.end}T23:59:59.999Z`)
            .order("created_at", { ascending: true });

          const { data: aquaRaw } = await supabase
            .from("aquaponics_sensors")
            .select("*")
            .gte("created_at", `${dateRange.start}T00:00:00.000Z`)
            .lte("created_at", `${dateRange.end}T23:59:59.999Z`)
            .order("created_at", { ascending: true });

          if (raisedRaw) raisedRows = raisedRaw as RaisedBedRow[];
          if (aquaRaw) aquaRows = aquaRaw as AquaponicsRow[];
        }

        const aggregated = aggregateData(raisedRows, aquaRows, useSummary);
        setHistory(aggregated);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistoryData();
  }, [dateRange]);

  return (
    <main
      className={`min-h-screen pb-28 transition ${dark ? "bg-[#07111f] text-white" : "bg-[#f4f7fb] text-slate-950"
        }`}
    >
      <div className="mx-auto w-full max-w-md px-4 py-5 sm:max-w-3xl lg:max-w-none lg:px-8 lg:py-6 xl:px-12">
        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1180px)] lg:justify-center lg:gap-8">
          <div className="sticky top-4 z-50 mb-5">
            <Header
              dark={dark}
              setDark={setDark}
              alerts={alerts}
              showAlert={showAlert}
              setShowAlert={setShowAlert}
            />

            <div
              className={`mt-4 hidden rounded-[28px] p-3 lg:block ${dark ? "bg-[#101827] text-white" : "bg-white text-slate-950 shadow-sm"
                }`}
            >
              <p className={dark ? "mb-3 px-3 text-xs font-black uppercase tracking-widest text-slate-500" : "mb-3 px-3 text-xs font-black uppercase tracking-widest text-slate-400"}>
                Menu
              </p>

              <div className="space-y-2">
                {[
                  { label: "Dashboard", value: "dashboard" },
                  { label: "Raised Bed", value: "raised" },
                  { label: "Aquaponik", value: "aqua" },
                  { label: "History", value: "history" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setTab(item.value as TabType)}
                    className={`w-full rounded-[20px] px-4 py-3 text-left text-sm font-black transition ${tab === item.value
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20"
                      : dark
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
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
              <div className="relative">
                {loadingHistory && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[30px] bg-black/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                      <p className="text-sm font-bold text-teal-500">Memuat data...</p>
                    </div>
                  </div>
                )}
                <HistoryPage
                  dark={dark}
                  data={history}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
              </div>
            )}

            <footer className="mt-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Developed by
              </p>
              <h3 className="mt-2 text-sm font-extrabold text-teal-500">
                Tim IoT GIAT 16 UNNES
              </h3>
            </footer>
          </div>
        </div>
      </div>

      <BottomNav tab={tab} setTab={setTab} dark={dark} />
    </main>
  );
}