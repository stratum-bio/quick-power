export enum FactorName {
  PS = "Performance Status",
  AGE = "Age",
  GLEASON_ISUP = "Gleason/ISUP Grade",
  TNM = "TNM Stage",
  MET_BURDEN = "Metastatic Burden",
  MET_SITE = "Metastatic Site",
  PSA = "PSA Level",
  ALP = "Alkaline Phosphatase (ALP)",
  LDH = "Lactate Dehydrogenase (LDH)",
  HB = "Hemoglobin (Hb)",
  ALBUMIN = "Albumin",
}

export enum Biomarker {
  ECOG_PS = "ECOG PS",
  AGE = "Age",
  ISUP_GRADE = "ISUP Grade",
  T_STAGE = "T-Stage",
  METASTATIC_STATUS = "Metastatic Status",
  METASTATIC_VOLUME = "Metastatic Volume",
  METASTATIC_SITE = "Metastatic Site",
  PSA = "PSA",
  PSA_AT_RT = "PSA at Radiotherapy Start",
  ALP = "Alkaline Phosphatase (ALP)",
  LDH = "Lactate Dehydrogenase (LDH)",
  HB = "Hemoglobin (Hb)",
  ALBUMIN = "Albumin",
  AGR = "Albumin-to-Globulin Ratio (AGR)",
}

export enum RelationalOperator {
  GREATER_THAN = ">",
  LESS_THAN = "<",
  GREATER_THAN_OR_EQUAL = "≥",
  LESS_THAN_OR_EQUAL = "≤",
  EQUAL = "=",
}

// --- COMPARISON GROUP MODELS ---

export interface NumericalComparison {
  type: "numerical";
  operator: RelationalOperator;
  value: number;
  unit?: string;
}

export interface RangeComparison {
  type: "range";
  lower_bound: number;
  upper_bound: number;
  unit?: string;
}

export interface CategoricalComparison {
  type: "categorical";
  category: string;
}

/**
 * A discriminated union for different comparison types.
 */
export type GroupType =
  | NumericalComparison
  | RangeComparison
  | CategoricalComparison;

// --- MAIN MODELS ---

export interface ComparisonDetail {
  biomarker: Biomarker;
  comparison_group: GroupType;
  reference_group: GroupType;
}

export interface PrognosticFactor {
  factor: FactorName;
  comparison: ComparisonDetail;
  hazard_ratio: number;
  ci_lower?: number;
  ci_upper?: number;
  patient_population: string;
  data_source_type: "Meta-analysis" | "Pooled Analysis" | "Single Study";
  reference: number;
}

/**
 * The top-level model representing a list of PrognosticFactor objects.
 */
export type PrognosticFactorTable = PrognosticFactor[];
