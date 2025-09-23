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
  PROSTATE_TNM_STAGE = "TNM Stage",
  PROSTATE_PSA_LEVEL = "PSA Level",
  PROSTATE_ALP = "Alkaline Phosphatase (ALP)",
  PROSTATE_LDH = "Lactate Dehydrogenase (LDH)",
  PROSTATE_HEMOGLOBIN = "Hemoglobin (Hb)",
  PROSTATE_ALBUMIN = "Albumin",

  // Breast
  BREAST_M_STAGE = "Metastasis (M Stage)",
  BREAST_MOLECULAR_SUBTYPE = "Molecular Subtype",
  BREAST_NODAL_STATUS = "Nodal Status (N Stage)",
  BREAST_AGE_AT_DIAGNOSIS = "Age at Diagnosis",
  BREAST_KI67_PROLIFERATION = "Ki-67 Proliferation",
  BREAST_HORMONE_RECEPTORS = "Hormone Receptors",
  BREAST_HER2_STATUS = "HER2 Status",
  BREAST_COMORBIDITY = "Comorbidity",

  // Colorectal
  COLORECTAL_AJCC = "AJCC TNM Stage",
  COLORECTAL_PRIMARY_LOC = "Primary Tumor Location",
  COLORECTAL_LVI = "Lymphovascular Invasion (LVI)",
  COLORECTAL_PNI = "Perineural Invasion (PNI)",
  COLORECTAL_AGE_COMORBIDITY = "Age + Comorbidity",
  COLORECTAL_EARLY_ONSET_AGE = "Early-Onset Age (Stage-Adjusted)",
  COLORECTAL_SEX = "Sex",
  COLORECTAL_NUM_METASTATIC_SITES = "Number of Metastatic Sites",
  COLORECTAL_METASTATIC_SITE = "Site of Metastasis (vs. Liver-only)",
  COLORECTAL_PRIMARY_TUMOR_RESECTION = "Primary Tumor Resection (RCT data)",
  COLORECTAL_SERUM_CEA = "Serum CEA Level",
  COLORECTAL_BRAF_MUTATION = "BRAF V600E Mutation",
  COLORECTAL_MSI = "Microsatellite Instability (MSI)",

  // Lung
  SMOKING_STATUS = "Smoking Status",
  WEIGHT_LOSS = "Weight Loss",
  LUNG_TNM_STAGE = "TNM Stage (Pathological)",
  LUNG_PDL1_EXPRESSION = "PD-L1 Expression",
  LUNG_EGFR_MUTATION = "EGFR Mutation",
  LUNG_ALK_REARRANGEMENT = "ALK Rearrangement",

  // Common
  HISTOLOGICAL_GRADE = "Histological Grade",
  KRAS_MUTATION = "KRAS Mutation",
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
  Record<Biomarker, PrognosticFactor[]>
>;
export type PrognosticFactorTable = Partial<
  Record<DiseaseType, DiseasePrognosticFactorTable>
>;
