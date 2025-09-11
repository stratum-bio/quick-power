export interface Weibull {
  scale: number;
  shape: number;
}

export interface TrialArmData {
  events: boolean[];
  time: number[];
  arm_name: string;
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
  interval: [number, number][];
}

export interface KaplanMeierByArm {
  arm_names: string[];
  curves: KaplanMeier[];
  time_scale: string;
}
