export enum Relationship {
    LESS_THAN = "<",
    LESS_THAN_EQ = "≤",
    GREATER_THAN = ">",
    GREATER_THAN_EQ = "≥",
    BETWEEN_INCL = "-",
    EQUALS = "=",
    MISSING = "N/A",
}

export interface Range {
    relation: Relationship;
    lower: number | null;
    upper: number | null;
}

export interface ParsedGroupData {
    group_name: string;
    count: number | null;
    percentage: number | null;
}

export interface ParsedFactor {
    value_range: Range;
    groups: ParsedGroupData[];
}
