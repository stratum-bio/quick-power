
/**
 * Define enums for data_type for better validation and clarity
 */
export enum DataType {
  NumericMeanSD = "numeric_mean_sd",
  NumericMeanRange = "numeric_mean_range",
  NumericMedianIQR = "numeric_median_iqr",
  NumericSingle = "numeric_single",
  CategoricalCountPercentage = "categorical_count_percentage",
  CategoricalRatio = "categorical_ratio",
  Text = "text",
  Header = "header",
  Other = "other",
}


/**
 * Captures statistics (like Z-scores or t-values and p-values)
 * reported for comparisons between groups for a specific characteristic.
 */
export interface ComparisonStatistics {
  statistic_type?: string; // e.g., 'Z', 't'
  statistic_value: number;
  p_value: number;
  notes?: string; // e.g., 'determined by Mann-Whitney U test'
  raw_string: string; // original string from the statistic column
}

/**
 * Contains the actual data for each group for a specific characteristic.
 * Conditional fields based on 'data_type'.
 */
export interface GroupData {
  group_name: string;
  /**
   * Specifies how the value is represented for this characteristic in this group.
   */
  data_type: DataType;

  // Fields for 'numeric_mean_sd'
  mean?: number;
  std_dev?: number;

  // Fields for 'numeric_mean_range'
  mean_value?: number;
  range_min?: number;
  range_max?: number;

  // Fields for 'numeric_median_iqr'
  median?: number;
  iqr_min?: number;
  iqr_max?: number;

  // Field for 'numeric_single'
  value?: number; // For singular numeric values or calculated 'change'

  // Fields for 'categorical_count_percentage'
  count?: number; // Using number for consistency with percentages
  percentage?: number;

  // Fields for 'categorical_ratio' (e.g., for sex ratios)
  female_count?: number;
  male_count?: number;

  // Field for 'text'
  text_value?: string;

  /**
   * The exact string value from the source table cell (e.g., '56.8±6', '16 (80)'). Useful for auditing.
   */
  raw_string: string;
  notes?: string; // Any specific notes/footnote markers for this data point
  n_for_value?: number; // Specific N if it differs from group's overall N
}

/**
 * Represents a measured variable or row in the table.
 */
export interface Characteristic {
  original_label: string; // The exact string used in the source table (e.g., "Age, year")
  standardized_name: string; // A canonical, consistent name (e.g., "Age")
  unit?: string; // The standardized unit (e.g., 'years', 'kg/m^2')
  category?: string; // Categorical grouping (e.g., 'Demographics')
  time_point?: string; // Measurement time point (e.g., 'baseline', 'followup')
  is_sub_characteristic?: boolean; // True if a sub-item (e.g., "Female" under "Sex")
  sub_characteristic_of?: string; // Standardized name of parent characteristic

  /**
   * Contains the actual data for each group for this specific characteristic.
   */
  group_data: GroupData[];
  comparison_statistics?: ComparisonStatistics;
}

/**
 * Defines a participant cohort or intervention arm.
 */
export interface Group {
  name: string; // The name of the group (e.g., "Exercise group")
  n?: number; // Number of participants in this group
  type?: string; // Categorization (e.g., 'intervention', 'control', 'total')
}

/**
 * Represents a single table or file from a study, following the common data schema.
 */
export interface StudyTable {
  study_id: string; // Unique identifier for this specific table or study
  study_title: string;
  table_name: string; // Exact name of the table from the source
  table_title: string; // Full, descriptive title of the table
  description?: string; // Additional summary or context
  footnotes: string[]; // General footnotes applicable to the entire table

  /**
   * Defines the participant cohorts or intervention arms.
   */
  groups: Group[];
  /**
   * list of measured variables or rows in the table.
   */
  characteristics: Characteristic[];
}

// The top-level structure is an array of StudyTable objects
// This can be represented by a StudyTable[] when parsing a collection of tables.
// For example, to validate a JSON file containing multiple tables:
// import { StudyTable } from './study_table';
// const allStudyData: StudyTable[] = your_json_data as StudyTable[];
