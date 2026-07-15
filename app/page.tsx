"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Overview from "@/components/Overview";
import RaisedBed from "@/components/RaisedBed";
import Aquaponik from "@/components/Aquaponik";
import HistoryPage, {
  type HistoryInterval,
} from "@/components/History";
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

interface ActivityLogRow {
  id?: string;
  activity_at?: string;
  created_at?: string;
  activity_type?: string;
  system_type?: string;
  device_id?: string;
  zone_id?: string;
  actor_name?: string;
  actor_type?: string;
  title?: string;
  description?: string;
  status?: string;
}

interface ManualControlLogRow {
  id?: string;
  requested_at?: string;
  executed_at?: string;
  completed_at?: string;
  created_at?: string;

  system_type?: string;
  device_id?: string;
  zone_id?: string;

  actuator_name?: string;
  command?: string;
  duration_seconds?: number;

  previous_state?: boolean | string;
  requested_state?: boolean | string;
  final_state?: boolean | string;

  command_status?: string;
  initiated_by?: string;
  reason?: string;
  error_message?: string;
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

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  );
}

function validNumber(
  value: number | null | undefined
): number | null {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return null;
  }

  return Number(value);
}

function collectNumbers(
  values: Array<number | null | undefined>
): number[] {
  return values
    .map(validNumber)
    .filter(
      (value): value is number =>
        value !== null
    );
}

function calculateRangeScore(
  value: number,
  optimalMin: number,
  optimalMax: number,
  absoluteMin: number,
  absoluteMax: number
): number {
  if (value >= optimalMin && value <= optimalMax) {
    return 100;
  }

  if (value < optimalMin) {
    if (value <= absoluteMin) return 0;

    return clamp(
      ((value - absoluteMin) /
        (optimalMin - absoluteMin)) *
      100
    );
  }

  if (value >= absoluteMax) return 0;

  return clamp(
    ((absoluteMax - value) /
      (absoluteMax - optimalMax)) *
    100
  );
}

function calculateRaisedHealth(
  temperature: number,
  humidity: number,
  soil1: number,
  soil2: number
): number {
  const soilAverage = (soil1 + soil2) / 2;

  const temperatureScore = calculateRangeScore(
    temperature,
    24,
    31,
    15,
    42
  );

  const humidityScore = calculateRangeScore(
    humidity,
    60,
    85,
    25,
    100
  );

  const soilScore = calculateRangeScore(
    soilAverage,
    45,
    75,
    10,
    100
  );

  const soilDifference = Math.abs(soil1 - soil2);

  const consistencyScore =
    soilDifference <= 10
      ? 100
      : clamp(100 - (soilDifference - 10) * 5);

  return Math.round(
    temperatureScore * 0.25 +
    humidityScore * 0.2 +
    soilScore * 0.45 +
    consistencyScore * 0.1
  );
}

function calculateAquaponicsHealth(
  ph: number,
  waterTemperature: number,
  turbidity: number,
  waterLevel: number,
  feedLevel: number
): number {
  const phScore = calculateRangeScore(
    ph,
    6.5,
    7.5,
    5,
    9
  );

  const temperatureScore = calculateRangeScore(
    waterTemperature,
    24,
    29,
    18,
    36
  );

  const turbidityScore =
    turbidity <= 20
      ? 100
      : clamp(100 - (turbidity - 20) * 2.5);

  const waterLevelScore = calculateRangeScore(
    waterLevel,
    70,
    95,
    25,
    100
  );

  const feedScore =
    feedLevel >= 25
      ? 100
      : clamp((feedLevel / 25) * 100);

  return Math.round(
    phScore * 0.3 +
    temperatureScore * 0.2 +
    turbidityScore * 0.2 +
    waterLevelScore * 0.2 +
    feedScore * 0.1
  );
}

