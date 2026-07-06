export type TabType = "dashboard" | "raised" | "aqua" | "history";

export type DateRange = {
  start: string;
  end: string;
};

export type RaisedState = {
  temp: number;
  humidity: number;
  soil1: number;
  soil2: number;
  light: number;
  rain: number;
  tank: number;
  pump: boolean;
  valve1: boolean;
  valve2: boolean;
  valve3: boolean;
  valve4: boolean;
};

export type AquaState = {
  ph: number;
  turbidity: number;
  waterTemp: number;
  waterLevel: number;
  feedLevel: number;
  waterPump: boolean;
  aerator: boolean;
  autoFeed: boolean;
  drainValve: boolean;
};

export type HistoryItem = {
  date: string;
  label: string;
  temp: number;
  humidity: number;
  soil1: number;
  soil2: number;
  light: number;
  rain: number;
  ph: number;
  waterTemp: number;
  turbidity: number;
  waterLevel: number;
  feedLevel: number;
  raised: number;
  aqua: number;
};

export type AlertItem = {
  id: string;
  title: string;
  message: string;
  level: "warning" | "danger";
};