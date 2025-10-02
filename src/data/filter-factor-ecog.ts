import { type Range, Relationship } from "../types/demo_types.d";

export const ECOGFactors: Range[] = [
    {
        relation: Relationship.EQUALS,
        lower: 0,
        upper: 0
    },
    {
        relation: Relationship.EQUALS,
        lower: 1,
        upper: 1
    },
    {
        relation: Relationship.GREATER_THAN_EQ,
        lower: 2,
        upper: null
    }
];
