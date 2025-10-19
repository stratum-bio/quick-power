import { type ParsedFactor, type Range } from "../types/demo_types.d";

export function rangeToString(range: Range): string {
  let name = "";
  if (range.relation == "=") {
    name = `${range.lower}`;
  } else if (range.lower != null && range.upper != null) {
    name = `${range.lower} - ${range.upper}`;
  } else if (range.lower != null) {
    name = `${range.relation}${range.lower}`;
  } else if (range.upper != null) {
    name = `${range.relation}${range.upper}`;
  }

  return name;
}

export function processFactorRangeData(factors: ParsedFactor[]) {
  const sortedFactors = factors.sort(
    (a, b) => (a.value_range.lower ?? 0) - (b.value_range.lower ?? 0),
  );

  const groupNames: Set<string> = new Set();
  const chartData: { [key: string]: number | string }[] = [];
  for (const factor of sortedFactors) {
    const name = rangeToString(factor.value_range);
    const entry: { [key: string]: number | string } = {
      name: name,
    };
    for (const group of factor.groups) {
      if (group.count || group.percentage) {
        const group_name = group.group_name.toLowerCase();
        groupNames.add(group_name);
        entry[group_name] = group.count ?? group.percentage ?? 0;
      }
    }

    chartData.push(entry);
  }
  console.log("group names ", groupNames);
  console.log("original ", factors);
  console.log("chart ", chartData);
  return { chartData, groupNames };
}
