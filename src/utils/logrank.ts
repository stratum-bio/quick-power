import jStat from "jstat";

interface DetailedResult {
  time: number;
  observedTreat: number;
  expectedTreat: number;
  variance: number;
}

/**
 * Performs the log-rank test on survival data with two groups.
 * @param controlTime An array of survival times for the control group.
 * @param controlEvent An array of event indicators (1=event, 0=censored) for the control group.
 * @param treatTime An array of survival times for the treatment group.
 * @param treatEvent An array of event indicators (1=event, 0=censored) for the treatment group.
 * @returns A tuple containing the chi-square statistic, p-value
 */
export function logRankTest(
  controlTime: Float64Array,
  controlEvent: Uint8Array,
  treatTime: Float64Array,
  treatEvent: Uint8Array,
): [number, number] {
  // 1. Combine data and sort by time
  const controlData = Array.from(controlTime).map((time, i) => ({
    time: time,
    event: controlEvent[i],
    group: 0,
  }));
  const treatData = Array.from(treatTime).map((time, i) => ({
    time: time,
    event: treatEvent[i],
    group: 1,
  }));

  const combinedData = [...controlData, ...treatData].sort(
    (a, b) => a.time - b.time,
  );

  // 2. Get unique event times
  const uniqueEventTimes = Array.from(
    new Set(combinedData.filter((d) => d.event === 1).map((d) => d.time)),
  );

  // 3. Perform log-rank calculations
  const detailedResults: DetailedResult[] = [];

  for (const t of uniqueEventTimes) {
    // Subjects at risk just before time t
    const atRisk = combinedData.filter((d) => d.time >= t);
    const atRiskAll = atRisk.length;
    const atRiskTreat = atRisk.filter((d) => d.group === 1).length;
    const atRiskControl = atRisk.filter((d) => d.group === 0).length;

    // Events at time t
    const eventsAtT = atRisk.filter((d) => d.time === t && d.event === 1);
    const eventsAll = eventsAtT.length;
    const eventsTreat = eventsAtT.filter((d) => d.group === 1).length;

    // Observed and expected counts for the treatment group
    const observedTreat = eventsTreat;
    const expectedTreat =
      atRiskAll > 0 ? (eventsAll * atRiskTreat) / atRiskAll : 0;

    // Variance
    const variance =
      atRiskAll > 1
        ? (atRiskTreat * atRiskControl * eventsAll * (atRiskAll - eventsAll)) /
          (atRiskAll ** 2 * (atRiskAll - 1))
        : 0;

    detailedResults.push({
      time: t,
      observedTreat,
      expectedTreat,
      variance,
    });
  }

  // 4. Aggregate results and calculate statistic
  const sumO = detailedResults.reduce((sum, r) => sum + r.observedTreat, 0);
  const sumE = detailedResults.reduce((sum, r) => sum + r.expectedTreat, 0);
  const sumV = detailedResults.reduce((sum, r) => sum + r.variance, 0);

  const chi2Stat = sumV > 0 ? (sumO - sumE) ** 2 / sumV : 0;

  // 5. Calculate p-value using jStat's chi-square CDF
  const pValue = 1 - jStat.chisquare.cdf(chi2Stat, 1);

  return [chi2Stat, pValue];
}
