import { type Range, Relationship } from "../types/demo_types.d";

export const AgeFactors: Range[] = [
  {
    relation: Relationship.LESS_THAN,
    lower: null,
    upper: 65,
  },
  {
    relation: Relationship.BETWEEN_INCL,
    lower: 65,
    upper: 74,
  },
  {
    relation: Relationship.BETWEEN_INCL,
    lower: 75,
    upper: 84,
  },
  {
    relation: Relationship.GREATER_THAN_EQ,
    lower: 85,
    upper: null,
  },
];
