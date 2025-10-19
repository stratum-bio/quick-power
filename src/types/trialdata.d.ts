import { ParsedFactor } from "./demo_types.d";

export interface Weibull {
  scale: number;
  shape: number;
}

export interface TrialArmData {
  events: boolean[];
  time: number[];
  arm_name: string;
}

export interface TrialDataIndex {
  age: ParsedFactor[];
  ecog: ParsedFactor[];
}

export interface TrialMeta {
  identifier: string;
  pubmed: string;
  publication_date: string;
  arms: number;
  disease: string;
  subjects: number;
  weibull_by_arm: { [key: string]: Weibull };
  weibull_max_diff: number;
  time_scale: string;
  title: string | null;
  condition_list: string[] | null;
  data_index: TrialDataIndex | null;
  hazard_ratios: Record<string, Record<string, number>>
  min_hazard_ratio: number
}

export interface Trial {
  meta: TrialMeta;
  arms: TrialArmData[];
}

export interface TrialIndex {
  trials: TrialMeta[];
}

export interface KaplanMeier {
  time: number[];
  probability: number[];
  interval?: [number, number][];
  events_at_time?: number[];
  at_risk_at_time?: number[];
}

export interface KaplanMeierByArm {
  arm_names: string[];
  curves: KaplanMeier[];
  time_scale: string;
}
