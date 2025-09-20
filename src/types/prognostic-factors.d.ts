export enum DiseaseType {
  BREAST_CANCER = "breast_cancer",
  COLORECTAL_CANCER = "colorectal_cancer",
  LUNG_CANCER = "lung_cancer",
  PROSTATE_CANCER = "prostate_cancer",
}

export enum Biomarker {
  // Prostate
  ECOG_PS = "ECOG PS",

  METASTATIC_STATUS = "Metastatic Status",
  METASTATIC_VOLUME = "Metastatic Volume",
  METASTATIC_SITE = "Metastatic Site",

  // Brease
  BREAST_M_STAGE = "Metastasis (M Stage)",
  BREAST_MOLECULAR_SUBTYPE = "Molecular Subtype",

  // Colorectal
  COLORECTAL_AJCC = "AJCC TNM Stage",
  COLORECTAL_PRIMARY_LOC = "Primary Tumor Location",
  COLORECTAL_HISTOLOGICAL_GRADE = "Histological Grade",
  COLORECTAL_LVI = "Lymphovascular Invasion (LVI)",
  COLORECTAL_PNI = "Perineural Invasion (PNI)",

  // Lung
  SMOKING_STATUS = "Smoking Status",
  WEIGHT_LOSS = "Weight Loss",
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

export interface Comparison {
  group: GroupType;
  hazard_ratio: number | undefined;
  ci_lower?: number | undefined;
  ci_upper?: number | undefined;
  patient_population: string;
}
export interface PrognosticFactor {
  biomarker: Biomarker;
  reference_group: GroupType;
  comparison_group_list: Comparison[];
}

export interface Allocation {
  reference: number;
  comparisons: number[];
}

export interface AllocationChange {
  biomarker: Biomarker;
  original: Allocation;
  target: Allocation;
  // hazard ratios associated with each stratum
  hazardRatios: number[];
}

/**
 * The top-level model representing a list of PrognosticFactor objects.
 */
export type DiseasePrognosticFactorTable = Partial<
  Record<Biomarker, PrognosticFactor>
>;
export type PrognosticFactorTable = Partial<
  Record<DiseaseType, DiseasePrognosticFactorTable>
>;
