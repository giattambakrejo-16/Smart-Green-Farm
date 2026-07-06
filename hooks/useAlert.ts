import { useMemo } from "react";
import type { AlertItem, AquaState, RaisedState } from "@/types/sensor";

export function useAlert(raised: RaisedState, aqua: AquaState): AlertItem[] {
  return useMemo(() => {
    const alerts: AlertItem[] = [];

    if (aqua.feedLevel < 20) {
      alerts.push({
        id: "feed",
        title: "Pakan hampir habis",
        message: `Sisa pakan tinggal ${aqua.feedLevel}%. Segera isi ulang.`,
        level: "warning",
      });
    }

    if (aqua.waterLevel < 30) {
      alerts.push({
        id: "aqua-water",
        title: "Air aquaponik rendah",
        message: `Water level aquaponik hanya ${aqua.waterLevel}%.`,
        level: "danger",
      });
    }

    if (aqua.ph < 6.5 || aqua.ph > 8) {
      alerts.push({
        id: "ph",
        title: "pH air tidak normal",
        message: `pH air saat ini ${aqua.ph}. Perlu pengecekan.`,
        level: "danger",
      });
    }

    if (raised.tank < 25) {
      alerts.push({
        id: "tank",
        title: "Tangki air rendah",
        message: `Level tangki Raised Bed hanya ${raised.tank}%.`,
        level: "warning",
      });
    }

    if (raised.soil1 < 30) {
      alerts.push({
        id: "soil1",
        title: "Soil Sensor 1 kering",
        message: `Kelembapan tanah sensor 1 hanya ${raised.soil1}%.`,
        level: "warning",
      });
    }

    if (raised.soil2 < 30) {
      alerts.push({
        id: "soil2",
        title: "Soil Sensor 2 kering",
        message: `Kelembapan tanah sensor 2 hanya ${raised.soil2}%.`,
        level: "warning",
      });
    }

    return alerts;
  }, [raised, aqua]);
}