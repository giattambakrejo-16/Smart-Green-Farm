import type { AquaState, HistoryItem, RaisedState } from "@/types/sensor";

export const initialRaised: RaisedState = {
  temp: 28.4,
  humidity: 72,
  soil1: 46,
  soil2: 58,
  light: 76,
  rain: 12,
  tank: 75,
  pump: false,
  valve1: false,
  valve2: false,
  valve3: false,
  valve4: false,
  valve5: false,
};

export const initialAqua: AquaState = {
  ph: 7.2,
  turbidity: 18,
  waterTemp: 27.8,
  waterLevel: 68,
  feedLevel: 82,
  waterPump: false,
  aerator: true,
  autoFeed: false,
  drainValve: false,
};

export const historyData: HistoryItem[] = [
  { date: "2026-07-01", label: "1 Jul", temp: 28.1, humidity: 70, soil1: 64, soil2: 61, light: 75, rain: 10, ph: 7.1, waterTemp: 27.3, turbidity: 18, waterLevel: 78, feedLevel: 78, raised: 64, aqua: 72 },
  { date: "2026-07-02", label: "2 Jul", temp: 28.4, humidity: 72, soil1: 58, soil2: 65, light: 69, rain: 14, ph: 7.0, waterTemp: 27.7, turbidity: 22, waterLevel: 74, feedLevel: 74, raised: 58, aqua: 69 },
  { date: "2026-07-03", label: "3 Jul", temp: 29.0, humidity: 76, soil1: 76, soil2: 71, light: 82, rain: 8, ph: 7.2, waterTemp: 28.1, turbidity: 19, waterLevel: 82, feedLevel: 80, raised: 76, aqua: 80 },
  { date: "2026-07-04", label: "4 Jul", temp: 27.8, humidity: 68, soil1: 70, soil2: 69, light: 77, rain: 16, ph: 7.4, waterTemp: 27.5, turbidity: 25, waterLevel: 76, feedLevel: 76, raised: 70, aqua: 74 },
  { date: "2026-07-05", label: "5 Jul", temp: 28.8, humidity: 75, soil1: 82, soil2: 78, light: 85, rain: 6, ph: 7.2, waterTemp: 28.0, turbidity: 17, waterLevel: 80, feedLevel: 82, raised: 82, aqua: 78 },
  { date: "2026-07-06", label: "6 Jul", temp: 27.9, humidity: 71, soil1: 66, soil2: 63, light: 72, rain: 12, ph: 7.3, waterTemp: 27.2, turbidity: 21, waterLevel: 71, feedLevel: 70, raised: 66, aqua: 71 },
  { date: "2026-07-07", label: "7 Jul", temp: 28.6, humidity: 74, soil1: 73, soil2: 77, light: 80, rain: 9, ph: 7.1, waterTemp: 27.9, turbidity: 16, waterLevel: 84, feedLevel: 84, raised: 73, aqua: 83 },
  { date: "2026-07-08", label: "8 Jul", temp: 29.1, humidity: 77, soil1: 79, soil2: 75, light: 86, rain: 7, ph: 7.5, waterTemp: 28.4, turbidity: 20, waterLevel: 77, feedLevel: 79, raised: 79, aqua: 76 },
  { date: "2026-07-09", label: "9 Jul", temp: 28.2, humidity: 70, soil1: 62, soil2: 67, light: 74, rain: 15, ph: 7.0, waterTemp: 27.6, turbidity: 24, waterLevel: 70, feedLevel: 73, raised: 62, aqua: 70 },
  { date: "2026-07-10", label: "10 Jul", temp: 29.3, humidity: 78, soil1: 84, soil2: 80, light: 88, rain: 5, ph: 7.3, waterTemp: 28.5, turbidity: 18, waterLevel: 83, feedLevel: 86, raised: 84, aqua: 81 },
];