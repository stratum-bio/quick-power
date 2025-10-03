import { type Range, Relationship } from "../types/demo_types.d";

export const AgeFactors: Range[] = [
  {
    relation: Relationship.LESS_THAN,
    lower: null,
    upper: 40,
  },
  {
    relation: Relationship.LESS_THAN,
    lower: 40,
    upper: 55,
  },
  {
    relation: Relationship.BETWEEN_INCL,
    lower: 55,
    upper: 70,
  },
  {
    relation: Relationship.BETWEEN_INCL,
    lower: 70,
    upper: 84,
  },
  {
    relation: Relationship.GREATER_THAN_EQ,
    lower: 85,
    upper: null,
  },
];