function createBucketKey(
  timestamp: string,
  interval: HistoryInterval
): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const jakartaDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    })
  );

  if (interval === "30m") {
    const minutes =
      Math.floor(jakartaDate.getMinutes() / 30) * 30;

    jakartaDate.setMinutes(minutes, 0, 0);
  }

  if (interval === "1h") {
    jakartaDate.setMinutes(0, 0, 0);
  }

  if (interval === "6h") {
    const hour =
      Math.floor(jakartaDate.getHours() / 6) * 6;

    jakartaDate.setHours(hour, 0, 0, 0);
  }

  if (interval === "1d") {
    jakartaDate.setHours(0, 0, 0, 0);
  }

  const year = jakartaDate.getFullYear();
  const month = String(
    jakartaDate.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    jakartaDate.getDate()
  ).padStart(2, "0");
  const hour = String(
    jakartaDate.getHours()
  ).padStart(2, "0");
  const minute = String(
    jakartaDate.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:00+07:00`;
}

function formatHistoryLabel(
  timestamp: string,
  interval: HistoryInterval
): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  if (interval === "1d") {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      timeZone: "Asia/Jakarta",
    }).format(date);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function aggregateData(
  raisedRows: RaisedBedRow[],
  aquaRows: AquaponicsRow[],
  interval: HistoryInterval,
  isSummary: boolean
): HistoryItem[] {
  const groups: Record<
    string,
    {
      raised: RaisedBedRow[];
      aqua: AquaponicsRow[];
    }
  > = {};

  const getKey = (
    row: RaisedBedRow | AquaponicsRow
  ): string => {
    const timestamp = isSummary
      ? row.summary_date
      : row.created_at;

    if (!timestamp) return "";

    if (isSummary) {
      return timestamp.includes("T")
        ? timestamp
        : `${timestamp}T00:00:00+07:00`;
    }

    return createBucketKey(timestamp, interval);
  };

  raisedRows.forEach((row) => {
    const key = getKey(row);

    if (!key) return;

    if (!groups[key]) {
      groups[key] = {
        raised: [],
        aqua: [],
      };
    }

    groups[key].raised.push(row);
  });

  aquaRows.forEach((row) => {
    const key = getKey(row);

    if (!key) return;

    if (!groups[key]) {
      groups[key] = {
        raised: [],
        aqua: [],
      };
    }

    groups[key].aqua.push(row);
  });

  return Object.keys(groups)
    .sort(
      (first, second) =>
        new Date(first).getTime() -
        new Date(second).getTime()
    )
    .map((key) => {
      const raisedGroup = groups[key].raised;
      const aquaGroup = groups[key].aqua;

      const temperatures = collectNumbers(
        raisedGroup.map((row) =>
          isSummary
            ? row.avg_air_temperature
            : row.air_temperature
        )
      );

      const humidities = collectNumbers(
        raisedGroup.map((row) =>
          isSummary
            ? row.avg_air_humidity
            : row.air_humidity
        )
      );

      const lights = collectNumbers(
        raisedGroup.map((row) =>
          isSummary
            ? row.avg_light_intensity
            : row.light_intensity
        )
      );

      const rainfalls = collectNumbers(
        raisedGroup.map((row) =>
          isSummary
            ? row.total_rainfall
            : row.rainfall
        )
      );

      const soil1Values = collectNumbers(
        raisedGroup
          .filter((row) => row.bed_id === "Bed-1")
          .map((row) =>
            isSummary
              ? row.avg_soil_moisture
              : row.soil_moisture
          )
      );

      const soil2Values = collectNumbers(
        raisedGroup
          .filter((row) => row.bed_id === "Bed-2")
          .map((row) =>
            isSummary
              ? row.avg_soil_moisture
              : row.soil_moisture
          )
      );

      const phValues = collectNumbers(
        aquaGroup.map((row) =>
          isSummary
            ? row.avg_water_ph
            : row.water_ph
        )
      );

      const turbidityValues = collectNumbers(
        aquaGroup.map((row) =>
          isSummary
            ? row.avg_turbidity
            : row.turbidity
        )
      );

      const waterTemperatureValues =
        collectNumbers(
          aquaGroup.map((row) =>
            isSummary
              ? row.avg_water_temperature
              : row.water_temperature
          )
        );

      const waterLevelValues = collectNumbers(
        aquaGroup.map((row) =>
          isSummary
            ? row.avg_water_level
            : row.water_level
        )
      );

      const feedLevelValues = collectNumbers(
        aquaGroup.map((row) =>
          isSummary
            ? row.avg_feed_storage
            : row.feed_storage
        )
      );

      const temp = average(temperatures);
      const humidity = average(humidities);
      const soil1 = average(soil1Values);
      const soil2 = average(soil2Values);
      const light = average(lights);
      const rain = average(rainfalls);

      const ph = average(phValues);
      const turbidity = average(turbidityValues);
      const waterTemp = average(
        waterTemperatureValues
      );
      const waterLevel = average(waterLevelValues);
      const feedLevel = average(feedLevelValues);

      return {
        date: key,
        label: formatHistoryLabel(key, interval),

        temp: Number(temp.toFixed(1)),
        humidity: Math.round(humidity),
        soil1: Math.round(soil1),
        soil2: Math.round(soil2),
        light: Math.round(light),
        rain: Math.round(rain),

        ph: Number(ph.toFixed(2)),
        waterTemp: Number(waterTemp.toFixed(1)),
        turbidity: Number(turbidity.toFixed(1)),
        waterLevel: Math.round(waterLevel),
        feedLevel: Math.round(feedLevel),

        raised:
          soil1Values.length > 0 ||
            soil2Values.length > 0
            ? calculateRaisedHealth(
              temp,
              humidity,
              soil1,
              soil2
            )
            : 0,

        aqua:
          aquaGroup.length > 0
            ? calculateAquaponicsHealth(
              ph,
              waterTemp,
              turbidity,
              waterLevel,
              feedLevel
            )
            : 0,
      };
    });
}

async function fetchPagedRows<T>(
  table:
    | "raised_bed_sensors"
    | "aquaponics_sensors",
  startTimestamp: string,
  endTimestamp: string
): Promise<T[]> {
  const pageSize = 1000;
  let from = 0;
  const result: T[] = [];

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .gte("created_at", startTimestamp)
      .lte("created_at", endTimestamp)
      .order("created_at", {
        ascending: true,
      })
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    const currentRows = (data ?? []) as T[];

    result.push(...currentRows);

    if (currentRows.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return result;
}

function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - 6);

  const format = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return {
    start: format(start),
    end: format(end),
  };
}

export default function Home() {
  const [tab, setTab] = useState<TabType>("dashboard");
  const [dark, setDark] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const [dateRange, setDateRange] =
    useState<DateRange>(getDefaultDateRange);

  const [historyInterval, setHistoryInterval] =
    useState<HistoryInterval>("30m");

  const [raised, setRaised] = useState(initialRaised);
  const [aqua, setAqua] = useState(initialAqua);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activityLogs, setActivityLogs] =
    useState<ActivityLogRow[]>([]);
  const [
    manualControlLogs,
    setManualControlLogs,
  ] = useState<ManualControlLogRow[]>([]);
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
        .then(() => {
          console.log("✅ Service Worker Registered");
        })
        .catch((error) => {
          console.error(
            "❌ Service Worker Error:",
            error
          );
        });
    }
  }, []);

  // Fetch and aggregate history data
  // Fetch and aggregate history data
  useEffect(() => {
    let cancelled = false;

    async function fetchHistoryData() {
      if (!dateRange.start || !dateRange.end) {
        return;
      }

      setLoadingHistory(true);

      try {
        let raisedRows: RaisedBedRow[] = [];
        let aquaRows: AquaponicsRow[] = [];
        let activityRows: ActivityLogRow[] = [];
        let manualRows: ManualControlLogRow[] = [];

        const useSummary =
          historyInterval === "1d";

        if (useSummary) {
          const [
            raisedSummaryResponse,
            aquaSummaryResponse,
          ] = await Promise.all([
            supabase
              .from("daily_raised_bed_summary")
              .select("*")
              .gte(
                "summary_date",
                dateRange.start
              )
              .lte(
                "summary_date",
                dateRange.end
              )
              .order("summary_date", {
                ascending: true,
              }),

            supabase
              .from("daily_aquaponics_summary")
              .select("*")
              .gte(
                "summary_date",
                dateRange.start
              )
              .lte(
                "summary_date",
                dateRange.end
              )
              .order("summary_date", {
                ascending: true,
              }),
          ]);

          if (raisedSummaryResponse.error) {
            throw raisedSummaryResponse.error;
          }

          if (aquaSummaryResponse.error) {
            throw aquaSummaryResponse.error;
          }

          raisedRows =
            (raisedSummaryResponse.data ??
              []) as RaisedBedRow[];

          aquaRows =
            (aquaSummaryResponse.data ??
              []) as AquaponicsRow[];
        } else {
          const startTimestamp =
            `${dateRange.start}T00:00:00+07:00`;

          const endTimestamp =
            `${dateRange.end}T23:59:59.999+07:00`;

          const [raisedRaw, aquaRaw] =
            await Promise.all([
              fetchPagedRows<RaisedBedRow>(
                "raised_bed_sensors",
                startTimestamp,
                endTimestamp
              ),

              fetchPagedRows<AquaponicsRow>(
                "aquaponics_sensors",
                startTimestamp,
                endTimestamp
              ),
            ]);

          raisedRows = raisedRaw;
          aquaRows = aquaRaw;
        }

        const activityStart =
          `${dateRange.start}T00:00:00+07:00`;

        const activityEnd =
          `${dateRange.end}T23:59:59.999+07:00`;

        try {
          const {
            data: activityData,
            error: activityError,
          } = await supabase
            .from("activity_log")
            .select("*")
            .gte("activity_at", activityStart)
            .lte("activity_at", activityEnd)
            .order("activity_at", {
              ascending: true,
            });

          if (activityError) {
            // Activity Log bersifat opsional.
            // Dashboard tetap berjalan jika tabel belum dibuat.
            console.warn(
              "Activity Log belum tersedia:",
              activityError.message
            );

            activityRows = [];
          } else {
            activityRows =
              (activityData ?? []) as ActivityLogRow[];
          }
        } catch (activityError) {
          console.warn(
            "Activity Log dilewati:",
            activityError
          );

          activityRows = [];
        }

        const manualStart =
          `${dateRange.start}T00:00:00+07:00`;

        const manualEnd =
          `${dateRange.end}T23:59:59.999+07:00`;

        try {
          const {
            data: manualData,
            error: manualError,
          } = await supabase
            .from("manual_control_log")
            .select("*")
            .gte("requested_at", manualStart)
            .lte("requested_at", manualEnd)
            .order("requested_at", {
              ascending: true,
            });

          if (manualError) {
            console.warn(
              "Manual Control Log belum tersedia:",
              manualError.message
            );

            manualRows = [];
          } else {
            manualRows =
              (manualData ??
                []) as ManualControlLogRow[];
          }
        } catch (manualError) {
          console.warn(
            "Manual Control Log dilewati:",
            manualError
          );

          manualRows = [];
        }

        console.log(
          "Jumlah activity log:",
          activityRows.length,
          activityRows
        );

        const aggregated = aggregateData(
          raisedRows,
          aquaRows,
          historyInterval,
          useSummary
        );

        if (activityRows.length === 0) {
          activityRows = aggregated.flatMap((item) => {
            const generatedActivities: ActivityLogRow[] = [];

            const activityTime = item.date;

            if (item.temp > 0 || item.soil1 > 0 || item.soil2 > 0) {
              generatedActivities.push({
                activity_at: activityTime,
                activity_type: "sensor_data_received",
                system_type: "raised_bed",
                actor_name: "ESP32 Raised Bed",
                actor_type: "device",
                title: "Data Raised Bed diterima",
                description:
                  `Data sensor diterima: suhu ${item.temp} °C, ` +
                  `kelembapan ${item.humidity}%, ` +
                  `soil 1 ${item.soil1}%, soil 2 ${item.soil2}%.`,
                status: "success",
              });
            }

            if (
              item.ph > 0 ||
              item.waterTemp > 0 ||
              item.waterLevel > 0
            ) {
              generatedActivities.push({
                activity_at: activityTime,
                activity_type: "sensor_data_received",
                system_type: "aquaponik",
                actor_name: "ESP32 Aquaponik",
                actor_type: "device",
                title: "Data Aquaponik diterima",
                description:
                  `Data sensor diterima: pH ${item.ph}, ` +
                  `suhu air ${item.waterTemp} °C, ` +
                  `turbidity ${item.turbidity} NTU, ` +
                  `water level ${item.waterLevel}%.`,
                status: "success",
              });
            }

            if (item.raised < 70 && item.raised > 0) {
              generatedActivities.push({
                activity_at: activityTime,
                activity_type: "recommendation_generated",
                system_type: "raised_bed",
                actor_name: "Smart Green Farm",
                actor_type: "system",
                title: "Rekomendasi Raised Bed dibuat",
                description:
                  `Health score Raised Bed berada pada ${item.raised}%. ` +
                  "Sistem menyarankan pemeriksaan kondisi tanaman.",
                status: "warning",
              });
            }

            if (item.aqua < 70 && item.aqua > 0) {
              generatedActivities.push({
                activity_at: activityTime,
                activity_type: "recommendation_generated",
                system_type: "aquaponik",
                actor_name: "Smart Green Farm",
                actor_type: "system",
                title: "Rekomendasi Aquaponik dibuat",
                description:
                  `Health score Aquaponik berada pada ${item.aqua}%. ` +
                  "Sistem menyarankan pemeriksaan kualitas air.",
                status: "warning",
              });
            }

            return generatedActivities;
          });
        }

        if (!cancelled) {
          setHistory(aggregated);
          setActivityLogs(activityRows);
          setManualControlLogs(manualRows);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil history:",
          error
        );

        if (!cancelled) {
          setHistory([]);
          setActivityLogs([]);
          setManualControlLogs([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    fetchHistoryData();

    return () => {
      cancelled = true;
    };
  }, [
    dateRange,
    historyInterval,
  ]);

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
        {
          event: "*",
          schema: "public",
          table: "aquaponics_sensors",
        },
        (payload) => {
          const latest =
            payload.new as AquaponicsRow;

          if (!latest) return;

          setAqua((previous) => ({
            ...previous,
            ph:
              latest.water_ph ??
              previous.ph,
            turbidity:
              latest.turbidity ??
              previous.turbidity,
            waterTemp:
              latest.water_temperature ??
              previous.waterTemp,
            waterLevel:
              latest.water_level ??
              previous.waterLevel,
            feedLevel:
              latest.feed_storage ??
              previous.feedLevel,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        raisedChannel
      );

      supabase.removeChannel(
        aquaChannel
      );
    };
  }, []);

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
                  alerts={alerts}
                  activityLogs={activityLogs}
                  manualControlLogs={manualControlLogs}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  interval={historyInterval}
                  setInterval={setHistoryInterval}
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