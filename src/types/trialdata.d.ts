export interface TrialArmData {
  events: boolean[];
  times: number[];
  arm_name: string;
}


export interface TrialMeta {
  identifier: string;
  pubmed: string; 
  publication_date: string;
  arms: number;
  disease: string;
  subjects: number;
}

export interface Trial {
  meta: TrialMeta;
  arms: TrialArmData[];
}

export interface TrialIndex {
  trials: TrialMeta[];
}
